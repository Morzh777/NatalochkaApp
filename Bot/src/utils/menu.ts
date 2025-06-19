import { BotContext } from "../bot/BotSettings.js";
import { AppKeyboard } from "./keyboards.js";
import { ImageService } from "../services/ImageService.js"; // или твой путь
import type { Message } from "grammy/types";

export async function showMainMenu(ctx: BotContext, name?: string): Promise<Message> {
    const formattedName = name?.trim() ? `, <b>${name}</b>` : "";

    const caption = `✨ <b>Приветствую тебя${formattedName}!</b>\n
Ты попал(а) в мир <b>Наталочки</b> — место, где числа раскрывают судьбу и помогают понять себя и других 💫

🔮 Выбери, с чего хочешь начать:`;

    const message = await ImageService.replyWithPhoto(ctx, "menu", {
        caption,
        parse_mode: "HTML",
        reply_markup: AppKeyboard.getMainMenuKeyboard(),
    });

    ctx.session.messageIds ||= [];
    ctx.session.messageIds.push(message.message_id);

    return message;
}
