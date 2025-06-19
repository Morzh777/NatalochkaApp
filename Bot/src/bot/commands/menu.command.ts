import { Bot } from "grammy";
import axios from "axios";
import { BotContext } from "../BotSettings.js";
import { deleteAllBotMessages } from "../../utils/messageUtils.js";
import { API_BASE_URL } from "../../config/api.js";
import { Logger } from "../../utils/Logger.js";
import {showMainMenu} from "../../utils/menu.js";

// ==============================
// 📦 Локальные переменные SRP
// ==============================

// callbacks
const CALLBACK_MENU = "menu";

// API
const api = {
    getUser: (userId: string) => `${API_BASE_URL}/users/${userId}`,
};

// лог-контексты
const LOG_CTX_LOAD_MENU = "загрузка пользователя для меню";

// сообщения
const MSG_MENU_LOAD_ERROR = "⚠️ Не удалось загрузить главное меню.";

// логгер
const logger = new Logger("Menu");

// ==============================
// ✅ Команда
// ==============================
export function registerMenuCommand(bot: Bot<BotContext>) {
    bot.callbackQuery(CALLBACK_MENU, async (ctx: BotContext) => {
        await ctx.answerCallbackQuery();

        await deleteAllBotMessages(ctx);

        try {
            const res = await axios.get(api.getUser(String(ctx.from!.id)));
            const user = res.data;

            const menuMsg = await showMainMenu(ctx, user.name);

            ctx.session.messageIds.push(menuMsg.message_id);
        } catch (error) {
            logger.logError(LOG_CTX_LOAD_MENU, error);

            const errMsg = await ctx.reply(MSG_MENU_LOAD_ERROR);
            ctx.session.messageIds.push(errMsg.message_id);
        }
    });
}
