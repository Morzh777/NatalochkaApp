import { BotContext } from '../bot/BotSettings.js';


export class BotCleaner {
  static async autoDelete(ctx: BotContext, messageId: number, delay = 5000): Promise<void> {
    if (!ctx.chat?.id) return;

    setTimeout(() => {
      ctx.api.deleteMessage(ctx.chat!.id, messageId).catch(() => {});
    }, delay);
  }
}