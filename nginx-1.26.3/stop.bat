@echo off
echo 🛑 Останавливаю Nginx...

REM Пробуем завершить процесс nginx.exe
taskkill /F /IM nginx.exe >nul 2>&1

REM Удаляем PID файл, если остался
if exist logs\nginx.pid (
    del /f logs\nginx.pid
    echo 🧹 Удалён nginx.pid
)

timeout /t 1 >nul
echo ✅ Nginx остановлен.
pause
