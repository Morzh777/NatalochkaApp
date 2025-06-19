import { Injectable } from '@nestjs/common';

import { compatibilityMap } from '../data/compatibility-map';
import { CompatibilityResult, DestinyNumber } from '../types/types';

const flatMap: Map<string, CompatibilityResult> = new Map();

// ⚡ Создаём быстрый доступ по ключу 'min|max'
Object.entries(compatibilityMap).forEach(([a, sub]) => {
  Object.entries(sub).forEach(([b, result]) => {
    const min = Math.min(+a, +b);
    const max = Math.max(+a, +b);
    const key = `${min}|${max}`;
    flatMap.set(key, result);
  });
});

@Injectable()
export class CompatibilityService {
  getCompatibility(a: DestinyNumber, b: DestinyNumber): CompatibilityResult {
    const key = `${Math.min(a, b)}|${Math.max(a, b)}`;
    const result = flatMap.get(key);

    if (!result) {
      console.warn(`🛑 Совместимость для пар [${a}, ${b}] не найдена`);
    }

    return (
      result ?? {
        percentage: 0,
        description: 'Нет данных о совместимости.',
      }
    );
  }

  getBatchCompatibility(
    batch: Array<{ a: DestinyNumber; b: DestinyNumber }>,
  ): CompatibilityResult[] {
    return batch.map(({ a, b }) => this.getCompatibility(a, b));
  }
}
