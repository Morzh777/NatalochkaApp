
import { createCanvas, Canvas, loadImage } from "canvas";
import * as fs from "fs";
import path from "path";
import { matrixPositions } from "../constants/DescriptionPos";
import { MatrixResult } from "../types/descriptions";

export class MatrixImageHelper {
    /**
     * Создание канваса с матрицей (1080x1080) на тёмной теме + шаблон
     */
    public static async createMatrixCanvas(
        matrix: MatrixResult,
        calcDate: string
    ): Promise<Canvas> {
        const canvas = createCanvas(1080, 1080);
        const ctx = canvas.getContext("2d");

        // Загрузка шаблона
        const bgPath = path.resolve(__dirname, "../images/matrix-template.png");
        const bg = await loadImage(bgPath);
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

        // Дата вверху
        // ctx.fillStyle = "white";
        // ctx.font = "bold 40px Arial";
        // ctx.textAlign = "center";
        // ctx.fillText(calcDate, canvas.width / 2, 60);

        this.drawMatrix(ctx, matrix);
        return canvas;
    }

    /**
     * Отрисовка всех точек матрицы
     */
    private static drawMatrix(ctx: any, matrix: MatrixResult) {
        for (const pos of matrixPositions) {
            const r = 44;

            // Значение
            const raw = matrix[pos.key as keyof MatrixResult];
            const value = String(raw ?? "-");

            const big = ["A", "B", "V", "G", "D","E", "Zh", "Z", "I"];
            const medium = ["BBD","EED","AAD","ZZD","GGD","IID","VVD","ZhZhD",];

            let fontSize = "bold 35px Arial";
            if (big.includes(pos.key)) fontSize = "bold 60px Arial";
            else if (medium.includes(pos.key)) fontSize = "bold 45px Arial";

            ctx.fillStyle = "white";
            ctx.font = fontSize;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(value, pos.x, pos.y);

        }
    }

    /**
     * Генерация PNG-файла по пути
     */
    public static async generateMatrixImage(
        matrix: MatrixResult,
        calcDate: string,
        outputPath: string
    ) {
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const canvas = await this.createMatrixCanvas(matrix, calcDate);
        const buffer = canvas.toBuffer("image/png");
        fs.writeFileSync(outputPath, buffer);
    }

    /**
     * Генерация base64-строки изображения
     */
    public static async generateMatrixBase64Image(
        matrix: MatrixResult,
        calcDate: string
    ): Promise<string> {
        const canvas = await this.createMatrixCanvas(matrix, calcDate);
        return canvas.toBuffer("image/png").toString("base64");
    }
}

