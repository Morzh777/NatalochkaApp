import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';

import { CompatibilityService } from '../services/compatibility.service';
import { DestinyNumber } from '../types/types';

@Controller('compatibility')
export class CompatibilityController {
  constructor(private readonly compatibilityService: CompatibilityService) {}

  @Get()
  getCompatibility(@Query('a') a: string, @Query('b') b: string) {
    const aNumber = Number(a);
    const bNumber = Number(b);

    const isValidDestiny = (n: number): n is DestinyNumber =>
      Number.isInteger(n) && n >= 1 && n <= 9;

    if (!isValidDestiny(aNumber) || !isValidDestiny(bNumber)) {
      throw new BadRequestException('Числа судьбы должны быть целыми числами от 1 до 9.');
    }

    return this.compatibilityService.getCompatibility(aNumber, bNumber);
  }

  @Post('batch')
  getBatchCompatibility(@Body() body: { batch: Array<{ a: number; b: number }> }) {
    if (!Array.isArray(body.batch) || body.batch.length === 0) {
      throw new BadRequestException('Некорректный формат запроса.');
    }

    const isValidDestiny = (n: number): n is DestinyNumber =>
      Number.isInteger(n) && n >= 1 && n <= 9;

    const batch: Array<{ a: DestinyNumber; b: DestinyNumber }> = [];

    for (const { a, b } of body.batch) {
      if (!isValidDestiny(a) || !isValidDestiny(b)) {
        throw new BadRequestException('Каждое число должно быть от 1 до 9.');
      }
      batch.push({ a, b });
    }

    return this.compatibilityService.getBatchCompatibility(batch);
  }
}
