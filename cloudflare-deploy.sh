#!/bin/bash

# Скрипт для деплоя на Cloudflare Pages (для Mac/Linux)
# Автор: egoro
# Версия: 1.0

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Функция для вывода цветного текста
echo_color() {
    local color=$1
    local text=$2
    echo -e "${color}${text}${NC}"
}

# Проверяем наличие Wrangler
check_wrangler() {
    if npx wrangler --version &>/dev/null; then
        echo_color $GREEN "✓ Wrangler найден: $(npx wrangler --version)"
        return 0
    else
        echo_color $YELLOW "✗ Wrangler не найден. Будет использован режим архивации."
        return 1
    fi
}

# Проверяем, авторизован ли пользователь в Cloudflare
check_cloudflare_auth() {
    if npx wrangler whoami 2>/dev/null | grep -q "You are logged in"; then
        echo_color $GREEN "✓ Вы авторизованы в Cloudflare"
        return 0
    else
        echo_color $YELLOW "✗ Вы не авторизованы в Cloudflare. Запускаем авторизацию..."
        if npx wrangler login; then
            return 0
        else
            echo_color $RED "✗ Не удалось авторизоваться в Cloudflare"
            return 1
        fi
    fi
}

# Функция для создания ZIP-архива проекта
create_project_zip() {
    local output_path=${1:-"mts-design-cards-deploy.zip"}
    
    echo_color $CYAN "Создаем ZIP-архив проекта..."
    
    # Создаем временную директорию для файлов проекта
    local temp_dir="temp-deploy"
    if [ -d "$temp_dir" ]; then
        rm -rf "$temp_dir"
    fi
    mkdir -p "$temp_dir"
    
    # Копируем нужные файлы, исключая ненужное
    exclude_dirs=(".git" "node_modules" ".github")
    exclude_files=(".gitignore" "cloudflare-deploy.sh" "cloudflare-deploy.ps1" "deploy.sh" "*.zip")
    
    # Копируем директории
    for dir in */; do
        dir=${dir%/}
        if [[ ! " ${exclude_dirs[@]} " =~ " ${dir} " ]]; then
            cp -r "$dir" "$temp_dir/"
        fi
    done
    
    # Копируем файлы
    for file in *; do
        if [ -f "$file" ]; then
            skip=false
            for exclude in "${exclude_files[@]}"; do
                if [[ "$file" == $exclude ]]; then
                    skip=true
                    break
                fi
            done
            if [ "$skip" = false ]; then
                cp "$file" "$temp_dir/"
            fi
        fi
    done
    
    # Создаем ZIP-архив
    if [ -f "$output_path" ]; then
        rm "$output_path"
    fi
    
    (cd "$temp_dir" && zip -r "../$output_path" .)
    
    # Удаляем временную директорию
    rm -rf "$temp_dir"
    
    if [ -f "$output_path" ]; then
        echo_color $GREEN "✓ ZIP-архив успешно создан: $output_path"
        return 0
    else
        echo_color $RED "✗ Не удалось создать ZIP-архив"
        return 1
    fi
}

# Функция для деплоя проекта на Cloudflare Pages
deploy_to_cloudflare() {
    local project_name=${1:-"mts-design-cards"}
    local branch=${2:-"main"}
    
    echo_color $CYAN "Запускаем деплой на Cloudflare Pages..."
    
    # Список проектов, чтобы проверить, существует ли наш
    if ! npx wrangler pages project list | grep -q "$project_name"; then
        echo_color $YELLOW "Проект '$project_name' не найден. Создаем новый проект..."
        npx wrangler pages project create "$project_name" --production-branch="$branch"
    fi
    
    # Деплой проекта
    echo_color $CYAN "Деплой проекта '$project_name' на Cloudflare Pages..."
    if npx wrangler pages deploy . --project-name="$project_name" --branch="$branch"; then
        echo_color $GREEN "✓ Деплой успешно завершен!"
        return 0
    else
        echo_color $RED "✗ Ошибка деплоя"
        return 1
    fi
}

# Главная функция
main() {
    echo_color $CYAN "=============================================="
    echo_color $CYAN "    Деплой MTS Design Cards на Cloudflare    "
    echo_color $CYAN "=============================================="
    
    if check_wrangler; then
        if check_cloudflare_auth; then
            # Спрашиваем имя проекта
            read -p "Введите имя проекта на Cloudflare Pages (по умолчанию: mts-design-cards): " project_name
            project_name=${project_name:-"mts-design-cards"}
            
            # Деплоим напрямую через Wrangler
            if deploy_to_cloudflare "$project_name"; then
                echo_color $GREEN "Проект успешно задеплоен на Cloudflare Pages!"
                echo_color $CYAN "URL: https://${project_name}.pages.dev"
            else
                echo_color $RED "Произошла ошибка при деплое."
                echo_color $YELLOW "Попробуйте архивный способ. Создаем ZIP-архив..."
                
                if create_project_zip; then
                    echo_color $CYAN "Загрузите файл mts-design-cards-deploy.zip через панель Cloudflare Pages:"
                    echo_color $CYAN "1. Перейдите на https://dash.cloudflare.com/"
                    echo_color $CYAN "2. Выберите 'Pages' в боковом меню"
                    echo_color $CYAN "3. Выберите 'Create application'"
                    echo_color $CYAN "4. Выберите 'Upload assets'"
                    echo_color $CYAN "5. Перетащите созданный ZIP-файл"
                fi
            fi
        else
            echo_color $YELLOW "Не удалось авторизоваться в Cloudflare. Создаем ZIP-архив для ручной загрузки..."
            if create_project_zip; then
                echo_color $CYAN "Загрузите файл mts-design-cards-deploy.zip через панель Cloudflare Pages вручную."
            fi
        fi
    else
        # Если Wrangler не найден, создаем ZIP-архив
        echo_color $YELLOW "Создаем ZIP-архив для ручной загрузки..."
        if create_project_zip; then
            echo_color $CYAN "Загрузите файл mts-design-cards-deploy.zip через панель Cloudflare Pages:"
            echo_color $CYAN "1. Перейдите на https://dash.cloudflare.com/"
            echo_color $CYAN "2. Выберите 'Pages' в боковом меню"
            echo_color $CYAN "3. Выберите 'Create application'"
            echo_color $CYAN "4. Выберите 'Upload assets'"
            echo_color $CYAN "5. Перетащите созданный ZIP-файл"
        fi
    fi
    
    echo_color $CYAN "=============================================="
    echo_color $CYAN "            Операция завершена               "
    echo_color $CYAN "=============================================="
}

# Запускаем главную функцию
main 