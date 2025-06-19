import {InlineKeyboard, Keyboard} from 'grammy';
import {BotContext} from '../bot/BotSettings.js';
import {ComparisonsItem} from '../types/Compatibility.js';

/** ==================== КНОПОКИ ==================== **/
const BTN_BACK = '◀️ Назад';
const BTN_BACK_ALT = '◀️';
const BTN_BACK_FAST = '⏮️';
const BTN_FORWARD = '▶️';
const BTN_FORWARD_FAST = '⏭️';
const BTN_BACK_TO_HISTORY = '↩️ К истории';
const BTN_MENU_ALT = '↩️ В главное меню';
const BTN_NEW_CALC = '🆕 Новый расчёт';
const BTN_DAY = '📆 Начнём с дня рождения';
const BTN_MONTH = '📆 Теперь выберите месяц';
const BTN_YEAR = '📆 Осталось указать год';
const BTN_USERNAME = '📝 И напоследок — имя';
const BTN_MAIN_CALC = '🧍‍♂️ Матрица Пифагора';
const BTN_MATRIX = '🧬 Матрица судьбы ⭐';
const BTN_COMPAT = '💞 Совместимость';
const BTN_HISTORY = '🔢 История расчетов';
const BTN_PRIMARY = '📌 Основные черты';
const BTN_ADDITIONAL = '🪞 Дополнительные аспекты';
const BTN_USER_SETTINGS = '⚙️ НАСТРОЙКИ';
const BTN_USER_PROFILE_CHANGE_NAME = '🧍‍♂️ Изменить имя';
const BTN_USER_PROFILE_CHANGE_DATE = '📅 Изменить дату';


const CB_MATRIX = 'matrix_menu';

/** ==================== ИКОНКИ ==================== **/
const ICON_USER = '👤 ';
const ICON_PRIMARY = '🔢 ';
const ICON_PERCENT = '📊 ';

/** ==================== ЗНАЧЕНИЯ КВАДРАТА ==================== **/
const TXT_CHAR = 'Характер'; // 1
const TXT_ENERGY = 'Энергия'; // 2
const TXT_INTEREST = 'Интерес'; // 3
const TXT_HEALTH = 'Здоровье'; // 4
const TXT_LOGIC = 'Логика'; //5
const TXT_WORK = 'Трудолюбие'; //6
const TXT_LUCK = 'Удача'; //7
const TXT_CARE = 'Забота'; //8
const TXT_MEMORY = 'Память'; //9
const TXT_GOAL = 'Цель'; //10
const TXT_FAMILY = 'Семья'; //11
const TXT_STABILITY = 'Стабильность'; //12
const TXT_SELFESTEEM = 'Самооценка'; //13
const TXT_MONEY = 'Финансы'; //14
const TXT_TALENT = 'Талант'; //15
const TXT_SEX = 'Сексуальность'; //16
const TXT_SPIRIT = 'Духовность'; //17

/** ==================== CALLBACK ЧИСЛА (КВАДРАТА) ==================== **/
const CHAR_NUMBER = '1';
const ENERGY_NUMBER = '2';
const INTEREST_NUMBER = '3';
const HEALTH_NUMBER = '4';
const LOGIC_NUMBER = '5';
const WORK_NUMBER = '6';
const LUCK_NUMBER = '7';
const CARE_NUMBER = '8';
const MEMORY_NUMBER = '9';
const GOAL_NUMBER = '10';
const FAMILY_NUMBER = '11';
const STABILITY_NUMBER = '12';
const SELFESTEEM_NUMBER = '13';
const MONEY_NUMBER = '14';
const TALENT_NUMBER = '15';
const SEX_NUMBER = '16';
const SPIRIT_NUMBER = '17';

/** ==================== CALLBACK DATA ==================== **/
const CB_BACK_TO_MODE = 'back_to_mode';
const CB_BACK_TO_HISTORY = 'back_to_history';
const CB_MENU = 'menu';
const CB_NEW_CALC = 'square';
const CB_MAIN_CALC = 'main_calculation';
const CB_COMPAT = 'menu_compatibility';
const CB_COMPAT_PAGINATION = 'compatibility';
const CB_HISTORY = 'history';
const CB_SHOW_SQUARE = 'show_square';
const CB_SHOW_AGGREGATES = 'show_aggregates';
const CB_SHOW_HISTORY_PREFIX = 'show_history';
const CB_HISTORY_PAGE_PREFIX = 'history_page';
const CB_SHOW_COMPATIBILITY_PREFIX = 'show_compatibility';
const CB_COMPATIBILITY_PAGE_PREFIX = 'compatibility_page';
const CB_USER_SETTINGS = 'settings';
const CB_USER_CHANGE_NAME = 'edit_name';
const CB_USER_CHANGE_DATE = 'edit_date';

/** ==================== SESSION STATE ==================== **/
const AWAIT_USERNAME = 'awaiting_username';

interface HistoryItem {
    name: string;
    input_date: string;
}

export class AppKeyboard {
    /** ==================== REPLY-КЛАВИАТУРЫ ==================== **/

    public static dayKeyboard(): Keyboard {
        return this.createNumericKeyboard(1, 31, 5);
    }

    public static monthKeyboard(): Keyboard {
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
        ];
        return this.createTextKeyboard(months, 4);
    }

    public static yearKeyboard(): Keyboard {
        const currentYear = new Date().getFullYear();
        return this.createNumericKeyboard(1600, currentYear, 5, true);
    }

    /** ==================== INLINE-КЛАВИАТУРЫ ==================== **/
    public static getUserMenuKeyboard: () => InlineKeyboard = () => {
        return new InlineKeyboard()
            .text(BTN_USER_PROFILE_CHANGE_NAME, CB_USER_CHANGE_NAME).row()
            .text(BTN_USER_PROFILE_CHANGE_DATE, CB_USER_CHANGE_DATE).row()
            .text('🎁 Ввести промокод', 'enter_promo').row()
            .text('🗑️ Удалить профиль', 'delete_profile').row()
            .text(BTN_MENU_ALT, CB_MENU);
    };

    public static getAdminMenuKeyboard: () => InlineKeyboard = () => {
        return new InlineKeyboard()
            .text("📤 Отправить новость", "send_news_admin").row()
            .text(BTN_MENU_ALT, CB_MENU);
    };

    public static squareKeyboard(square: Record<string, string>, openedFromHistory = false): InlineKeyboard {
        const keyboard = new InlineKeyboard()
            .text(TXT_CHAR, CHAR_NUMBER).text(TXT_HEALTH, HEALTH_NUMBER).text(TXT_LUCK, LUCK_NUMBER).row()
            .text(TXT_ENERGY, ENERGY_NUMBER).text(TXT_LOGIC, LOGIC_NUMBER).text(TXT_CARE, CARE_NUMBER).row()
            .text(TXT_INTEREST, INTEREST_NUMBER).text(TXT_WORK, WORK_NUMBER).text(TXT_MEMORY, MEMORY_NUMBER).row()
            .text(BTN_BACK, CB_BACK_TO_MODE);

        if (openedFromHistory) {
            keyboard.row().text(BTN_BACK_TO_HISTORY, CB_BACK_TO_HISTORY);
        }

        return keyboard;
    }

    public static aggregatesKeyboard(
        square: Record<string, string>,
        openedFromHistory = false,
        hasPremium?: boolean,
    ): InlineKeyboard {
        const keyboard = new InlineKeyboard();

        const buttons = [
            { label: TXT_GOAL, callback: GOAL_NUMBER },
            { label: TXT_FAMILY, callback: FAMILY_NUMBER },
            { label: TXT_STABILITY, callback: STABILITY_NUMBER },
            { label: TXT_SELFESTEEM, callback: SELFESTEEM_NUMBER },
            { label: TXT_MONEY, callback: MONEY_NUMBER },
            { label: TXT_TALENT, callback: TALENT_NUMBER },
            { label: TXT_SEX, callback: SEX_NUMBER },
            { label: TXT_SPIRIT, callback: SPIRIT_NUMBER },
        ];

        for (let i = 0; i < buttons.length; i += 3) {
            const row = buttons.slice(i, i + 3);
            for (const { label, callback } of row) {
                const isActive = hasPremium === true; // 👈 Явная проверка
                const finalLabel = isActive ? label : `${label} ⭐`;
                const finalCallback = isActive ? callback : 'buy_premium';
                keyboard.text(finalLabel, finalCallback);
            }
            keyboard.row();
        }

        keyboard.text(BTN_BACK, CB_BACK_TO_MODE);

        if (openedFromHistory) {
            keyboard.row().text(BTN_BACK_TO_HISTORY, CB_BACK_TO_HISTORY);
        }

        return keyboard;
    }

    public static detailKeyboard({
                                     hasPremium = false,
                                 }: {
        square: any;
        openedFromHistory?: boolean;
        showNewCalc?: boolean;
        isMainCalculation?: boolean;
        hasPremium?: boolean;
    }): InlineKeyboard {
        const keyboard = new InlineKeyboard()
            .text(BTN_PRIMARY, CB_SHOW_SQUARE).row()
            .text(BTN_ADDITIONAL, CB_SHOW_AGGREGATES).row();

        if (!hasPremium) {
            keyboard.text("💞 Совместимость по матрице судьбы", "matrix_compatibility").row();
            keyboard.text("🧬 Твоя матрица судьбы", "matrix_menu").row();
        }

        keyboard
            .text(BTN_NEW_CALC, CB_NEW_CALC).row()
            .text(BTN_HISTORY, CB_HISTORY).row()
            .text(BTN_MENU_ALT, CB_MENU).row();

        return keyboard;
    }

    public static getHistoryKeyboard(
        history: HistoryItem[],
        page: number,
        pageSize: number,
        totalCount: number,
    ): InlineKeyboard {
        const keyboard = new InlineKeyboard();

        history.forEach((item) => {
            keyboard
                .text(
                    `${item.name} — ${item.input_date}`,
                    `${CB_SHOW_HISTORY_PREFIX}:${item.input_date}|${item.name}`,
                )
                .row();
        });

        this.addPaginationControls(keyboard, page, totalCount, pageSize, CB_HISTORY);
        keyboard.row().text(BTN_NEW_CALC, CB_NEW_CALC);
        keyboard.row().text(BTN_MENU_ALT, CB_MENU);

        return keyboard;
    }


    public static getCompatibilityKeyboard(
        comparisons: ComparisonsItem[],
        page: number,
        pageSize: number,
        totalCount: number,
        userDestiny?: string,
        hasPremium?: boolean,
    ): InlineKeyboard {
        const keyboard = new InlineKeyboard();

        comparisons.forEach((item) => {
            const callbackData = hasPremium
                ? `${CB_SHOW_COMPATIBILITY_PREFIX}:${item.inputDate}|${item.name}`
                : 'buy_premium'; // 🔒 редиректим на платную страницу

            keyboard.text(
                `${ICON_USER} ${item.name} | ${ICON_PRIMARY} ${item.destiny} | ${ICON_PERCENT} ${item.percentage}%`,
                callbackData
            ).row();
        });

        this.addPaginationControls(keyboard, page, totalCount, pageSize, CB_COMPAT_PAGINATION);

        keyboard.row().text(`☀️ Твое число судьбы: ${userDestiny}`, `show_user_destiny:${userDestiny}`).row();

        if (!hasPremium) {
            keyboard.text('👉 Больше о твоей совместимости тут', 'matrix_compatibility').row();
        }

        keyboard.row().text(BTN_NEW_CALC, CB_NEW_CALC);
        keyboard.row().text(BTN_MENU_ALT, CB_MENU);

        return keyboard;
    }



    public static getMainMenuKeyboard(): InlineKeyboard {
        return new InlineKeyboard()
            .text(BTN_MAIN_CALC, CB_MAIN_CALC).row()
            .text(BTN_COMPAT, CB_COMPAT).row()
            .text(BTN_MATRIX, CB_MATRIX).row()
            .text('💞 Совместимость Пары ⭐', 'matrix_compatibility').row()
            .text(BTN_USER_SETTINGS, CB_USER_SETTINGS).row()
            .url("🎁 Подарки и новости", "https://t.me/natalochka_news").row()
            .switchInline('💌 Поделиться Наталочкой', '🔥 Зацени Наталочку — это бот, который реально раскрывает скрытые черты по дате рождения и показывает совместимость с другими. Очень годно!');
    }

    /** ==================== ПРОМПТЫ ==================== **/

    public static async promptForDay(ctx: BotContext) {
        await this.sendPrompt(ctx, BTN_DAY, this.dayKeyboard());
    }

    public static async promptForMonth(ctx: BotContext) {
        await this.sendPrompt(ctx, BTN_MONTH, this.monthKeyboard());
    }

    public static async promptForYear(ctx: BotContext) {
        await this.sendPrompt(ctx, BTN_YEAR, this.yearKeyboard());
    }

    public static async promptForUsername(ctx: BotContext) {
        ctx.session.state = AWAIT_USERNAME;
        await ctx.reply(BTN_USERNAME, {
            reply_markup: {remove_keyboard: true},
        });
    }

    /** ==================== ПРИВАТНЫЕ ==================== **/

    private static async sendPrompt(ctx: BotContext, text: string, keyboard: Keyboard) {
        const msg = await ctx.reply(text, {reply_markup: keyboard});
        ctx.session.botMessageId = msg.message_id;
    }

    private static createNumericKeyboard(start: number, end: number, perRow: number, descending = false): Keyboard {
        const numbers = Array.from({length: end - start + 1}, (_, i) => String(descending ? end - i : start + i));
        return this.createTextKeyboard(numbers, perRow);
    }

    private static createTextKeyboard(items: string[], perRow: number): Keyboard {
        const keyboard = new Keyboard();
        for (let i = 0; i < items.length; i += perRow) {
            keyboard.row(...items.slice(i, i + perRow));
        }
        return keyboard.resized();
    }

    private static addPaginationControls(
        keyboard: InlineKeyboard,
        page: number,
        totalItems: number,
        pageSize: number,
        prefix: string,
    ) {
        const totalPages = Math.ceil(totalItems / pageSize);
        const buttons: { text: string; callback_data: string }[] = [];

        if (page > 0) {
            // В начало
            buttons.push({text: BTN_BACK_FAST, callback_data: `${prefix}_page:0`});
            // Назад
            buttons.push({text: BTN_BACK_ALT, callback_data: `${prefix}_page:${page - 1}`});
        }

        if (page < totalPages - 1) {
            // Вперёд
            buttons.push({text: BTN_FORWARD, callback_data: `${prefix}_page:${page + 1}`});
            // В конец
            if (page < totalPages - 2) {
                buttons.push({text: BTN_FORWARD_FAST, callback_data: `${prefix}_page:${totalPages - 1}`});
            }
        }

        // Рисуем строку кнопок, если есть хоть одна
        if (buttons.length > 0) {
            buttons.forEach(btn => keyboard.text(btn.text, btn.callback_data));
            keyboard.row(); // кнопки в одну строку
        }
    }

    public static getMatrixMenuKeyboard(hasPremium: boolean): InlineKeyboard {
        const keyboard = new InlineKeyboard();

        const buttons = [
            { label: '🧩 Программы', callback: 'open_program_menu' },
            { label: '🎯 Предназначение', callback: 'show_purpose' },
            { label: '❤️ Взаимоотношения', callback: 'show_relationships' },
            { label: '💰 Финансы', callback: 'show_money' },
            { label: '💞 Совместимость', callback: 'matrix_compatibility', alwaysEnabled: true },
            { label: '🆕 Новый расчёт', callback: 'new_matrix' },
            { label: BTN_HISTORY, callback: 'matrix_history' },
        ];

        for (const { label, callback, alwaysEnabled } of buttons) {
            const finalLabel = hasPremium || alwaysEnabled ? label : `${label} ⭐`;
            const finalCallback = hasPremium || alwaysEnabled ? callback : 'buy_premium';
            keyboard.text(finalLabel, finalCallback).row();
        }

        keyboard.text(BTN_MENU_ALT, 'menu');

        return keyboard;
    }

    public static getProgramsKeyboard(fromHistory = false): InlineKeyboard {
        const keyboard = new InlineKeyboard()
            .text('🧩 Обычные', 'open_programs').row()
            .text('💀 Кармические', 'open_karmic').row();

        if (fromHistory) {
            keyboard.text('◀️ Назад', 'back_to_matrix_menu');
        } else {
            keyboard.text('◀️ Назад', 'matrix_menu');
        }

        return keyboard;
    }

    public static getProgramListKeyboard(
        programs: { key: string; title: string; type: 'обычная' | 'кармическая' }[],
        prefix = 'show_program',
        backCallback = 'back_to_program_menu',
    ): InlineKeyboard {
        const keyboard = new InlineKeyboard();

        programs.forEach(({key, title, type}) => {
            keyboard.text(`📌 ${key} ${title}`, `${prefix}:${key}|${type}`).row();
        });

        keyboard.text('◀️ Назад', backCallback).row();
        keyboard.text(BTN_MENU_ALT, CB_MENU);

        return keyboard;
    }

    public static backToProgramsKeyboard(): InlineKeyboard {
        return new InlineKeyboard().text('◀️ Назад', 'delete_message');
    }


    public static getMatrixHistoryKeyboard(
        history: { input_date: string; name: string }[],
        page: number,
        pageSize: number,
        totalCount: number,
    ): InlineKeyboard {
        const keyboard = new InlineKeyboard();

        history.forEach((item) => {
            keyboard
                .text(`${item.name} — ${item.input_date}`, `show_matrix:${item.input_date}|${item.name}`)
                .row();
        });

        // пагинация
        const totalPages = Math.ceil(totalCount / pageSize);
        if (totalPages > 1) {
            const navRow: [string, string][] = [];

            if (page > 0) {
                navRow.push(['◀️ Назад', `matrix_page:${page - 1}`]);
            }

            if (page < totalPages - 1) {
                navRow.push(['Вперёд ▶️', `matrix_page:${page + 1}`]);
            }

            navRow.forEach(([label, callback]) => keyboard.text(label, callback));
            if (navRow.length > 0) keyboard.row();
        }

        keyboard.text(BTN_MENU_ALT, CB_MENU).row();

        return keyboard;
    }

    public static getPurposeKeyboard(SKY_NUM: number, LAND_NUM: number, DEST_NUM: number, fromHistory = false): InlineKeyboard {
        const keyboard = new InlineKeyboard()
            .text(`🪶 Число земли`, 'purpose_land').row()
            .text(`🎈 Число неба`, 'purpose_sky').row()
            .text(`🛤️ Предназначение`, 'purpose_dest').row();

        if (fromHistory) {
            keyboard.text('◀️ Назад', 'back_to_matrix_menu');
        } else {
            keyboard.text('🧬 В  меню матрицы', 'matrix_menu');
        }

        return keyboard;
    }


    public static backToPurposeKeyboard(): InlineKeyboard {
        return new InlineKeyboard().text('↩️ Назад', 'delete_message');
    }

    public static programWithBackKeyboard(): InlineKeyboard {
        return new InlineKeyboard()
            .text("🔮 Больше информации тут", "matrix_menu").row()
            .text("↩️ Назад", "delete_message");
    }

    public static detailDestinyKeyboard(): InlineKeyboard {
        return new InlineKeyboard().text('◀️ Назад', 'back_to_mode');
    }

    public static getRelationshipsKeyboard(fromHistory = false): InlineKeyboard {
        const keyboard = new InlineKeyboard()
            .text(`🔢 Идеальный партнёр`, "partner_description").row()
            .text(`🎯 Поведение в отношениях`, "relationships_description").row();

        if (fromHistory) {
            keyboard.text("◀️ Назад", "back_to_matrix_menu");
        } else {
            keyboard.text("🧬 В  меню матрицы", "matrix_menu");
        }

        return keyboard;
    }

    public static getMoneyKeyboard(fromHistory = false): InlineKeyboard {
        const keyboard = new InlineKeyboard()
            .text(`🚫 Препятствия к деньгам`, "money_block_description").row()
            .text(`💼 Призвание в работе`, "work_description").row();

        if (fromHistory) {
            keyboard.text("◀️ Назад", "back_to_matrix_menu");
        } else {
            keyboard.text("🧬 В  меню матрицы", "matrix_menu");
        }

        return keyboard;
    }

    public static getMaterialMeaningKeyboard(hasPremium: boolean): InlineKeyboard {
        const keyboard = new InlineKeyboard();

        const buttons = [
            { label: '🌫️ Атмосфера в паре', callback: 'compat_atmosphere' },
            { label: '🪞 Как пару видят другие', callback: 'appearance_description' },
            { label: '🎯 Цель пары', callback: 'positive_meaning' },
            { label: '📌 Задачи для пары', callback: 'couple_task' },
            { label: '💞 Что обьединяет пару', callback: 'couple_attraction' },
            { label: '💰 Отношение пары к деньгам', callback: 'material_meaning' },
            { label: '💸 Как паре заработать', callback: 'cache' },
            { label: '💸 В чем проблемы с деньгами', callback: 'cache_trouble' },
            { label: '🆕 Новый расчёт', callback: 'new_matrix' },
        ];

        for (const { label, callback } of buttons) {
            const finalLabel = hasPremium ? label : `${label} ⭐`;
            const finalCallback = hasPremium ? callback : 'buy_premium';
            keyboard.text(finalLabel, finalCallback).row();
        }

        keyboard.text('◀️ Назад', 'matrix_history');
        return keyboard;
    }

    public static afterPaymentKeyboard(): InlineKeyboard {
        return new InlineKeyboard()
            .text("🔮 Матрица судьбы", "matrix_menu").row()
            .text("💞 Совместимость", "matrix_compatibility").row()
            .text("🏠 В главное меню", "menu");
    }
}
