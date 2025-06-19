// src/gateway/gateway.types.ts

export interface CalculateResponse {
  square: Record<string, number>;
  file_id?: string;
  image?: string;
  from: 'db' | 'calc';
}

export interface MatrixDestinyResponse {
  matrix: Record<string, number>;
  file_id?: string;
  image?: string;
  programs: { key: string; type: 'обычная' | 'кармическая' }[];
  from: 'db' | 'calc';
}
