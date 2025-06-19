import { parse, format, isValid } from "date-fns";

/**
 * Приводит дату из формата "DD.MM.YYYY" или ISO к формату "YYYY-MM-DD" (для БД).
 */
export function formatDateForDB(dateStr: string): string {
    // Если уже в ISO — возвращаем как есть
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

    const parsed = parse(dateStr, "dd.MM.yyyy", new Date());
    if (!isValid(parsed)) throw new Error(`Невалидная дата: ${dateStr}`);

    return format(parsed, "yyyy-MM-dd");
}

/**
 * Приводит дату из ISO ("YYYY-MM-DD") к пользовательскому виду "DD.MM.YYYY"
 */
export function formatDateForDisplay(isoDateStr: string): string {
    const parsed = parse(isoDateStr, "yyyy-MM-dd", new Date());
    if (!isValid(parsed)) return isoDateStr;

    return format(parsed, "dd.MM.yyyy");
}
