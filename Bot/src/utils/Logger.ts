import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ESM поддержка __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Logger {
    private moduleName: string;
    private logFile: string;

    constructor(moduleName: string) {
        this.moduleName = moduleName;
        this.logFile = path.join(__dirname, "../../logs/bot.log");

        if (!fs.existsSync(path.dirname(this.logFile))) {
            fs.mkdirSync(path.dirname(this.logFile), { recursive: true });
        }
    }

    public log(message: string): void {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} [${this.moduleName}] ${message}\n`;
        fs.appendFileSync(this.logFile, logMessage);
        console.log(logMessage);
    }

    public logError(context: string, error: unknown): void {
        const timestamp = new Date().toISOString();
        const message = error instanceof Error ? error.message : String(error);
        const fullMessage = `${timestamp} [${this.moduleName}] ❌ Ошибка [${context}]: ${message}\n`;
        fs.appendFileSync(this.logFile, fullMessage);
        console.error(fullMessage);
    }

    public logDebug(context: string, message?: string): void {
        const timestamp = new Date().toISOString();
        const debugMessage = `${timestamp} [${this.moduleName}] 🐞 DEBUG [${context}]: ${message ?? ""}\n`;
        fs.appendFileSync(this.logFile, debugMessage);
        console.debug(debugMessage);
    }

    // ✅ Добавляем info лог
    public logInfo(context: string, message?: string): void {
        const timestamp = new Date().toISOString();
        const infoMessage = `${timestamp} [${this.moduleName}] ℹ️ INFO [${context}]: ${message ?? ""}\n`;
        fs.appendFileSync(this.logFile, infoMessage);
        console.info(infoMessage);
    }

    // ✅ Добавляем warn лог
    public logWarn(context: string, message?: string): void {
        const timestamp = new Date().toISOString();
        const warnMessage = `${timestamp} [${this.moduleName}] ⚠️ WARN [${context}]: ${message ?? ""}\n`;
        fs.appendFileSync(this.logFile, warnMessage);
        console.warn(warnMessage);
    }
}
