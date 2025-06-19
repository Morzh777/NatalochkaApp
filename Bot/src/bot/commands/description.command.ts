import {Bot} from "grammy";
import axios from "axios";
import {BotContext} from "../BotSettings.js";
import {AppKeyboard} from "../../utils/keyboards.js";
import {API_BASE_URL} from "../../config/api.js";
import {Logger} from "../../utils/Logger.js";
import {checkPremiumAccess} from "../../utils/checkPremiumAccess.js";
import {trackButtonClick} from "../../utils/trackButtonClick.js"; // 👈 логгер

// ==============================
// 📦 Локальные переменные SRP
// ==============================

// callbacks
const CALLBACK_SHOW_SQUARE = "show_square";
const CALLBACK_SHOW_AGGREGATES = "show_aggregates";
const CALLBACK_BACK_TO_MODE = "back_to_mode";

// сообщения
const MSG_NO_DATA = "Нет данных";
const MSG_BACK_OPTION = "Выберите вариант";
const MSG_NOT_FOUND = "Ошибка: Квадрат Пифагора не найден!";
const MSG_DESCRIPTION_ERROR = "Ошибка при загрузке описания";

// лог-контексты
const LOG_CTX_DELETE_DESC = "удаление описания";
const LOG_CTX_LOAD_DESC = "загрузка описания по нажатию цифры";

// API
const api = {
    getDescription: () => `${API_BASE_URL}/description`,
};

// логгер
const logger = new Logger("Description");

// ==============================
// 🔁 Регистрация хендлеров
// ==============================
export function registerDescriptionCommand(bot: Bot<BotContext>) {
    bot.callbackQuery(CALLBACK_SHOW_SQUARE, async (ctx) => {
        trackButtonClick(CALLBACK_SHOW_SQUARE);
        if (!ctx.session.square) return ctx.answerCallbackQuery(MSG_NO_DATA);

        const keyboard = AppKeyboard.squareKeyboard(ctx.session.square, ctx.session.openedFromHistory);
        await ctx.editMessageReplyMarkup({reply_markup: keyboard});
        await ctx.answerCallbackQuery("Показана основная информация");
    });

    bot.callbackQuery(CALLBACK_SHOW_AGGREGATES, async (ctx) => {
        trackButtonClick(CALLBACK_SHOW_AGGREGATES);

        if (!ctx.session.square) {
            return ctx.answerCallbackQuery(MSG_NO_DATA);
        }

        const hasPremium = await checkPremiumAccess(ctx); // ✅ получение премиума из API или сессии

        const keyboard = AppKeyboard.aggregatesKeyboard(
            ctx.session.square,
            ctx.session.openedFromHistory,
            hasPremium
        );

        await ctx.editMessageReplyMarkup({ reply_markup: keyboard });
        await ctx.answerCallbackQuery("Показаны дополнительные значения");
    });


    bot.callbackQuery(CALLBACK_BACK_TO_MODE, async (ctx) => {
        trackButtonClick(CALLBACK_BACK_TO_MODE);
        if (ctx.chat && ctx.session.lastDescriptionMessageId) {
            try {
                await ctx.api.deleteMessage(ctx.chat.id, ctx.session.lastDescriptionMessageId);
            } catch (error) {
                logger.logError(LOG_CTX_DELETE_DESC, error); // ✅ лог в файл и консоль
            }
            ctx.session.lastDescriptionMessageId = undefined;
        }
        const hasPremium = await checkPremiumAccess(ctx);
        const keyboard = AppKeyboard.detailKeyboard({
            square: ctx.session.square,
            openedFromHistory: true,
            showNewCalc: false,
            hasPremium,
        });

        await ctx.editMessageReplyMarkup({reply_markup: keyboard});
        await ctx.answerCallbackQuery(MSG_BACK_OPTION);
    });

    bot.callbackQuery(/^show_user_destiny:(\d+)$/, async (ctx) => {
        const number = ctx.match?.[1];
        if (!number) return;
        try {
            const url = `${API_BASE_URL}/description/destiny/${number}`;
            console.log("📡 [BOT] Запрос на число судьбы:", number);
            console.log("🔗 [BOT] URL запроса:", url);

            const { data } = await axios.get<{ title: string; description: string }>(url);

            console.log("✅ [BOT] Ответ от description-api:", data);

            const message = `<b>${data.title}</b>\n\n${data.description}`;
            const keyboard = AppKeyboard.detailDestinyKeyboard();

            // удаляем старое описание, если было
            if (ctx.chat && ctx.session.lastDescriptionMessageId) {
                try {
                    await ctx.api.deleteMessage(ctx.chat.id, ctx.session.lastDescriptionMessageId);
                } catch (err) {
                    logger.logError(LOG_CTX_DELETE_DESC, err);
                }
            }

            const sentMessage = await ctx.reply(message, {
                parse_mode: "HTML",
                reply_markup: keyboard,
            });

            ctx.session.lastDescriptionMessageId = sentMessage.message_id;
            ctx.session.messageIds.push(sentMessage.message_id);

            await ctx.answerCallbackQuery();
        } catch (error) {
            logger.logError(LOG_CTX_LOAD_DESC, error);
            await ctx.answerCallbackQuery({ text: MSG_DESCRIPTION_ERROR });
        }
    });


    // === Обработка нажатий по цифрам === В САМЫЙ КОНЕЦ ОБЯЗАТЕЛЬНО!!!
    bot.callbackQuery(/^\d+$/, async (ctx) => {
        const digit = ctx.match![0]; // гарантировано — строка с числом

        if (!ctx.session.square) {
            await ctx.answerCallbackQuery({ text: MSG_NOT_FOUND });
            return;
        }

        // 🧹 Удаляем предыдущее описание, если было
        if (ctx.chat && ctx.session.lastDescriptionMessageId) {
            try {
                await ctx.api.deleteMessage(ctx.chat.id, ctx.session.lastDescriptionMessageId);
            } catch (error) {
                logger.logError(LOG_CTX_DELETE_DESC, error);
            }
            ctx.session.lastDescriptionMessageId = undefined;
        }
        try {
            const response = await axios.post(api.getDescription(), {
                key: digit,
                square: ctx.session.square,
            });

            const message = response.data.description;

            const sentMessage = await ctx.reply(message, {
                parse_mode: "HTML",
                reply_markup: AppKeyboard.programWithBackKeyboard(),
            });

            ctx.session.lastDescriptionMessageId = sentMessage.message_id;
            ctx.session.messageIds.push(sentMessage.message_id);

            await ctx.answerCallbackQuery();
        } catch (error) {
            logger.logError(LOG_CTX_LOAD_DESC, error);
            await ctx.answerCallbackQuery({ text: MSG_DESCRIPTION_ERROR });
        }
    });



}
