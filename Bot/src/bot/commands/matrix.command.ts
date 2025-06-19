import {Logger} from '../../utils/Logger.js';
import {BotContext} from '../BotSettings.js';
import {deleteAllBotMessages} from '../../utils/messageUtils.js';
import {API_BASE_URL} from '../../config/api.js';
import {AppKeyboard} from '../../utils/keyboards.js';
import {Bot} from 'grammy';
import {sendPhotoWithCaption} from '../../services/ImageService.js';
import {LoadingService} from '../../services/LoadingService.js';
import {handleMatrixRequest} from '../../services/DestinyMatrixService.js';
import {Flow} from '../../types/Flow.js';
import {checkPremiumAccess} from '../../utils/checkPremiumAccess.js';
import {DestinyMatrix} from '../../types/DestinyMatrix.js';
import {showMatrixHistoryPage} from "../../services/MatrixHistoryService.js";
import {fetchDescription} from "../../utils/fetchDescription.js";
import {showProgramList} from "../../utils/showProgramList.js";
import {registerMatrixHandlers} from "../handlers/registerMatrixHandlers.js";
import {
    getDestinyTrioCaption, getMoneyProfileCaption,
    getProgramOverviewCaption,
    getRelationshipProfileCaption
} from "../../utils/captionUtils.js";
import {getProfileInfo} from "../../utils/sessionUtils.js";
import {trackButtonClick} from "../../utils/trackButtonClick.js";


// 📌 Основной экспорт
export function registerMatrixCommand(bot: Bot<BotContext>) {
    const logger = new Logger('matrix');
    registerMatrixHandlers(bot, logger);

    // Меню матрицы
    bot.callbackQuery('matrix_menu', async (ctx) => {
        trackButtonClick("matrix_menu");
        await ctx.answerCallbackQuery();

        // 🔐 Проверка премиума один раз
        ctx.session.hasPremium = await checkPremiumAccess(ctx);

        // 🧠 Далее используем hasPremium из сессии
        await handleMatrixRequest(ctx);
    });

    // Меню программ
    bot.callbackQuery('open_program_menu', async (ctx) => {
        await ctx.answerCallbackQuery();
        await deleteAllBotMessages(ctx);
        const { name, birthDate } = getProfileInfo(ctx);
        const caption = getProgramOverviewCaption(name, birthDate);
        await sendPhotoWithCaption(
            ctx,
            'program_menu',
            caption,
            AppKeyboard.getProgramsKeyboard(ctx.session.openedFromHistory)
        );
    });

    // Обычные программы
    bot.callbackQuery('open_programs', async (ctx) => {
        await ctx.answerCallbackQuery();
        await showProgramList(ctx, ctx.session.matchedPrograms ?? [], AppKeyboard.getProgramListKeyboard(ctx.session.matchedPrograms ?? [], 'show_program', 'back_to_program_menu'));
    });

    // Кармические программы
    bot.callbackQuery('open_karmic', async (ctx) => {
        await ctx.answerCallbackQuery();
        await showProgramList(ctx, ctx.session.karmicPrograms ?? [], AppKeyboard.getProgramListKeyboard(ctx.session.karmicPrograms ?? [], 'show_program', 'back_to_program_menu'));
    });

    // Назад к программам
    bot.callbackQuery('back_to_program_menu', async (ctx) => {
        await ctx.answerCallbackQuery();
        await ctx.editMessageReplyMarkup({reply_markup: AppKeyboard.getProgramsKeyboard()});
    });

    // Описание программы
    bot.callbackQuery(/^show_program:(.+)$/, async (ctx) => {
        await ctx.answerCallbackQuery();
        const match = ctx.match?.[1];
        const [programKey, rawType] = match?.split('|') ?? [];
        const programType = rawType === 'кармическая' ? 'кармическая' : 'обычная';
        if (!programKey) {
            return ctx.reply('⚠️ Программа не найдена.');
        }
        let loading: LoadingService | undefined;
        try {
            loading = await LoadingService.create(ctx);
            const data = await fetchDescription(`${API_BASE_URL}/description/program/${programKey}?type=${programType}`, logger);
            await loading.stop();
            const message = await ctx.reply(`<b>📌 Программа: ${programKey}</b>\n\n${data.description}`, {
                parse_mode: 'HTML',
                reply_markup: AppKeyboard.backToProgramsKeyboard(),
            });
            ctx.session.messageIds ||= [];
            ctx.session.messageIds.push(message.message_id);
        } catch {
            if (loading) await loading.stop();
            await ctx.reply('🚫 Не удалось получить описание программы. Попробуй позже.');
        }
    });

    // Удалить сообщение
    bot.callbackQuery('delete_message', async (ctx) => {
        await ctx.answerCallbackQuery();
        await ctx.deleteMessage();
    });

    // Новый расчёт матрицы
    bot.callbackQuery('new_matrix', async (ctx) => {
        await ctx.answerCallbackQuery();
        ctx.session.flow = Flow.NewDestinyMatrix;
        ctx.session.state = 'day';
        ctx.session.birthDate = undefined;
        ctx.session.username = undefined;
        ctx.session.messageIds = [];
        ctx.session.programs = undefined;
        await deleteAllBotMessages(ctx);
        await AppKeyboard.promptForDay(ctx);
    });

    // Показ назначения (предназначение)
    bot.callbackQuery('show_purpose', async (ctx) => {
        await ctx.answerCallbackQuery();
        await deleteAllBotMessages(ctx);
        const matrix = ctx.session.matrix as DestinyMatrix;
        if (!matrix?.SKY_NUM || !matrix.LAND_NUM || !matrix.DEST_NUM) {
            await ctx.answerCallbackQuery({text: 'Нет данных предназначения', show_alert: true});
            return;
        }
        const { name, birthDate } = getProfileInfo(ctx);
        const caption = getDestinyTrioCaption(name, birthDate)
        const keyboard = AppKeyboard.getPurposeKeyboard(
            matrix.SKY_NUM,
            matrix.LAND_NUM,
            matrix.DEST_NUM,
            ctx.session.openedFromHistory, // 🔥 ВАЖНО!
        );
        await sendPhotoWithCaption(ctx, 'purpose_menu', caption, keyboard);
    });

    bot.callbackQuery('show_relationships', async (ctx) => {
        await ctx.answerCallbackQuery();
        await deleteAllBotMessages(ctx);
        const matrix = ctx.session.matrix as DestinyMatrix;
        if (!matrix?.H) {
            await ctx.answerCallbackQuery({text: 'Нет данных о партнёре', show_alert: true});
            return;
        }
        const { name, birthDate } = getProfileInfo(ctx);
        const caption = getRelationshipProfileCaption(name, birthDate)
        const keyboard = AppKeyboard.getRelationshipsKeyboard(ctx.session.openedFromHistory);
        await sendPhotoWithCaption(ctx, 'relationships_menu', caption, keyboard);
    });

    bot.callbackQuery('show_money', async (ctx) => {
        await ctx.answerCallbackQuery();
        await deleteAllBotMessages(ctx);
        const matrix = ctx.session.matrix as DestinyMatrix;
        if (!matrix?.VD) {
            await ctx.answerCallbackQuery({text: 'Нет данных о Денюжке', show_alert: true});
            return;
        }
        const { name, birthDate } = getProfileInfo(ctx);
        const caption = getMoneyProfileCaption(name, birthDate)
        const keyboard = AppKeyboard.getMoneyKeyboard(ctx.session.openedFromHistory);
        await sendPhotoWithCaption(ctx, 'money_menu', caption, keyboard);
    });

    bot.callbackQuery('matrix_compatibility', async (ctx) => {
        trackButtonClick("matrix_compatibility");
        await ctx.answerCallbackQuery();
        await deleteAllBotMessages(ctx);
        ctx.session.hasPremium = await checkPremiumAccess(ctx); // 👈 сохраняем в сессию

        ctx.session.flow = Flow.CompatibilityMatrix;
        ctx.session.openedFromHistory = false;
        ctx.session.messageIds = [];

        await deleteAllBotMessages(ctx);
        await showMatrixHistoryPage(ctx, 0);
    });
}
