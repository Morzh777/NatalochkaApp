import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

import { DB_API } from '../config/routes';

interface CalculationFromDB {
  square: Record<string, number>;
  file_id: string;
}

interface MatrixFromDB {
  matrix: Record<string, number>;
  file_id: string;
  programs: { key: string; type: 'обычная' | 'кармическая' }[];
}

@Injectable()
export class DbService {
  async getCalculationFromDB(birthDate: string): Promise<CalculationFromDB | null> {
    try {
      const res: AxiosResponse<CalculationFromDB> = await axios.get(`${DB_API}/calculation`, {
        params: { inputDate: birthDate },
      });

      const { square, file_id } = res.data;

      if (square && file_id) {
        return res.data;
      }

      return null;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  }

  async getMatrixFromDB(birthDate: string): Promise<MatrixFromDB | null> {
    try {
      const res: AxiosResponse<MatrixFromDB> = await axios.get(`${DB_API}/matrix`, {
        params: { inputDate: birthDate },
      });

      const { matrix, file_id, programs } = res.data;

      if (matrix && file_id) {
        return {
          matrix,
          file_id,
          programs: programs ?? [],
        };
      }

      return null;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  }
}
