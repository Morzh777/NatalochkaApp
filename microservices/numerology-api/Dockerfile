# ===== 1. СТАДИЯ СБОРКИ =====
FROM node:20 AS builder

WORKDIR /app

# 🔁 Переписываем источник пакетов
RUN echo "deb http://ftp.de.debian.org/debian bookworm main" > /etc/apt/sources.list && \
    echo "deb http://ftp.de.debian.org/debian-security bookworm-security main" >> /etc/apt/sources.list

# УСТАНАВЛИВАЕМ canvas-зависимости
RUN apt-get update && apt-get install -y \
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

COPY . .
RUN npm run build


# ===== 2. СТАДИЯ ПРОДАКШЕН =====
FROM node:20-slim

WORKDIR /app

# 🔁 Переписываем источник пакетов
RUN echo "deb http://ftp.de.debian.org/debian bookworm main" > /etc/apt/sources.list && \
    echo "deb http://ftp.de.debian.org/debian-security bookworm-security main" >> /etc/apt/sources.list && \
    apt-get update && apt-get install -y \
    libcairo2 \
    libjpeg62-turbo \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgif7 \
    libx11-6 \
    fonts-dejavu-core \
    fontconfig \
    fonts-liberation \
 && rm -rf /var/lib/apt/lists/*

RUN fc-cache -f -v

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

CMD ["node", "dist/index.js"]
