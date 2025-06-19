import { createCanvas, Canvas, loadImage } from "canvas";
import * as fs from "fs";
import path from "path";
import { positions } from "../constants/DescriptionPos";



export class ImageHelper {
    public static async createCanvas(square: Record<string, string>, calcDate: string): Promise<Canvas> {
        const canvas = createCanvas(700, 650);
        const ctx = canvas.getContext("2d") as any;

        const bgPath = path.resolve(__dirname, "../images/template.png");
        const bg = await loadImage(bgPath);
        ctx.drawImage(bg, 0, 0, 700, 650);

        ctx.fillStyle = "rgb(255, 100, 150)";
        ctx.font = "bold 44px Arial";
        ctx.textAlign = "center";
        ctx.fillText(calcDate, 350, 139);

        this.drawAll(ctx, square);
        return canvas;
    }

    private static drawAll(ctx: CanvasRenderingContext2D, square: Record<string, string>) {
        const cellWidth = 160;
        const cellHeight = 100;
        const gap = 7;

        const gridCols = 4;
        const gridRows = 5;

        const totalWidth = gridCols * cellWidth + (gridCols - 1) * gap;
        const totalHeight = gridRows * cellHeight + (gridRows - 1) * gap;

        const offsetX = (700 - totalWidth) / 2; // 700 — ширина canvas
        const offsetY = (650 - totalHeight) / 2 + 60 + 40; // 650 — высота canvas (+60 для отступа под заголовок)

        positions.forEach((pos) => {
            const x = offsetX + pos.col * (cellWidth + gap);
            const y = offsetY + pos.row * (cellHeight + gap);

            const isBlackCell = pos.col === 3 || pos.row === 3;
            const bgColor = isBlackCell ? "#000000" : "#363636";

            // 🎯 Рисуем скруглённый прямоугольник
            const radius = 12;
            ctx.fillStyle = bgColor;
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + cellWidth - radius, y);
            ctx.quadraticCurveTo(x + cellWidth, y, x + cellWidth, y + radius);
            ctx.lineTo(x + cellWidth, y + cellHeight - radius);
            ctx.quadraticCurveTo(x + cellWidth, y + cellHeight, x + cellWidth - radius, y + cellHeight);
            ctx.lineTo(x + radius, y + cellHeight);
            ctx.quadraticCurveTo(x, y + cellHeight, x, y + cellHeight - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();

            // 🏷️ Название
            ctx.fillStyle = "white";
            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.fillText(pos.label, x + cellWidth / 2, y + 40);

            // 🔢 Значение
            const val = square[pos.key] || "-";
            ctx.fillStyle = "rgb(255, 100, 150)";
            ctx.font = "bold 22px Arial";
            ctx.fillText(val, x + cellWidth / 2, y + 75);
        });
    }

    /**
     * Общий приватный метод: создаёт PNG-буфер изображения
     */
    private static async generateBuffer(
        square: Record<string, string>,
        calcDate: string
    ): Promise<Buffer> {
        const canvas = await this.createCanvas(square, calcDate);
        return canvas.toBuffer("image/png");
    }

    /**
     * Генерация изображения и запись в файл
     */
    public static async generateImage(
        square: Record<string, string>,
        calcDate: string,
        outputPath: string
    ) {
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const buffer = await this.generateBuffer(square, calcDate);
        fs.writeFileSync(outputPath, buffer);
    }

    /**
     * Генерация изображения и возврат в формате base64
     */
    public static async generateBase64Image(
        square: Record<string, string>,
        calcDate: string
    ): Promise<string> {
        const buffer = await this.generateBuffer(square, calcDate);
        return buffer.toString("base64");
    }

}

