import { BotContext } from "../bot/BotSettings.js";
import axios from "axios";
import { API_BASE_URL } from "../config/api.js";
import { SessionService } from "./SessionService.js";
import { Flow } from "../types/Flow.js";
import { DateSelectorService } from "./DateSelectorService.js";
import { AppKeyboard } from "../utils/keyboards.js";
import { deleteAllBotMessages } from "../utils/messageUtils.js";
import { CalculationService } from "./CalculationService.js";
import { Logger } from "../utils/Logger.js";
import {getMatrixCaption} from "../utils/captionUtils.js";
import {checkPremiumAccess} from "../utils/checkPremiumAccess.js";

// ==============================
// 📦 Константы
// ==============================

const DEFAULT_NAME = "Пользователь";
const DEFAULT_FLOW_STATE = "menu";

const CALLBACK_SETTINGS = "settings";
const CALLBACK_MENU = "menu";
const PARSE_MODE_HTML = "HTML" as const;

const MSG_LOAD_ERROR = "⚠️ Не удалось завершить регистрацию/обновление.";
const MSG_NAME_SUCCESS = (name: string) => `✅ Имя успешно обновлено на: <b>${name}</b>`;
const MSG_CALC_FAILED = "Расчёт не выполнен";

const BTN_UPDATE_PROFILE = {
    inline_keyboard: [
        [{ text: "🔙 В настройки", callback_data: CALLBACK_SETTINGS }],
        [{ text: "🏠 В меню", callback_data: CALLBACK_MENU }],
    ],
};

const LOG_CTX_DELETE_LOADING = "удаление загрузочного сообщения";
const LOG_CTX_LOAD_NAME = "загрузка имени пользователя из базы";
const LOG_CTX_SAVE_NAME = "обновление имени пользователя";
const LOG_CTX_FINALIZE = "завершение регистрации/обновления";

const api = {
    getUser: (id: string) => `${API_BASE_URL}/users/${id}`,
    saveUser: () => `${API_BASE_URL}/user`,
    getCalculation: (inputDate: string) => `${API_BASE_URL}/calculation?inputDate=${inputDate}`,
};

const logger = new Logger("UserRegistration");

// ==============================
// 🚀 Класс UserRegistrationService
// ==============================
export class UserRegistrationService {
    public static async start(ctx: BotContext) {
        const loadingMessageId = await SessionService.resetForFlow(ctx, Flow.Registration);
        await DateSelectorService.requestDay(ctx);

        if (loadingMessageId) {
            try {
                await ctx.api.deleteMessage(ctx.chat!.id, loadingMessageId);
            } catch (error) {
                logger.logError(LOG_CTX_DELETE_LOADING, error);
            }
        }
    }

    public static async complete(ctx: BotContext) {
        const { day, month, year, name, flow } = ctx.session;
        const inputDate = `${day}.${month}.${year}`;

        let resolvedName = name;

        if (!resolvedName && flow === Flow.EditProfile) {
            try {
                const res = await axios.get(api.getUser(String(ctx.from!.id)));
                resolvedName = res.data?.name ?? DEFAULT_NAME;
                ctx.session.name = resolvedName;
            } catch (err) {
                logger.logError(LOG_CTX_LOAD_NAME, err);
                resolvedName = DEFAULT_NAME;
            }
        }

        if (flow === Flow.EditProfile && !day && !month && !year) {
            try {
                await axios.post(api.saveUser(), {
                    userId: String(ctx.from!.id),
                    name: resolvedName,
                });

                await deleteAllBotMessages(ctx);

                const msg = await ctx.reply(MSG_NAME_SUCCESS(resolvedName ?? DEFAULT_NAME), {
                    parse_mode: PARSE_MODE_HTML,
                    reply_markup: BTN_UPDATE_PROFILE,
                });

                ctx.session.messageIds = [...(ctx.session.messageIds || []), msg.message_id];
                ctx.session.flow = undefined;
                ctx.session.state = DEFAULT_FLOW_STATE;
                return;
            } catch (error) {
                logger.logError(LOG_CTX_SAVE_NAME, error);
            }
        }

        try {
            const existing = await axios.get(api.getCalculation(inputDate)).catch(() => null);

            let calculationId: number;
            let square: any;
            let file_id: string;

            if (existing?.data?.id) {
                calculationId = existing.data.id;
                square = existing.data.square;
                file_id = existing.data.file_id;

                await deleteAllBotMessages(ctx);
                const hasPremium = await checkPremiumAccess(ctx);
                const msg = await ctx.replyWithPhoto(file_id, {
                    caption: getMatrixCaption(inputDate),
                    parse_mode: PARSE_MODE_HTML,
                    reply_markup: AppKeyboard.detailKeyboard({
                        square,
                        openedFromHistory: false,
                        showNewCalc: true,
                        isMainCalculation: true,
                        hasPremium, // ✅ передаём сюда
                    }),
                });

                ctx.session.messageIds = [msg.message_id];
            } else {
                await deleteAllBotMessages(ctx);

                const calc = await CalculationService.calculateAndSend(ctx);
                if (!calc) throw new Error(MSG_CALC_FAILED);

                calculationId = calc.id;
                square = calc.square;
                file_id = calc.file_id;

                ctx.session.messageIds = [calc.messageId];
            }

            await axios.post(api.saveUser(), {
                userId: String(ctx.from!.id),
                name: resolvedName,
                birthDate: inputDate,
                mainCalculationId: calculationId,
            });

            ctx.session.state = DEFAULT_FLOW_STATE;
            ctx.session.flow = undefined;
        } catch (error) {
            logger.logError(LOG_CTX_FINALIZE, error);

            const errMsg = await ctx.reply(MSG_LOAD_ERROR);
            ctx.session.messageIds = [...(ctx.session.messageIds || []), errMsg.message_id];
        }
    }
}
