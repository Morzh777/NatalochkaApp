# ===== 1. СТАДИЯ СБОРКИ =====
FROM node:20 AS builder

# Создаём директорию внутри контейнера
WORKDIR /app

# Копируем только package.json и package-lock.json
COPY package*.json ./

# Устанавливаем все зависимости (включая dev) на стадии сборки
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем проект
RUN npm run build


# ===== 2. ПРОДАКШЕН СТАДИЯ =====
FROM node:20-slim

# Создаём директорию внутри контейнера
WORKDIR /app

# Копируем только dist и node_modules из предыдущей стадии
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Указываем команду по умолчанию
CMD ["node", "dist/main.js"]
