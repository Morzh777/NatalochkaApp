import {Bot} from "grammy";
import {BotContext} from "../BotSettings.js";
import {deleteAllBotMessages} from "../../utils/messageUtils.js";
import {
    handleBackToMatrixMenu,
    handleShowMatrixCallback,
    showMatrixHistoryPage
} from "../../services/MatrixHistoryService.js";
import {checkPremiumAccess} from "../../utils/checkPremiumAccess.js";

const CALLBACK_PAGE = /^matrix_page:(\d+)$/;
const CALLBACK_SHOW_MATRIX = /^show_matrix:(.+)\|(.+)$/;
const CALLBACK_BACK = "back_to_matrix_history";
const CALLBACK_BACK_TO_MENU = "back_to_matrix_menu";
const CALLBACK_MATRIX_HISTORY = "matrix_history";


export function registerMatrixHistoryCommand(bot: Bot<BotContext>) {
    bot.command(CALLBACK_MATRIX_HISTORY, async (ctx) => {
        if (!(await checkPremiumAccess(ctx))) return;
        await deleteAllBotMessages(ctx);
        await showMatrixHistoryPage(ctx, 0);
    });

    bot.callbackQuery(CALLBACK_MATRIX_HISTORY, async (ctx) => {
        await ctx.answerCallbackQuery();
        await deleteAllBotMessages(ctx);
        await showMatrixHistoryPage(ctx, 0);
    });

    bot.callbackQuery(CALLBACK_BACK, async (ctx) => {
        await ctx.answerCallbackQuery();
        await showMatrixHistoryPage(ctx, 0, true);
    });

    bot.callbackQuery(CALLBACK_PAGE, async (ctx) => {
        const page = parseInt(ctx.match[1], 10);
        await showMatrixHistoryPage(ctx, page, true);
    });

    bot.callbackQuery(CALLBACK_SHOW_MATRIX, handleShowMatrixCallback);
    bot.callbackQuery(CALLBACK_BACK_TO_MENU, handleBackToMatrixMenu);
}
