import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';

import programs from '../data/JsonData/programs.json';
import { ProgramFromFile } from '../types/types';

@Controller('description/program')
export class ProgramController {
  @Get(':key')
  getProgramDescription(@Param('key') key: string, @Query('type') type: string) {
    if (!key || !type || (type !== 'обычная' && type !== 'кармическая')) {
      throw new BadRequestException(
        'key и type обязательны. type должен быть "обычная" или "кармическая".',
      );
    }

    const data = programs as ProgramFromFile[];

    const program = data.find((p) => p.key === key && p.position === type);

    if (!program) {
      throw new NotFoundException('Описание не найдено');
    }

    return {
      key: program.key,
      type: program.position,
      description: program.description,
    };
  }
}
