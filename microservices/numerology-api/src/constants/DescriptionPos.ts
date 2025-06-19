import {MatrixResult} from "../types/descriptions";

export interface DescriptionPos {
    label: string;
    key: string;
    row: number;
    col: number;
}

export const positions: DescriptionPos[] = [
    { label: "Характер", key: "1", row: 0, col: 0 },
    { label: "Здоровье", key: "4", row: 0, col: 1 },
    { label: "Удача", key: "7", row: 0, col: 2 },
    { label: "Цель", key: "10", row: 0, col: 3 },

    { label: "Энергия", key: "2", row: 1, col: 0 },
    { label: "Логика", key: "5", row: 1, col: 1 },
    { label: "Забота", key: "8", row: 1, col: 2 },
    { label: "Семья", key: "11", row: 1, col: 3 },

    { label: "Интерес", key: "3", row: 2, col: 0 },
    { label: "Трудолюбие", key: "6", row: 2, col: 1 },
    { label: "Память", key: "9", row: 2, col: 2 },
    { label: "Стабильность", key: "12", row: 2, col: 3 },

    { label: "Самооценка", key: "13", row: 3, col: 0 },
    { label: "Финансы", key: "14", row: 3, col: 1 },
    { label: "Талант", key: "15", row: 3, col: 2 },
    { label: "Сексуальность", key: "16", row: 3, col: 3 },
    // { label: "Духовность", key: "17", row: 4, col: 3 }
];

export interface MatrixPos {
    key: keyof MatrixResult;
    x: number;
    y: number;
}

export const matrixPositions: MatrixPos[] = [
    { key: "A", x: 120, y: 540 },
    { key: "B", x: 542, y: 120 },
    { key: "V", x: 955, y: 540 },
    { key: "G", x: 539, y: 960 },
    { key: "D", x: 542, y: 540 },
    { key: "E", x: 248, y: 248 },
    { key: "Zh", x: 830, y: 245 },
    { key: "Z", x: 249, y: 835 },
    { key: "I", x: 835, y: 834 },

    { key: "BD", x: 540, y: 260 },
    { key: "ED", x: 343, y: 343 },
    { key: "AD", x: 262, y: 540 },
    { key: "ZD", x: 345, y: 735 },
    { key: "GD", x: 540, y: 820 },
    { key: "ID", x: 740, y: 735 },
    { key: "VD", x: 820, y: 540 },
    { key: "ZhD", x: 740, y: 345 },

    { key: "BBD", x: 543, y: 203 },
    { key: "EED", x: 303, y: 303 },
    { key: "AAD", x: 198, y: 540 },
    { key: "ZZD", x: 305, y: 775 },
    { key: "GGD", x: 540, y: 885 },
    { key: "IID", x: 780, y: 780 },
    { key: "VVD", x: 880, y: 540 },
    { key: "ZhZhD", x: 780, y: 303 },
    // Линия благополучия
    { key: "M", x: 684, y: 678 },
    { key: "O", x: 733, y: 627 },
    { key: "H", x: 631, y: 725 },
    // Зелененькие кружочки
    { key: "ONE", x: 405, y: 539 },
    { key: "TWO", x: 541, y: 405 },
];
