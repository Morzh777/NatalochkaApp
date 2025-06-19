export const MONTHS_MAP: Record<string, string> = {
    "Январь": "01", "Февраль": "02", "Март": "03", "Апрель": "04",
    "Май": "05", "Июнь": "06", "Июль": "07", "Август": "08",
    "Сентябрь": "09", "Октябрь": "10", "Ноябрь": "11", "Декабрь": "12"
};

export function isValidMonth(month: string): boolean {
    return month in MONTHS_MAP;
}

export function isValidDay(day: string): boolean {
    return /^\d{1,2}$/.test(day) && +day >= 1 && +day <= 31;
}

export function isValidYear(year: string): boolean {
    const startYear = 1600
    const y = +year;
    return /^\d{4}$/.test(year) && y >= startYear && y <= new Date().getFullYear();
}
export function isValidUsername(name: string): boolean {
    // Разрешены только буквы, цифры, пробелы и подчёркивание
    const regex = /^[\w\sа-яА-ЯёЁ]{1,20}$/u;
    return regex.test(name.trim());
}
