import { config } from "dotenv";
import { BotSettings } from "./bot/BotSettings.js";
import { Messages } from "./bot/Messages.js";
import { registerCommands } from "./bot/commands/index.js";
import { registerAdminCommands } from "./bot/commands/admin.command.js";
import { BotContext } from "./bot/BotSettings.js";
import { registerFallbacks } from "./bot/commands/fallback.command.js";

config();

// ✅ Получаем Singleton-экземпляр бота
const botSettings = BotSettings.getInstance();
const bot = botSettings.getBot();

// ✅ Регистрируем команды и обработчики
registerCommands(bot);
registerAdminCommands(bot);
const messageHandler = new Messages(bot);
messageHandler.registerMessageHandlers();

// ✅ Регистрируем fallback-обработчик в самом конце
registerFallbacks(bot);

// ✅ Логируем ошибки
bot.catch((err) => {
    console.error("❌ Произошла ошибка в работе бота:", err);
});

// ✅ Запускаем бота
botSettings.start().catch((err) => {
    console.error("❌ Ошибка при запуске бота:", err);
});
