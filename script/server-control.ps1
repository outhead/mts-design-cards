# Скрипт для управления HTTP-сервером
param (
    [string]$Action = "start"
)

function Start-HttpServer {
    Write-Host "Запуск HTTP-сервера..." -ForegroundColor Green
    Start-Process -NoNewWindow -FilePath "npx" -ArgumentList "http-server"
    Write-Host "HTTP-сервер запущен в фоновом режиме!" -ForegroundColor Green
    Write-Host "Доступен по адресам:"
    Write-Host "  http://127.0.0.1:8080"
    Write-Host "  http://localhost:8080"
    Write-Host ""
    Write-Host "Для остановки сервера выполните: .\server-control.ps1 -Action stop" -ForegroundColor Yellow
}

function Stop-HttpServer {
    Write-Host "Остановка HTTP-сервера..." -ForegroundColor Yellow
    
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    
    if ($nodeProcesses) {
        foreach ($process in $nodeProcesses) {
            Write-Host "Завершаем процесс node (ID: $($process.Id))" -ForegroundColor Cyan
            Stop-Process -Id $process.Id -Force
        }
        Write-Host "HTTP-сервер остановлен!" -ForegroundColor Green
    } else {
        Write-Host "HTTP-сервер не найден или уже остановлен" -ForegroundColor Red
    }
}

function Show-ServerStatus {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    
    if ($nodeProcesses) {
        Write-Host "HTTP-сервер работает!" -ForegroundColor Green
        Write-Host "Следующие процессы обнаружены:" -ForegroundColor Cyan
        foreach ($process in $nodeProcesses) {
            Write-Host "  Процесс ID: $($process.Id)" -ForegroundColor Cyan
        }
        Write-Host ""
        Write-Host "Доступен по адресам:"
        Write-Host "  http://127.0.0.1:8080"
        Write-Host "  http://localhost:8080"
    } else {
        Write-Host "HTTP-сервер не запущен" -ForegroundColor Yellow
    }
}

# Выполнение команды в зависимости от параметра Action
switch ($Action.ToLower()) {
    "start" { Start-HttpServer }
    "stop" { Stop-HttpServer }
    "status" { Show-ServerStatus }
    default { Write-Host "Неизвестное действие. Используйте: start, stop или status" -ForegroundColor Red }
} 