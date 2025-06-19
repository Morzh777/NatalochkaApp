import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./routes"; // или "./routes/index"

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // заменяет body-parser

// Роуты
app.use("/api", routes)

// Запуск сервера
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 API "Расчет Квадрата запущен" на порту ${PORT}`);
});

