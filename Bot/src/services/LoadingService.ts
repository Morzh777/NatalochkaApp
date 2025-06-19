import { BotContext } from "../bot/BotSettings.js";

export class LoadingService {
    private static readonly full = "■";
    private static readonly empty = "□";

    private interval?: NodeJS.Timeout;
    private progress = 0;
    private readonly steps: number;
    private readonly ctx: BotContext;
    private messageId: number = 0;

    private constructor(ctx: BotContext, steps: number) {
        this.ctx = ctx;
        this.steps = steps;
    }

    // 🔁 Обновлённый create: сначала reply, потом start
    static async create(ctx: BotContext, steps = 10): Promise<LoadingService> {
        const instance = new LoadingService(ctx, steps);

        const message = await ctx.reply(
            `⏳ Загружаю... [${this.empty.repeat(steps)}] 0%`,
            { parse_mode: "HTML" }
        );

        instance.messageId = message.message_id;
        instance.start(); // запускаем только после получения ID

        return instance;
    }

    private start() {
        this.interval = setInterval(async () => {
            if (this.progress >= this.steps || !this.messageId) return;

            this.progress++;
            const percent = Math.round((this.progress / this.steps) * 100);
            const bar =
                LoadingService.full.repeat(this.progress) +
                LoadingService.empty.repeat(this.steps - this.progress);

            try {
                await this.ctx.api.editMessageText(
                    this.ctx.chat!.id,
                    this.messageId,
                    `⏳ Загружаю... [${bar}] ${percent}%`,
                    { parse_mode: "HTML" }
                );
            } catch {
                await this.stop(); // если ошибка — останавливаем
            }
        }, 300);
    }

    public async stop(): Promise<void> {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }

        if (!this.messageId) return;

        try {
            await this.ctx.api.deleteMessage(this.ctx.chat!.id, this.messageId);
        } catch {
            // всё нормально, если уже удалено
        }
    }

    public getMessageId(): number {
        return this.messageId;
    }
}
