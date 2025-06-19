import { Bot } from "grammy";
import { BotContext } from "../BotSettings.js";
import { Logger } from "../../utils/Logger.js";
import { DateSelectorService } from "../../services/DateSelectorService.js";
import { PaymentService } from "../../services/PaymentService.js";
import { Flow } from "../../types/Flow.js";

const EVENT_TEXT_MESSAGE = "message:text";
const LOG_CTX_DELETE_PROMPT = "удаление prompt-сообщения";
const logger = new Logger("Fallback");

export function registerFallbacks(bot: Bot<BotContext>) {
    bot.on(EVENT_TEXT_MESSAGE, async (ctx) => {
        if (!ctx.message || !ctx.message.text) return;

        const text = ctx.message.text.trim();
        logger.logInfo(`Fallback handler received message: "${text}". Current session state: ${ctx.session.state}`);

        // Игнорируем команды, начинающиеся с '/'
        if (text.startsWith('/')) {
            logger.logInfo(`Ignoring command: ${text}`);
            return;
        }

        // 🔁 Если ожидаем charge_id для возврата
        if (ctx.session.flow === Flow.awaitRefundChargeId) {
            ctx.session.flow = undefined;

            const chargeId = text;
            const userId = 69884361;

            await ctx.reply("⏳ Пытаемся выполнить возврат...");
            await PaymentService.refund(ctx, chargeId, userId);

            return;
        }

        // 🔒 Если пользователь в процессе оплаты
        if (ctx.session.flow === Flow.buy) {
            if (!text.startsWith("/")) {
                await ctx.deleteMessage();
                await ctx.reply("💳 Чтобы продолжить, пожалуйста, оплатите доступ через команду /buy");
                return;
            }
            return;
        }

        // 💬 Удаляем сообщение пользователя
        await ctx.deleteMessage();

        if (ctx.session.botMessageId) {
            try {
                await ctx.api.deleteMessage(ctx.chat.id, ctx.session.botMessageId);
            } catch (e) {
                logger.logError(LOG_CTX_DELETE_PROMPT, e);
            }
            ctx.session.botMessageId = undefined;
        }

        // 🔁 Обрабатываем ввод
        await DateSelectorService.processState(ctx, text);
    });
}