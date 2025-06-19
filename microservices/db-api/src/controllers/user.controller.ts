import {Request, Response} from "express";
import {
    addUser,
    getUserCalculations,
    findUserHistory,
    saveCalculation,
    addToUserHistory,
    getCalculationById,
    getCalculationByDate,
    addToDestinyHistory,
    getDestinyHistory
} from "../services/user.service";
import {getDB} from "../db/database";
import {paginate} from "../utils/paginate";
import {NextFunction} from "grammy";
import {encrypt,decrypt} from "../utils/encryption";
import {AddMatrixHistorySchema} from "../validation/schemas";
import {ZodError} from "zod";

/**
 * Регистрирует пользователя
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const { userId, name, birthDate, mainCalculationId } = req.body;

    if (!userId || !name) {
        res.status(400).json({ error: "Missing userId or name" });
        return;
    }

    try {
        if (birthDate && typeof mainCalculationId === "number") {
            await addUser(userId, name, birthDate, mainCalculationId);
        } else {
            const db = await getDB();
            await db.run(
                `UPDATE users SET name = ? WHERE user_id = ?`,
                [encrypt(name), userId] // отдельно шифруем только имя
            );
        }

        res.status(200).json({ message: `User ${userId} зарегистрирован или обновлён` });
    } catch (error) {
        console.error("🔥 Ошибка при регистрации:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



/**
 * Получает пользователя по ID
 */
export const getUserById = async (req: Request, res: Response) => {
    const userId = req.params.id;

    try {
        const db = await getDB();
        const user = await db.get("SELECT * FROM users WHERE user_id = ?", [userId]);

        if (user) {
            res.json({
                ...user,
                name: decrypt(user.name),
                birth_date: decrypt(user.birth_date),
            });
        } else {
            res.status(404).json({error: "User not found"});
        }
    } catch (error) {
        console.error("🔥 Ошибка при получении пользователя:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
};


/**
 * Возвращает историю всех расчётов пользователя
 */
export const getUserHistory = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id;

    if (!userId) {
        res.status(400).json({error: "userId is required"});
        return;
    }

    try {
        const history = await getUserCalculations(userId);
        res.json(history);
    } catch (error) {
        console.error("Ошибка при получении истории:", error);
        res.status(500).json({error: "Ошибка при получении истории пользователя"});
    }
};
export const getPaginatedUserHistory = async (req: Request, res: Response): Promise<void> => {
    const userId = (req.query.userId || req.params.id) as string;
    const page = parseInt(req.query.page as string) || 0;
    const pageSize = parseInt(req.query.pageSize as string) || 5;

    if (!userId) {
        res.status(400).json({error: "userId is required"});
        return;
    }

    try {
        const db = await getDB();
        const all = await db.all(
            `SELECT uh.name, c.input_date, c.id as calculation_id
             FROM user_history uh
                      JOIN calculations c ON uh.calculation_id = c.id
             WHERE uh.user_id = ?
             ORDER BY uh.created_at DESC`,
            [userId]
        );

        const totalCount = all.length;
        const paginatedItems = all.slice(page * pageSize, (page + 1) * pageSize).map(entry => ({
            name: decrypt(entry.name),
            input_date: entry.input_date,
            calculationId: entry.calculation_id,
        }));

        res.json({
            items: paginatedItems,
            totalCount,
        });
    } catch (error) {
        console.error("❌ Ошибка при получении истории:", error);
        res.status(500).json({error: "Ошибка при получении истории"});
    }
};


export const getUserCompatibilityHistory = async (req: Request, res: Response): Promise<void> => {
    const userId = (req.query.userId || req.params.id) as string;
    const page = parseInt(req.query.page as string) || 0;
    const pageSize = parseInt(req.query.pageSize as string) || 5;

    if (!userId) {
        res.status(400).json({ error: "userId is required" });
        return;
    }

    try {
        const db = await getDB();

        const rows = await db.all(
            `SELECT uh.name,
                    c.input_date,
                    c.id                             as calculation_id,
                    json_extract(c.square, '$."18"') as destiny
             FROM user_history uh
             JOIN calculations c ON uh.calculation_id = c.id
             WHERE uh.user_id = ?
             ORDER BY uh.created_at DESC
             LIMIT ? OFFSET ?`,
            [userId, pageSize, page * pageSize]
        );

        const countRow = await db.get(
            `SELECT COUNT(*) as count FROM user_history WHERE user_id = ?`,
            [userId]
        );
        const totalCount = countRow?.count ?? 0;

        const parsed = rows.map(entry => ({
            name: decrypt(entry.name),
            inputDate: entry.input_date,
            calculationId: entry.calculation_id,
            destiny: Number(entry.destiny) ?? null,
        }));

        res.json({
            items: parsed,
            totalCount,
        });
    } catch (error) {
        console.error("❌ Ошибка при получении совместимости:", error);
        res.status(500).json({ error: "Ошибка при получении совместимости" });
    }
};



/**
 * Получает конкретный расчёт из истории пользователя
 */
export const getCalculationFromHistory = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id;
    const { inputDate, name } = req.query;

    if (!userId || !inputDate) {
        res.status(400).json({ error: "userId, inputDate и name обязательны" });
        return;
    }

    try {
        const result = await findUserHistory(userId, String(inputDate), String(name));

        if (result) {
            if (typeof result.name === 'string' && result.name.includes(':')) {
                result.name = decrypt(result.name);
            } else {
                console.warn("⚠️ Некорректное поле name при расшифровке:", result.name);
            }

            res.json(result);
        } else {
            res.status(404).json({ message: "Расчёт не найден в истории" });
        }
    } catch (error) {
        console.error("Ошибка при поиске расчёта:", error);
        res.status(500).json({ error: "Ошибка при поиске расчёта" });
    }
};


export const saveCalculationHandler = async (
    req: Request,
    res: Response
): Promise<void> => {
    const {birthDate, square, file_id} = req.body;

    if (!birthDate || !square || !file_id) {
        res.status(400).json({error: "Missing required fields"});
        return;
    }

    try {
        const result = await saveCalculation(birthDate, square, file_id);
        res.status(200).json(result);
    } catch (error) {
        console.error("❌ Ошибка при сохранении расчёта:", error);
        res.status(500).json({error: "Internal server error"});
    }
};


export const addInHistory = async (req: Request, res: Response): Promise<void> => {
    const {userId, calculationId, name} = req.body;

    if (!userId || !calculationId || !name) {
        res.status(400).json({error: "Missing required fields"});
        return;
    }

    try {
        await addToUserHistory(userId, calculationId, name);
        res.status(200).json({message: "История добавлена"});
    } catch (error) {
        console.error("❌ Ошибка при добавлении в историю:", error);
        res.status(500).json({error: "Internal server error"});
    }
};


export const getCalculationByIdHandler = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        res.status(400).json({error: "Invalid calculation ID"});
        return;
    }

    try {
        const calc = await getCalculationById(id);
        if (!calc) {
            res.status(404).json({message: "Расчёт не найден"});
            return;
        }

        res.status(200).json(calc);
    } catch (error) {
        console.error("❌ Ошибка при получении расчёта по ID:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
};

/**
 * Сохраняет матрицу судьбы в базу данных.
 *
 * 📥 Ожидается:
 * {
 *   inputDate: string;
 *   file_id: string;
 *   matrix: object;
 * }
 */
export async function saveMatrixHandler(req: Request, res: Response): Promise<void> {
    const {inputDate, file_id, matrix, programs} = req.body;

    if (!inputDate || !file_id || !matrix) {
        res.status(400).json({error: "Missing inputDate, file_id or matrix"});
        return;
    }

    try {
        const db = await getDB();

        const result = await db.run(
            `
                INSERT INTO destiny_matrices (input_date, matrix, file_id, programs)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(input_date) DO NOTHING
            `,
            inputDate,
            JSON.stringify(matrix),
            file_id,
            programs ? JSON.stringify(programs) : null // 👈 сохраняем, если есть
        );

        const insertedId = result.lastID;

        if (!insertedId) {
            const row = await db.get<{ id: number }>(
                `SELECT id
                 FROM destiny_matrices
                 WHERE input_date = ?`,
                inputDate
            );

            res.json({id: row?.id});
        } else {
            res.json({id: insertedId});
        }
    } catch (err) {
        console.error("❌ Ошибка при сохранении матрицы:", err);
        res.status(500).json({error: "Internal error"});
    }
}

export async function getMatrixHandler(req: Request, res: Response): Promise<void> {
    const {inputDate} = req.query;

    if (!inputDate || typeof inputDate !== "string") {
        res.status(400).json({error: "Missing inputDate"});
        return;
    }

    try {
        const db = await getDB();

        const row = await db.get(`
            SELECT id, matrix, file_id, programs
            FROM destiny_matrices
            WHERE input_date = ?
        `, inputDate);

        if (!row) {
            res.status(404).json({error: "Matrix not found"});
            return;
        }

        res.json({
            id: row.id, // 🟢 ВОТ ЭТОГО НЕ ХВАТАЛО!
            matrix: JSON.parse(row.matrix),
            file_id: row.file_id,
            programs: row.programs ? JSON.parse(row.programs) : [],
        });
    } catch (err) {
        console.error("❌ Ошибка при получении матрицы:", err);
        res.status(500).json({error: "Internal error"});
    }
}


export async function getCalculationByDateHandler(
    req: Request,
    res: Response
): Promise<void> {
    const {inputDate} = req.query;

    if (!inputDate || typeof inputDate !== "string") {
        res.status(400).json({error: "Missing inputDate"});
        return;
    }

    try {
        const result = await getCalculationByDate(inputDate);
        res.json(result);
    } catch (error) {
        console.error("❌ Ошибка в getCalculationByDateHandler:", error);
        res.status(404).json({error: "Calculation not found"});
    }
}

export async function saveMatrixHistory(req: Request, res: Response): Promise<void> {
    try {
        const parsed = AddMatrixHistorySchema.parse(req.body);
        const { userId, inputDate, name, matrixId } = parsed;

        const db = await getDB();

        // 🔍 Проверяем, существует ли пользователь в базе
        const userExists = await db.get(`SELECT user_id FROM users WHERE user_id = ?`, [userId]);
        if (!userExists) {
            console.warn(`⚠️ Пользователь ${userId} не найден. Нельзя сохранить matrix_history.`);
            res.status(409).json({ error: "User not found. Cannot add to matrix_history." });
            return;
        }

        // ✅ Пытаемся добавить
        await addToDestinyHistory(userId, inputDate, name, matrixId);
        res.json({ ok: true });

    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                error: "Validation failed",
                issues: error.flatten(),
            });
            return;
        }

        console.error("❌ Ошибка сохранения в destiny_history:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}



export const getMatrixHistory = async (req: Request, res: Response): Promise<void> => {
    const userId = (req.query.userId || req.params.id) as string;
    const page = parseInt(req.query.page as string) || 0;
    const pageSize = parseInt(req.query.pageSize as string) || 5;

    if (!userId) {
        res.status(400).json({ error: "userId is required" });
        return;
    }

    try {
        const db = await getDB();

        // 🧠 1. Загружаем всё
        const matrixRows = await db.all(
            `SELECT mh.name, mh.input_date, mh.matrix_id, m.id as matrix_id, mh.created_at
             FROM matrix_history mh
                      LEFT JOIN destiny_matrices m ON mh.matrix_id = m.id
             WHERE mh.user_id = ?`,
            [userId]
        );

        const userFallback = await db.all(
            `SELECT uh.name, c.input_date, NULL as matrix_id, uh.created_at
             FROM user_history uh
                      JOIN calculations c ON uh.calculation_id = c.id
             WHERE uh.user_id = ?
               AND NOT EXISTS (
                 SELECT 1 FROM matrix_history mh
                 WHERE mh.user_id = uh.user_id
                   AND mh.input_date = c.input_date
                   AND mh.name = uh.name
             )`,
            [userId]
        );

        // 🛠️ Расшифровываем до фильтрации
        const combinedDecrypted = [...matrixRows, ...userFallback].map((item) => ({
            ...item,
            name: decrypt(item.name),
        }));

        // ✅ 2. Удаляем дубли по input_date + name
        const seen = new Set<string>();
        const uniqueItems = combinedDecrypted.filter((item) => {
            const key = `${item.input_date}|${item.name}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // 🔢 3. Сортируем по дате создания
        const sortedItems = uniqueItems.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        // 📄 4. Получаем totalCount
        const totalCount = sortedItems.length;

        // ✂️ 5. Применяем пагинацию
        const paginatedItems = sortedItems.slice(page * pageSize, (page + 1) * pageSize);

        res.json({
            items: paginatedItems,
            totalCount,
        });
    } catch (error) {
        console.error("❌ Ошибка при получении истории матриц:", error);
        res.status(500).json({ error: "Ошибка при получении истории матриц" });
    }
};





export const getMatrixByDateHandler = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { userId, inputDate, name } = req.query;

    if (!userId || !inputDate || !name) {
        res.status(400).json({ error: "Missing parameters" });
        return;
    }

    try {
        const db = await getDB();

        const numericUserId = Number(userId);
        const row = await db.get(
            `SELECT m.id AS id, m.file_id, m.matrix, m.programs
             FROM matrix_history mh
                      JOIN destiny_matrices m ON m.id = mh.matrix_id
             WHERE mh.user_id = ?
               AND mh.input_date = ?
               AND mh.name = ?`,
            [numericUserId, inputDate, encrypt(String(name))]
        );

        if (!row) {
            res.status(404).json({ error: "Matrix not found" });
            return;
        }

        res.json({
            id: row.id,
            file_id: row.file_id,
            matrix: JSON.parse(row.matrix),
            programs: row.programs ? JSON.parse(row.programs) : [],
        });
    } catch (err) {
        console.error("❌ Ошибка при получении матрицы из истории:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMatrixCompatibility = async (
    req: Request,
    res: Response
): Promise<void> => {
    const {mainBirthDate, inputDate} = req.query;

    if (!mainBirthDate || !inputDate) {
        res.status(400).json({error: "Missing required parameters"});
        return;
    }

    try {
        const db = await getDB();

        const row = await db.get(
            `SELECT id, matrix, file_id
             FROM compatibility_matrices
             WHERE (main_birth_date = ? AND input_date = ?)
                OR (main_birth_date = ? AND input_date = ?)`,
            [mainBirthDate, inputDate, inputDate, mainBirthDate]
        );

        if (!row) {
            res.status(404).json({error: "Compatibility matrix not found"});
            return;
        }

        res.json({
            id: row.id,
            matrix: JSON.parse(row.matrix),
            file_id: row.file_id,
        });
    } catch (err) {
        console.error("❌ Error in getMatrixCompatibility:", err);
        res.status(500).json({error: "Internal server error"});
    }
};


export const saveCompatibilityMatrix = async (req: Request, res: Response): Promise<void> => {
    const {mainBirthDate, inputDate, matrix, file_id} = req.body;

    if (!mainBirthDate || !inputDate || !matrix || !file_id) {
        res.status(400).json({error: "Missing required fields"});
        return;
    }

    try {
        const db = await getDB();
        const matrixStr = JSON.stringify(matrix);

        await db.run(
            `INSERT OR
             REPLACE
             INTO compatibility_matrices (main_birth_date, input_date, matrix, file_id)
             VALUES (?, ?, ?, ?)`,
            [mainBirthDate, inputDate, matrixStr, file_id]
        );

        res.status(200).json({message: "Saved successfully"});
    } catch (err) {
        console.error("❌ Ошибка при сохранении матрицы совместимости:", err);
        res.status(500).json({error: "Failed to save compatibility matrix"});
    }
};

export const deleteUserHandler = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id;
    if (!userId) {
        res.status(400).json({ error: "Missing userId" });
        return;
    }

    try {
        const db = await getDB();

        // Удаляем пользователя и связанные данные (если нужно)
        await db.run('DELETE FROM users WHERE user_id = ?', [userId]);

        // Также можете почистить user_history, matrix_history, premium_access и т.д. если надо

        res.status(200).json({ message: "User deleted" });
    } catch (error) {
        console.error("Ошибка удаления пользователя:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Получает список всех активных пользователей
 */
export const getActiveUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("INFO: [db-api] Запрос на получение активных пользователей.");
        const db = await getDB();
        console.log("INFO: [db-api] База данных получена.");
        const users = await db.all(
            `SELECT user_id, name, is_active, joined_at 
             FROM users 
             WHERE is_active = 1 
             ORDER BY joined_at DESC`
        );
        console.log(`INFO: [db-api] Получено ${users.length} пользователей.`);

        const decryptedUsers = users.map(user => {
            console.log(`DEBUG: [db-api] Дешифрование пользователя: ${user.user_id}`);
            const decryptedName = user.name ? decrypt(user.name) : undefined;
            return {
                id: user.user_id,
                username: decryptedName,
                is_active: Boolean(user.is_active),
                joined_at: user.joined_at
            };
        });
        console.log("INFO: [db-api] Дешифрование завершено.");

        res.json(decryptedUsers);
    } catch (error) {
        console.error("❌ Ошибка при получении списка пользователей:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};