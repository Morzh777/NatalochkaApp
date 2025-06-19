import { Bot } from "grammy";
import axios, {AxiosError} from "axios";
import { BotContext } from "../BotSettings";
import { deleteAllBotMessages } from "../../utils/messageUtils.js";
import { API_BASE_URL } from "../../config/api.js";
import {getMatrixCaption, getSquareHistoryCaptionPaginated} from "../../utils/captionUtils.js";
import { AppKeyboard } from "../../utils/keyboards.js";
import { ImageService } from "../../services/ImageService.js";
import { Logger } from "../../utils/Logger.js";
import {checkPremiumAccess} from "../../utils/checkPremiumAccess.js";

// ==============================
// 📦 Локальные переменные SRP
// ==============================

// pagination
const PAGE_SIZE = 5;

// callbacks
const CALLBACK_HISTORY = "history";
const CALLBACK_BACK = "back_to_history";
const CALLBACK_PAGE = /^history_page:(\d+)$/;
const CALLBACK_SHOW = /^show_history:(.+)\|(.+)$/;

// лог-контексты
const LOG_CTX_HISTORY_PAGE = "загрузка страницы истории";
const LOG_CTX_SHOW_CALC = "загрузка расчёта из истории";

// сообщения
const MSG_EMPTY_HISTORY = "🔢 История пуста. Сделайте первый расчёт";
const MSG_HISTORY_LOAD_ERROR = "⚠️ Не удалось загрузить историю.";
const MSG_ITEM_LOAD_ERROR = "Ошибка загрузки.";

// изображение
const PHOTO_KEY_HISTORY = "history";

// API
const api = {
    historyPaginated: (userId: string) => `${API_BASE_URL}/users/${userId}/history/paginated`,
    historyByDate: (userId: string) => `${API_BASE_URL}/users/${userId}/history/by-date`,
};

// логгер
const logger = new Logger("History");

function resetSessionMessages(ctx: BotContext) {
    ctx.session.messageIds = [];
}

// ==============================
// 📘 Команда регистрации
// ==============================
export function registerHistoryCommand(bot: Bot<BotContext>) {
    bot.command("history", async (ctx) => {
        if (!ctx.from) return;
        await deleteAllBotMessages(ctx);
        await showHistoryPage(ctx, 0);
    });

    bot.callbackQuery(CALLBACK_HISTORY, async (ctx) => {
        await ctx.answerCallbackQuery();
        await deleteAllBotMessages(ctx);
        await showHistoryPage(ctx, 0);
    });

    bot.callbackQuery(CALLBACK_BACK, async (ctx) => {
        await deleteAllBotMessages(ctx);
        resetSessionMessages(ctx);
        await showHistoryPage(ctx, 0, false);
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery(CALLBACK_PAGE, async (ctx) => {
        const page = parseInt(ctx.match[1], 10);
        await showHistoryPage(ctx, page, ctx.session.openedFromHistory);
    });

    bot.callbackQuery(CALLBACK_SHOW, async (ctx) => {
        const inputDate = ctx.match[1];
        const name = ctx.match[2];
        const userId = String(ctx.from?.id || "");

        console.log("📤 [BOT] Отправляем запрос на получение расчёта из истории:", {
            userId,
            inputDate,
            name,
        });

        await deleteAllBotMessages(ctx);

        try {
            const response = await axios.get(api.historyByDate(userId), {
                params: { inputDate, name },
            });

            console.log("✅ [BOT] Успешно получен расчёт из истории:", response.data);

            const data = response.data as {
                name: string;
                square: any;
                file_id: string;
            };

            ctx.session.square = data.square;
            ctx.session.openedFromHistory = true;

            const caption = getMatrixCaption(data.name, inputDate);
            const hasPremium = await checkPremiumAccess(ctx);
            const msg = await ctx.replyWithPhoto(data.file_id, {
                caption,
                parse_mode: "HTML",
                reply_markup: AppKeyboard.detailKeyboard({
                    square: data.square,
                    openedFromHistory: true,
                    hasPremium,
                }),
            });

            ctx.session.messageIds = [...(ctx.session.messageIds || []), msg.message_id];
            await ctx.answerCallbackQuery();
        } catch (error) {
            const err = error as AxiosError;
            console.error("❌ [BOT] Ошибка при получении расчёта из истории:", {
                message: err.response?.data || err.message,
            });

            logger.logError(LOG_CTX_SHOW_CALC, error);
            await ctx.answerCallbackQuery({ text: MSG_ITEM_LOAD_ERROR });
        }
    });
}

// ==============================
// 📘 Показ страницы истории
// ==============================
async function showHistoryPage(ctx: BotContext, page: number, openedFromHistory = false) {
    const userId = String(ctx.from!.id);
    ctx.session.openedFromHistory = openedFromHistory;

    try {
        if (!ctx.session.messageIds?.length) {
            await deleteAllBotMessages(ctx); // как и в совместимости
        }

        const {
            data: { items, totalCount },
        } = await axios.get(api.historyPaginated(userId), {
            params: { page, pageSize: PAGE_SIZE },
        });

        if (!items || items.length === 0) {
            const msg = await ctx.reply(MSG_EMPTY_HISTORY);
            const keyboard = {
                inline_keyboard: [[{ text: "🆕 Добавить расчёт", callback_data: "square" }]],
            };
            await ctx.api.editMessageReplyMarkup(msg.chat.id, msg.message_id, {
                reply_markup: keyboard,
            });
            ctx.session.messageIds = [msg.message_id];
            return;
        }
        const caption = getSquareHistoryCaptionPaginated();
        const keyboard = AppKeyboard.getHistoryKeyboard(items, page, PAGE_SIZE, totalCount);

        const messageId = ctx.session.messageIds?.[0];

        if (!messageId) {
            const msg = await ImageService.replyWithPhoto(ctx, PHOTO_KEY_HISTORY, {
                caption,
                parse_mode: "HTML",
                reply_markup: keyboard,
            });
            ctx.session.messageIds = [msg.message_id];
            console.log("🧾 items:", items);
        } else {
            await ctx.api.editMessageReplyMarkup(ctx.chat!.id, messageId, {
                reply_markup: keyboard,
            });
        }

    } catch (error) {
        logger.logError(LOG_CTX_HISTORY_PAGE, error);
        const msg = await ctx.reply(MSG_HISTORY_LOAD_ERROR);
        ctx.session.messageIds = [msg.message_id];
    }

}

