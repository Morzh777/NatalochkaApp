<!-- Логотип и заголовок -->
<p align="center">
  <img src="https://raw.githubusercontent.com/Morzh777/NatalochkaApp/main/Bot/images/template.png" alt="Natalochka Logo" width="120"/>
</p>

<h1 align="center">Наталочка — Telegram Bot & Микросервисная архитектура</h1>
<p align="center">
  <b>Многоуровневый проект для расчёта, визуализации и анализа матриц судьбы, совместимости, профилей и управления пользователями через Telegram-бота и микросервисы.</b>
</p>

<p align="center">
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-20+-brightgreen" alt="Node.js"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-blue" alt="TypeScript"></a>
  <a href="https://nestjs.com/"><img src="https://img.shields.io/badge/NestJS-11+-red" alt="NestJS"></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-ready-blue" alt="Docker"></a>
  <a href="https://github.com/Morzh777/NatalochkaApp"><img src="https://img.shields.io/github/license/Morzh777/NatalochkaApp" alt="License"></a>
</p>

---

## 🚀 Основные компоненты

<ul>
  <li><b>Bot/</b> — Telegram-бот (TypeScript, grammY), основной интерфейс для пользователей.</li>
  <li><b>microservices/</b>
    <ul>
      <li><b>gateway-api/</b> — API Gateway (NestJS), маршрутизация и агрегация данных.</li>
      <li><b>db-api/</b> — сервис пользователей, истории, матриц и премиум-доступа (Express, SQLite, шифрование).</li>
      <li><b>numerology-api/</b> — сервис расчёта и визуализации матриц, совместимости, генерации изображений (Express, canvas).</li>
      <li><b>api-description/</b> — сервис описаний программ, энергий, совместимости и др. (NestJS).</li>
    </ul>
  </li>
  <li><b>nginx-1.26.3/</b> — обратный прокси и балансировщик для микросервисов.</li>
  <li><b>decript/</b> — скрипты для работы с зашифрованными данными и БД.</li>
  <li><b>Докер инструкции/</b> — docker-compose и инструкции для развёртывания.</li>
</ul>

---

## 💡 Основные возможности

<ul>
<li>Расчёт и визуализация матрицы судьбы, квадрата Пифагора, совместимости пар</li>
<li>Работа с профилями пользователей, историями расчетов и матриц</li>
<li>Оплата, премиум-доступ, управление подписками</li>
<li>Интеграция с внешними микросервисами (описания, расчёты, совместимость)</li>
<li>Логирование действий пользователей, аналитика</li>
<li>Безопасное хранение персональных данных (шифрование)</li>
<li>Масштабируемая микросервисная архитектура</li>
</ul>

---

## 🛠️ Технологический стек

<p>
  <img src="https://img.shields.io/badge/Node.js-20+-brightgreen" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue" />
  <img src="https://img.shields.io/badge/grammY-Telegram%20Bot%20API-blueviolet" />
  <img src="https://img.shields.io/badge/NestJS-11+-red" />
  <img src="https://img.shields.io/badge/Express.js-4.x-lightgrey" />
  <img src="https://img.shields.io/badge/Fastify-4.x-yellow" />
  <img src="https://img.shields.io/badge/SQLite-3.x-orange" />
  <img src="https://img.shields.io/badge/canvas-image%20generation-green" />
  <img src="https://img.shields.io/badge/Axios-HTTP--client-blue" />
  <img src="https://img.shields.io/badge/Swagger-API%20Docs-yellowgreen" />
  <img src="https://img.shields.io/badge/Docker-ready-blue" />
  <img src="https://img.shields.io/badge/ESLint-Prettier%20Jest-informational" />
  <img src="https://img.shields.io/badge/AES--256--CBC-encryption-important" />
</p>

---

## 📁 Структура репозитория

```text
Bot/                        # Telegram-бот
microservices/
  gateway-api/              # API Gateway
  db-api/                   # Сервис пользователей и истории
  numerology-api/           # Сервис расчётов и изображений
  api-description/          # Сервис описаний
nginx-1.26.3/               # Nginx для проксирования и балансировки
decript/                    # Скрипты для работы с зашифрованными БД
Докер инструкции/           # docker-compose и инструкции
docker-compose.yml          # Общий запуск всех сервисов
```

---

## ⚡ Быстрый старт

```bash
git clone https://github.com/Morzh777/NatalochkaApp.git
cd NatalochkaApp

# Создайте необходимые .env файлы для каждого сервиса (см. примеры в README соответствующих папок)

docker-compose up --build
```

Бот и все микросервисы будут доступны через Nginx (порт 80 по умолчанию).

---

## 🔒 Безопасность и приватность

<ul>
<li>Все персональные данные (имя, дата рождения) шифруются на уровне db-api (AES-256-CBC).</li>
<li>В репозиторий не попадают .env, базы данных, логи, временные и большие файлы (см. .gitignore).</li>
</ul>

---

## 📚 Документация

<ul>
<li>Подробные README для каждого сервиса находятся в соответствующих папках.</li>
<li>Swagger-документация доступна для gateway-api и description-api.</li>
<li><b>Важно:</b> JSON-файлы с описаниями (папка <code>microservices/api-description/src/data/JsonData/</code> и другие файлы описаний) не входят в репозиторий. Их необходимо сгенерировать и наполнить самостоятельно для корректной работы description-api.</li>
</ul>

---

## 👤 Обо мне

<p>
  <b>Привет! Меня зовут Илья, я fullstack-разработчик.</b><br>
  <b>Мой стек:</b> JavaScript, TypeScript, Node.js, NestJS, Express, Docker, микросервисы, Telegram Bot API, шифрование данных, генерация изображений (canvas), CI/CD.<br>
  <b>Этот проект — мой практический опыт построения микросервисной архитектуры, интеграции с Telegram и создания production-ready систем с нуля.</b><br>
  <b>Открыт к новым предложениям и сотрудничеству!</b><br>
  <a href="mailto:kla_atu@mail.ru">kla_atu@mail.ru</a>
</p> 
