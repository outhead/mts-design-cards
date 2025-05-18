#!/bin/bash

echo "========================================"
echo "Запуск локального PHP-сервера для MTS Design Cards"
echo "========================================"

# Проверяем наличие PHP в системе
if ! command -v php &> /dev/null; then
    echo "[ОШИБКА] PHP не найден в системе. Пожалуйста, установите PHP."
    echo "Для Ubuntu/Debian: sudo apt install php"
    echo "Для MacOS: brew install php"
    echo "========================================"
    exit 1
fi

echo "[ЗАПУСК] Локальный сервер запускается на порту 8000..."
echo "[ДОСТУП] http://localhost:8000"
echo "[CTRL+C] для остановки сервера"
echo "========================================"

php -S localhost:8000

echo "[СТОП] Сервер остановлен" 