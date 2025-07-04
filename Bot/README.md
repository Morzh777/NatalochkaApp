# Natalka Telegram Bot

Телеграм-бот для работы с матрицами судьбы, профилями, совместимостью и оплатой. Проект написан на TypeScript с использованием фреймворка [grammY](https://grammy.dev/).

## Основные возможности

- Расчёт и визуализация матрицы судьбы
- Проверка совместимости пар
- Работа с профилями пользователей
- История расчетов
- Оплата и премиум-доступ
- Интеграция с внешними микросервисами (описания, совместимость,рассчеты, оплата)
- Логирование действий пользователей

## Технологический стек

- **Node.js 20+** — серверная платформа
- **TypeScript** — типизированный JavaScript
- **grammY** — Telegram Bot API фреймворк
- **Express** — веб-фреймворк для webhook и интеграций
- **canvas** — генерация и обработка изображений
- **Docker** — контейнеризация и деплой
- **dotenv** — управление переменными окружения
- **cpx** — копирование ассетов при сборке

## Структура проекта

- `src/bot/commands/` — команды бота (start, profile, compatibility, history и др.)
- `src/bot/handlers/` — обработчики событий и команд
- `src/services/` — бизнес-логика (расчёты, работа с пользователями, платежи и др.)
- `src/utils/` — вспомогательные утилиты (логирование, клавиатуры, трекинг кликов)
- `src/style/img/` — изображения для меню и интерфейса
- `file_ids.json` — идентификаторы файлов Telegram для кэширования изображений

## Быстрый старт (локально)

1. **Установите Node.js 20+ и npm**
2. **Установите зависимости:**
   ```bash
   npm ci
   ```
3. **Создайте файл `.env` с настройками (см. ниже)**
4. **Запустите в режиме разработки:**
   ```bash
   npm run dev
   ```
5. **Для продакшена:**
   ```bash
   npm run start:prod
   ```

## Переменные окружения

Создайте файл `.env` в папке `Bot` и укажите необходимые переменные, например:
```
BOT_TOKEN=ваш_токен_бота

```

## Сборка и запуск в Docker

1. Соберите и запустите контейнер:
   ```bash
   docker build -t natalka-bot .
   docker run --env-file .env natalka-bot
   ```
   Или используйте `docker-compose` (см. пример в корне репозитория).

2. Dockerfile включает все необходимые зависимости для работы библиотеки `canvas` (отрисовка изображений).

## Зависимости

### Основные

- `grammy` — основной Telegram Bot API фреймворк
- `@grammyjs/conversations` — поддержка диалогов
- `@grammyjs/storage-cloudflare` — облачное хранилище (опционально)
- `axios` — HTTP-клиент для запросов к микросервисам
- `canvas` — генерация изображений (требует системные библиотеки, см. Dockerfile)
- `express`, `cors` — для запуска веб-сервера (например, webhook)
- `dotenv` — работа с переменными окружения
- `sqlite`, `sqlite3` — база данных SQLite
- `qrcode` — генерация QR-кодов

### Для разработки

- `typescript`, `ts-node`, `tsx` — поддержка TypeScript
- `nodemon` — автоперезапуск при изменениях
- `rimraf`, `cpx` — утилиты для сборки и копирования ассетов
- `@types/*` — типы для TypeScript

### Системные требования

Для работы библиотеки `canvas` необходимы следующие пакеты (устанавливаются в Dockerfile):

- libcairo2, libjpeg, libpango, libgif, libx11, fonts-dejavu-core, fontconfig, fonts-liberation

На Windows для локальной разработки потребуется установить [windows-build-tools](https://www.npmjs.com/package/windows-build-tools) и зависимости для canvas.

## Скрипты npm

- `npm run dev` — запуск в режиме разработки
- `npm run build` — сборка проекта
- `npm start` — сборка и запуск
- `npm run start:prod` — сборка и запуск (production)
- `npm run pm2` — запуск через pm2
- `npm run copy-assets` — копирование ассетов (изображений)

## Контакты

by Morzh
@: kla_atu@mail.ru

---

### Требования к окружению

- Node.js 20+
- npm 9+
- Docker (для контейнеризации)
- Для production: Linux-based окружение (или WSL2 для Windows)
- Для локальной разработки на Windows: Python 3.x, Visual Studio Build Tools (для сборки canvas) 