<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
</p>

<h1 align="center">Наталочка — Description API</h1>
<p align="center">
  Лёгкий, быстрый и масштабируемый микросервис для обработки нумерологических описаний. Построено на <a href="https://nestjs.com/" target="_blank">NestJS</a> и <a href="https://nodejs.org/" target="_blank">Node.js</a>.
</p>

<p align="center">
  <a href="https://nodejs.org/" target="_blank"><img src="https://img.shields.io/badge/Node.js-20.x-brightgreen" alt="Node.js Version" /></a>
  <a href="https://nestjs.com/" target="_blank"><img src="https://img.shields.io/badge/NestJS-11.x-red" alt="NestJS Version" /></a>
  <a href="https://www.npmjs.com/" target="_blank"><img src="https://img.shields.io/npm/l/express" alt="License" /></a>
</p>

---

## 📚 Описание проекта

**Наталочка Description API** — это специализированный микросервис для обработки текстовых данных:
- Описания чисел квадрата Пифагора.
- Расшифровки программ судьбы.
- Описания совместимости по числам судьбы.
- Интерпретаций земных и небесных кодов.

Проект:
- Принимает REST-запросы от клиента или других микросервисов.
- Возвращает текстовые описания, связанные с нумерологией.
- Минимизирует нагрузку на Telegram-бота и основной Gateway.
- Легко масштабируется и поддерживает расширение базы описаний.

**Стек технологий:**  
NestJS + Fastify + TypeScript + ESLint + Prettier

---

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск проекта в режиме разработки
npm run start:dev

# Сборка проекта
npm run build

# Запуск собранного продакшн-приложения
npm run start:prod
