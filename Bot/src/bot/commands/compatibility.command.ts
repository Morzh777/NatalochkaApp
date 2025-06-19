import { Bot, InlineKeyboard } from "grammy";
import axios from "axios";
import { BotContext } from "../BotSettings.js";
import { deleteAllBotMessages } from "../../utils/messageUtils.js";
import { API_BASE_URL } from "../../config/api.js";
import { ComparisonsItem, CompatibilityEntry } from "../../types/Compatibility.js";
import { AppKeyboard } from "../../utils/keyboards.js";
import { ImageService } from "../../services/ImageService.js";
import { Logger } from "../../utils/Logger.js";
import {checkPremiumAccess} from "../../utils/checkPremiumAccess.js";
import {trackButtonClick} from "../../utils/trackButtonClick.js";

// ==============================
// 📦 Локальные переменные для SRP
// ==============================

// pagination
const PAGE_SIZE = 5;

const PHOTO_KEY_COMPATIBILITY = "compatibility";
// callbacks
const CALLBACK_MENU = "menu_compatibility";
const CALLBACK_PAGE = /^compatibility_page:(\d+)$/;
const CALLBACK_ITEM = /^show_compatibility:(.+)\|(.+)$/;

// кнопки
const BUTTON_BACK_TEXT = "↩️ Назад";

// сообщения
const MSG_NO_MAIN_CALC = "❗ У вас нет основного расчёта. Сначала сделай /square";
const MSG_NO_DESTINY = "⚠️ Не удалось определить ваше число судьбы.";
const MSG_EMPTY_LIST = "📭 У вас пока нет других расчётов. Добавьте через /square";
const MSG_LOAD_ERROR = "⚠️ Не удалось загрузить совместимость.";
const MSG_ITEM_NOT_FOUND = "Данные не найдены.";
const MSG_FETCH_ERROR = "Ошибка при получении данных.";

// лог-контексты
const LOG_CTX_ITEM = "показ совместимости по имени";
const LOG_CTX_PAGE = "загрузка страницы совместимости";

// шаблоны UI
const ITEM_TEMPLATE = (match: ComparisonsItem) => `
💑 <b>Совместимость с ${match.name}</b>

🔢 <b>Число судьбы:</b> ${match.destiny}
💯 <b>Совместимость:</b> ${match.percentage}%

${match.description}
`.trim();

const CAPTION_TEMPLATE = (page: number, totalPages: number) => `
💞 <b>Совместимость по числу судьбы!</b>

Ниже ты увидишь список людей, чьи матрицы Пифагора ты уже рассчитывал(а) 👇

Каждая строка показывает:
👤 Имя человека
🔢 Его <b>число судьбы</b>
💯 <b>Процент совместимости</b> с тобой

Нажми на имя, чтобы узнать подробности ✨


📊 Загруженно <b>${totalPages}</b> страниц по ${PAGE_SIZE} записей
`.trim();

// роуты API
const api = {
    user: (id: string) => `${API_BASE_URL}/users/${id}`,
    userMainCalculation: (id: string) => `${API_BASE_URL}/calculation/${id}`,
    compatibilityHistory: () => `${API_BASE_URL}/compatibility/history`,
};

// логгер
const logger = new Logger("Compatibility");

// ==============================
// 📘 Команда регистрации
// ==============================
export function registerCompatibilityCommand(bot: Bot<BotContext>) {
    bot.callbackQuery(CALLBACK_MENU, async (ctx) => {
        await ctx.answerCallbackQuery();
        trackButtonClick(CALLBACK_MENU)
        await deleteAllBotMessages(ctx);
        await showCompatibilityPage(ctx, 0);
    });

    bot.callbackQuery(CALLBACK_PAGE, async (ctx) => {
        const page = parseInt(ctx.match[1], 10);
        await ctx.answerCallbackQuery();
        await showCompatibilityPage(ctx, page);
    });

    bot.callbackQuery(CALLBACK_ITEM, async (ctx) => {
        const inputDate = ctx.match[1];
        const name = ctx.match[2];

        // 🧹 Удаляем только прошлую карточку совместимости, если она есть
        const lastMessageId = ctx.session.compatibilityItemMessageId;
        if (lastMessageId) {
            try {
                await ctx.api.deleteMessage(ctx.chat!.id, lastMessageId);
            } catch (e) {
                console.warn(`⚠️ сообщение ${lastMessageId} уже удалено`);
            }
        }

        try {
            const match = Object.values(ctx.session.compatibilityList ?? {})
                .flat()
                .find((c) => c.inputDate === inputDate && c.name === name);

            if (!match) {
                return await ctx.answerCallbackQuery({ text: MSG_ITEM_NOT_FOUND });
            }

            const message = ITEM_TEMPLATE(match);
            const keyboard = new InlineKeyboard().text(BUTTON_BACK_TEXT, CALLBACK_MENU);

            const sent = await ctx.reply(message, {
                parse_mode: "HTML",
                reply_markup: keyboard,
            });

            // 💾 Сохраняем ID текущей карточки совместимости
            ctx.session.compatibilityItemMessageId = sent.message_id;

            await ctx.answerCallbackQuery();
        } catch (error) {
            logger.logError(LOG_CTX_ITEM, error);
            await ctx.answerCallbackQuery({ text: MSG_FETCH_ERROR });
        }
    });
}

// ==============================
// 📘 Страница совместимости
// ==============================
async function showCompatibilityPage(ctx: BotContext, page: number) {
    const startTotal = Date.now(); // 🕰️ старт полной обработки

    const userId = String(ctx.from!.id);

    try {
        if (!ctx.session.messageIds?.length) {
            await deleteAllBotMessages(ctx); // Удаляем только при первом показе
        }

        const startUser = Date.now();
        const { data: user } = await axios.get(api.user(userId));
        logger.logDebug("GET /user", `${Date.now() - startUser} ms`);

        if (!user.main_calculation_id) {
            const msg = await ctx.reply(MSG_NO_MAIN_CALC);
            ctx.session.messageIds.push(msg.message_id);
            return;
        }

        let userDestiny = ctx.session.userDestiny ?? -1;
        if (userDestiny === -1) {
            const startCalc = Date.now();
            const { data: calc } = await axios.get(api.userMainCalculation(user.main_calculation_id));
            logger.logDebug("GET /calculation", `${Date.now() - startCalc} ms`);

            userDestiny = Number(calc.square?.["18"]);
            if (isNaN(userDestiny)) {
                const msg = await ctx.reply(MSG_NO_DESTINY);
                ctx.session.messageIds.push(msg.message_id);
                return;
            }
            ctx.session.userDestiny = userDestiny;
        }

        const startHistory = Date.now();
        const { data } = await axios.get(api.compatibilityHistory(), {
            params: { userId, page, pageSize: PAGE_SIZE },
        });
        logger.logDebug("GET /compatibility/history", `${Date.now() - startHistory} ms`);

        const items = Array.isArray(data.items) ? data.items : [];
        const totalCount = typeof data.totalCount === "number" ? data.totalCount : 0;

        if (items.length === 0) {
            const msg = await ctx.reply(MSG_EMPTY_LIST);
            ctx.session.messageIds.push(msg.message_id);
            return;
        }

        const batchRequest = items.map((entry: CompatibilityEntry) => ({
            a: userDestiny,
            b: Number(entry.destiny),
        }));

        const startBatch = Date.now();
        const { data: compatibilities } = await axios.post(`${API_BASE_URL}/compatibility/batch`, {
            batch: batchRequest,
        });
        logger.logDebug("POST /compatibility/batch", `${Date.now() - startBatch} ms`);

        const results: ComparisonsItem[] = items.map((entry: CompatibilityEntry, index: number) => {
            const comp = compatibilities[index];
            return {
                calculationId: String(entry.calculationId),
                name: entry.name,
                inputDate: entry.inputDate,
                destiny: Number(entry.destiny),
                percentage: comp.percentage,
                description: comp.description ?? "",
            };
        });

        ctx.session.compatibilityList ??= {};
        ctx.session.compatibilityList[page] = results;
        ctx.session.compatibilityTotalCount = totalCount;

        const totalPages = Math.ceil(totalCount / PAGE_SIZE);
        const caption = CAPTION_TEMPLATE(page, totalPages);
        const hasPremium = await checkPremiumAccess(ctx);
        const keyboard = AppKeyboard.getCompatibilityKeyboard(
            results,
            page,
            PAGE_SIZE,
            totalCount,
            String(userDestiny),
            hasPremium,
        );

        const messageId = ctx.session.messageIds?.[0];

        if (!messageId) {
            // 📸 Первый раз отправляем фотку
            const msg = await ImageService.replyWithPhoto(ctx, PHOTO_KEY_COMPATIBILITY, {
                caption,
                parse_mode: "HTML",
                reply_markup: keyboard,
            });
            ctx.session.messageIds = [msg.message_id];
        } else {
            // 🔥 При любой странице обновляем только кнопки
            await ctx.api.editMessageReplyMarkup(ctx.chat!.id, messageId, {
                reply_markup: keyboard,
            });
        }

    } catch (error) {
        logger.logError(LOG_CTX_PAGE, error);
        const msg = await ctx.reply(MSG_LOAD_ERROR);
        ctx.session.messageIds = [msg.message_id];
    } finally {
        logger.logDebug("TOTAL showCompatibilityPage", `${Date.now() - startTotal} ms`);
    }
}

