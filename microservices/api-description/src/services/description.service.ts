import { Injectable } from '@nestjs/common';

import { descriptions } from '../data/descriptions';

@Injectable()
export class DescriptionService {
  private readonly categories: Record<string, string> = {
    '1': 'Характер',
    '2': 'Энергия',
    '3': 'Интерес',
    '4': 'Здоровье',
    '5': 'Логика',
    '6': 'Трудолюбие',
    '7': 'Удача',
    '8': 'Забота',
    '9': 'Память',
    '10': 'Цель',
    '11': 'Семья',
    '12': 'Стабильность',
    '13': 'Самооценка',
    '14': 'Финансы',
    '15': 'Талант',
    '16': 'Сексуальность',
    '17': 'Духовность',
  };

  private readonly icons: Record<string, string> = {
    Характер: '🧠',
    Энергия: '⚡️',
    Интерес: '🎯',
    Здоровье: '🩺',
    Логика: '🧠',
    Трудолюбие: '⚙️',
    Удача: '🍀',
    Забота: '💗',
    Память: '🧠',
    Цель: '🎯',
    Семья: '🏡',
    Стабильность: '🧱',
    Самооценка: '📈',
    Финансы: '💰',
    Талант: '🎭',
    Сексуальность: '🔥',
    Духовность: '🕊️',
  };

  public getFormattedDescription(key: string, square: Record<string, string>): string {
    const category = this.categories[key] || 'Неизвестная категория';
    const value = square[key] || '-';
    const categoryDescriptions = descriptions[category];
    const icon = this.icons[category] || '🔸';

    if (!categoryDescriptions) {
      return `<b>${icon} ${category} (${value})</b>\nОписание не найдено.`;
    }

    let descriptionText = categoryDescriptions[value];

    if (!descriptionText) {
      // Числовая логика поиска ближайшего значения
      const valueNum = Number(value);
      const availableNums = Object.keys(categoryDescriptions)
        .map(Number)
        .sort((a, b) => a - b);

      if (!isNaN(valueNum)) {
        let closest = null;
        for (const n of availableNums) {
          if (n <= valueNum) {
            closest = n;
          }
        }
        if (closest !== null) {
          descriptionText = categoryDescriptions[String(closest)];
        }
      }
    }

    if (!descriptionText) {
      descriptionText = 'Описание не найдено.';
    }

    return `<b>${icon} ${category} (${value})</b>\n${descriptionText}`;
  }
}
