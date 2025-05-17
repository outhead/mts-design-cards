Write-Host "Начинаем автоматическую публикацию..." -ForegroundColor Green

# Добавляем все изменения
git add .

# Запрашиваем сообщение коммита
$commit_message = Read-Host "Message for commit"

# Коммитим с сообщением
git commit -m "$commit_message"

# Определяем имя текущей ветки
$current_branch = git symbolic-ref --short HEAD

# Отправляем изменения
git push origin $current_branch

Write-Host "Sucess commit GitHub!" -ForegroundColor Green
Write-Host "check deploy in Actions: https://github.com/outhead/mts-design-cards/actions" -ForegroundColor Cyan 