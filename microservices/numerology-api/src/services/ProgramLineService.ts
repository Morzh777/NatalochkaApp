// 📌 Определяем линии программ (по 3 символа)
import { calculateMatrix } from "./numerology.service";

export const programLines: string[][] = [
    // Стандартные линии
    ["A", "AAD", "AD"],
    ["E", "EED", "ED"],
    ["B", "BBD", "BD"],
    ["Zh", "ZhZhD", "ZhD"],
    ["V", "VVD", "VD"],
    ["I", "IID", "ID"],
    ["G", "GGD", "GD"],
    ["Z", "ZZD", "ZD"],

    // Дополнительные оси (эмоциональные/энергетические)
    ["G", "H", "M"],
    ["M", "O", "MVD"],

    // Предназначения
    ["SKY_NUM", "LAND_NUM", "DEST_NUM"],         // Поиск себя
    ["MAN_NUM", "WOMAN_NUM", "SOCIAL_NUM"],      // Социализация

    ["Н","M","M"] // программа Свободных отношений
];

// Типы
export type MatrixData = ReturnType<typeof calculateMatrix>;
export type ProgramKey = `${number}-${number}-${number}`;
type ProgramItem = {
    key: ProgramKey;
    type: "обычная" | "кармическая";
    title: string;
};
/**
 * Находит совпадающие программы среди всех линий, включая обратные.
 */
export function findAllValidPrograms(
    matrix: MatrixData,
    programLines: string[][],
    keyMap: Record<ProgramKey, ProgramItem[]>
): ProgramItem[] {
    const found: ProgramItem[] = [];
    let karmicAlreadyAdded = false;

    for (const line of programLines) {
        if (line.length !== 3) continue;

        const [aKey, bKey, cKey] = line;
        const a = matrix[aKey as keyof MatrixData];
        const b = matrix[bKey as keyof MatrixData];
        const c = matrix[cKey as keyof MatrixData];

        if (a == null || b == null || c == null) continue;

        const direct = `${a}-${b}-${c}` as ProgramKey;
        const reverse = `${c}-${b}-${a}` as ProgramKey;
        const key = keyMap[direct] ? direct : keyMap[reverse] ? reverse : null;
        if (!key) continue;

        const variants = keyMap[key];
        if (!variants || !variants.length) continue;

        const karmic = variants.find(v => v.type === "кармическая");
        const regular = variants.find(v => v.type === "обычная");

        const isGLine =
            (aKey === "G" && bKey === "GGD" && cKey === "GD") ||
            (aKey === "GD" && bKey === "GGD" && cKey === "G");

        const validKarmic = karmic && isGLine && isKarmicProgram(key, matrix);

        const final = validKarmic && !karmicAlreadyAdded
            ? karmic
            : regular;

        if (final) {
            const exists = found.some(p => p.key === final.key && p.type === final.type);
            if (!exists) {
                if (final.type === "кармическая") karmicAlreadyAdded = true;
                found.push(final);
            }
        }
    }

    return found;
}


/**
 * Проверяет, является ли данный ключ программой по кармической оси G → GGD → GD
 */
export function isKarmicProgram(key: string, matrix: MatrixData): boolean {
    const [a, b, c] = key.split("-").map(Number);
    const G = matrix["G"];
    const GGD = matrix["GGD"];
    const GD = matrix["GD"];

    if (G == null || GGD == null || GD == null) return false;

    return (
        (a === G && b === GGD && c === GD) ||
        (a === GD && b === GGD && c === G)
    );
}


