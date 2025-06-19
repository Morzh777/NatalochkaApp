import { Bot } from "grammy";
import axios from "axios";
import { BotContext } from "../BotSettings.js";
import { deleteAllBotMessages } from "../../utils/messageUtils.js";
import { API_BASE_URL } from "../../config/api.js";
import { ImageService } from "../../services/ImageService.js";
import { UserRegistrationService } from "../../services/UserRegistrationService.js";
import { Logger } from "../../utils/Logger.js";
import {showMainMenu} from "../../utils/menu.js";

// ==============================
// 📦 Константы SRP
// ==============================

const COMMAND_START = "start";
const PHOTO_KEY_WELCOME = "welcome";

// API
const api = {
    getUser: (id: string) => `${API_BASE_URL}/users/${id}`,
};

// лог-контекст
const LOG_CTX_START = "регистрация через команду /start";
const logger = new Logger("Start");

const MSG_WELCOME = `
👋 <b>Привет, я Наталочка</b>! 🌟

Хочешь <b>бесплатно</b> рассчитать свою <b>матрицу Пифагора</b>?

Ты узнаешь:
🔢 Какие числа формируют твой характер и таланты  
💞 Насколько ты совместим(а) с другими  
🔮 И получишь советы по предназначению

А ещё я умею:  
✨ Строить <b>матрицу судьбы</b>  
❤️ Рассчитывать <b>совместимость пары</b> и давать рекомендации

📌 <b>Начнём с твоей даты рождения</b> — это займёт меньше минуты ⏳
`.trim();

// ==============================
// ✅ Регистрация команды
// ==============================
export function registerStartCommand(bot: Bot<BotContext>) {
    bot.command(COMMAND_START, async (ctx) => {
        if (!ctx.from) return;

        await deleteAllBotMessages(ctx);

        try {
            const res = await axios.get(api.getUser(String(ctx.from.id)));
            const user = res.data;

            if (user && user.main_calculation_id) {
                return await showMainMenu(ctx, user.name);
            }
        } catch (error) {
            logger.logError(LOG_CTX_START, error);
        }

        const message = await ImageService.replyWithPhoto(ctx, PHOTO_KEY_WELCOME, {
            caption: MSG_WELCOME,
            parse_mode: "HTML",
        });

        ctx.session.botMessageId = message.message_id;
        ctx.session.messageIds ||= [];
        ctx.session.messageIds.push(message.message_id);

        await UserRegistrationService.start(ctx);
    });
}
