import { Bot, Context, MemorySessionStorage, session, SessionFlavor } from 'grammy';
import { settings } from '../config/settings.js';
import { SessionData } from '../types/SessionData.js';

/**
 * Расширенный контекст бота с сессиями.
 */

export type BotContext = Context & SessionFlavor<SessionData>;

/**
 * Singleton-класс для управления Telegram-ботом.
 */
export class BotSettings {
  private static instance: BotSettings;
  private bot: Bot<BotContext>;

  private constructor() {
    this.bot = new Bot<BotContext>(settings.botToken);

    // ✅ Подключаем сессии
    this.bot.use(
      session({
        storage: new MemorySessionStorage(),
        initial: (): SessionData => ({
          state: 'start',
          messageIds: [],
          historyTotalCount: 0,
        }),
      }),
    );
  }

  /**
   * Получает единственный экземпляр бота (Singleton).
   */
  public static getInstance(): BotSettings {
    if (!BotSettings.instance) {
      BotSettings.instance = new BotSettings();
    }
    return BotSettings.instance;
  }

  /**
   * Получает экземпляр бота.
   */
  public getBot(): Bot<BotContext> {
    return this.bot;
  }

  /**
   * Регистрирует команды бота.
   */
  public async registerCommands() {
    console.log('📌 Обновление команд...');
    
    // Базовые команды для всех пользователей
    const publicCommands = [
      { command: 'start', description: 'Начать работу' },
    ];

    // Команды только для администраторов
    const adminCommands: any[] = [];

    // Устанавливаем команды для всех пользователей
    await this.bot.api.setMyCommands(publicCommands);

    // Устанавливаем команды для администраторов
    for (const adminId of settings.adminIds) {
      // Объединяем публичные и административные команды для админов
      const combinedCommands = [...publicCommands, ...adminCommands];
      await this.bot.api.setMyCommands(combinedCommands, {
        scope: { type: "chat", chat_id: adminId }
      });
    }
  }

  /**
   * Запускает бота.
   */
  public async start(): Promise<void> {
    console.log('🟡 Начало запуска бота...');
    try {
      await this.registerCommands();
      console.log('✅ Команды зарегистрированы.');

      console.log('⏳ Бот запускается...');
      await this.bot.start({
        onStart: () => console.log(`🤖 Бот запущен. Версия: ${settings.botVersion}`),
      });
    } catch (error) {
      console.error('❌ Ошибка при запуске бота:', error);
    }
  }
}
