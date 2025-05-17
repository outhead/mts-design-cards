# Установка кодировки для корректного отображения кириллицы
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 > $null # Установка кодовой страницы UTF-8

# Скрипт для запуска бота Telegram
# Инструкция: Замените значения переменных на ваши собственные токены и URL

# Режим отладки (true - включен, false - выключен)
$DEBUG_MODE = $true

# Установка прокси (раскомментируйте и задайте адрес, если требуется)
# $env:HTTP_PROXY = "http://your-proxy-server:port"
# $env:HTTPS_PROXY = "http://your-proxy-server:port"

# Параметры повторных попыток подключения
$env:CONNECT_RETRIES = "5"        # Количество попыток подключения
$env:CONNECT_RETRY_DELAY = "5000" # Задержка между попытками в миллисекундах

# ВАЖНО: Не храните API ключи в коде!
# Для безопасности используйте файл .env (не коммитьте его в репозиторий)
# или системные переменные окружения

# Токен Telegram бота (получите у @BotFather)
# Не указывайте токен здесь, задайте его через переменную окружения
$env:TELEGRAM_BOT_TOKEN = ""

# URL вашего веб-приложения
$env:WEB_APP_URL = "https://outhead.github.io/mts-design-cards/"

# Ключ API для OpenAI (для функции генерации предсказаний)
# Не указывайте ключ здесь, задайте его через переменную окружения
$env:OPENAI_API_KEY = ""

# Включаем режим отладки при необходимости
if ($DEBUG_MODE) {
    $env:NODE_DEBUG = "telegram*,http,https,net"
    $env:DEBUG = "telegraf:*"
}

# Функция проверки доступности сайта
function Test-WebsiteConnection {
    param (
        [string]$Url
    )
    
    Write-Host "Проверка доступности $Url..." -NoNewline
    
    try {
        $request = [System.Net.WebRequest]::Create($Url)
        $request.Timeout = 5000 # 5 секунд таймаут
        $response = $request.GetResponse()
        $response.Close()
        Write-Host " ДОСТУПЕН" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host " НЕДОСТУПЕН" -ForegroundColor Red
        Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Проверка установки пакета
function Test-PackageInstalled {
    param (
        [string]$PackageName
    )
    
    Write-Host "Проверка наличия пакета $PackageName..." -NoNewline
    
    $packageJsonPath = Join-Path $PSScriptRoot "package.json"
    
    if (Test-Path $packageJsonPath) {
        $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
        
        $dependencies = $packageJson.dependencies
        $devDependencies = $packageJson.devDependencies
        
        $isInstalled = $false
        
        if ($dependencies -and $dependencies.$PackageName) {
            $isInstalled = $true
        }
        
        if (-not $isInstalled -and $devDependencies -and $devDependencies.$PackageName) {
            $isInstalled = $true
        }
        
        if ($isInstalled) {
            Write-Host " УСТАНОВЛЕН" -ForegroundColor Green
            return $true
        }
    }
    
    Write-Host " НЕ УСТАНОВЛЕН" -ForegroundColor Yellow
    
    $installChoice = Read-Host "Установить пакет $PackageName? (y/n)"
    
    if ($installChoice -eq "y" -or $installChoice -eq "Y") {
        Write-Host "Установка пакета $PackageName..." -ForegroundColor Cyan
        npm install $PackageName --save
        return $true
    }
    
    return $false
}

# Подготовка
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "       Запуск бота MTS Design Weekend Cards       " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# Проверка наличия пакета https-proxy-agent
Test-PackageInstalled -PackageName "https-proxy-agent"

# Проверка доступности Telegram API
$telegramApiAvailable = Test-WebsiteConnection -Url "https://api.telegram.org"

if (-not $telegramApiAvailable) {
    Write-Host "ВНИМАНИЕ: API Telegram недоступен!" -ForegroundColor Red
    Write-Host "Возможные причины:" -ForegroundColor Yellow
    Write-Host "1. Проблемы с интернет-соединением" -ForegroundColor Yellow
    Write-Host "2. Блокировка на уровне провайдера" -ForegroundColor Yellow
    Write-Host "3. Настройки брандмауэра или антивируса" -ForegroundColor Yellow
    
    Write-Host "`nРекомендации:" -ForegroundColor Cyan
    Write-Host "1. Проверьте подключение к интернету" -ForegroundColor Cyan
    Write-Host "2. Настройте прокси-сервер, раскомментировав строки с HTTP_PROXY/HTTPS_PROXY" -ForegroundColor Cyan
    Write-Host "3. Временно отключите брандмауэр/антивирус" -ForegroundColor Cyan
    
    $continueChoice = Read-Host "Продолжить запуск бота, несмотря на проблемы с подключением? (y/n)"
    
    if ($continueChoice -ne "y" -and $continueChoice -ne "Y") {
        Write-Host "Запуск бота отменен" -ForegroundColor Red
        exit 1
    }
}

# Информация о настройках
Write-Host "Токен Telegram: " -NoNewline
if ([string]::IsNullOrEmpty($env:TELEGRAM_BOT_TOKEN)) {
    Write-Host "НЕ УСТАНОВЛЕН" -ForegroundColor Red
} else {
    Write-Host "УСТАНОВЛЕН" -ForegroundColor Green
}

Write-Host "URL приложения: " -NoNewline
Write-Host $env:WEB_APP_URL -ForegroundColor Yellow

Write-Host "API OpenAI: " -NoNewline
if ([string]::IsNullOrEmpty($env:OPENAI_API_KEY)) {
    Write-Host "НЕ УСТАНОВЛЕН" -ForegroundColor Red
} else {
    Write-Host "УСТАНОВЛЕН" -ForegroundColor Green
}

# Информация о прокси
if ($env:HTTP_PROXY -or $env:HTTPS_PROXY) {
    Write-Host "HTTP прокси: " -NoNewline
    Write-Host $env:HTTP_PROXY -ForegroundColor Yellow
    Write-Host "HTTPS прокси: " -NoNewline
    Write-Host $env:HTTPS_PROXY -ForegroundColor Yellow
}

# Информация о режиме отладки
if ($DEBUG_MODE) {
    Write-Host "Режим отладки: " -NoNewline
    Write-Host "ВКЛЮЧЕН" -ForegroundColor Green
}

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Запускаем бота с указанными параметрами..." -ForegroundColor Green

# Запуск бота
try {
    node bot-example.js
}
catch {
    Write-Host "Произошла ошибка при запуске бота:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
} 