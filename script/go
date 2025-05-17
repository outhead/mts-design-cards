#!/bin/bash

echo -e "\033[32mНачинаем автоматическую публикацию...\033[0m"

# Добавляем все изменения
git add .

# Запрашиваем сообщение коммита
echo -e "Message for commit: \c"
read commit_message

# Коммитим с сообщением
git commit -m "$commit_message"

# Определяем имя текущей ветки
current_branch=$(git symbolic-ref --short HEAD)

# Отправляем изменения
git push origin $current_branch

echo -e "\033[32mSucces commit GitHub!\033[0m"
echo -e "\033[36mcheck deploy in Actions: https://github.com/outhead/mts-design-cards/actions\033[0m" 