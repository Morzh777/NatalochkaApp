// src/validation/schemas.ts
import { z } from "zod";

// 📘 Общие типы
const DateString = z.string().regex(/^\d{2}\.\d{2}\.\d{4}$/, "Формат даты: дд.мм.гггг");
const NonEmptyString = z.string().min(1);
const UserId = z.union([z.string(), z.number()]).transform((val) => String(val).trim());
const Name = z.string().min(1).max(50);

// 👤 Регистрация или обновление пользователя
export const RegisterUserSchema = z.object({
    userId: UserId,
    name: Name,
    birthDate: DateString,
    mainCalculationId: z.number().int().nonnegative(),
});

// 📜 Добавление в историю расчёта
export const AddHistorySchema = z.object({
    userId: UserId,
    calculationId: z.number().int().nonnegative(),
    name: Name,
});

// 📜 Добавление матрицы судьбы в историю
export const AddMatrixHistorySchema = z.object({
    userId: UserId,
    inputDate: DateString,
    name: Name,
    matrixId: z.number().int().optional(),
});

// 💾 Сохранение матрицы судьбы
export const SaveMatrixSchema = z.object({
    inputDate: DateString,
    file_id: NonEmptyString,
    matrix: z.record(z.any()),
    programs: z.array(z.object({
        key: z.string(),
        type: z.string(),
    })).optional(),
});

// 💾 Сохранение матрицы совместимости
export const SaveCompatibilityMatrixSchema = z.object({
    mainBirthDate: DateString,
    inputDate: DateString,
    matrix: z.record(z.any()),
    file_id: NonEmptyString,
});

// 🔎 Получение расчёта по дате
export const GetCalculationByDateSchema = z.object({
    inputDate: DateString,
});

// 🔎 Получение матрицы по дате
export const GetMatrixByDateSchema = z.object({
    userId: UserId,
    inputDate: DateString,
    name: Name,
});

// 🔎 Получение истории (пагинация)
export const PaginatedHistorySchema = z.object({
    userId: UserId,
    page: z.string().optional(),
    pageSize: z.string().optional(),
});

// ✅ Получение совместимости
export const GetCompatibilityMatrixSchema = z.object({
    mainBirthDate: DateString,
    inputDate: DateString,
});

export const FindUserHistorySchema = z.object({
    userId: z.string().min(1),
    inputDate: z.string().regex(/^\d{2}\.\d{2}\.\d{4}$/, "Формат даты: дд.мм.гггг"),
    name: z.string().min(1).max(50),
});

// Схема для проверки параметров запроса getPremiumStatus
export const GetPremiumStatusQuerySchema = z.object({
    withDate: z.string().optional(),
});

// Схема для тела запроса savePremiumPayment
export const SavePremiumPaymentBodySchema = z.object({
    userId: z.union([z.string().min(1), z.number()]).transform(String),
    chargeId: z.string().min(1, "chargeId обязателен"),
    amount: z.number().int().positive("amount должен быть положительным числом"),
});