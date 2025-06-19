import {BotContext} from '../bot/BotSettings';
import {AppKeyboard} from '../utils/keyboards.js';
import {InputFile} from 'grammy';
import axios from 'axios';
import {API_BASE_URL} from '../config/api.js';
import {Flow} from '../types/Flow.js';
import {SessionService} from './SessionService.js';
import type {PhotoSize} from 'grammy/types';
import {deleteAllBotMessages} from '../utils/messageUtils.js';
import {getMatrixCaption} from '../utils/captionUtils.js';
import {Logger} from '../utils/Logger.js';
import {checkPremiumAccess} from "../utils/checkPremiumAccess.js";

const api = {
    calculate: () => `${API_BASE_URL}/calculate`,
    saveCalculation: () => `${API_BASE_URL}/calculation`,
    addToHistory: () => `${API_BASE_URL}/user_history`,
    getCalculationByDate: (inputDate: string) =>
        `${API_BASE_URL}/calculation?inputDate=${inputDate}`,
};

const logger = new Logger('Calculation');

const BASE64_PREFIX = 'base64';
const DEFAULT_FLOW_STATE = 'menu';
const MSG_CALC_ERROR = '⚠️ Не удалось выполнить расчёт.';
const ERR_NO_FILE_ID = 'Не удалось получить file_id';
const ERR_CALC_NOT_SAVED = 'Расчёт не сохранился';

export class CalculationService {
    public static async start(ctx: BotContext) {
        const loadingMessageId = await SessionService.resetForFlow(ctx, Flow.NewCalculation);
        await AppKeyboard.promptForDay(ctx);
        if (loadingMessageId) {
            try {
                await ctx.api.deleteMessage(ctx.chat!.id, loadingMessageId);
            } catch (error) {
                logger.logError('удаление загрузочного сообщения', error);
            }
        }
    }

    public static async complete(ctx: BotContext): Promise<number | null> {
        const calculation = await CalculationService.calculateAndSend(ctx);

        ctx.session.state = DEFAULT_FLOW_STATE;
        ctx.session.flow = undefined;

        return calculation?.id ?? null;
    }

    public static async calculateAndSend(
        ctx: BotContext,
    ): Promise<{ id: number; square: any; file_id: string; messageId: number } | null> {
        const { day, month, year, name } = ctx.session;

        if (!day || !month || !year || !name) {
            await ctx.reply("⚠️ Отсутствуют данные для расчёта. Попробуйте заново.");
            return null;
        }

        const inputDate = `${day}.${month}.${year}`;
        await deleteAllBotMessages(ctx);

        try {
            const existing = await axios
                .get(api.getCalculationByDate(inputDate))
                .then((res) => res.data)
                .catch(() => null);

            let square: any;
            let fileId: string;
            let id: number;
            let messageId: number;

            const caption = getMatrixCaption(name, inputDate);

            if (existing?.id && existing.file_id) {
                id = existing.id;
                fileId = existing.file_id;
                square = existing.square;
                const hasPremium = await checkPremiumAccess(ctx);
                const msg = await ctx.replyWithPhoto(fileId, {
                    caption,
                    parse_mode: 'HTML',
                    reply_markup: AppKeyboard.detailKeyboard({
                        square,
                        openedFromHistory: false,
                        showNewCalc: true,
                        hasPremium,
                    }),
                });

                messageId = msg.message_id;
            } else {
                const res = await axios.post(api.calculate(), { birthDate: inputDate });
                const { square: sq, image, file_id } = res.data;

                if (!image || typeof image !== 'string') {
                    throw new Error("Некорректный формат изображения");
                }

                square = sq;

                const buffer = Buffer.from(image.split(',')[1], BASE64_PREFIX);
                const photo = new InputFile(buffer);
                const hasPremium = await checkPremiumAccess(ctx);
                const msg = await ctx.replyWithPhoto(photo, {
                    caption,
                    parse_mode: 'HTML',
                    reply_markup: AppKeyboard.detailKeyboard({
                        square,
                        openedFromHistory: false,
                        showNewCalc: true,
                        hasPremium,
                    }),
                });

                const largest = msg.photo?.reduce<PhotoSize | null>(
                    (max, p) => (!max || p.width > max.width ? p : max),
                    null,
                );

                if (!largest?.file_id) throw new Error(ERR_NO_FILE_ID);

                fileId = largest.file_id;
                messageId = msg.message_id;

                const saveRes = await axios.post(api.saveCalculation(), {
                    birthDate: inputDate,
                    square,
                    file_id: fileId,
                });

                id = saveRes.data?.id;
                if (!id) throw new Error(ERR_CALC_NOT_SAVED);
            }

            await CalculationService.addToUserHistory(ctx, id, name);
            ctx.session.square = square;
            ctx.session.messageIds ||= [];
            ctx.session.messageIds.push(messageId);

            return { id, square, file_id: fileId, messageId };
        } catch (error) {
            logger.logError('расчёт и отправка', error);
            const fallback = await ctx.reply(MSG_CALC_ERROR);
            ctx.session.messageIds ||= [];
            ctx.session.messageIds.push(fallback.message_id);
            return null;
        }
    }

    private static async addToUserHistory(ctx: BotContext, calculationId: number, name?: string) {
        try {
            const payload = {
                userId: String(ctx.from!.id),
                calculationId,
                name: name || 'Без имени',
            };
            console.log('📦 Добавляем в историю:', payload);

            await axios.post(api.addToHistory(), payload);
        } catch (error) {
            logger.logError('добавление в историю', error);
            if ((error as any)?.response?.data) {
                console.error('📩 Ответ от API:', (error as any).response.data);
            }
        }
    }
}
