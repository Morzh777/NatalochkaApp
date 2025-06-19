import { Bot } from "grammy";
import { Logger } from "../utils/Logger.js";
import { BotContext } from "./BotSettings.js";

export class Messages {
    private bot: Bot<BotContext>;
    private logger: Logger;

    constructor(bot: Bot<BotContext>) {
        this.bot = bot;
        this.logger = new Logger("MessageHandler");
    }

    public registerMessageHandlers(): void {
        // Удаляем обработчик, который перехватывает все текстовые сообщения
        // this.bot.on("message:text", async (ctx) => {
        //     if (!ctx.session.state || ctx.session.state === 'start') {
        //         this.logger.log(`Получено сообщение: ${ctx.message.text}`);
        //         await ctx.reply(`Вы отправили: ${ctx.message.text}`);
        //     }
        // });
    }
}
