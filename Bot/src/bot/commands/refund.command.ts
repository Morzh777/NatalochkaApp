import { Bot } from "grammy";
import { BotContext } from "../BotSettings.js";
import { Flow } from "../../types/Flow.js";

export function registerRefundCommand(bot: Bot<BotContext>) {
    bot.command("refund", async (ctx) => {
        ctx.session.flow = Flow.awaitRefundChargeId;
        await ctx.reply("💸 Введи <code>charge_id</code> для возврата звёзд:", {
            parse_mode: "HTML",
        });
    });
}