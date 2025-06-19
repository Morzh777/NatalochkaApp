// 📁 src/config/routes.ts

export const DB_API = 'http://db-api:3003/api';
export const DESCRIPTION_API = 'http://description-api:3002/api';
export const CALC_API = 'http://nginx/api';

export const Routes = {
  // 🧬 Матрицы
  matrixPost: () => `${DB_API}/matrix`,
  matrixGet: () => `${DB_API}/matrix`,
  saveMatrixHistory: () => `${DB_API}/matrix_history`,
  matrixHistoryPaginated: () => `${DB_API}/matrix_history/paginated`, // ✅ исправил

  // 💳 Подписка
  premiumAccess: (userId: string) => `${DB_API}/premium/${userId}`,
  premiumRedeem: (userId: string) => `${DB_API}/premium/${userId}/redeem`,

  // 🧭 Описания
  descriptionProgram: (key: string, type?: string) =>
    `${DESCRIPTION_API}/description/program/${key}${type ? `?type=${type}` : ''}`,
  descriptionLand: (num: string) => `${DESCRIPTION_API}/description/land/${num}`,
  descriptionSky: (num: string) => `${DESCRIPTION_API}/description/sky/${num}`,
  descriptionDest: (num: string) => `${DESCRIPTION_API}/description/dest/${num}`,
  descriptionPartner: (num: string) => `${DESCRIPTION_API}/description/partner/${num}`,
  descriptionRelation: (num: string) => `${DESCRIPTION_API}/description/relation/${num}`,
  descriptionMoney: (num: string) => `${DESCRIPTION_API}/description/money/${num}`,
  descriptionWork: (num: string) => `${DESCRIPTION_API}/description/work/${num}`,
  descriptionAtmCouple: (num: string) => `${DESCRIPTION_API}/description/atmCouple/${num}`,
  appearance: (num: string) => `${DESCRIPTION_API}/description/appearance/${num}`,
  positiveMeaning: (num: string) => `${DESCRIPTION_API}/description/positiveMeaning/${num}`,
  materialMeaning: (num: string) => `${DESCRIPTION_API}/description/materialMeaning/${num}`,
  coupleTask: (num: string) => `${DESCRIPTION_API}/description/coupleTask/${num}`,
  attraction: (num: string) => `${DESCRIPTION_API}/description/attraction/${num}`,
  cache: (num: string) => `${DESCRIPTION_API}/description/cache/${num}`,
  cacheTrouble: (num: string) => `${DESCRIPTION_API}/description/cacheTrouble/${num}`,

  // 🔢 Квадрат Пифагора
  destinyNumberDescription: (number: string) => `${DESCRIPTION_API}/description/destiny/${number}`,

  // 📚 История расчётов и совместимости
  userHistoryPaginated: (userId: string) => `${DB_API}/users/${userId}/history/paginated`,
  userCompatibilityHistory: (userId: string) => `${DB_API}/users/${userId}/compatibility`,

  // 💞 Пакетная совместимость (batch)
  batchCompatibility: () => `${DESCRIPTION_API}/compatibility/batch`,

  // 👥 Пользователи
  activeUsers: () => `${DB_API}/users/active`,
};
