# ===== 1. СТАДИЯ СБОРКИ =====
FROM node:20 AS builder

WORKDIR /app

# Копируем зависимости
COPY package*.json ./
RUN npm ci

# Копируем исходники
COPY . .

# Сборка проекта
RUN npm run build


# ===== 2. СТАДИЯ ПРОДАКШЕН =====
FROM node:20-slim

WORKDIR /app

# Только нужные артефакты
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Запуск
CMD ["node", "dist/main.js"]
