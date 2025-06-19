import { BotContext } from "../bot/BotSettings.js";
import { AppKeyboard } from "../utils/keyboards.js";
import {
    isValidDay,
    isValidMonth,
    isValidUsername,
    isValidYear,
    MONTHS_MAP,
} from "../validation/validate.js";
import { UserRegistrationService } from "./UserRegistrationService.js";
import { CalculationService } from "./CalculationService.js";
import { Flow } from "../types/Flow.js";
import {handleMatrixRequest} from "./DestinyMatrixService.js";
import {handlePromoCode} from "./PaymentService.js";

// ==============================
// 📦 Константы и шаблоны
// ==============================

const MSG_UNKNOWN_STATE = "⚠️ Неизвестное состояние. Используйте команду /start";
const MSG_PROMPT_NAME = '📝 Введите имя';

// состояния
const STATE_DAY = "day";
const STATE_MONTH = "month";
const STATE_YEAR = "year";
const STATE_NAME = "name";

// ==============================
// ✅ Класс DateSelectorService
// ==============================
export class DateSelectorService {
    public static async processState(ctx: BotContext, messageText: string) {
        if (ctx.session.flow === Flow.EnterPromo) {
            await handlePromoCode(ctx, messageText);
            return;
        }
        switch (ctx.session.state) {
            case STATE_DAY:
                await this.handleDay(ctx, messageText);
                break;
            case STATE_MONTH:
                await this.handleMonth(ctx, messageText);
                break;
            case STATE_YEAR:
                await this.handleYear(ctx, messageText);
                break;
            case STATE_NAME:
                await this.handleName(ctx, messageText);
                break;
            default:
                const msg = await ctx.reply(MSG_UNKNOWN_STATE);
                ctx.session.messageIds.push(msg.message_id);
        }
    }

    public static async requestDay(ctx: BotContext) {
        ctx.session.state = STATE_DAY;
        await AppKeyboard.promptForDay(ctx);
    }

    public static async requestMonth(ctx: BotContext) {
        ctx.session.state = STATE_MONTH;
        await AppKeyboard.promptForMonth(ctx);
    }

    public static async requestYear(ctx: BotContext) {
        ctx.session.state = STATE_YEAR;
        await AppKeyboard.promptForYear(ctx);
    }

    public static async requestName(ctx: BotContext) {
        ctx.session.state = STATE_NAME;
        const msg = await ctx.reply(MSG_PROMPT_NAME);
        ctx.session.messageIds.push(msg.message_id);
    }

    private static async handleDay(ctx: BotContext, messageText: string) {
        if (!isValidDay(messageText)) {
            return await this.requestDay(ctx);
        }

        ctx.session.day = messageText.padStart(2, "0");
        await this.requestMonth(ctx);
    }

    private static async handleMonth(ctx: BotContext, messageText: string) {
        if (!isValidMonth(messageText)) {
            return await this.requestMonth(ctx);
        }

        ctx.session.month = MONTHS_MAP[messageText];
        await this.requestYear(ctx);
    }

    private static async handleYear(ctx: BotContext, messageText: string) {
        if (!isValidYear(messageText)) {
            return await this.requestYear(ctx);
        }

        ctx.session.year = messageText;

        // 🧠 Составляем итоговую дату
        if (ctx.session.day && ctx.session.month && ctx.session.year) {
            ctx.session.birthDate = `${ctx.session.day}.${ctx.session.month}.${ctx.session.year}`;
            console.log("🧾 Сформированная birthDate:", ctx.session.birthDate);
        }

        switch (ctx.session.flow) {
            case Flow.Registration:
            case Flow.NewCalculation:
            case Flow.NewDestinyMatrix:
                await this.requestName(ctx);
                break;
            case Flow.EditProfile:
                await UserRegistrationService.complete(ctx);
                break;
        }
    }

    private static async handleName(ctx: BotContext, messageText: string) {
        if (!isValidUsername(messageText)) {
            return await AppKeyboard.promptForUsername(ctx);
        }

        // 💾 Сохраняем имя и туда, и туда
        ctx.session.name = messageText;       // 🧮 квадрат Пифагора
        ctx.session.username = messageText;   // 🧬 матрица судьбы

        switch (ctx.session.flow) {
            case Flow.EditProfile:
                ctx.session.day = undefined;
                ctx.session.month = undefined;
                ctx.session.year = undefined;
                await UserRegistrationService.complete(ctx);
                break;
            case Flow.Registration:
                await UserRegistrationService.complete(ctx);
                break;
            case Flow.NewCalculation:
                await CalculationService.complete(ctx);
                break;
            case Flow.NewDestinyMatrix:
                await handleMatrixRequest(ctx);
                break;
        }
    }
}
