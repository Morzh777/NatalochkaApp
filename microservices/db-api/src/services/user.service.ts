import { getDB } from "../db/database";
import {encrypt,decrypt,hash} from "../utils/encryption";
import {
    AddHistorySchema,
    AddMatrixHistorySchema, FindUserHistorySchema,
    GetCalculationByDateSchema,
    RegisterUserSchema
} from "../validation/schemas";


/**
 * Регистрирует пользователя (или обновляет, если уже есть)
 */
export async function addUser(
    userId: string,
    name: string,
    birthDate: string,
    mainCalculationId: number
): Promise<void> {
    RegisterUserSchema.parse({ userId, name, birthDate, mainCalculationId });
    const db = await getDB();
    await db.run(
        `INSERT INTO users (user_id, name, birth_date, main_calculation_id, is_active)
         VALUES (?, ?, ?, ?, 1)
         ON CONFLICT(user_id) DO UPDATE SET
                                            name = excluded.name,
                                            birth_date = excluded.birth_date,
                                            main_calculation_id = excluded.main_calculation_id,
                                            is_active = excluded.is_active`,
        [userId, encrypt(name), encrypt(birthDate), mainCalculationId]
    );
}

/**
 * Добавляет расчёт в историю пользователя, если его ещё нет
 */
export async function addToUserHistory(
    userId: string,
    calculationId: number,
    name: string
): Promise<void> {
    AddHistorySchema.parse({ userId, calculationId, name });
    const db = await getDB();
    await db.run(
        `INSERT OR IGNORE INTO user_history (user_id, calculation_id, name, name_hash)
         VALUES (?, ?, ?, ?)`,
        [userId, calculationId, encrypt(name), hash(name)]
    );
    console.log("✅ История попыталась сохраниться:", { userId, calculationId, name });
}


/**
 * Получает конкретный расчёт из истории пользователя
 */

export async function findUserHistory(
    userId: string,
    inputDate: string,
    name: string
): Promise<{ name: string, square: any, file_id: string } | null> {
    FindUserHistorySchema.parse({ userId, inputDate, name });
    const db = await getDB();
    const result = await db.get(
        `SELECT uh.name, c.square, c.file_id
     FROM user_history uh
     JOIN calculations c ON uh.calculation_id = c.id
     WHERE uh.user_id = ? AND uh.name_hash = ? AND c.input_date = ?`,
        [userId, hash(name), inputDate]
    );
    if (!result) return null;
    try {
        return {
            ...result,
            name: decrypt(result.name),
            square: JSON.parse(result.square),
        };
    } catch (error) {
        console.error("❌ Ошибка парсинга square JSON:", error, "\nСодержимое:", result.square);
        return null;
    }
}

/**
 * Возвращает историю всех расчётов пользователя
 */
export async function getUserCalculations(userId: string): Promise<{ name: string, input_date: string, calculation_id: number }[]> {
    const db = await getDB();
    const rows = await db.all(
        `SELECT uh.name, c.input_date, c.id as calculation_id
         FROM user_history uh
                  JOIN calculations c ON uh.calculation_id = c.id
         WHERE uh.user_id = ?
         ORDER BY uh.created_at DESC`,
        [userId]
    );
    return rows.map((r) => ({ ...r, name: decrypt(r.name) }));
}

export async function saveCalculation(
    birthDate: string,
    square: Record<string, number>,
    file_id: string
): Promise<{ id: number }> {
    GetCalculationByDateSchema.parse({ inputDate: birthDate });
    const db = await getDB();
    const exists = await db.get(`SELECT id FROM calculations WHERE input_date = ?`, [birthDate]);
    if (exists) return { id: exists.id };
    const result = await db.run(
        `INSERT INTO calculations (input_date, square, file_id)
         VALUES (?, ?, ?)`,
        [birthDate, JSON.stringify(square), file_id]
    );
    return { id: result.lastID! };
}

export async function getCalculationById(id: number): Promise<{ id: number, input_date: string, square: any, file_id: string } | null> {
    const db = await getDB();
    const row = await db.get(
        `SELECT id, input_date, square, file_id FROM calculations WHERE id = ?`,
        [id]
    );
    if (!row) return null;
    try {
        return { ...row, square: JSON.parse(row.square) };
    } catch (e) {
        console.error("❌ Ошибка парсинга square JSON:", e);
        return null;
    }
}

export async function getCalculationByDate(birthDate: string): Promise<{ id: number; square: Record<string, number>; file_id: string; }> {
    GetCalculationByDateSchema.parse({ inputDate: birthDate });
    const db = await getDB();
    const row = await db.get(
        `SELECT id, square, file_id FROM calculations WHERE input_date = ?`,
        [birthDate]
    );
    if (!row) throw new Error("Расчёт не найден");
    return {
        id: row.id,
        square: JSON.parse(row.square),
        file_id: row.file_id,
    };
}

export async function addToDestinyHistory(
    userId: string,
    inputDate: string,
    name: string,
    matrixId?: number
) {
    AddMatrixHistorySchema.parse({ userId, inputDate, name, matrixId });
    const db = await getDB();

    // ✅ Явно проверим, существует ли пользователь
    const userExists = await db.get(
        `SELECT user_id FROM users WHERE user_id = ?`,
        [userId]
    );

    if (!userExists) {
        console.error("❌ Пользователь не найден в базе при попытке вставки в matrix_history:", userId);
        throw new Error("User does not exist — cannot insert into matrix_history");
    }

    const encryptedName = encrypt(name);
    const nameHash = hash(name);
    const result = await db.run(
        `INSERT OR IGNORE INTO matrix_history (user_id, input_date, name, name_hash, matrix_id)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, inputDate.trim(), encryptedName, nameHash, matrixId ?? null]
    );

    console.log("📊 SQLite insert result:", { changes: result.changes, userId, inputDate, name, matrixId });

    if (result.changes === 0) {
        console.warn("⚠️ Строка не добавлена в matrix_history — уже существует или данные некорректны.");
    } else {
        console.log("📘 Матрица добавлена в историю destiny_history");
    }
}

export async function getDestinyHistory(userId: string): Promise<any[]> {
    const db = await getDB();
    console.log("📡 SELECT из destiny_history по userId:", userId);
    const rows = await db.all(
        `SELECT * FROM matrix_history WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
    );
    console.log("📋 Полученные строки:", rows);
    return rows;
}



