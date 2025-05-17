@echo off
echo Запуск http-server в фоновом режиме...
start /B npx http-server
echo Сервер запущен!
echo.
echo Сервер доступен по адресам:
echo   http://127.0.0.1:8080
echo   http://localhost:8080
echo.
echo Для остановки сервера запустите stop-server.bat
echo. 