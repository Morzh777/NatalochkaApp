import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { GatewayService } from './gateway.service';
import { CalculateResponse, MatrixDestinyResponse } from './gateway.types';

@ApiTags('Gateway API')
@Controller('api')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Расчёт квадрата Пифагора' })
  calculate(@Body('birthDate') birthDate: string): Promise<CalculateResponse> {
    return this.gatewayService.proxyCalculate(birthDate);
  }

  @Post('matrix/destiny')
  @ApiOperation({ summary: 'Расчёт матрицы судьбы' })
  calculateDestinyMatrix(@Body('birthDate') birthDate: string): Promise<MatrixDestinyResponse> {
    return this.gatewayService.proxyMatrixDestiny(birthDate);
  }

  @Post('matrix')
  @ApiOperation({ summary: 'Создание матрицы судьбы' })
  createMatrix(@Body() body: Record<string, unknown>): Promise<unknown> {
    return this.gatewayService.proxyCreateMatrix(body);
  }

  @Get('matrix')
  @ApiOperation({ summary: 'Получение матрицы судьбы по дате рождения' })
  getMatrix(@Query('inputDate') inputDate: string): Promise<unknown> {
    return this.gatewayService.proxyGetMatrix(inputDate);
  }

  @Post('matrix_history')
  @ApiOperation({ summary: 'Сохранение матрицы судьбы в историю' })
  saveMatrixHistory(@Body() body: Record<string, unknown>): Promise<unknown> {
    return this.gatewayService.proxySaveMatrixHistory(body);
  }

  @Get('history/paginated')
  @ApiOperation({ summary: 'Получение истории расчётов пользователя (пагинация)' })
  getUserHistory(
    @Query('userId') userId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<unknown> {
    return this.gatewayService.proxyUserHistory(userId, page, pageSize);
  }

  @Get('compatibility/history')
  @ApiOperation({ summary: 'Получение истории совместимости пользователя (пагинация)' })
  getCompatibilityHistory(
    @Query('userId') userId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<unknown> {
    return this.gatewayService.proxyCompatibilityHistory(userId, page, pageSize);
  }

  @Get('matrix_history/paginated')
  @ApiOperation({ summary: 'Получение истории матриц судьбы пользователя (пагинация)' })
  getMatrixHistory(
    @Query('userId') userId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<unknown> {
    return this.gatewayService.proxyMatrixHistory(userId, page, pageSize);
  }

  @Get('premium/:userId')
  getPremiumAccess(
    @Param('userId') userId: string,
    @Query() query: Record<string, string>,
  ): Promise<unknown> {
    return this.gatewayService.proxyPremiumAccess(userId, query);
  }

  @Post('premium/:userId/redeem')
  redeemPremiumCode(
    @Param('userId') userId: string,
    @Body('code') code: string,
  ): Promise<unknown> {
    return this.gatewayService.proxyRedeemPremium(userId, code);
  }

  @Get('description/program/:key')
  @ApiOperation({ summary: 'Получение описания программы судьбы' })
  getProgramDescription(@Param('key') key: string, @Query('type') type?: string): Promise<unknown> {
    return this.gatewayService.proxyProgramDescription(key, type);
  }

  // ✅ Универсальный эндпоинт для всех описаний по типу
  @Get('description/:type/:num')
  @ApiOperation({ summary: 'Получение описания по типу и числу' })
  getGenericDescription(@Param('type') type: string, @Param('num') num: string): Promise<unknown> {
    return this.gatewayService.proxyGenericDescription(type, num);
  }

  @Post('compatibility/batch')
  @ApiOperation({ summary: 'Получение совместимости для списка пар' })
  getBatchCompatibility(
    @Body() body: { batch: Array<{ a: number; b: number }> },
  ): Promise<unknown> {
    return this.gatewayService.proxyBatchCompatibility(body);
  }

  @Get('users/active')
  @ApiOperation({ summary: 'Получение списка активных пользователей' })
  getActiveUsers(): Promise<unknown> {
    return this.gatewayService.proxyGetActiveUsers();
  }
}
