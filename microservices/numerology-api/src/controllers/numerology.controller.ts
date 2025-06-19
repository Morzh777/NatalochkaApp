import { Request, Response, NextFunction } from "express";
import {calculateCompatibilityMatrix, calculateMatrix, NumerologyService} from "../services/numerology.service";

import path from "path";
import fs from "fs";
import {ImageHelper} from "../services/ImageHelper";
import {MatrixImageHelper} from "../services/MatrixImageHelper";
import {
    findAllValidPrograms,
    ProgramKey,
    programLines
} from "../services/ProgramLineService";
import {programKeys} from "../services/programKeys";
import {MatrixResult} from "../types/descriptions";


/**
 * Контроллер, отвечающий за обработку нумерологических запросов.
 *
 * В текущей реализации содержит один метод — `calculateWithImage`,
 * который рассчитывает квадрат Пифагора по дате рождения и возвращает PNG изображение.
 */
type ProgramItem = {
    key: ProgramKey;
    type: "обычная" | "кармическая";
    title: string;
};
export class NumerologyController {
    /**
     * Обрабатывает POST-запрос на `/calculate`.
     *
     * 🧮 Логика:
     * - Получает дату рождения из тела запроса
     * - Выполняет расчёт квадрата Пифагора (матрицы)
     * - Генерирует изображение этой матрицы
     * - Возвращает PNG в ответ пользователю
     *
     * 📥 Пример запроса:
     * ```json
     * {
     *   "birthDate": "21.03.1990"
     * }
     * ```
     *
     * 📤 Ответ:
     * - `200 OK` с изображением PNG (image/png)
     * - `400 Bad Request`, если `birthDate` отсутствует
     * - `500 Internal Server Error`, если что-то пошло не так
     *
     * @param req - Объект запроса Express, ожидается поле `birthDate` в теле
     * @param res - Объект ответа Express, куда будет передано изображение
     * @param next - Middleware функция для обработки ошибок
     */

    public async calculateWithImage(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { birthDate, skipImage } = req.body;

            if (!birthDate) {
                res.status(400).json({ error: "birthDate is required" });
                return;
            }

            const square = NumerologyService.calculatePythagoreanSquare(birthDate);

            if (skipImage) {
                // ⚠️ Вернуть только square — для расчёта совместимости
                res.json({ square });
                return;
            }

            // Стандартное поведение с генерацией PNG
            const filename = `square_${Date.now()}.png`;
            const tmpPath = path.join(process.cwd(), "tmp", filename);

            await ImageHelper.generateImage(square, birthDate, tmpPath);

            res.setHeader("Content-Type", "image/png");
            const stream = fs.createReadStream(tmpPath);
            stream.pipe(res);
            stream.on("end", () => fs.unlink(tmpPath, () => {}));
        } catch (error) {
            next(error);
        }
    }
    public  async calculateWithJson(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { birthDate } = req.body;

            if (!birthDate) {
                res.status(400).json({ error: "birthDate is required" });
                return;
            }

            const square = NumerologyService.calculatePythagoreanSquare(birthDate);
            const base64 = await ImageHelper.generateBase64Image(square, birthDate);

            res.json({
                square,
                image: `data:image/png;base64,${base64}`
            });
        } catch (error) {
            next(error);
        }
    }


    public async calculateMatrixJson(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { birthDate } = req.body;

            if (!birthDate) {
                res.status(400).json({ error: "birthDate is required" });
                return;
            }

            const matrix = calculateMatrix(birthDate);
            const base64 = await MatrixImageHelper.generateMatrixBase64Image(matrix, birthDate);

            // 🔐 Типобезопасная генерация keyMap
            const keyMap: Record<ProgramKey, ProgramItem[]> = {};

            for (const item of programKeys) {
                const trimmedKey = item.key.trim();

                if (/^\d{1,2}-\d{1,2}-\d{1,2}$/.test(trimmedKey)) {
                    const key = trimmedKey as ProgramKey;

                    if (!keyMap[key]) keyMap[key] = [];

                    const alreadyExists = keyMap[key].some(p => p.type === item.type);
                    if (!alreadyExists) {
                        keyMap[key].push({
                            key,
                            type: item.type === "кармическая" ? "кармическая" : "обычная",
                            title: item.title,
                        });
                    }
                }
            }

            // 🔥 Используем новую единую функцию
            const programs = findAllValidPrograms(matrix, programLines, keyMap);

            console.log("📦 Возвращаемые программы:", programs);
            console.log("🧮 Рассчитанная матрица:", matrix);

            res.json({
                matrix,
                image: `data:image/png;base64,${base64}`,
                programs,
            });

        } catch (error) {
            console.error("❌ Ошибка в calculateMatrixJson:", error);
            next(error);
        }
    }
}
export async function calculateCompatibilityHandler(req: Request, res: Response): Promise<void> {
    const { birthDate, mainBirthDate } = req.body;

    if (!birthDate || !mainBirthDate) {
        res.status(400).json({ error: "birthDate and mainBirthDate are required" });
        return;
    }

    try {
        const matrixA = calculateMatrix(mainBirthDate);
        const matrixB = calculateMatrix(birthDate);

        const result = calculateCompatibilityMatrix(matrixA, matrixB);

        const filename = `tmp_${Date.now()}.png`;
        const tmpPath = path.join(process.cwd(), "tmp", filename);

        // 👇 Приведение типа
        await MatrixImageHelper.generateMatrixImage(result as MatrixResult, birthDate, tmpPath);

        const base64 = fs.readFileSync(tmpPath, { encoding: "base64" });
        fs.unlinkSync(tmpPath);

        res.json({
            matrix: result,
            image: `data:image/png;base64,${base64}`,
        });
    } catch (err) {
        console.error("❌ Ошибка расчёта совместимости:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const numerologyController = new NumerologyController();