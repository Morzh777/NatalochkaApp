export type DestinyNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface CompatibilityResult {
  percentage: number;
  description: string;
}

export interface Description {
  title: string;
  description: string;
}

export type ProgramFromFile = {
  key: string;
  position: 'обычная' | 'кармическая';
  description: string;
};
