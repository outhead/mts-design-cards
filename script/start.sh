#!/bin/bash

echo -e "\033[32mЗапуск http-server в фоновом режиме...\033[0m"
npx http-server &
SERVER_PID=$!

# Сохраняем PID сервера в файл
echo $SERVER_PID > .server.pid

echo -e "\033[32mСервер запущен!\033[0m"
echo ""
echo "Сервер доступен по адресам:"
echo "  http://127.0.0.1:8080"
echo "  http://localhost:8080"
echo ""
echo -e "\033[33mДля остановки сервера запустите ./stop.sh\033[0m"
echo "" 