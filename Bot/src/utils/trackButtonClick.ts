import fs from "fs/promises";
import path from "path";

const LOG_DIR = path.resolve("analytics");
const LOG_PATH = path.join(LOG_DIR, "button_clicks.log");
const WRITE_INTERVAL_MS = 5000; // Каждые 5 сек
const MAX_BUFFER_SIZE = 100;    // Или при 100 записях

let buffer: string[] = [];
let isWriting = false;

// ✅ Создаём директорию, если её нет
fs.mkdir(LOG_DIR, { recursive: true }).catch(console.error);

// Периодическая запись в файл
setInterval(flushBuffer, WRITE_INTERVAL_MS);

export function trackButtonClick(callback: string) {
    const entry = {
        time: new Date().toISOString(),
        callback,
    };

    buffer.push(JSON.stringify(entry));

    // Если буфер большой — сразу пишем
    if (buffer.length >= MAX_BUFFER_SIZE) flushBuffer().catch(console.error);
}

// Сброс буфера в файл
async function flushBuffer() {
    if (isWriting || buffer.length === 0) return;

    isWriting = true;
    const toWrite = buffer.join("\n") + "\n";
    buffer = [];

    try {
        await fs.appendFile(LOG_PATH, toWrite);
        console.log(`📝 Записано ${toWrite.split("\n").length - 1} логов`);
    } catch (err) {
        console.error("❌ Ошибка при записи логов:", err);
        buffer.unshift(...toWrite.trim().split("\n")); // восстановление буфера
    } finally {
        isWriting = false;
    }
}
