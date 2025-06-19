import {BotContext} from "../bot/BotSettings.js";
import axios from "axios";
import {API_BASE_URL} from "../config/api.js";
import {sendPhotoWithCaption} from "../services/ImageService.js";

/**
 * 🔐 Проверяет, есть ли у пользователя активная подписка.
 * Если нет — отправляет сообщение с кнопкой оформления.
 *
 * @returns true, если доступ есть, иначе false
 */
export async function checkPremiumAccess(ctx: BotContext): Promise<boolean> {
    const userId = ctx.from?.id;
    if (!userId) return false;

    try {
        const { data } = await axios.get<{ isActive: boolean }>(
            `${API_BASE_URL}/premium/${userId}`
        );

        return !!data.isActive;
    } catch (err) {
        console.error("❌ Ошибка при проверке подписки:", err);
        return false;
    }
}

export async function showPremiumPitch(ctx: BotContext) {
    const caption = `
✨ <b>Хочешь понять себя глубже и изменить жизнь?</b>

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

⭐ <b>Купи доступ всего за 99 звёзд(💵 179 рублей )  </b> — и ты откроешь доступ ко всем этим расшифровкам.
`.trim();

    await sendPhotoWithCaption(ctx, "premium_matrix", caption, {
        inline_keyboard: [
            [{ text: "💫 Купить доступ на 30 дней", callback_data: "buy_premium" }],
            [{ text: "⭐ Купить звезды со скидкой", url: "https://t.me/PremiumBot" }],
            [{ text: "🔙 Назад", callback_data: "menu" }],
        ]
    });
}
