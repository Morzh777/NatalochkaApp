import { Bot } from "grammy";
import axios from "axios";
import { BotContext } from "../BotSettings.js";
import { deleteAllBotMessages } from "../../utils/messageUtils.js";
import { CalculationService } from "../../services/CalculationService.js";
import { API_BASE_URL } from "../../config/api.js";
import { Flow } from "../../types/Flow.js";
import { AppKeyboard } from "../../utils/keyboards.js";
import { Logger } from "../../utils/Logger.js";
import {getMatrixCaption} from "../../utils/captionUtils.js";
import {checkPremiumAccess} from "../../utils/checkPremiumAccess.js";
import {trackButtonClick} from "../../utils/trackButtonClick.js";
import {LoadingService} from "../../services/LoadingService.js";

// ==============================
// 📦 Локальные переменные SRP
// ==============================

const DEFAULT_USER_NAME = "Пользователь";

// parse mod
const PARSE_MODE_HTML = "HTML";

// callbacks
const CALLBACK_SQUARE = "square";
const CALLBACK_MAIN_CALC = "main_calculation";

// сообщения
const MSG_MAIN_CALC_NOT_FOUND = "❌ Основной расчёт не найден.";
const MSG_CALC_LOAD_FAIL = "⚠️ Не удалось загрузить расчёт.";
const MSG_FALLBACK = "🚫 Не удалось получить твой расчёт. Попробуй позже.";

// лог-контексты
const LOG_CTX_MAIN_CALC = "показ основного расчёта";

// API
const api = {
    getUser: (id: string) => `${API_BASE_URL}/users/${id}`,
    getCalculation: (id: string) => `${API_BASE_URL}/calculation/${id}`,
};

// логгер
const logger = new Logger(CALLBACK_SQUARE);

// ==============================
// ✅ Регистрация команды
// ==============================
export function registerSquareCommand(bot: Bot<BotContext>) {
    async function squareFlow(ctx: BotContext) {
        await deleteAllBotMessages(ctx);
        await CalculationService.start(ctx);
    }

    bot.command(CALLBACK_SQUARE, async (ctx) => {
        if (!ctx.from) return;
        await squareFlow(ctx);
    });

    bot.callbackQuery(CALLBACK_SQUARE, async (ctx) => {
        await ctx.answerCallbackQuery();
        await deleteAllBotMessages(ctx);
        await squareFlow(ctx);
    });

    bot.callbackQuery(CALLBACK_MAIN_CALC, async (ctx) => {
        void ctx.answerCallbackQuery();

        setTimeout(async () => {
            trackButtonClick(CALLBACK_MAIN_CALC);
            if (!ctx.from) return;

            let loader: LoadingService | null = null;

            try {
                // 🌀 Показываем старый прогресс-бар (с задержкой)
                loader = await LoadingService.create(ctx, 10);

                // 🔄 Получаем пользователя напрямую, без кеша
                const res = await axios.get(api.getUser(String(ctx.from.id)));
                const user = res.data;

                if (!user?.main_calculation_id) {
                    await loader.stop();
                    return void ctx.reply(MSG_MAIN_CALC_NOT_FOUND);
                }

                // 🔄 Получаем расчёт напрямую, без кеша
                const calcRes = await axios.get(api.getCalculation(String(user.main_calculation_id)));
                const calculation = calcRes.data;

                if (!calculation?.square) {
                    await loader.stop();
                    return void ctx.reply(MSG_CALC_LOAD_FAIL);
                }

                const { square, file_id: photo, input_date: inputDate } = calculation;
                const name = user.name ?? DEFAULT_USER_NAME;

                ctx.session.square = square;
                ctx.session.flow = Flow.MainCalculation;
                ctx.session.openedFromHistory = false;

                // Удаление старых сообщений — не тормозит
                setTimeout(() => deleteAllBotMessages(ctx), 0);

                const caption = getMatrixCaption(name, inputDate);
                const hasPremium = await checkPremiumAccess(ctx);

                await loader.stop(); // 🧹 скрываем лоадер

                const msg = await ctx.replyWithPhoto(photo, {
                    caption,
                    parse_mode: PARSE_MODE_HTML,
                    reply_markup: AppKeyboard.detailKeyboard({
                        square,
                        openedFromHistory: false,
                        showNewCalc: true,
                        hasPremium,
                    }),
                });

                ctx.session.messageIds ||= [];
                ctx.session.messageIds.push(msg.message_id);

            } catch (err) {
                logger.logError(LOG_CTX_MAIN_CALC, err);

                if (loader) await loader.stop();

                const fallback = await ctx.reply(MSG_FALLBACK);
                ctx.session.messageIds ||= [];
                ctx.session.messageIds.push(fallback.message_id);
            }
        }, 0);
    });



}
