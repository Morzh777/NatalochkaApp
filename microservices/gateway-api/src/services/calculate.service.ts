import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

import { CALC_API } from '../config/routes';

interface SquareCalculationResponse {
  square: Record<string, number>;
  image: string;
  id: number;
}

interface MatrixCalculationResponse {
  matrix: Record<string, number>;
  image: string;
  programs?: { key: string; type: 'обычная' | 'кармическая' }[];
}

@Injectable()
export class CalculateService {
  async getCalculationFromAPI(birthDate: string): Promise<SquareCalculationResponse> {
    const res: AxiosResponse<SquareCalculationResponse> = await axios.post(
      `${CALC_API}/calculate-json`,
      { birthDate },
    );

    const { square, image, id } = res.data;

    if (!square || !image) {
      throw new Error('Некорректный ответ от calculate-api');
    }

    return { square, image, id };
  }

  async getMatrixFromAPI(birthDate: string): Promise<MatrixCalculationResponse> {
    const res: AxiosResponse<MatrixCalculationResponse> = await axios.post(
      `${CALC_API}/calculate-matrix`,
      { birthDate },
    );

    const { matrix, image, programs } = res.data;

    if (!matrix || !image) {
      throw new Error('Некорректный ответ от numerology-api');
    }

    return { matrix, image, programs };
  }
}
