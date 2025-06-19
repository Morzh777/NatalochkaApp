import {Bot, InlineKeyboard} from "grammy";
import axios from "axios";
import {API_BASE_URL} from "../../config/api.js";
import {deleteAllBotMessages, deleteMessage} from "../../utils/messageUtils.js";
import {BotContext} from "../BotSettings.js";
import {ImageService} from "../../services/ImageService.js";
import {AppKeyboard} from "../../utils/keyboards.js";
import {SessionService} from "../../services/SessionService.js";
import {Flow} from "../../types/Flow.js";
import {DateSelectorService} from "../../services/DateSelectorService.js";
import {Logger} from "../../utils/Logger.js";
import { settings } from "../../config/settings.js"; // Import settings

// ==============================
// 📦 Локальные переменные SRP
// ==============================

// parse mod
const PARSE_MODE_HTML = "HTML";

// callbacks
const CALLBACK_SETTINGS = "settings";
const CALLBACK_EDIT_NAME = "edit_name";
const CALLBACK_EDIT_DATE = "edit_date";

// состояния
const SESSION_STATE_PROFILE = "name"

// лог-контексты
const LOG_CTX_LOAD_PROFILE = "загрузка профиля";
const LOG_CTX_DELETE_LOADING_MSG = "удаление сообщения загрузки";

// сообщения
const MSG_PROFILE_NOT_FOUND = "❌ Профиль не найден.";
const MSG_PROFILE_LOAD_FAIL = "🚫 Не удалось загрузить профиль. Попробуй позже.";
const MSG_ASK_NEW_NAME = "✏️ Введите новое имя (до 20 символов):";

// изображения
const PHOTO_KEY_SETTINGS = "settings";

// API
const api = {
    getUser: (id: string) => `${API_BASE_URL}/users/${id}`,
    deleteUser: (id: string) => `${API_BASE_URL}/users/${id}`,
};

// логгер
const logger = new Logger("Profile");

// Проверка на администратора (для использования здесь)
function isAdmin(userId: number): boolean {
    return settings.adminIds.includes(userId);
}

// ==============================
// ✅ Регистрация хендлеров
// ==============================
export function registerProfileCommand(bot: Bot<BotContext>) {
    bot.callbackQuery(CALLBACK_SETTINGS, async (ctx) => {
        if (!ctx.from) return;

        await deleteAllBotMessages(ctx);

        try {
            const userId = String(ctx.from.id);

            // Получаем пользователя
            const res = await axios.get(api.getUser(userId));
            const user = res.data;

            if (!user || !user.name || !user.birth_date) {
                return ctx.answerCallbackQuery({text: MSG_PROFILE_NOT_FOUND});
            }

            // Получаем премиум-статус
            let premiumText = "🚫 <b>Премиум:</b> не активен";
            try {
                const {data: premium} = await axios.get<{ isActive: boolean; expiresAt?: string }>(
                    `${API_BASE_URL}/premium/${userId}?withDate=true`
                );

                if (premium.isActive) {
                    premiumText = `🌟 <b>Премиум:</b> активен`;

                    if (premium.expiresAt) {
                        const now = new Date();
                        const expires = new Date(premium.expiresAt);
                        const diff = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        premiumText += `\n⏳ Осталось дней: <b>${diff}</b>`;
                    }
                }
            } catch (e) {
                const err = e as Error;
                console.warn("⚠️ Не удалось получить премиум:", err.message);
            }

            const messageText =
                `👤 <b>Профиль пользователя</b>\n\n` +
                `🧍‍♂️ <b>Имя:</b> ${user.name}\n` +
                `📅 <b>Дата рождения:</b> ${user.birth_date}\n\n` +
                `${premiumText}`;

            const msg = await ImageService.replyWithPhoto(ctx, PHOTO_KEY_SETTINGS, {
                caption: messageText,
                parse_mode: PARSE_MODE_HTML,
                reply_markup: isAdmin(ctx.from.id) ? AppKeyboard.getAdminMenuKeyboard() : AppKeyboard.getUserMenuKeyboard(),
            });

            ctx.session.messageIds = [...(ctx.session.messageIds || []), msg.message_id];

            await ctx.answerCallbackQuery();
        } catch (error) {
            logger.logError(LOG_CTX_LOAD_PROFILE, error);

            const errMsg = await ctx.reply(MSG_PROFILE_LOAD_FAIL);
            ctx.session.messageIds = [...(ctx.session.messageIds || []), errMsg.message_id];
        }
    });

    bot.callbackQuery(CALLBACK_EDIT_NAME, async (ctx) => {
        ctx.session.flow = Flow.EditProfile;
        ctx.session.state = SESSION_STATE_PROFILE;

        await deleteAllBotMessages(ctx);

        const askNameMsg = await ctx.reply(MSG_ASK_NEW_NAME, {
            reply_markup: {remove_keyboard: true},
        });

        ctx.session.messageIds.push(askNameMsg.message_id);
    });

    bot.callbackQuery(CALLBACK_EDIT_DATE, async (ctx) => {
        const loadingMessageId = await SessionService.resetForFlow(ctx, Flow.EditProfile);

        await deleteAllBotMessages(ctx);

        await DateSelectorService.requestDay(ctx);

        if (loadingMessageId) {
            try {
                await ctx.api.deleteMessage(ctx.chat?.id!, loadingMessageId);
            } catch (e) {
                logger.logError(LOG_CTX_DELETE_LOADING_MSG, e);
            }
        }
    });
    bot.callbackQuery("delete_profile", async (ctx) => {
        if (!ctx.from) return;

        // Отправляем вопрос с кнопками "Да" и "Нет"
        const keyboard = new InlineKeyboard()
            .text("✅ Да", "confirm_delete")
            .text("❌ Нет", "cancel_delete");

        const msg = await ctx.reply("⚠️ Вы уверены, что хотите удалить профиль?", {
            reply_markup: keyboard,
        });

        ctx.session.messageIds = [...(ctx.session.messageIds || []), msg.message_id];
        await ctx.answerCallbackQuery();
    });

// Обработчик кнопки "Да"
    bot.callbackQuery("confirm_delete", async (ctx) => {
        if (!ctx.from) return;

        await deleteAllBotMessages(ctx);

        try {
            const userId = String(ctx.from.id);
            await axios.delete(api.deleteUser(userId));


            const msg = await ctx.reply("🗑️ Ваш профиль удалён. для регистрации нажмите /start", {
            });

            ctx.session.messageIds = [...(ctx.session.messageIds || []), msg.message_id];
        } catch (error) {
            logger.logError("удаление профиля", error);
            const errMsg = await ctx.reply("❌ Ошибка при удалении профиля. Попробуйте позже.");
            ctx.session.messageIds = [...(ctx.session.messageIds || []), errMsg.message_id];
        }

        await ctx.answerCallbackQuery();
    });

// Обработчик кнопки "Нет"

    bot.callbackQuery("cancel_delete", async (ctx) => {
        try {
            if (ctx.callbackQuery.message && ctx.callbackQuery.message.message_id) {
                await deleteMessage(ctx, ctx.callbackQuery.message.message_id, "сообщение с кнопкой отмены");
            }
            await ctx.answerCallbackQuery();
        } catch (e) {
            console.error("Ошибка удаления сообщения:", e);
        }
    });

}
