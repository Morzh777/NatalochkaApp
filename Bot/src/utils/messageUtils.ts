import { BotContext } from "../bot/BotSettings.js";

/**
 * Приватная функция.
 * Безопасно удаляет ОДНО сообщение по id.
 * Ловит и аккуратно логирует ошибки.
 */
async function deleteMessageSafe(ctx: BotContext, messageId?: number, label = "сообщение") {
    if (!ctx.chat || !messageId) return;
    const chatId = ctx.chat.id;

    try {
        await ctx.api.deleteMessage(chatId, messageId);
    } catch (error: any) {
        if (error.description?.includes("message to delete not found")) {
            console.warn(`⚠️ ${label} уже удалено (#${messageId})`);
        } else {
            console.error(`❌ Ошибка при удалении ${label} #${messageId}:`, error);
        }
    }
}

/**
 * Удаляет ВСЕ сообщения, отправленные ботом:
 * - подсказки (messageIds)
 * - приветствие (botMessageId)
 * - описание (lastDescriptionMessageId)
 * - временное описание (tempMessageId)
 */
export async function deleteAllBotMessages(ctx: BotContext) {
    if (!ctx.chat) return;

    // 🧹 Удаляем все сообщения из массива
    for (const messageId of ctx.session.messageIds || []) {
        await deleteMessageSafe(ctx, messageId, "сообщение из messageIds");
    }
    ctx.session.messageIds = [];

    // 🧹 Удаляем приветственное сообщение
    await deleteMessageSafe(ctx, ctx.session.botMessageId, "приветственное сообщение");
    ctx.session.botMessageId = undefined;

    // 🧹 Удаляем последнее описание
    await deleteMessageSafe(ctx, ctx.session.lastDescriptionMessageId, "описание");
    ctx.session.lastDescriptionMessageId = undefined;

    // 🧹 Удаляем временное описание
    await deleteMessageSafe(ctx, ctx.session.tempMessageId, "временное описание");
    ctx.session.tempMessageId = undefined;
}

/**
 * Удаляет ТОЛЬКО временное описание (tempMessageId)
 */
export async function deleteTempMessageOnly(ctx: BotContext) {
    if (!ctx.chat) return;

    await deleteMessageSafe(ctx, ctx.session.tempMessageId, "временное описание");
    ctx.session.tempMessageId = undefined;
}
export async function deleteMessage(ctx: BotContext, messageId?: number, label = "сообщение") {
    if (!ctx.chat || !messageId) return;
    const chatId = ctx.chat.id;

    try {
        await ctx.api.deleteMessage(chatId, messageId);
    } catch (error: any) {
        if (error.description?.includes("message to delete not found")) {
            console.warn(`⚠️ ${label} уже удалено (#${messageId})`);
        } else {
            console.error(`❌ Ошибка при удалении ${label} #${messageId}:`, error);
        }
    }
}