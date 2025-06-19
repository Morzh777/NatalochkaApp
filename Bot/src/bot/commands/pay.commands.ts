import { Bot } from "grammy";
import { BotContext } from "../BotSettings.js";
import { PaymentService } from "../../services/PaymentService.js";
import { Flow } from "../../types/Flow.js";
import {deleteAllBotMessages} from "../../utils/messageUtils.js";
import {showPremiumPitch} from "../../utils/checkPremiumAccess.js";



export function registerBuyCommand(bot: Bot<BotContext>) {
    bot.callbackQuery("buy", async (ctx) => {
        console.log("🔥 Кнопка 'buy' нажата");
        await ctx.answerCallbackQuery();
        ctx.session.flow = Flow.buy;
        await PaymentService.sendInvoice(ctx);
    });

    bot.on("pre_checkout_query", async (ctx) => {
        await PaymentService.handlePreCheckout(ctx);
    });

    bot.on("message:successful_payment", async (ctx) => {
        await deleteAllBotMessages(ctx);

        const confirmationMessage = await PaymentService.handleSuccessfulPayment(ctx);

        ctx.session.messageIds ??= [];
        if (confirmationMessage?.message_id) {
            ctx.session.messageIds.push(confirmationMessage.message_id);
        }

        ctx.session.flow = Flow.MainCalculation;
    });
    bot.callbackQuery('enter_promo', async (ctx) => {
        await deleteAllBotMessages(ctx); // если чистишь сообщения

        const msg = await ctx.reply("🔑 Введите промокод для активации премиума:");
        ctx.session.messageIds = [...(ctx.session.messageIds || []), msg.message_id];

        ctx.session.flow = Flow.EnterPromo;
        ctx.session.state = undefined;

        await ctx.answerCallbackQuery(); // закроет кнопку
    });
    bot.callbackQuery("buy_premium_now", async (ctx) => {
        await ctx.answerCallbackQuery();
        await showPremiumPitch(ctx); // 👈 передаём ctx внутрь
    });
    bot.callbackQuery("buy_premium", async (ctx) => {
        await ctx.answerCallbackQuery();
        await PaymentService.sendInvoice(ctx); // 👈 напрямую инвойс
    });
}

