import {Context, InlineKeyboard} from "grammy";
import type {LabeledPrice} from "@grammyjs/types";
import {Logger} from "../utils/Logger.js";
import {API_BASE_URL} from "../config/api.js";
import axios from "axios";

import {BotContext} from "../bot/BotSettings.js";
import {Message} from "grammy/types";
import {AppKeyboard} from "../utils/keyboards.js";

const logger = new Logger("PaymentService");

export class PaymentService {
    static starsPrice = 99;
    static payload = "premium_access";

    static async sendInvoice(ctx: Context) {
        try {
            const chatId = ctx.chat?.id;
            if (!chatId) {
                logger.logError("sendInvoice", "Chat ID не найден");
                await ctx.reply("❌ Ошибка: невозможно определить чат для оплаты.");
                return;
            }

            const prices: LabeledPrice[] = [
                { label: "Премиум-доступ", amount: this.starsPrice },
            ];

            const description =
                "💫 Доступ к расшифровкам на 30 дней\n\n" +
                "✔️ Матрица судьбы\n" +
                "✔️ Полная совместимость\n" +
                "✔️ Финансы, цели, потенциал\n" +
                "✔️ Глубокие трактовки и советы\n" +
                "✔️ Все будущие обновления\n\n" +
                "💳 К оплате 99 звёзд (179 рублей)";

            await ctx.api.sendInvoice(
                chatId,
                "Премиум-доступ",
                description,
                this.payload,
                "XTR",
                prices,
                {
                    start_parameter: "buy_premium",
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "Оплатить 99 звезд (179 рублей) ", pay: true }],
                            [{ text: "↩️ Не сейчас", callback_data: "delete_message" }]
                        ]
                    }
                }
            );

            logger.log(`📨 Инвойс на ${this.starsPrice} звёзд отправлен.`);
        } catch (error) {
            logger.logError("sendInvoice", error);
            await ctx.reply("❌ Не удалось отправить счёт. Попробуйте позже.");
        }
    }


    static async handlePreCheckout(ctx: Context) {
        try {
            await ctx.answerPreCheckoutQuery(true);
            logger.log("✅ Pre-checkout подтверждён");
        } catch (error) {
            logger.logError("handlePreCheckout", error);
        }
    }

    static async handleSuccessfulPayment(ctx: BotContext): Promise<Message | void> {
        try {
            const payment = ctx.message?.successful_payment;

            if (payment?.invoice_payload === this.payload) {
                const userId = ctx.from?.id?.toString();
                const chargeId = payment.telegram_payment_charge_id;
                const amount = 30;
                const stars = payment.total_amount;
                logger.log(`✅ Успешная оплата: ${stars} звёзд`);
                logger.log(`💾 Сохраняем подписку: userId=${userId}, chargeId=${chargeId}`);

                try {
                    await axios.post(`${API_BASE_URL}/premium/save-payment`, {
                        userId,
                        chargeId,
                        amount
                    });
                    logger.log("📦 Платёж успешно сохранён в базе");
                } catch (err: any) {
                    logger.logError("❌ Ошибка при сохранении подписки в БД", err);
                    await ctx.reply("⚠️ Платёж прошёл, но не удалось сохранить в базу.");
                    return;
                }

                const sentMessage = await ctx.reply(
                    `🎉 <b>Премиум активирован!</b>\n\n` +
                    `🔓 <b>Тебе открыт доступ к расширенным функциям:</b>\n\n` +
                    `• <b>Матрица судьбы</b> — глубокий разбор потенциала и задач\n` +
                    `• <b>Совместимость</b> — анализ отношений по числу судьбы\n\n` +
                    `👇 Выбери, с чего хочешь начать:`,
                    {
                        parse_mode: "HTML",
                        reply_markup: AppKeyboard.afterPaymentKeyboard(),
                    }
                );
                return sentMessage;
            } else {
                logger.log("⚠️ Получена неизвестная или пустая оплата");
            }
        } catch (error) {
            logger.logError("handleSuccessfulPayment", error);
            await ctx.reply("❌ Ошибка при активации подписки. Попробуй позже.");
        }
    }

    static async refund(ctx: Context, chargeId: string, userId: number) {
        try {
            const botToken = process.env.TG_TOKEN!;
            const url = `https://api.telegram.org/bot${botToken}/refundStarPayment`;

            logger.log(`🔍 Refund attempt:
URL: ${url}
charge_id: ${chargeId}
user_id: ${userId}`);

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    telegram_payment_charge_id: chargeId,
                    user_id: userId,
                }),
            });

            const result = await response.json();
            console.log("Refund response:", result);

            if (!result.ok) {
                throw new Error(result.description || "Неизвестная ошибка");
            }

            logger.log(`🔁 Успешный возврат по charge_id: ${chargeId}`);
            await ctx.reply(`✅ Возврат успешно выполнен:
<code>${chargeId}</code>`, {
                parse_mode: "HTML",
            });
        } catch (error: any) {
            logger.logError("refund", error);
            await ctx.reply(`❌ Ошибка при возврате:
<code>${error.message}</code>`, {
                parse_mode: "HTML",
            });
        }
    }
}
export async function handlePromoCode(ctx: BotContext, code: string) {
    const userId = String(ctx.from?.id);
    const normalized = code.trim();

    try {
        const res = await axios.post(`${API_BASE_URL}/premium/${userId}/redeem`, {
            code: normalized,
        });

        const keyboard = new InlineKeyboard().text("🔙 Назад в меню", "menu");

        const msg = await ctx.reply(res.data.message || "✅ Промокод активирован!", {
            reply_markup: keyboard,
        });

        ctx.session.messageIds = [...(ctx.session.messageIds || []), msg.message_id];
    } catch (error: any) {
        logger.logError("handlePromoCode", error);

        const message = error?.response?.data?.error || "❌ Не удалось активировать промокод.";
        const msg = await ctx.reply(`⚠️ ${message}`);
        ctx.session.messageIds = [...(ctx.session.messageIds || []), msg.message_id];
    } finally {
        ctx.session.flow = undefined;
        ctx.session.state = undefined;
    }
}