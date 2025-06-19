// 📍 Унифицированный показ списка программ
import {BotCleaner} from "./BotCleaner.js";
import {BotContext} from "../bot/BotSettings.js";
import {ProgramItem} from "../types/ProgramItem.js";


export async function showProgramList(ctx: BotContext, programs: ProgramItem[], replyMarkup: any) {
    if (!programs.length) {
        const message = await ctx.reply('⚠️ Нет программ для отображения.');

        // Удаляем сообщение через 5 секунд
        await BotCleaner.autoDelete(ctx, message.message_id);
        return;
    }

    await ctx.editMessageReplyMarkup({reply_markup: replyMarkup});
}