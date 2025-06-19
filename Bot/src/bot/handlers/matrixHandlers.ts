// handlers/matrixHandlers.ts

import {DestinyMatrix} from "../../types/DestinyMatrix.js";
import {Bot} from "grammy";
import {BotContext} from "../BotSettings.js";
import {Logger} from "../../utils/Logger.js";
import {deleteTempMessageOnly} from "../../utils/messageUtils.js";
import {API_BASE_URL} from "../../config/api.js";
import {AppKeyboard} from "../../utils/keyboards.js";
import {fetchDescription} from "../../utils/fetchDescription.js";

export const matrixHandlers: {
    callbackKey: string;
    field: keyof DestinyMatrix;
    path: string;
}[] = [
    {callbackKey: 'purpose_land', field: 'LAND_NUM', path: 'land'},
    {callbackKey: 'purpose_sky', field: 'SKY_NUM', path: 'sky'},
    {callbackKey: 'purpose_dest', field: 'DEST_NUM', path: 'dest'},
    {callbackKey: 'partner_description', field: 'H', path: 'partner'},
    {callbackKey: 'relationships_description', field: 'GD', path: 'relation'},
    {callbackKey: 'money_block_description', field: 'VD', path: 'money'},
    {callbackKey: 'work_description', field: 'O', path: 'work'},
    {callbackKey: 'compat_atmosphere', field: 'D', path: 'atmCouple'},
    {callbackKey: 'appearance_description', field: 'A', path: 'appearance'},
    {callbackKey: 'material_meaning', field: 'V', path: 'materialMeaning'},
    {callbackKey: 'positive_meaning', field: 'B', path: 'positiveMeaning'},
    {callbackKey: 'couple_task', field: 'G', path: 'coupleTask'},
    {callbackKey: 'couple_attraction', field: 'Zh', path: 'attraction'},
    {callbackKey: 'cache', field: 'O', path: 'cache'},
    {callbackKey: 'cache_trouble', field: 'M', path: 'cacheTrouble'}
];

export async function registerPurposeNumberHandler(
    bot: Bot<BotContext>,
    callbackKey: string,
    matrixField: keyof DestinyMatrix,
    apiPath: string,
    logger: Logger,
) {
    bot.callbackQuery(callbackKey, async (ctx) => {
        const matrix = ctx.session.matrix as DestinyMatrix | undefined;
        const num = matrix?.[matrixField]?.toString();

        if (!num) {
            await ctx.answerCallbackQuery({text: `Нет числа для ${matrixField}`, show_alert: true});
            return;
        }

        try {
            await ctx.answerCallbackQuery();

            await deleteTempMessageOnly(ctx);

            const data = await fetchDescription(`${API_BASE_URL}/description/${apiPath}/${num}`, logger);

            const msg = await ctx.reply(`<b>${data.title}</b>\n\n${data.description}`, {
                parse_mode: 'HTML',
                reply_markup: AppKeyboard.backToPurposeKeyboard(),
            });

            ctx.session.tempMessageId = msg.message_id;
        } catch {
            await ctx.reply(`❌ Не удалось получить описание ${matrixField}.`);
        }
    });
}
