import dotenv from "dotenv"
dotenv.config();
console.log("DEBUG: [db-api] SECRET_KEY value:", process.env.SECRET_KEY ? "Loaded" : "Not loaded");

import express from "express";
import cors from "cors";
import router from "./routes";
import { getDB } from "./db/database.js";

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Роуты
app.use("/api", router);

// Глобальный обработчик ошибок
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("💥 Global Error Handler:", err);
    if (err.stack) console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error (global handler)" });
});

// Запуск сервера
(async () => {
    try {
        // Инициализируем базу данных перед запуском сервера
        await getDB(); 
        console.log("✅ DB-API: База данных инициализирована.");

        app.listen(PORT, () => {
            console.log(`🚀 DB-сервис запущен на порту ${PORT}`);
        });
    } catch (error) {
        console.error("❌ DB-API: Ошибка при запуске сервиса или инициализации БД:", error);
        process.exit(1); // Завершаем процесс, если не удалось запустить сервер или БД
    }
})();
