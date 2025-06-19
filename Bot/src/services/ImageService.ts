import fs from "fs";
import path from "path";
import { InputFile } from "grammy";
import { fileURLToPath } from "url";
import { BotContext } from "../bot/BotSettings.js";
import { Logger } from "../utils/Logger.js";

// ==============================
// 📦 Константы
// ==============================

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE_IDS_FILENAME = "../../file_ids.json";
const IMG_DIR = path.resolve(__dirname, "../../style/img");
const FILE_IDS_PATH = path.resolve(__dirname, FILE_IDS_FILENAME);
const IMAGE_EXT = ".webp";

// сообщения
const MSG_IMAGE_FAIL = "⚠️ Не удалось отобразить сообщение.";

// логгер
const logger = new Logger("ImageService");

// ==============================
// 📦 Типы
// ==============================
type MyPhotoOptions = {
    reply_markup?: any;
    caption?: string;
    parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
    disable_notification?: boolean;
    reply_to_message_id?: number;
};

interface FileCacheData {
    file_id: string;
}

// ==============================
// 📁 Инициализация кэша
// ==============================
let fileIdCache: Record<string, FileCacheData> = {};

if (fs.existsSync(FILE_IDS_PATH)) {
    try {
        const raw = fs.readFileSync(FILE_IDS_PATH, "utf-8").trim();
        fileIdCache = raw ? JSON.parse(raw) : {};
    } catch (e) {
        logger.logError("❌ Ошибка чтения file_ids.json", e);
        fileIdCache = {};
    }
} else {
    fileIdCache = {};
}

// ==============================
// ⚙️ Утилиты
// ==============================
function getImagePath(name: string): string {
    return path.join(IMG_DIR, `${name}${IMAGE_EXT}`);
}

export async function sendPhotoWithCaption(ctx: BotContext, imageKey: string, caption: string, replyMarkup: any) {
    const message = await ImageService.replyWithPhoto(ctx, imageKey, {
        caption,
        parse_mode: "HTML",
        reply_markup: replyMarkup,
    });

    ctx.session.messageIds ||= [];
    ctx.session.messageIds.push(message.message_id);
}

// ==============================
// 📸 Класс ImageService
// ==============================
export class ImageService {
    /** Если file_id есть — отдаем, иначе InputFile */
    static getImage(name: string): InputFile | string {
        const fullPath = getImagePath(name);
        const cached = fileIdCache[name];

        if (cached?.file_id) {
            return cached.file_id;
        }

        if (fs.existsSync(fullPath)) {
            return new InputFile(fullPath);
        }

        throw new Error(`❌ Изображение "${name}" не найдено`);
    }

    /** Сохраняем file_id */
    static saveFileId(name: string, file_id: string) {
        fileIdCache[name] = { file_id };
        fs.writeFileSync(FILE_IDS_PATH, JSON.stringify(fileIdCache, null, 2));
        logger.log(`💾 Сохранили file_id для "${name}": ${file_id}`);
    }

    /** Основной метод отправки изображения */
    static async replyWithPhoto(
        ctx: BotContext,
        imageName: string,
        options?: MyPhotoOptions
    ) {
        let imageOrFile = this.getImage(imageName);

        try {
            const { reply_markup, ...rest } = options || {};

            const msg = await ctx.replyWithPhoto(imageOrFile, rest);

            if (reply_markup) {
                await ctx.api.editMessageReplyMarkup(ctx.chat!.id, msg.message_id, {
                    reply_markup,
                });
            }

            if (imageOrFile instanceof InputFile) {
                const file_id = msg.photo?.[msg.photo.length - 1]?.file_id;
                if (file_id) {
                    this.saveFileId(imageName, file_id);
                }
            }

            return msg;
        } catch (error: any) {
            const isBadFileId =
                typeof imageOrFile === "string" &&
                error?.description?.toLowerCase()?.includes("wrong file identifier");

            if (isBadFileId) {
                logger.log(`♻️ file_id для "${imageName}" недействителен. Пересоздаём...`);
                delete fileIdCache[imageName];
                fs.writeFileSync(FILE_IDS_PATH, JSON.stringify(fileIdCache, null, 2));

                const retryImage = new InputFile(getImagePath(imageName));
                const retryMsg = await ctx.replyWithPhoto(retryImage, options);

                const file_id = retryMsg.photo?.[retryMsg.photo.length - 1]?.file_id;
                if (file_id) {
                    this.saveFileId(imageName, file_id);
                }

                return retryMsg;
            }

            logger.logError(`❌ Ошибка отправки изображения "${imageName}"`, error);

            if (options?.caption) {
                return await ctx.reply(options.caption, {
                    parse_mode: options.parse_mode,
                    reply_markup: options.reply_markup,
                    disable_notification: options.disable_notification,
                    reply_to_message_id: options.reply_to_message_id,
                });
            }

            return await ctx.reply(MSG_IMAGE_FAIL);
        }
    }
}
