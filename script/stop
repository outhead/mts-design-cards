#!/bin/bash

echo -e "\033[33mОстановка http-server...\033[0m"

if [ -f .server.pid ]; then
    PID=$(cat .server.pid)
    if ps -p $PID > /dev/null; then
        kill $PID
        echo -e "\033[32mСервер остановлен (PID: $PID)!\033[0m"
    else
        echo -e "\033[31mПроцесс с PID $PID не найден. Сервер, возможно, был остановлен другим способом.\033[0m"
    fi
    rm .server.pid
else
    echo -e "\033[31mФайл с PID сервера не найден. Попытка остановить все процессы http-server...\033[0m"
    pkill -f "http-server" || echo -e "\033[31mНе удалось найти процессы http-server\033[0m"
    echo -e "\033[32mСервер остановлен!\033[0m"
fi

echo "" 