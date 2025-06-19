import {Request, Response} from "express";
import path from "path";
import {ImageHelper} from "./ImageHelper";
import fs from "fs";

export class NumerologyService {
    public static calculatePythagoreanSquare(birthDate: string): Record<string, string> {
        if (!birthDate) {
            console.error("❌ Ошибка: передана пустая дата рождения!");
            return Object.fromEntries(
                Array.from({length: 17}, (_, i) => [(i + 1).toString(), i < 9 ? "-" : "0"])
            );
        }

        const digits = birthDate.replace(/\D/g, "").split("").map(Number);
        const sumDigits = (num: number): number =>
            num.toString().split("").map(Number).reduce((acc, d) => acc + d, 0);

        const firstWorkingNumber = digits.reduce((sum, num) => sum + num, 0);
        const secondWorkingNumber = sumDigits(firstWorkingNumber);
        const thirdWorkingNumber = firstWorkingNumber - digits[0] * 2;
        const fourthWorkingNumber = sumDigits(thirdWorkingNumber);

        const allNumbers = [
            ...digits,
            firstWorkingNumber,
            secondWorkingNumber,
            thirdWorkingNumber,
            fourthWorkingNumber
        ];
        //Число судьбы
        let destinyNumber = firstWorkingNumber;
        while (destinyNumber >= 10) {
            destinyNumber = destinyNumber
                .toString()
                .split("")
                .map(Number)
                .reduce((a, b) => a + b, 0);
        }
        const groupedNumbers: Record<number, string> = {};
        allNumbers.forEach((num) => {
            num.toString().split("").map(Number).forEach((digit) => {
                if (digit !== 0) {
                    groupedNumbers[digit] = (groupedNumbers[digit] || "") + digit;
                }
            });
        });

        const square: Record<string, string> = {};
        for (let i = 1; i <= 9; i++) {
            square[i.toString()] = groupedNumbers[i] || "-";
        }

        const count = (val: string) => (val === "-" ? 0 : val.length);

        square["10"] = (count(square["1"]) + count(square["4"]) + count(square["7"])).toString();
        square["11"] = (count(square["2"]) + count(square["5"]) + count(square["8"])).toString();
        square["12"] = (count(square["3"]) + count(square["6"]) + count(square["9"])).toString();
        square["13"] = (count(square["1"]) + count(square["2"]) + count(square["3"])).toString();
        square["14"] = (count(square["4"]) + count(square["5"]) + count(square["6"])).toString();
        square["15"] = (count(square["7"]) + count(square["8"]) + count(square["9"])).toString();
        square["16"] = (count(square["3"]) + count(square["5"]) + count(square["7"])).toString();
        square["17"] = (count(square["1"]) + count(square["5"]) + count(square["9"])).toString();
        square["18"] = destinyNumber.toString();
        return square;
    }
}


export function calculateMatrix(date: string) {
    const [day, month, year] = date.split('.').map(Number);
    // Личный Квадрат
    const A = reduceSum(day);               // Сумма цифр дня
    const B = month;                       // Месяц рождения
    const V = reduceSum(year);              // Сумма цифр года
    const G = reduceSum(A + B + V);        // Г = A + B + V
    const D = reduceSum(A + B + V + G);    // Д = A + B + V + Г
    const E = reduceSum(A + B);            // Е = A + D
    const Zh = reduceSum(B + V);           // Ж = E + D
    const Z = reduceSum(A + G);            // З = B + D
    const I = reduceSum(V + G);            // И = V + D

    // Числа Энергий
    const BD = reduceSum(B + D);
    const ED = reduceSum(E + D);
    const AD = reduceSum(A + D);
    const ZD = reduceSum(Z + D);
    const GD = reduceSum(G + D);
    const ID = reduceSum(I + D);
    const VD = reduceSum(V + D);
    const ZhD = reduceSum(Zh + D);
    const BBD = reduceSum(B + BD);
    const EED = reduceSum(E + ED);
    const AAD = reduceSum(A + AD);
    const ZZD = reduceSum(Z + ZD);
    const GGD = reduceSum(G + GD);
    const IID = reduceSum(I + ID);
    const VVD = reduceSum(V + VD);
    const ZhZhD = reduceSum(Zh + ZhD);

    // Благополучие
    const M = reduceSum(GD + VD);
    const O = reduceSum(M + VD);
    const H = reduceSum(M + GD);

    // Зеленые кружочки
    const ONE = reduceSum(D + AD);
    const TWO = reduceSum(D + BD);

    // Первое предназначение Поиск себя
    const SKY_NUM = reduceSum(B + G);
    const LAND_NUM = reduceSum(A + V);
    const DEST_NUM = reduceSum(SKY_NUM + LAND_NUM);

    // Второе предназначение Социализация
    const MAN_NUM = reduceSum(E + I);
    const WOMAN_NUM = reduceSum(Zh + Z);
    const SOCIAL_NUM = reduceSum(MAN_NUM + WOMAN_NUM);

    // Третье предназначение Духовное
    const SPIRIT_NUM = reduceSum(DEST_NUM + SOCIAL_NUM);

    // Четвертое предназначение Планетарное
    const PLANETARY_NUM = reduceSum(SOCIAL_NUM + SPIRIT_NUM);

    return {
        A,
        B,
        V,
        G,
        D,
        E,
        Zh,
        Z,
        I,
        BD,
        ED,
        AD,
        ZD,
        GD,
        ID,
        VD,
        ZhD,
        BBD,
        EED,
        AAD,
        ZZD,
        GGD,
        IID,
        VVD,
        ZhZhD,
        M,
        O,
        H,
        ONE,
        TWO,
        SKY_NUM,
        LAND_NUM,
        DEST_NUM,
        MAN_NUM,
        WOMAN_NUM,
        SOCIAL_NUM,
        SPIRIT_NUM,
        PLANETARY_NUM
    };
}

// Вспомогательные функции
function sumDigits(n: number): number {
    return String(n).split('').reduce((sum, d) => sum + Number(d), 0);
}

function reduceSum(n: number): number {
    while (n > 22) {
        n = sumDigits(n);
    }
    return n;
}
export function calculateCompatibilityMatrix(
    matrixA: Record<string, number>,
    matrixB: Record<string, number>
): Record<string, number> {
    const result: Record<string, number> = {};

    const allKeys = new Set([...Object.keys(matrixA), ...Object.keys(matrixB)]);

    for (const key of allKeys) {
        const a = matrixA[key] ?? 0;
        const b = matrixB[key] ?? 0;
        result[key] = reduceSum(a + b);
    }

    return result;
}
