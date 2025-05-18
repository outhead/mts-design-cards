/**
 * configManager.js
 * Утилита для управления конфигурацией без использования PHP
 * Для размещения на Cloudflare Pages и других статических хостингах
 */

const ConfigManager = (function() {
    // Константы
    const CONFIG_LOCAL_STORAGE_KEY = 'appConfig';
    const CONFIG_BACKUP_KEY = 'configBackup';
    
    /**
     * Загрузка конфигурации
     * Приоритет: 
     * 1. localStorage 
     * 2. window.APP_CONFIG 
     * 3. Значения по умолчанию
     */
    function loadConfig() {
        try {
            // Проверяем localStorage
            const savedConfig = localStorage.getItem(CONFIG_LOCAL_STORAGE_KEY);
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                console.log('Конфигурация загружена из localStorage');
                return config;
            }
            
            // Проверяем глобальную конфигурацию
            if (window.APP_CONFIG) {
                console.log('Конфигурация загружена из глобальной переменной');
                return window.APP_CONFIG;
            }
            
            // Используем значения по умолчанию
            console.log('Используются значения по умолчанию');
            return {
                apiBaseUrl: 'https://api.openai.com/v1',
                apiKey: '',
                apiModel: 'gpt-3.5-turbo',
                isApiEnabled: false,
                temperature: 0.7,
                systemPrompt: 'Ты метафорическая карта предсказаний для дизайнеров. Создай творческое и вдохновляющее предсказание на основе названия карты "${cardTitle}" и вопроса пользователя "${question}". Предсказание должно быть полезным, позитивным и с долей юмора. Не более 3-4 предложений.',
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Ошибка при загрузке конфигурации:', error);
            return {
                apiBaseUrl: 'https://api.openai.com/v1',
                apiKey: '',
                apiModel: 'gpt-3.5-turbo',
                isApiEnabled: false,
                temperature: 0.7,
                systemPrompt: 'Ты метафорическая карта предсказаний для дизайнеров. Создай творческое и вдохновляющее предсказание на основе названия карты "${cardTitle}" и вопроса пользователя "${question}". Предсказание должно быть полезным, позитивным и с долей юмора. Не более 3-4 предложений.',
                lastUpdated: new Date().toISOString()
            };
        }
    }
    
    /**
     * Сохранение конфигурации
     * @param {Object} config - Объект конфигурации
     * @returns {boolean} - Результат сохранения
     */
    function saveConfig(config) {
        try {
            if (!config) {
                console.error('Пустая конфигурация не может быть сохранена');
                return false;
            }
            
            // Добавляем метку времени обновления
            config.lastUpdated = new Date().toISOString();
            
            // Сохраняем в localStorage
            const configString = JSON.stringify(config);
            localStorage.setItem(CONFIG_LOCAL_STORAGE_KEY, configString);
            
            // Дополнительно сохраняем резервную копию
            localStorage.setItem(CONFIG_BACKUP_KEY, configString);
            
            // Обновляем глобальную конфигурацию
            window.APP_CONFIG = config;
            
            console.log('Конфигурация успешно сохранена');
            
            // Публикуем событие обновления
            if (window.EventBus && typeof window.EventBus.publish === 'function') {
                window.EventBus.publish('CONFIG_SAVED', {
                    success: true,
                    timestamp: config.lastUpdated
                });
            }
            
            return true;
        } catch (error) {
            console.error('Ошибка при сохранении конфигурации:', error);
            
            // Публикуем событие ошибки
            if (window.EventBus && typeof window.EventBus.publish === 'function') {
                window.EventBus.publish('CONFIG_SAVE_ERROR', {
                    success: false,
                    message: 'Ошибка при сохранении настроек',
                    error: error.message
                });
            }
            
            return false;
        }
    }
    
    /**
     * Экспорт конфигурации в файл
     * Позволяет пользователю скачать текущую конфигурацию в виде JSON-файла
     */
    function exportConfig() {
        try {
            const config = loadConfig();
            if (!config) {
                console.error('Нет конфигурации для экспорта');
                return false;
            }
            
            // Удаляем чувствительные данные при необходимости
            const exportConfig = { ...config };
            if (window.confirm('Включить API ключ в экспортируемую конфигурацию?')) {
                // Оставляем API ключ
            } else {
                // Скрываем API ключ
                exportConfig.apiKey = '';
            }
            
            // Создаем файл для скачивания
            const configString = JSON.stringify(exportConfig, null, 2);
            const blob = new Blob([configString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Создаем ссылку и имитируем клик
            const a = document.createElement('a');
            a.href = url;
            a.download = 'mts-design-cards-config.json';
            document.body.appendChild(a);
            a.click();
            
            // Очистка
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            return true;
        } catch (error) {
            console.error('Ошибка при экспорте конфигурации:', error);
            return false;
        }
    }
    
    /**
     * Импорт конфигурации из файла
     * @param {File} file - Файл конфигурации
     * @returns {Promise<boolean>} - Результат импорта
     */
    function importConfig(file) {
        return new Promise((resolve, reject) => {
            try {
                if (!file) {
                    console.error('Файл не выбран');
                    reject(new Error('Файл не выбран'));
                    return;
                }
                
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    try {
                        const configString = event.target.result;
                        const config = JSON.parse(configString);
                        
                        // Проверяем, что это корректная конфигурация
                        if (!config.apiBaseUrl || !config.apiModel) {
                            console.error('Некорректный формат конфигурации');
                            reject(new Error('Некорректный формат конфигурации'));
                            return;
                        }
                        
                        // Сохраняем импортированную конфигурацию
                        const result = saveConfig(config);
                        if (result) {
                            console.log('Конфигурация успешно импортирована');
                            
                            // Публикуем событие импорта
                            if (window.EventBus && typeof window.EventBus.publish === 'function') {
                                window.EventBus.publish('CONFIG_IMPORTED', {
                                    success: true,
                                    timestamp: new Date().toISOString()
                                });
                            }
                            
                            resolve(true);
                        } else {
                            console.error('Ошибка при сохранении импортированной конфигурации');
                            reject(new Error('Ошибка при сохранении импортированной конфигурации'));
                        }
                    } catch (error) {
                        console.error('Ошибка при обработке файла:', error);
                        reject(error);
                    }
                };
                
                reader.onerror = function(error) {
                    console.error('Ошибка при чтении файла:', error);
                    reject(error);
                };
                
                reader.readAsText(file);
            } catch (error) {
                console.error('Ошибка при импорте конфигурации:', error);
                reject(error);
            }
        });
    }
    
    /**
     * Очистка конфигурации
     * @returns {boolean} - Результат очистки
     */
    function clearConfig() {
        try {
            localStorage.removeItem(CONFIG_LOCAL_STORAGE_KEY);
            console.log('Конфигурация успешно очищена');
            
            // Публикуем событие очистки
            if (window.EventBus && typeof window.EventBus.publish === 'function') {
                window.EventBus.publish('CONFIG_CLEARED', {
                    success: true,
                    timestamp: new Date().toISOString()
                });
            }
            
            return true;
        } catch (error) {
            console.error('Ошибка при очистке конфигурации:', error);
            return false;
        }
    }
    
    // Публичное API
    return {
        loadConfig,
        saveConfig,
        exportConfig,
        importConfig,
        clearConfig
    };
})();

// Экспорт утилиты в глобальное пространство имен
window.ConfigManager = ConfigManager; 