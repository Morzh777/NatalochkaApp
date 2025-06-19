import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { DescriptionService } from '../services/description.service';
import { Description } from '../types/types'; // Путь поправь если надо
import destNumberDescription from '../data/JsonData/destNumberDescription.json'; // Путь поправь если надо

const pythagorasDestinyDescriptions = destNumberDescription as Record<string, Description>;

@Controller('description')
export class DescriptionController {
  constructor(private readonly descriptionService: DescriptionService) {}

  @Post()
  getDescription(@Body() body: { key: string; square: Record<string, string> }) {
    const { key, square } = body;

    if (!key || !square) {
      throw new BadRequestException("Missing 'key' or 'square'");
    }

    const description = this.descriptionService.getFormattedDescription(key, square);

    return { description };
  }

  @Get('/destiny/:num')
  getPythagorasDestinyDescription(@Param('num') num: string) {
    const data = pythagorasDestinyDescriptions[num];

    if (!data) {
      throw new NotFoundException('Описание не найдено');
    }

    return { number: num, ...data };
  }
}
