// db-api/src/controllers/premium.controller.ts
import type { Request, Response } from "express";
import { getDB } from "../db/database";
import {GetPremiumStatusQuerySchema, SavePremiumPaymentBodySchema} from "../validation/schemas";


/**
 * Проверяет, активен ли премиум-доступ у пользователя
 */
export const getPremiumStatus = async (req: Request, res: Response): Promise<void> => {
    const parseResult = GetPremiumStatusQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
        res.status(400).json({ error: "Invalid query parameters", issues: parseResult.error.format() });
        return;
    }

    const { withDate } = parseResult.data;
    const db = await getDB();
    const userId = req.params.userId;

    try {
        const row = await db.get<{ purchased_at: string; amount: number }>(
            `SELECT purchased_at, amount
             FROM premium_access
             WHERE user_id = ?
             ORDER BY purchased_at DESC
             LIMIT 1`,
            userId
        );

        if (!row) {
            res.json({ isActive: false });
            return;
        }

        const purchasedAt = new Date(row.purchased_at);
        const expiresAt = new Date(purchasedAt.getTime() + row.amount * 24 * 60 * 60 * 1000);
        const isActive = new Date() < expiresAt;

        if (withDate === "true") {
            res.json({
                isActive,
                expiresAt: expiresAt.toISOString(),
            });
        } else {
            res.json({ isActive });
        }
    } catch (error) {
        console.error("❌ Ошибка при проверке подписки:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


/**
 * Сохраняет успешную оплату премиума в базу данных
 */
export const savePremiumPayment = async (req: Request, res: Response): Promise<void> => {
    const parseResult = SavePremiumPaymentBodySchema.safeParse(req.body);
    if (!parseResult.success) {
        res.status(400).json({ error: "Validation failed", issues: parseResult.error.format() });
        return;
    }

    const { userId, chargeId, amount } = parseResult.data;

    try {
        const db = await getDB();
        await db.run(
            `INSERT INTO premium_access (user_id, charge_id, amount, purchased_at)
             VALUES (?, ?, ?, DATETIME('now'))`,
            userId,
            chargeId,
            amount
        );

        res.json({ success: true });
    } catch (err: any) {
        console.error("❌ Ошибка при сохранении оплаты:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const validPromoCodes = new Map<string, { days: number; limit: number }>([
    ["LOVERS", { days: 3, limit: 25 }],

]);

export const redeemPremiumCode = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { code } = req.body;

    if (!userId || typeof code !== "string" || !code.trim()) {
        res.status(400).json({ error: "Missing or invalid userId or code" });
        return;
    }

    const normalizedCode = code.trim().toUpperCase();
    const promo = validPromoCodes.get(normalizedCode);

    if (!promo) {
        res.status(404).json({ error: "Invalid or expired promo code" });
        return;
    }

    try {
        const db = await getDB();
        const chargeId = `PROMO:${normalizedCode}`;

        // 🔒 Проверка: использовал ли юзер этот промокод
        const alreadyUsed = await db.get(
            `SELECT 1 FROM premium_access WHERE user_id = ? AND charge_id = ?`,
            userId,
            chargeId
        );

        if (alreadyUsed) {
            res.status(409).json({ error: "You already used this promo code" });
            return;
        }

        // 📊 Проверка общего количества использований
        const usage = await db.get<{ count: number }>(
            `SELECT COUNT(*) as count FROM premium_access WHERE charge_id = ?`,
            chargeId
        );

        const totalUses = usage?.count ?? 0;
        if (totalUses >= promo.limit) {
            res.status(409).json({ error: "Promo code usage limit reached" });
            return;
        }

        // ✅ Добавление доступа
        await db.run(
            `INSERT INTO premium_access (user_id, charge_id, amount, purchased_at)
             VALUES (?, ?, ?, DATETIME('now'))`,
            userId,
            chargeId,
            promo.days
        );

        console.log(`✅ Promo "${normalizedCode}" activated for user ${userId}`);

        res.json({ success: true, days: promo.days });
    } catch (error) {
        console.error("❌ Error redeeming promo code:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
