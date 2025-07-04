
export function getMatrixCaption(name?: string | undefined, inputDate?: string): string {
    return`
🧍Имя: ${name}
📅 День рождения: ${inputDate}
Квадрат Пифагора:
Каждое число в квадрате — не случайность. Это <b>энергии</b>, которые формируют характер, сильные и слабые стороны, таланты и задачи.
• <b>Основные черты</b> — как проявляется личность
• <b>Дополнительные аспекты</b> — потенциал, таланты, энергия

👇 Узнать подробности:

`.trim();
}

export function getMatrixHistoryCaption(name: string, birthDate: string): string {
    return (
        `🧍Имя: ${name}\n 📅 День рождения: ${birthDate}\n\n`+
        `🖼️На изображении — матрица судьбы:\n` +
        `• Каждый сектор — это энергия, влияющая на разные сферы жизни.\n` +
        `• Комбинации чисел — скрытые программы, формирующие путь.\n` +
        `• Есть как сильные стороны, так и зоны роста.\n\n` +
        `👇 Узнать подробности:`
    );
}

export function getProgramOverviewCaption(name: string, birthDate: string): string {
    return `
🧍Имя: ${name}
📅 День рождения: ${birthDate}

🧩 <b>Программы</b> — это коды судьбы, зашифрованные в дате рождения.

🔹 <b>Обычные программы</b> — природные черты и ресурсы  
🔸 <b>Кармические программы</b> — задачи и уроки для роста

📌 В некоторых случаях программы могут отсутствовать. Это не ошибка — такой человек чаще всего живёт проще, с меньшим внутренним напряжением. Ему важно учиться наблюдать за собой и идти по жизни интуитивно.

👇 Узнать подробности:
`.trim();
}

export function getDestinyTrioCaption(name: string, birthDate: string): string {
    return `
🧍Имя: ${name}
📅 День рождения: ${birthDate}

🧭Первое предназначение — путь к себе (20–40 лет)
Это стартовая точка. Поиск себя: кто я? на что способен? чего хочу от жизни?
Здесь закладываются базовые качества личности: сила, реакции, внутренняя опора.
Мир будет тестировать: отношениями, болью, самореализацией, потребностью в любви.

🔸 <b>Чило земли</b> — то, на чём держится человек: принципы, сила, уверенность
🔸 <b>Число неба</b> — то, к чему тянет: желания, мечты, драйв 
🔸 Предназначение — это совокупность неба и земли, то, как человек идёт к своему: спокойно, резко, мягко, логично.

👇 Узнать подробности:
  `.trim();
}
export function getRelationshipProfileCaption(name: string, birthDate: string): string {
    return `
🧍Имя: ${name}
📅 День рождения: ${birthDate}

💞 <b>Отношения и ожидания</b>  
Как человек проявляется в паре — и кого на самом деле ищет рядом 

🔹 <b>Поведение в отношениях</b> (точка К)
Показывает, как проявляется человек в паре: заботится, отстраняется, тянет всё на себе и т.д.

🔹 <b>Идеальный партнёр</b> (точка Н)
Показывает, какие качества ищутся в партнёре на уровне ощущений и привычных сценариев.

В описании — два состояния:
➕ если энергия проявляется в положительном ключе
➖ если узнал себя в минусе — значит с этим нужно работать

👇 Узнать подробности:
  `.trim();
}

export function getMoneyProfileCaption(name: string, birthDate: string): string {
    return `
🧍Имя: ${name}
📅 День рождения: ${birthDate}

💸 <b>Деньги и реализация</b>
Как энергия проявляется в работе — и почему деньги могут тормозиться 💼  
Здесь — личный портрет денежного потока:

🔹 <b>Поведение в социуме</b> (точка «Л»)
Показывает, что может тормозить доход: суета, борьба, усталость, внутренние запреты.  

🔹 <b>Призвание в работе</b> (точка «О»)
Показывает, в каком формате энергия работает на максимум: где кайф, драйв и стиль действий.

👇 Узнать подробности:
  `.trim();
}


export function getCompatibilityMatrixCaption(
): string {
    return `
💞 <b>Совместимость по матрице судьбы</b>

Здесь ты можешь сравнить свою матрицу с другими.

📌 Совместимость считается на основе наложения двух матриц судьбы — твоей и выбранного человека.  
Система смотрит, как ваши энергии сочетаются: где поддержка, а где возможны конфликты и уроки.

👇 Узнать подробности:
  `.trim();
}

export function getSquareHistoryCaptionPaginated(): string {
    return `
🧾 <b>История твоих расчётов матрицы Пифагора</b>
Нажми на имя — и я покажу тебе подробности 💫
  `.trim();
}

export function getCompatibilityCaption(targetName: string, targetDate: string): string {
    return `
💞 <b>Твоя совместимость с ${targetName}</b> (${targetDate})

📌 Это анализ сочетания ваших матриц судьбы.  
Показано, где энергии усиливают друг друга, а где могут быть конфликты и точки роста.

👇 Узнать подробности:
`.trim();
}