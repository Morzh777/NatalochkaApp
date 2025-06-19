# 1. Базовый образ Nginx на Alpine (маленький и быстрый)
FROM nginx:1.26-alpine

# 2. Удаляем дефолтный конфиг
RUN rm /etc/nginx/conf.d/default.conf

# 3. Копируем свой конфиг
COPY conf/nginx.conf /etc/nginx/nginx.conf

# 4. Если у тебя есть кастомные HTML-файлы для отдачи (по желанию)
# COPY html/ /usr/share/nginx/html/

# 5. Открываем порт
EXPOSE 80

# 6. Запускаем nginx (по умолчанию этот шаг уже в base image)
CMD ["nginx", "-g", "daemon off;"]
