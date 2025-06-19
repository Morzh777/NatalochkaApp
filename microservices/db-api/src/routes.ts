import { Router } from "express";
import {
    registerUser,
    getUserHistory,
    getCalculationFromHistory,
    getUserById,
    saveCalculationHandler,
    addInHistory,
    getCalculationByIdHandler,
    getPaginatedUserHistory,
    getUserCompatibilityHistory,
    saveMatrixHandler,
    getMatrixHandler,
    getCalculationByDateHandler,
    saveMatrixHistory,
    getMatrixHistory,
    getMatrixByDateHandler,
    getMatrixCompatibility,
    saveCompatibilityMatrix,
    deleteUserHandler,
    getActiveUsers
} from "./controllers/user.controller";
import {
    getPremiumStatus,
    redeemPremiumCode,
    savePremiumPayment
} from "./controllers/premium.controller";

const router = Router();

// ─────────── 👤 Пользователи ───────────
router.post("/user", registerUser);                     // Регистрация
router.get("/users/active", getActiveUsers); // Новый маршрут для получения активных пользователей
router.get("/users/:id", getUserById);                  // Профиль
router.delete("/users/:id", deleteUserHandler);
// ─────────── 📊 История ───────────
router.get("/users/:id/history", getUserHistory);       // Вся история
router.get("/users/:id/history/by-date", getCalculationFromHistory); // По дате
router.post("/user_history", addInHistory);             // Добавить в историю

// ─────────── 📑 Пагинация истории (внешний и внутренний доступ) ───────────
router.get("/users/:id/history/paginated", getPaginatedUserHistory);       // ✅ для API Gateway
router.get("/internal/users/:id/history/paginated", getPaginatedUserHistory); // 🔒 internal
router.get("/api/users/:id/history/paginated", getPaginatedUserHistory);


// ─────────── 📅 Расчёты ───────────
router.post("/calculation", saveCalculationHandler);
router.get("/calculation", getCalculationByDateHandler);
router.get("/calculation/:id", getCalculationByIdHandler);


// ─────────── 💞 Совместимость (внешний и внутренний доступ) ───────────
router.get("/users/:id/compatibility", getUserCompatibilityHistory);
router.get("/internal/users/:id/compatibility", (req, res) => {
    console.log(`🔒 Internal-запрос на совместимость: ${req.params.id}`);
    getUserCompatibilityHistory(req, res);
});
router.get("/matrix/compatibility/by-date", getMatrixCompatibility);
router.post("/matrix", saveMatrixHandler);
router.get("/matrix", getMatrixHandler);


router.post("/matrix_history", saveMatrixHistory);
router.get("/matrix_history/paginated", getMatrixHistory);
router.get("/matrix/by-date", getMatrixByDateHandler);
router.post("/matrix/compatibility/save", saveCompatibilityMatrix);

// Премиум
router.get("/premium/:userId", getPremiumStatus);
router.post("/premium/save-payment", savePremiumPayment);
router.post("/premium/:userId/redeem", redeemPremiumCode);

export default router;