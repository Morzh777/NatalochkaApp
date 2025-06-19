export interface CompatibilityEntry {
    name: string;
    inputDate: string;
    calculationId: number;
    destiny: number;
}

export interface CompatibilityResult {
    name: string;
    inputDate: string;
    destiny: number;
    percentage: number;
    description?: string;
}

export interface ComparisonsItem {
    calculationId: string;
    name: string;
    inputDate: string;
    destiny: number;
    percentage: number;
    description?: string;
}

