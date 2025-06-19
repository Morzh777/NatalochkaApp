import { Flow } from "./Flow.js";
import { ComparisonsItem } from "./Compatibility.js";
import {ProgramItem} from "./ProgramItem.js";

export interface Square {
  [key: string]: string;
}

export interface TemplateButton {
    text: string;
    url?: string;
    callback_data?: string;
}

export interface TemplateData {
    title?: string;
    content?: string;
    buttons?: TemplateButton[];
}

export type SessionData = {
  activeMatrix?: { name: string; birthDate: string; matrixId: string };
  tempMessageId?: number;
  historyCache?: Record<number, { name: string; inputDate: string }[]>;
  historyTotalCount: number;
  flow?: Flow;
  botMessageId?: number;
  lastDescriptionMessageId?: number;
  state?: string;
  day?: string;
  month?: string;
  year?: string;
  name?: string;
  square?: Record<string, string>;
  messageIds: number[];
  openedFromHistory?: boolean;
  userDestiny?: number;
  compatibilityItemMessageId?: number;
  compatibilityTotalCount?: number;
  compatibilityList?: Record<number, ComparisonsItem[]>;
  compatibilityPage?: number;
  hasPremium?: boolean;
  /** 🔮 Матрица судьбы и программы */
  matrix?: Record<string, number>;
  matrixImage?: string;
  matchedPrograms?: ProgramItem[];
  karmicPrograms?: ProgramItem[];

  /** 🧬 Поля для нового расчёта матрицы судьбы */
  birthDate?: string;       // формат: "DD.MM.YYYY"
  username?: string;
  programs?: any[];

  /** 👤 Профиль пользователя */
  profile?: {
    name: string;
    birthDate: string;
  };
  cachedUser?: {
    id: number;
    name: string | null;
    main_calculation_id: number;
  };

  cachedMainCalculation?: {
    id: number;
    square: Square;
    file_id: string;
    input_date: string;
  };

  templateData?: TemplateData;
};
