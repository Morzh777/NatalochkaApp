import {BotContext} from "../bot/BotSettings.js";
import {Logger} from "../utils/Logger.js";
import {deleteAllBotMessages} from "../utils/messageUtils.js";
import {Flow} from "../types/Flow.js";
import {API_BASE_URL} from "../config/api.js";
import axios from "axios";
import {AppKeyboard} from "../utils/keyboards.js";
import {InputFile} from "grammy";
import { sendPhotoWithCaption } from "./ImageService.js"; // если не импортирован
import {getCompatibilityCaption, getCompatibilityMatrixCaption, getMatrixHistoryCaption} from "../utils/captionUtils.js";
import {ProgramItem} from "../types/ProgramItem.js";

const PAGE_SIZE = 5;
const MSG_EMPTY = "🔢 История пуста. Сделай хотя бы один расчёт.";
const MSG_LOAD_ERROR = "⚠️ Не удалось загрузить историю.";
const logger = new Logger("MatrixService");

export async function handleShowMatrixCallback(ctx: BotContext) {
    if (!ctx.match) {
        console.warn("❗ ctx.match не определён");
        return;
    }

    const [inputDateRaw, nameRaw] = ctx.match.slice(1);
    const inputDate = decodeURIComponent(inputDateRaw);
    const name = decodeURIComponent(nameRaw);
    const userId = ctx.from?.id;

    if (!userId) {
        console.warn("❗ userId не определён");
        return;
    }

    await deleteAllBotMessages(ctx);
    const isCompatibility = ctx.session.flow === Flow.CompatibilityMatrix;

    if (isCompatibility) {
        await handleCompatibilityMatrix(ctx, userId, inputDate, name);
    } else {
        await handleStandardMatrix(ctx, userId, inputDate, name);
    }
}

export async function handleCompatibilityMatrix(
    ctx: BotContext,
    userId: number,
    inputDate: string,
    name: string
) {
    try {
        console.log("🔍 [handleCompatibilityMatrix] userId:", userId);
        console.log("🔍 [handleCompatibilityMatrix] inputDate:", inputDate);
        console.log("🔍 [handleCompatibilityMatrix] name:", name);

        const user = await axios.get(`${API_BASE_URL}/users/${userId}`).then(r => r.data);
        console.log("🧾 [handleCompatibilityMatrix] user from API:", user);

        const mainDate = user?.birth_date;
        console.log("📆 [handleCompatibilityMatrix] mainDate (birth_date):", mainDate);

        if (!mainDate) {
            logger.logError("⚠️ У пользователя не найдена дата рождения", user);
            return ctx.reply("⚠️ Не найдена дата рождения пользователя.");
        }

        console.log("🔎 [handleCompatibilityMatrix] Ищем существующую совместимость...");
        const existing = await axios
            .get(`${API_BASE_URL}/matrix/compatibility/by-date`, {
                params: { mainBirthDate: mainDate, inputDate },
            })
            .then(r => r.data)
            .catch((err) => {
                console.warn("⚠️ [handleCompatibilityMatrix] Ошибка при запросе existing compatibility:", err.message);
                return null;
            });

        const hasPremium = ctx.session.hasPremium ?? false;
        if (existing?.file_id && existing?.matrix) {
            console.log("✅ [handleCompatibilityMatrix] Найдена сохранённая совместимость");
            const msg = await ctx.replyWithPhoto(existing.file_id, {
                caption: getCompatibilityCaption(name,inputDate),
                parse_mode: "HTML",
                reply_markup: AppKeyboard.getMaterialMeaningKeyboard(ctx.session.hasPremium ?? false),
            });
            ctx.session.matrix = existing.matrix;
            ctx.session.messageIds = [msg.message_id];
            ctx.session.activeMatrix = { name, birthDate: inputDate, matrixId: existing.id };
            return;
        }

        console.log("🧮 [handleCompatibilityMatrix] Выполняем новый расчёт совместимости...");
        const { matrix, image } = await axios
            .post(`${API_BASE_URL}/matrix/compatibility/calculate`, {
                birthDate: inputDate,
                mainBirthDate: mainDate,
                asCompatibility: true,
            })
            .then(r => r.data);

        const buffer = Buffer.from(image.replace(/^data:image\/png;base64,/, ""), "base64");
        const msg = await ctx.replyWithPhoto(new InputFile(buffer, "compat.png"), {
            caption: getCompatibilityCaption(name, inputDate),
            parse_mode: "HTML",
            reply_markup: AppKeyboard.getMaterialMeaningKeyboard(ctx.session.hasPremium ?? false),
        });

        const fileId = msg.photo?.[msg.photo.length - 1]?.file_id;
        console.log("🖼️ [handleCompatibilityMatrix] file_id:", fileId);

        if (fileId) {
            await axios.post(`${API_BASE_URL}/matrix/compatibility/save`, {
                mainBirthDate: mainDate,
                inputDate,
                matrix,
                file_id: fileId,
            });
            console.log("💾 [handleCompatibilityMatrix] Совместимость сохранена");
        }

        console.log("🔢 [handleCompatibilityMatrix] История матрицы совместимости добавлена");

        ctx.session.matrix = matrix;
        ctx.session.messageIds = [msg.message_id];
        ctx.session.activeMatrix = { name, birthDate: inputDate, matrixId: fileId ?? "unknown" };

    } catch (err) {
        logger.logError("❌ Ошибка расчёта совместимости", err);
        console.error("❌ [handleCompatibilityMatrix] Exception:", err);
    }
}

export async function handleStandardMatrix(
    ctx: BotContext,
    userId: number,
    inputDate: string,
    name: string
) {
    try {
        const data = await axios
            .get(`${API_BASE_URL}/matrix/by-date`, {
                params: {userId, inputDate, name},
            })
            .then(r => r.data)
            .catch(() => null);

        let matrix = data?.matrix;
        let programs = data?.programs || [];
        let file_id = data?.file_id;
        let matrixId = data?.id;

        if (!file_id || !matrix) {
            const {matrix: newMatrix, image, programs: newPrograms} = await axios
                .post(`${API_BASE_URL}/calculate-matrix`, {birthDate: inputDate})
                .then(r => r.data);

            const buffer = Buffer.from(image.replace(/^data:image\/png;base64,/, ""), "base64");
            const msg = await ctx.replyWithPhoto(new InputFile(buffer, "matrix.png"), {
                caption: getMatrixHistoryCaption(name, inputDate),
                parse_mode: "HTML",
                reply_markup: AppKeyboard.getMatrixMenuKeyboard(ctx.session.hasPremium ?? false),
            });

            file_id = msg.photo?.[msg.photo.length - 1]?.file_id;
            matrix = newMatrix;
            programs = newPrograms;

            if (file_id) {
                const saveRes = await axios.post(`${API_BASE_URL}/matrix`, {
                    inputDate,
                    file_id,
                    matrix,
                    programs,
                });
                matrixId = saveRes.data?.id;
            }

            ctx.session.messageIds = [msg.message_id];
        } else {
            const msg = await ctx.replyWithPhoto(file_id, {
                caption: getMatrixHistoryCaption(name, inputDate),
                parse_mode: "HTML",
                reply_markup: AppKeyboard.getMatrixMenuKeyboard(ctx.session.hasPremium ?? false),
            });
            ctx.session.messageIds = [msg.message_id];
        }

        ctx.session.matrix = matrix;
        ctx.session.matchedPrograms = programs.filter((p: ProgramItem) => p.type === "обычная");
        ctx.session.karmicPrograms = programs.filter((p: ProgramItem) => p.type === "кармическая");

        ctx.session.openedFromHistory = true;
        ctx.session.activeMatrix = {name, birthDate: inputDate, matrixId: matrixId ?? "unknown"};
    } catch (err) {
        logger.logError("❌ Ошибка загрузки или расчёта матрицы", err);
        await ctx.reply("🚫 Не удалось загрузить матрицу. Попробуй позже.");
    }
}

export async function handleBackToMatrixMenu(ctx: BotContext): Promise<void> {
    await ctx.answerCallbackQuery();

    const active = ctx.session.activeMatrix;
    if (!active) {
        await ctx.reply("⚠️ Не найден текущий расчёт.");
        return;
    }

    try {
        // 🔍 Сначала пробуем с именем
        let data = await axios
            .get(`${API_BASE_URL}/matrix/by-date`, {
                params: {
                    userId: ctx.from?.id,
                    inputDate: active.birthDate,
                    name: active.name,
                },
            })
            .then((r) => r.data)
            .catch(() => null);

        // ❗Если не найдено — пробуем без имени
        if (!data?.file_id || !data?.matrix) {
            data = await axios
                .get(`${API_BASE_URL}/matrix`, {
                    params: {inputDate: active.birthDate},
                })
                .then((r) => r.data)
                .catch(() => null);
        }

        if (!data?.file_id || !data?.matrix) {
            throw new Error("Матрица не найдена ни по имени, ни по дате");
        }

        const programs: ProgramItem[] = Array.isArray(data.programs) ? data.programs : [];

        const caption = getMatrixHistoryCaption(active.name, active.birthDate);
        await ctx.editMessageMedia(
            {
                type: "photo",
                media: data.file_id,
                caption,
                parse_mode: "HTML",
            },
            {
                reply_markup: AppKeyboard.getMatrixMenuKeyboard(ctx.session.openedFromHistory ?? false),

            }
        );

        ctx.session.matrix = data.matrix;
        ctx.session.matchedPrograms = programs.filter(
            (p: ProgramItem) => p.type === "обычная"
        );
        ctx.session.karmicPrograms = programs.filter(
            (p: ProgramItem) => p.type === "кармическая"
        );
    } catch (e) {
        console.error("❌ Ошибка возврата к активной матрице:", e);
        await ctx.reply("🚫 Не удалось загрузить расчёт.");
    }
}



export async function showMatrixHistoryPage(
    ctx: BotContext,
    page: number,
    openedFromHistory = false
) {
    const userId = String(ctx.from?.id);
    ctx.session.openedFromHistory = openedFromHistory;

    try {
        const { data } = await axios.get(`${API_BASE_URL}/matrix_history/paginated`, {
            params: { userId, page, pageSize: PAGE_SIZE },
        });

        const items = data.items || [];
        const totalCount = data.totalCount || 0;

        if (!items.length) {
            const msg = await ctx.reply(MSG_EMPTY, {
                reply_markup: {
                    inline_keyboard: [[{ text: "🆕 Новый расчёт", callback_data: "new_matrix" }]],
                },
            });
            ctx.session.messageIds = [msg.message_id];
            return;
        }

        ctx.session.historyTotalCount = totalCount;
        ctx.session.historyCache ||= {};
        ctx.session.historyCache[page] = items;

        const keyboard = AppKeyboard.getMatrixHistoryKeyboard(items, page, PAGE_SIZE, totalCount);


        const caption = getCompatibilityMatrixCaption()


        if (!ctx.session.messageIds?.length) {
            // 👇 Показываем изображение только на первом экране
            await sendPhotoWithCaption(ctx, 'compatibility', caption, keyboard);
        } else {
            // ♻️ Обновляем только клавиатуру при переходе
            await ctx.answerCallbackQuery();
            const lastMsgId = ctx.session.messageIds.at(-1);
            if (lastMsgId) {
                if (!ctx.chat) return;

                await ctx.api.editMessageReplyMarkup(ctx.chat.id, lastMsgId, {
                    reply_markup: keyboard,
                });
            }
        }
    } catch (err) {
        logger.logError("Ошибка загрузки истории матриц", err);
        const msg = await ctx.reply(MSG_LOAD_ERROR);
        ctx.session.messageIds = [msg.message_id];
    }
}
