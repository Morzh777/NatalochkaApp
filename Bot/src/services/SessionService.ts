import { BotContext } from "../bot/BotSettings.js";
import { Flow } from "../types/Flow.js";
import { Logger } from "../utils/Logger.js";

// ==============================
// 📦 Константы
// ==============================

const DEFAULT_STATE = "day";
const MSG_LOADING_FORM = "⏳ Загружаем форму...";
const LOG_CTX_RESET_SESSION = "сброс сессии";

const logger = new Logger("Session");

// ==============================
// 🔁 Класс SessionService
// ==============================
export class SessionService {
    /**
     * Сбрасывает сессию и запускает нужный поток
     */
    public static async resetForFlow(
        ctx: BotContext,
        flow: Flow
    ): Promise<number | undefined> {
        try {
            ctx.session = {
                ...ctx.session,
                day: undefined,
                month: undefined,
                year: undefined,
                name: undefined,
                square: undefined,
                openedFromHistory: false,
                flow,
                state: DEFAULT_STATE,
            };

            const msg = await ctx.reply(MSG_LOADING_FORM);
            return msg.message_id;
        } catch (error) {
            logger.logError(LOG_CTX_RESET_SESSION, error);
            return;
        }
    }
}
