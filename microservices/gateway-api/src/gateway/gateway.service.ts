import { Injectable } from '@nestjs/common';

import { proxyRequest } from '../utils/proxy-request';
import { Routes } from '../config/routes';
import { DbService } from '../services/db.service';
import { CalculateService } from '../services/calculate.service';

import { CalculateResponse, MatrixDestinyResponse } from './gateway.types';

@Injectable()
export class GatewayService {
  constructor(
    private readonly calculateService: CalculateService,
    private readonly dbService: DbService,
  ) {}

  private async request<T = unknown>(
    url: string,
    method: 'GET' | 'POST',
    data?: Record<string, unknown>,
    needsPagination = false,
  ): Promise<T> {
    const finalData = needsPagination
      ? {
          page: (data?.page as number) ?? 0,
          pageSize: (data?.pageSize as number) ?? 5,
          ...data,
        }
      : data;

    return proxyRequest<T>(url, method, finalData);
  }

  // 📌 Расчёт квадрата Пифагора
  async proxyCalculate(birthDate: string): Promise<CalculateResponse> {
    console.log('🔥 [gateway-api] POST /calculate вызван');
    console.log('📆 Получена дата рождения:', birthDate);

    try {
      const result = await this.dbService.getCalculationFromDB(birthDate);
      if (result) {
        console.log('✅ Данные найдены в БД:', result);
        return {
          square: result.square,
          file_id: result.file_id,
          from: 'db',
        };
      }

      console.log('🟡 Не найдено в БД, пробуем API...');
      const resultFromApi = await this.calculateService.getCalculationFromAPI(birthDate);
      console.log('🧠 Получено из API:', resultFromApi);

      return {
        square: resultFromApi.square,
        image: resultFromApi.image,
        from: 'calc',
      };
    } catch (error) {
      console.error('❌ Ошибка в /calculate:', error);
      throw new Error('Ошибка при расчёте квадрата Пифагора');
    }
  }

  // 📌 Расчёт матрицы судьбы
  async proxyMatrixDestiny(birthDate: string): Promise<MatrixDestinyResponse> {
    console.log('🔥 [gateway-api] POST /matrix/destiny вызван');
    console.log('📆 Получена дата рождения:', birthDate);

    try {
      const result = await this.dbService.getMatrixFromDB(birthDate);
      if (result) {
        console.log('✅ Матрица найдена в БД:', result);
        return {
          matrix: result.matrix,
          file_id: result.file_id,
          programs: result.programs,
          from: 'db',
        };
      }

      console.log('🟡 Матрица не найдена в БД, пробуем API...');
      const resultFromApi = await this.calculateService.getMatrixFromAPI(birthDate);
      console.log('🧠 Матрица получена из API:', resultFromApi);

      return {
        matrix: resultFromApi.matrix,
        image: resultFromApi.image,
        programs: resultFromApi.programs ?? [],
        from: 'calc',
      };
    } catch (error) {
      console.error('❌ Ошибка в /matrix/destiny:', error);
      throw new Error('Ошибка при расчёте матрицы судьбы');
    }
  }

  // 🔁 Прокси-методы
  async proxyCreateMatrix(body: Record<string, unknown>): Promise<unknown> {
    return this.request(Routes.matrixPost(), 'POST', body);
  }

  async proxyGetMatrix(inputDate: string): Promise<unknown> {
    return this.request(Routes.matrixGet(), 'GET', { inputDate });
  }

  async proxySaveMatrixHistory(body: Record<string, unknown>): Promise<unknown> {
    return this.request(Routes.saveMatrixHistory(), 'POST', body);
  }

  async proxyUserHistory(userId: string, page?: number, pageSize?: number): Promise<unknown> {
    return this.request(Routes.userHistoryPaginated(userId), 'GET', { page, pageSize }, true);
  }

  async proxyCompatibilityHistory(
    userId: string,
    page?: number,
    pageSize?: number,
  ): Promise<unknown> {
    return this.request(Routes.userCompatibilityHistory(userId), 'GET', { page, pageSize }, true);
  }

  async proxyMatrixHistory(userId: string, page?: number, pageSize?: number): Promise<unknown> {
    return this.request(Routes.matrixHistoryPaginated(), 'GET', { userId, page, pageSize }, true);
  }

  async proxyPremiumAccess(userId: string, query?: Record<string, string>): Promise<unknown> {
    let url = Routes.premiumAccess(userId);
    if (query && Object.keys(query).length) {
      const params = new URLSearchParams(query).toString();
      url += `?${params}`;
    }
    return this.request(url, 'GET');
  }

  async proxyRedeemPremium(userId: string, code: string): Promise<unknown> {
    const url = Routes.premiumRedeem(userId);
    return this.request(url, 'POST', { code: code });
  }

  async proxyProgramDescription(key: string, type?: string): Promise<unknown> {
    return this.request(Routes.descriptionProgram(key, type), 'GET');
  }

  async proxyBatchCompatibility(body: {
    batch: Array<{ a: number; b: number }>;
  }): Promise<unknown> {
    return this.request(Routes.batchCompatibility(), 'POST', body);
  }

  // ✅ Универсальный метод для всех простых описаний по типу
  async proxyGenericDescription(type: string, num: string): Promise<unknown> {
    const routeMap: Record<string, (num: string) => string> = {
      land: Routes.descriptionLand,
      sky: Routes.descriptionSky,
      dest: Routes.descriptionDest,
      partner: Routes.descriptionPartner,
      relation: Routes.descriptionRelation,
      money: Routes.descriptionMoney,
      work: Routes.descriptionWork,
      atmCouple: Routes.descriptionAtmCouple,
      appearance: Routes.appearance,
      positiveMeaning: Routes.positiveMeaning,
      materialMeaning: Routes.materialMeaning,
      coupleTask: Routes.coupleTask,
      attraction: Routes.attraction,
      cache: Routes.cache,
      cacheTrouble: Routes.cacheTrouble,
      destiny: Routes.destinyNumberDescription,
    };

    const routeFn = routeMap[type];
    if (!routeFn) {
      throw new Error(`Неверный тип описания: ${type}`);
    }

    return this.request(routeFn(num), 'GET');
  }

  // 👥 Получение активных пользователей
  async proxyGetActiveUsers(): Promise<unknown> {
    return this.request(Routes.activeUsers(), 'GET');
  }
}
