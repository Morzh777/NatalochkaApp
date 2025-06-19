@echo off
chcp 65001 >nul

echo 📛 Останавливаю все процессы nginx...
taskkill /F /IM nginx.exe >nul 2>&1

echo 🚀 Запускаю Nginx с конфигом...
start "" nginx.exe -c conf\nginx.conf

timeout /t 1 >nul
echo ✅ Готово. Открываю http://localhost ...
start http://localhost

pause
