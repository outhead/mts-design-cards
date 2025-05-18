/**
 * apiModule.js
 * Модуль для работы с GPT API через OpenAI API 
 * С поддержкой различных провайдеров API и конфигурации без PHP
 */

const apiModule = (function() {
    // Настройки API по умолчанию
    let apiKey = '';
    let isEnabled = false;
    let model = 'gpt-3.5-turbo';
    let temperature = 0.7;
    let systemPromptTemplate = 'Ты карта предсказаний дизайнеру. Создай короткое предсказание по теме "${cardTitle}" на вопрос "${question}".';
    let apiBaseUrl = 'https://api.openai.com/v1';
    
    // Статистика запросов
    let requestCount = 0;
    let lastRequestTime = null;
    
    /**
     * Инициализация модуля - загрузка настроек
     */
    function init() {
        console.log('Инициализация API модуля...');
        
        // Попытка загрузки конфигурации с использованием ConfigManager
        if (window.ConfigManager && typeof window.ConfigManager.loadConfig === 'function') {
            const config = window.ConfigManager.loadConfig();
            if (config) {
                updateSettings({
                    apiKey: config.apiKey,
                    isEnabled: config.isApiEnabled,
                    model: config.apiModel,
                    temperature: config.temperature,
                    systemPromptTemplate: config.systemPromptTemplate || config.systemPrompt,
                    apiBaseUrl: config.apiBaseUrl
                });
                console.log('Настройки API загружены из ConfigManager');
                return;
            }
        }
        
        // Если ConfigManager недоступен, загружаем из localStorage
        try {
            apiKey = localStorage.getItem('gptApiKey') || '';
            isEnabled = localStorage.getItem('isGptEnabled') === 'true';
            model = localStorage.getItem('gptModel') || 'gpt-3.5-turbo';
            temperature = parseFloat(localStorage.getItem('gptTemperature')) || 0.7;
            systemPromptTemplate = localStorage.getItem('gptPrompt') || systemPromptTemplate;
            apiBaseUrl = localStorage.getItem('apiBaseUrl') || 'https://api.openai.com/v1';
            
            console.log('Настройки API загружены из localStorage');
            
            // Обновляем статистику
            requestCount = parseInt(localStorage.getItem('apiRequestCount') || '0');
            lastRequestTime = localStorage.getItem('apiLastRequestTime') || null;
        } catch (error) {
            console.error('Ошибка при загрузке настроек API:', error);
        }
        
        // Подписываемся на обновления конфигурации
        if (window.EventBus && typeof window.EventBus.subscribe === 'function') {
            window.EventBus.subscribe('CONFIG_SAVED', function(data) {
                if (data.success && window.ConfigManager) {
                    const config = window.ConfigManager.loadConfig();
            if (config) {
                        updateSettings({
                            apiKey: config.apiKey,
                            isEnabled: config.isApiEnabled,
                            model: config.apiModel,
                            temperature: config.temperature,
                            systemPromptTemplate: config.systemPromptTemplate || config.systemPrompt,
                            apiBaseUrl: config.apiBaseUrl
                        });
                        console.log('Настройки API обновлены после сохранения конфигурации');
                    }
                }
            });
        }
    }

    /**
     * Обновление настроек API
     * @param {Object} settings - Объект с настройками
     */
    function updateSettings(settings) {
        if (settings.apiKey !== undefined) apiKey = settings.apiKey;
        if (settings.isEnabled !== undefined) isEnabled = settings.isEnabled;
        if (settings.model !== undefined) model = settings.model;
        if (settings.temperature !== undefined) temperature = parseFloat(settings.temperature);
        if (settings.systemPromptTemplate !== undefined) systemPromptTemplate = settings.systemPromptTemplate;
        if (settings.apiBaseUrl !== undefined) apiBaseUrl = settings.apiBaseUrl;
        
        // Сохраняем в localStorage для совместимости
        localStorage.setItem('gptApiKey', apiKey);
        localStorage.setItem('isGptEnabled', isEnabled);
        localStorage.setItem('gptModel', model);
        localStorage.setItem('gptTemperature', temperature);
        localStorage.setItem('gptPrompt', systemPromptTemplate);
        localStorage.setItem('apiBaseUrl', apiBaseUrl);
        
        console.log('Настройки API обновлены:', 
            'API ' + (isEnabled ? 'включен' : 'отключен'), 
            'модель:', model, 
            'температура:', temperature);
    }
    
    /**
     * Получение текущих настроек API
     * @returns {Object} - Объект с настройками
     */
    function getSettings() {
        return {
            apiKey: apiKey,
            isEnabled: isEnabled,
            model: model,
            temperature: temperature,
            systemPromptTemplate: systemPromptTemplate,
            apiBaseUrl: apiBaseUrl
        };
    }
    
    /**
     * Отправка запроса к GPT API
     * @param {Object} data - Объект с данными для запроса
     * @returns {Promise<string>} - Промис с ответом от API
     */
    async function makeApiRequest(data) {
        // Проверяем, что API включен и ключ задан
        if (!isEnabled || !apiKey) {
            return Promise.reject(new Error('API отключен или ключ не задан'));
        }
        
        try {
            // Готовим системный промпт с подстановкой данных
            let preparedPrompt = systemPromptTemplate
                .replace(/\${cardTitle}/g, data.card.title || 'Карта предсказаний')
                .replace(/\${question}/g, data.question || 'Вопрос пользователя');
        
        // Формируем запрос к API
            const requestBody = {
                model: model,
                messages: [
                    { role: "system", content: preparedPrompt },
                    { role: "user", content: data.question || 'Что меня ждет?' }
                ],
                temperature: temperature,
                max_tokens: 500,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0
            };
            
            const startTime = performance.now();
            
            // Выполняем запрос
            const response = await fetch(`${apiBaseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody)
            });
            
            const endTime = performance.now();
            const requestTime = Math.round(endTime - startTime);
            
            // Обрабатываем ответ
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Ошибка API:', errorData);
                throw new Error(`Ошибка API: ${response.status} ${errorData.error?.message || response.statusText}`);
            }
            
            const responseData = await response.json();
            
            // Обновляем статистику
            requestCount++;
            lastRequestTime = new Date().toISOString();
            localStorage.setItem('apiRequestCount', requestCount.toString());
            localStorage.setItem('apiLastRequestTime', lastRequestTime);
            
            // Публикуем событие об успешном запросе
            if (window.EventBus && typeof window.EventBus.publish === 'function') {
                window.EventBus.publish('API_REQUEST_COMPLETED', {
                    success: true,
                    time: requestTime,
                    model: model
                });
            }
            
            // Возвращаем текст ответа
            return responseData.choices[0].message.content;
        } catch (error) {
            console.error('Ошибка при запросе к API:', error);
            
            // Публикуем событие об ошибке
            if (window.EventBus && typeof window.EventBus.publish === 'function') {
                window.EventBus.publish('API_REQUEST_ERROR', {
                    success: false,
                    error: error.message
                });
            }
            
            throw error;
        }
    }

    /**
     * Тестовый запрос к API
     * @param {Object} data - Объект с данными для запроса
     * @returns {Promise<Object>} - Промис с результатом теста
     */
    async function testApiRequest(data) {
        try {
            const startTime = performance.now();
            const result = await makeApiRequest(data);
            const endTime = performance.now();
            const requestTime = Math.round(endTime - startTime);
            
            return {
                success: true,
                time: requestTime,
                result: result
            };
        } catch (error) {
            return {
                success: false,
                time: 0,
                error: error.message
            };
        }
    }
    
    // Публичное API модуля
    return {
        init: init,
        updateSettings: updateSettings,
        getSettings: getSettings,
        makeApiRequest: makeApiRequest,
        testApiRequest: testApiRequest
    };
})();

// Инициализация модуля
if (typeof window !== 'undefined') {
    // Автоматическая инициализация при загрузке страницы
    document.addEventListener('DOMContentLoaded', function() {
        apiModule.init();
    });
    
    // Экспорт модуля в глобальную область видимости
    window.apiModule = apiModule;
} 