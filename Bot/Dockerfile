# ===== 1. СТАДИЯ СБОРКИ =====
FROM node:20 AS builder

WORKDIR /app

# Добавляем репозитории и зависимости для сборки canvas
RUN echo "deb http://ftp.de.debian.org/debian bookworm main" > /etc/apt/sources.list && \
    echo "deb http://ftp.de.debian.org/debian-security bookworm-security main" >> /etc/apt/sources.list && \
    apt-get update && apt-get install -y \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    libx11-dev \
    pkg-config \
    build-essential \
    fonts-dejavu-core \
    fontconfig \
    fonts-liberation \
 && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

# Явно копируем изображения ДО npm run build
COPY ./src/style/img ./style/img
COPY . .

RUN npm run build

# ===== 2. СТАДИЯ ПРОДАКШЕН =====
FROM node:20-slim

WORKDIR /app

# Устанавливаем только runtime зависимости для canvas
RUN echo "deb http://ftp.de.debian.org/debian bookworm main" > /etc/apt/sources.list && \
    echo "deb http://ftp.de.debian.org/debian-security bookworm-security main" >> /etc/apt/sources.list && \
    apt-get update && apt-get install -y \
    libcairo2 \
    libjpeg62-turbo \
    libpango-1.0-0 \
    libgif7 \
    libx11-6 \
    fonts-dejavu-core \
    fontconfig \
    fonts-liberation \
 && rm -rf /var/lib/apt/lists/*

RUN fc-cache -f -v

# 👇 добавляем изображения
COPY --from=builder /app/style/img ./style/img

# 👇 копируем нужные артефакты
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# 🚀 запуск
CMD ["node", "dist/index.js"]
