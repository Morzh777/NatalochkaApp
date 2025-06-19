import sqlite3 from "sqlite3";
import {open, Database} from "sqlite";
import path from "path";
import fs from "fs";

// ===============================
// 🧠 Singleton-инстанс базы данных
// ===============================
let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

/**
 * 📦 Возвращает и инициализирует подключение к SQLite-базе.
 * Создаёт все нужные таблицы при первом вызове.
 */
export async function getDB(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
    if (!db) {
        const dbPath = path.resolve("data", "bot-data.db");
        console.log("📁 Путь к базе данных:", dbPath);
        const dbDir = path.dirname(dbPath);

        // 📂 Создаёт директорию, если её нет
        console.log(`INFO: [db-api] Проверка существования директории: ${dbDir}`);
        if (!fs.existsSync(dbDir)) {
            console.log(`INFO: [db-api] Директория ${dbDir} не найдена, создаю.`);
            fs.mkdirSync(dbDir, {recursive: true});
            console.log(`INFO: [db-api] Директория ${dbDir} создана.`);
        }

        console.log("INFO: [db-api] Открытие базы данных...");
        db = await open({filename: dbPath, driver: sqlite3.Database});
        console.log("INFO: [db-api] База данных открыта, выполнение PRAGMA...");
        await db.exec("PRAGMA foreign_keys = ON"); // ✅ это включает поддержку внешних ключей
        await db.exec("PRAGMA journal_mode = WAL;");
        await db.exec("PRAGMA synchronous = NORMAL;");
        console.log("INFO: [db-api] PRAGMA выполнены. Создание таблиц...");

        // 👤 Таблица пользователей
        console.log("INFO: [db-api] Создание таблицы 'users'...");
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users
            (
                user_id             TEXT PRIMARY KEY,
                name                TEXT,
                birth_date          TEXT,
                main_calculation_id INTEGER,
                is_active           INTEGER  NOT NULL DEFAULT 1,
                joined_at           DATETIME NOT NULL DEFAULT (DATETIME('now'))
            );
        `);
        console.log("INFO: [db-api] Таблица 'users' создана.");

        // 🧮 Таблица расчётов (Квадрат Пифагора)
        console.log("INFO: [db-api] Создание таблицы 'calculations'...");
        await db.exec(`
            CREATE TABLE IF NOT EXISTS calculations
            (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                input_date TEXT     NOT NULL UNIQUE,
                square     TEXT     NOT NULL, -- JSON строка
                file_id    TEXT     NOT NULL,
                created_at DATETIME NOT NULL DEFAULT (DATETIME('now'))
            );
        `);
        console.log("INFO: [db-api] Таблица 'calculations' создана.");

        // 🔮 Таблица матриц судьбы
        console.log("INFO: [db-api] Создание таблицы 'destiny_matrices'...");
        await db.exec(`
            CREATE TABLE IF NOT EXISTS destiny_matrices
            (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                input_date TEXT     NOT NULL UNIQUE,
                matrix     TEXT     NOT NULL, -- JSON строка
                file_id    TEXT     NOT NULL,
                programs   TEXT,              -- JSON строка с программами
                created_at DATETIME NOT NULL DEFAULT (DATETIME('now'))
            );
        `);
        console.log("INFO: [db-api] Таблица 'destiny_matrices' создана.");

        // 🕓 История расчётов пользователя
        console.log("INFO: [db-api] Создание таблицы 'user_history'...");
        await db.exec(`
            CREATE TABLE IF NOT EXISTS user_history
            (
                user_id        TEXT     NOT NULL,
                calculation_id INTEGER  NOT NULL,
                name           TEXT     NOT NULL, -- шифрованное имя для отображения
                name_hash      TEXT     NOT NULL, -- хэш имени для поиска
                created_at     DATETIME NOT NULL DEFAULT (DATETIME('now')),
                UNIQUE (user_id, calculation_id, name)
            );
        `);
        console.log("INFO: [db-api] Таблица 'user_history' создана.");

        // 🧾 История матриц судьбы
        console.log("INFO: [db-api] Создание таблицы 'matrix_history'...");
        await db.exec(`
            CREATE TABLE IF NOT EXISTS matrix_history
            (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id    TEXT     NOT NULL,
                input_date TEXT     NOT NULL,
                name       TEXT     NOT NULL,
                name_hash  TEXT     NOT NULL, -- хэш имени для поиска
                matrix_id  INTEGER,           -- может быть NULL, если матрица ещё не рассчитана
                created_at DATETIME NOT NULL DEFAULT (DATETIME('now')),
                UNIQUE (user_id, input_date, name)
            );
        `);
        console.log("INFO: [db-api] Таблица 'matrix_history' создана.");

        // 💎 Таблица Premium-подписок
        console.log("INFO: [db-api] Создание таблицы 'premium_access'...");
        await db.exec(`
            CREATE TABLE IF NOT EXISTS premium_access
            (
                user_id      TEXT     NOT NULL,
                charge_id    TEXT     NOT NULL,
                amount       INTEGER  NOT NULL,
                purchased_at DATETIME NOT NULL DEFAULT (DATETIME('now')),
                PRIMARY KEY (user_id, charge_id)
            );
        `);
        console.log("INFO: [db-api] Таблица 'premium_access' создана.");

        // 💎 Таблица матриц совместимости
        console.log("INFO: [db-api] Создание таблицы 'compatibility_matrices'...");
        await db.exec(`
            CREATE TABLE IF NOT EXISTS compatibility_matrices
            (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                main_birth_date TEXT     NOT NULL,
                input_date      TEXT     NOT NULL,
                matrix          TEXT     NOT NULL,
                file_id         TEXT,
                created_at      DATETIME NOT NULL DEFAULT (DATETIME('now')),
                UNIQUE (main_birth_date, input_date)
            );
        `);
        console.log("INFO: [db-api] Таблица 'compatibility_matrices' создана.");

        // 🔥 Индексы для оптимизации запросов
        console.log("INFO: [db-api] Создание индексов...");
        await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_user_history_user_id ON user_history (user_id);
            CREATE INDEX IF NOT EXISTS idx_user_history_calculation_id ON user_history (calculation_id);
            CREATE INDEX IF NOT EXISTS idx_user_history_created_at ON user_history (created_at);

            CREATE UNIQUE INDEX IF NOT EXISTS idx_calculations_input_date ON calculations (input_date);
            CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations (created_at);

            CREATE INDEX IF NOT EXISTS idx_matrix_history_user_id ON matrix_history (user_id);
            CREATE INDEX IF NOT EXISTS idx_matrix_history_input_date ON matrix_history (input_date);
            CREATE INDEX IF NOT EXISTS idx_matrix_history_created_at ON matrix_history (created_at);
        `);
        console.log("INFO: [db-api] Индексы созданы.");

    }
    return db;
}

/**
 * 🔒 Закрывает соединение с базой
 */
export async function closeDB(): Promise<void> {
    if (db) {
        await db.close();
        db = null;
    }
}

// 🛑 Обработка SIGINT (Ctrl + C) — корректно закрываем базу
process.on("SIGINT", async () => {
    console.log("⏹️ Завершение работы...");
    await closeDB();
    process.exit(0);
});
