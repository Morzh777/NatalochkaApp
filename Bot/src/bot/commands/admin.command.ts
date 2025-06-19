import { Bot, Context, InlineKeyboard } from "grammy";
import { UserService } from "../../services/UserService.js";
import { ImageService } from "../../services/ImageService.js";
import { Logger } from "../../utils/Logger.js";
import { settings } from "../../config/settings.js";
import { BotContext } from "../BotSettings.js";

const logger = new Logger("AdminCommands");

// Проверка на администратора
function isAdmin(userId: number): boolean {
    return settings.adminIds.includes(userId);
}

// Захардкоженная капча
const CAPTCHA_TEXT_PROMO = `🎁 <b>Специальное предложение!</b>

🧬 <b>Матрица судьбы</b> — покажет твои сильные и слабые стороны,  
влияющие энергии и скрытые установки.

🎯 <b>Цель и путь:</b>  
• Что твоя душа хочет пройти  
• Как раскрыть свой потенциал

💰 <b>Финансы и работа:</b>  
• Где теряется энергия и деньги  
• Как найти дело по душе и выйти на новый уровень

💞 <b>Совместимость:</b>  
• Почему вас тянет — или отталкивает  
• Что мешает гармонии в отношениях  
• Как стать ближе и избежать конфликтов

⭐ <b>Купи доступ всего за 99 звёзд(💵 179 рублей )  </b> — и ты откроешь доступ ко всем этим расшифровкам.`;

const CAPTCHA_TEXT = `📢 <b>Уважаемые подписчики Наталочки!</b>

Теперь все обновления бота, а также полезные материалы доступны в наших внешних каналах.

💬 <b>Telegram-группа</b>  
Мы публикуем свежие новости о функционале бота,  
дарим <b>промокоды на доступ</b> и делимся полезной информацией.

📰 <b>Канал на Яндекс.Дзен</b>  
Рассказываем о структуре Матрицы Судьбы, объясняем значения точек  
и публикуем практические разборы.

Эти ресурсы помогут вам:  
• лучше понимать свои предназначения и энергии  
• раскрыть сильные стороны и потенциал  
• использовать возможности бота на максимум

Подписывайтесь, чтобы быть в курсе новинок, получать подарки и использовать бот на 100%.`;

export const promoKeyboard = new InlineKeyboard()
    .url("📢 Канал на Дзен", "https://dzen.ru/asknatalochka")
    .url("💬 Группа в Telegram", "https://t.me/natalochka_news")
    .text("Твоя матрица судьбы", "matrix_menu");

// Функция для задержки
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function registerAdminCommands(bot: Bot<BotContext>) {
    bot.callbackQuery("send_news_admin", async (ctx) => {
        if (!ctx.from || !isAdmin(ctx.from.id) || !ctx.chat) {
            await ctx.answerCallbackQuery();
            return;
        }

        await ctx.answerCallbackQuery("Начинаем рассылку...");

        try {
            const users = await UserService.getAllActiveUsers();
            const totalUsers = users.length;

            if (totalUsers === 0) {
                await ctx.reply("❌ Нет активных пользователей для рассылки.");
                return;
            }

            await ctx.reply(`📤 Начинаем рассылку ${totalUsers} пользователям...\n⏳ Это может занять некоторое время...`);

            let successCount = 0;
            let failCount = 0;
            let currentCount = 0;

            // Запускаем рассылку асинхронно, не блокируя основной поток
            (async () => {
                // Отправляем все сообщения параллельно
                const sendPromises = users.map(async (user) => {
                    try {
                        // Создаем временный контекст для каждого пользователя
                        const userCtx = {
                            ...ctx,
                            from: { id: user.id },
                            chat: { id: user.id },
                            reply: ctx.api.sendMessage.bind(ctx.api, user.id),
                            replyWithPhoto: ctx.api.sendPhoto.bind(ctx.api, user.id),
                            session: ctx.session
                        } as BotContext;

                        // Отправляем сообщение с картинкой
                        await ImageService.replyWithPhoto(userCtx, "captcha", {
                            caption: CAPTCHA_TEXT,
                            parse_mode: "HTML",
                            reply_markup: promoKeyboard,
                        });

                        successCount++;
                        currentCount++;

                        // Убираем промежуточные обновления статуса
                        return { success: true, userId: user.id };
                    } catch (error: any) {
                        failCount++;
                        logger.logError(`Ошибка при отправке пользователю ${user.id}`, error);
                        return { success: false, userId: user.id };
                    }
                });

                // Ждем завершения всех отправок
                await Promise.all(sendPromises);

                await ctx.reply(
                    `✅ Рассылка завершена\n\n` +
                    `📊 Итоги:\n` +
                    `✅ Успешно отправлено: ${successCount}\n` +
                    `❌ Ошибок: ${failCount}\n` +
                    `📝 Всего получателей: ${totalUsers}`,
                    { reply_markup: new InlineKeyboard().text("🏠 В главное меню", "menu") }
                );
            })().catch(error => {
                logger.logError("Ошибка при массовой отправке", error);
                ctx.reply("❌ Произошла ошибка при рассылке.");
            });

        } catch (error) {
            logger.logError("Ошибка при запуске рассылки", error);
            await ctx.reply("❌ Произошла ошибка при запуске рассылки.");
        }
    });
}