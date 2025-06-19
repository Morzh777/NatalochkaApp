import { BotContext } from '../bot/BotSettings.js';
import { LoadingService } from './LoadingService.js';
import { deleteAllBotMessages } from '../utils/messageUtils.js';
import axios from 'axios';
import { API_BASE_URL } from '../config/api.js';
import { AppKeyboard } from '../utils/keyboards.js';
import { InputFile } from 'grammy';
import { Logger } from '../utils/Logger.js';
import { Flow } from '../types/Flow.js';
import {ProgramItem} from "../types/ProgramItem.js";
import {getMatrixHistoryCaption} from "../utils/captionUtils.js";

const MSG_ERROR = '🚫 Не удалось получить матрицу судьбы. Попробуй позже.';
const logger = new Logger('matrix');

export async function handleMatrixRequest(ctx: BotContext) {
  const userId = ctx.from?.id;
  if (!userId) {
    return ctx.reply('⚠️ Не удалось определить пользователя.');
  }

  let loading: LoadingService | undefined;

  try {
    const isNewMatrix = ctx.session.flow === Flow.NewDestinyMatrix;
    ctx.session.openedFromHistory = false;

    try {
      await deleteAllBotMessages(ctx);
    } catch (e) {
      console.warn('⚠️ Ошибка при удалении сообщений:', e);
    }

    loading = await LoadingService.create(ctx);

    let user: any = null;

    if (!isNewMatrix) {
      const res = await axios.get(`${API_BASE_URL}/users/${userId}`);
      user = res.data;

      if (!user?.birth_date) {
        await loading.stop();
        return ctx.reply('⚠️ Сначала введи дату рождения.');
      }
    }

    const birthDate = isNewMatrix ? ctx.session.birthDate : user.birth_date;
    const name = isNewMatrix ? ctx.session.username : user.name;

    if (!birthDate || !name) {
      await loading.stop();
      return ctx.reply('⚠️ Не хватает имени или даты рождения.');
    }

    const caption = getMatrixHistoryCaption(name, birthDate)

    let matrix: Record<string, number> | undefined;
    let file_id: string | undefined;
    let image: string | undefined;
    let matrixId: string | undefined;
    let programs: ProgramItem[] = [];

    try {
      const res = await axios.get(`${API_BASE_URL}/matrix`, {
        params: { inputDate: birthDate },
      });
      const data = res.data;
      matrix = data.matrix;
      file_id = data.file_id;
      matrixId = data.id;
      programs = Array.isArray(data.programs) ? data.programs : [];
      console.log('✅ [DB-API]Найдена сохранённая матрица в базе');
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.log('🔥 [CALCULATE-API] Матрица не найдена, пересчитываем новую');
        const imgRes = await axios.post(`${API_BASE_URL}/matrix/destiny`, { birthDate, name });
        const data = imgRes.data;
        matrix = data.matrix;
        file_id = data.file_id;
        image = data.image;
        programs = Array.isArray(data.programs) ? data.programs : [];
        matrixId = data.id;
        console.log('🧠 Матрица пересчитана через CALCULATE-API');
      } else {
        throw err;
      }
    }

    if (!matrix || (!file_id && !image)) {
      await loading?.stop();
      return ctx.reply(MSG_ERROR);
    }

    console.log('➡️ Полученные данные:', { matrix, file_id, hasImage: !!image, programs });

    let finalFileId = file_id;
    let messageId: number | undefined;

    if (file_id) {
      const msg = await ctx.replyWithPhoto(file_id, {
        caption,
        parse_mode: 'HTML',
        reply_markup: AppKeyboard.getMatrixMenuKeyboard(ctx.session.hasPremium ?? false),
      });
      messageId = msg.message_id;
    } else if (image?.startsWith('data:image/png;base64,')) {
      const buffer = Buffer.from(image.split(',')[1], 'base64');
      const inputFile = new InputFile(buffer, 'matrix.png');

      const msg = await ctx.replyWithPhoto(inputFile, {
        caption,
        parse_mode: 'HTML',
        reply_markup: AppKeyboard.getMatrixMenuKeyboard(ctx.session.hasPremium ?? false),
      });

      messageId = msg.message_id;

      if (msg.photo && msg.photo.length > 0) {
        const largest = msg.photo.reduce((max, p) => (!max || p.width > max.width ? p : max), msg.photo[0]);
        finalFileId = largest?.file_id;
        console.log('✅ Получен новый file_id из Telegram:', finalFileId);
      } else {
        console.error('❌ Ошибка: Telegram не вернул фотографию');
        throw new Error('Не удалось получить file_id после отправки изображения');
      }

      // 🛠️ Сохраняем матрицу в БД с новым file_id
      if (finalFileId) {
        const saveRes = await axios.post(`${API_BASE_URL}/matrix`, {
          inputDate: birthDate,
          file_id: finalFileId,
          matrix,
          programs,
        });
        matrixId = saveRes.data.id;
        console.log('💾 [DB-API] Сохранили матрицу с новым file_id в базу');
      }
    }

    console.log('📦 Отправка в историю:', {
      isNewMatrix,
      matrixId,
      name,
      ctxSessionName: ctx.session.username,
    });
    // 📘 Сохраняем в историю только если это новый расчёт и есть matrixId
    if (isNewMatrix && matrixId) {
      try {
        await axios.post(`${API_BASE_URL}/matrix_history`, {
          userId,
          inputDate: birthDate,
          name,
          matrixId,
        });
        console.log('📘 Матрица добавлена в историю matrix_history');
      } catch (e) {
        console.warn('⚠️ Не удалось сохранить матрицу в историю:', e);
      }
    }

    await loading?.stop();

    ctx.session.messageIds ||= [];
    if (messageId) ctx.session.messageIds.push(messageId);

    ctx.session.matrix = matrix;
    ctx.session.matrixImage = image;
    ctx.session.matchedPrograms = programs.filter((p) => p.type === 'обычная');
    ctx.session.karmicPrograms = programs.filter((p) => p.type === 'кармическая');
    ctx.session.activeMatrix = {
      name,
      birthDate,
      matrixId: matrixId || '',
    };
    console.log('✅ Сохранены обычные программы:', ctx.session.matchedPrograms);
    console.log('✅ Сохранены кармические программы:', ctx.session.karmicPrograms);

  } catch (err) {
    logger.logError('Ошибка получения матрицы судьбы', err);
    await loading?.stop();

    const fallback = await ctx.reply(MSG_ERROR);
    ctx.session.messageIds ||= [];
    ctx.session.messageIds.push(fallback.message_id);
  } finally {
    ctx.session.flow = undefined;
    ctx.session.day = undefined;
    ctx.session.month = undefined;
    ctx.session.year = undefined;
    ctx.session.birthDate = undefined;
    ctx.session.username = undefined;
    ctx.session.name = undefined;
  }
}
