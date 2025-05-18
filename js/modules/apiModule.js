/**
 * apiModule.js
 * Модуль для работы с внешними API (OpenAI)
 * Реализует функциональность генерации предсказаний через API
 * Обеспечивает безопасное хранение ключей и отслеживание использования
 */

const ApiModule = (function() {
    // Приватные переменные
    let apiKey = '';
    let isEnabled = false;
    let model = 'gpt-3.5-turbo';
    let temperature = 0.7;
    let apiBaseUrl = 'https://api.openai.com/v1';
    let systemPromptTemplate = 'Ты метафорическая карта предсказаний для дизайнеров. Создай творческое и вдохновляющее предсказание на основе названия карты "${cardTitle}" и вопроса пользователя "${question}". Предсказание должно быть полезным, позитивным и с долей юмора. Не более 3-4 предложений.';

    // Объект для хранения статистики использования API
    let apiStats = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalTokens: 0,
        lastRequest: null,
        history: []
    };

    // Ключи для хранения в localStorage
    const API_STATS_STORAGE_KEY = 'openAiApiStats';
    const MAX_HISTORY_LENGTH = 100;
    
    // Новые константы для ключей, используемых в admin.html и в этом модуле
    const ADMIN_API_KEY = 'openai_api_key';
    const ADMIN_ENABLED_KEY = 'openai_api_enabled';
    const ADMIN_PROMPT_KEY = 'openai_system_prompt';
    const GPT_API_KEY = 'gptApiKey';
    const GPT_ENABLED_KEY = 'isGptEnabled';
    const GPT_MODEL_KEY = 'gptModel';
    const GPT_TEMP_KEY = 'gptTemperature'; 
    const GPT_PROMPT_KEY = 'gptPrompt';
    const API_BASE_URL_KEY = 'apiBaseUrl';
    
    // Новые константы для QR-кодов
    const QR_MAPPING_KEY = 'qrCardMappings';
    const QR_CONFIG_KEY = 'qrCodeConfig';

    /**
     * Инициализация модуля
     */
    function init() {
        console.log('Инициализация API модуля...');
        
        // Проверяем наличие глобальной конфигурации
        if (window.APP_CONFIG) {
            console.log('Обнаружена глобальная конфигурация APP_CONFIG:', window.APP_CONFIG);
            
            // Применяем настройки из глобальной конфигурации
            if (window.APP_CONFIG.apiKey) {
                apiKey = window.APP_CONFIG.apiKey;
                console.log('API ключ установлен из глобальной конфигурации, длина:', apiKey.length);
            }
            
            if (window.APP_CONFIG.isApiEnabled !== undefined) {
                isEnabled = window.APP_CONFIG.isApiEnabled;
                console.log('Статус API установлен из глобальной конфигурации:', isEnabled);
            }
            
            if (window.APP_CONFIG.apiModel) {
                model = window.APP_CONFIG.apiModel;
                console.log('Модель API установлена из глобальной конфигурации:', model);
            }
            
            if (window.APP_CONFIG.temperature !== undefined) {
                temperature = window.APP_CONFIG.temperature;
                console.log('Температура API установлена из глобальной конфигурации:', temperature);
            }
            
            if (window.APP_CONFIG.systemPrompt) {
                systemPromptTemplate = window.APP_CONFIG.systemPrompt;
                console.log('Системный промпт установлен из глобальной конфигурации, длина:', systemPromptTemplate.length);
            }
            
            if (window.APP_CONFIG.apiBaseUrl) {
                apiBaseUrl = window.APP_CONFIG.apiBaseUrl;
                console.log('Базовый URL API установлен из глобальной конфигурации:', apiBaseUrl);
            }
            
            // Синхронизируем настройки с localStorage
            syncSettingsToLocalStorage();
        } else {
            console.log('Глобальная конфигурация APP_CONFIG не найдена, загружаем настройки из localStorage');
            loadSettings();
        }
        
        loadStats();
        loadQrConfig();
        console.log('API модуль инициализирован:', isEnabled ? 'Активен' : 'Отключен');
        console.log('Системный промпт загружен, длина:', systemPromptTemplate.length);
        
        // Публикуем событие инициализации
        if (window.EventBus && typeof window.EventBus.publish === 'function') {
            window.EventBus.publish('API_MODULE_INITIALIZED', {
                enabled: isEnabled,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Синхронизация настроек из переменных модуля в localStorage
     */
    function syncSettingsToLocalStorage() {
        try {
            // Сохраняем API ключ в оба формата
            localStorage.setItem(GPT_API_KEY, apiKey);
            localStorage.setItem(ADMIN_API_KEY, apiKey);
            
            // Сохраняем состояние enabled в оба формата
            localStorage.setItem(GPT_ENABLED_KEY, isEnabled.toString());
            localStorage.setItem(ADMIN_ENABLED_KEY, isEnabled.toString());
            
            // Сохраняем остальные настройки
            localStorage.setItem(GPT_MODEL_KEY, model);
            localStorage.setItem(GPT_TEMP_KEY, temperature.toString());
            localStorage.setItem(API_BASE_URL_KEY, apiBaseUrl);
            
            // Сохраняем системный промпт в оба формата
            localStorage.setItem(GPT_PROMPT_KEY, systemPromptTemplate);
            localStorage.setItem(ADMIN_PROMPT_KEY, systemPromptTemplate);
            
            console.log('Настройки синхронизированы с localStorage');
        } catch (error) {
            console.error('Ошибка при синхронизации настроек с localStorage:', error);
        }
    }

    /**
     * Загрузка настроек API из localStorage с поддержкой обоих форматов ключей
     */
    function loadSettings() {
        try {
            // Проверяем оба возможных ключа для API ключа
            apiKey = localStorage.getItem(GPT_API_KEY) || localStorage.getItem(ADMIN_API_KEY) || '';
            
            // Если ключ был найден в admin-формате, синхронизируем его с основным форматом
            if (!localStorage.getItem(GPT_API_KEY) && localStorage.getItem(ADMIN_API_KEY)) {
                localStorage.setItem(GPT_API_KEY, apiKey);
                console.log('Синхронизирован API ключ из admin-формата в основной формат');
            }
            
            // Проверяем оба возможных ключа для состояния enabled
            const gptEnabled = localStorage.getItem(GPT_ENABLED_KEY) === 'true';
            const adminEnabled = localStorage.getItem(ADMIN_ENABLED_KEY) === 'true';
            
            // Автоматически включаем API, если есть ключ и хотя бы один из флагов enabled установлен
            isEnabled = (gptEnabled || adminEnabled) && apiKey && apiKey.length > 0;
            
            // Синхронизируем состояние enabled между форматами
            localStorage.setItem(GPT_ENABLED_KEY, isEnabled.toString());
            localStorage.setItem(ADMIN_ENABLED_KEY, isEnabled.toString());
            
            // Загружаем остальные настройки
            model = localStorage.getItem(GPT_MODEL_KEY) || 'gpt-3.5-turbo';
            temperature = parseFloat(localStorage.getItem(GPT_TEMP_KEY)) || 0.7;
            apiBaseUrl = localStorage.getItem(API_BASE_URL_KEY) || 'https://api.openai.com/v1';
            
            // Загружаем системный промпт из всех возможных источников
            const savedPromptMain = localStorage.getItem(GPT_PROMPT_KEY);
            const savedPromptAdmin = localStorage.getItem(ADMIN_PROMPT_KEY);
            
            console.log('Проверка системного промпта:',
                { 'GPT_PROMPT_KEY': savedPromptMain ? 'найден' : 'не найден', 
                  'ADMIN_PROMPT_KEY': savedPromptAdmin ? 'найден' : 'не найден' });
            
            // Приоритет: 1) GPT_PROMPT_KEY, 2) ADMIN_PROMPT_KEY, 3) значение по умолчанию
            if (savedPromptMain) {
                systemPromptTemplate = savedPromptMain;
                console.log('Загружен промпт из основного источника, длина:', systemPromptTemplate.length);
            } else if (savedPromptAdmin) {
                systemPromptTemplate = savedPromptAdmin;
                console.log('Загружен промпт из admin источника, длина:', systemPromptTemplate.length);
                // Синхронизируем в основной формат
                localStorage.setItem(GPT_PROMPT_KEY, systemPromptTemplate);
                console.log('Системный промпт синхронизирован из admin в основной формат');
            } else {
                console.log('Используется промпт по умолчанию, так как сохраненный не найден');
            }
            
            // Всегда синхронизируем промпт между обоими ключами для надежности
            localStorage.setItem(GPT_PROMPT_KEY, systemPromptTemplate);
            localStorage.setItem(ADMIN_PROMPT_KEY, systemPromptTemplate);
            
            console.log('Загружены настройки API:', 
                { enabled: isEnabled, model: model, hasKey: !!apiKey, keyLength: apiKey ? apiKey.length : 0,
                  apiBaseUrl: apiBaseUrl, promptTemplate: systemPromptTemplate.substring(0, 50) + '...' });
        } catch (error) {
            console.error('Ошибка при загрузке настроек API:', error);
        }
    }

    /**
     * Загрузка статистики использования API из localStorage
     */
    function loadStats() {
        try {
            const savedStats = localStorage.getItem(API_STATS_STORAGE_KEY);
            if (savedStats) {
                const parsedStats = JSON.parse(savedStats);
                
                // Обновляем только существующие поля, чтобы избежать перезаписи новых полей
                if (parsedStats) {
                    Object.keys(parsedStats).forEach(key => {
                        if (apiStats.hasOwnProperty(key)) {
                            apiStats[key] = parsedStats[key];
                        }
                    });
                    
                    console.log('Статистика API успешно загружена из localStorage');
                }
            } else {
                console.log('Данные статистики API не найдены в localStorage, используются начальные значения');
            }
        } catch (error) {
            console.error('Ошибка при загрузке статистики API из localStorage:', error);
        }
    }

    // Загрузка конфигурации QR-кодов
    function loadQrConfig() {
        try {
            const savedConfig = localStorage.getItem(QR_CONFIG_KEY);
            if (savedConfig) {
                console.log('Загружена конфигурация QR-кодов из localStorage');
                return JSON.parse(savedConfig);
            } else {
                console.log('Конфигурация QR-кодов не найдена в localStorage');
                return null;
            }
        } catch (error) {
            console.error('Ошибка при загрузке конфигурации QR-кодов:', error);
            return null;
        }
    }

    // Сохранение конфигурации QR-кодов
    function saveQrConfig(config) {
        try {
            if (config) {
                localStorage.setItem(QR_CONFIG_KEY, JSON.stringify(config));
                console.log('Конфигурация QR-кодов сохранена в localStorage');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Ошибка при сохранении конфигурации QR-кодов:', error);
            return false;
        }
    }

    // Обновление конфигурации QR-кодов
    function updateQrConfig(updatedConfig) {
        try {
            const currentConfig = loadQrConfig() || {};
            const newConfig = { ...currentConfig, ...updatedConfig };
            
            saveQrConfig(newConfig);
            
            // Публикуем событие обновления конфигурации QR-кодов
            if (window.EventBus && typeof window.EventBus.publish === 'function') {
                window.EventBus.publish('QR_CONFIG_UPDATED', {
                    config: newConfig,
                    timestamp: new Date().toISOString()
                });
            }
            
            return newConfig;
        } catch (error) {
            console.error('Ошибка при обновлении конфигурации QR-кодов:', error);
            return null;
        }
    }

    // Получение QR-маппингов (соответствия QR-кодов картам)
    function getQrMappings() {
        try {
            const savedMappings = localStorage.getItem(QR_MAPPING_KEY);
            if (savedMappings) {
                return JSON.parse(savedMappings);
            }
            return {};
        } catch (error) {
            console.error('Ошибка при загрузке QR-маппингов:', error);
            return {};
        }
    }

    // Сохранение QR-маппингов
    function saveQrMappings(mappings) {
        try {
            localStorage.setItem(QR_MAPPING_KEY, JSON.stringify(mappings));
            
            // Публикуем событие обновления маппингов
            if (window.EventBus && typeof window.EventBus.publish === 'function') {
                window.EventBus.publish('QR_MAPPINGS_UPDATED', {
                    mappings: mappings,
                    timestamp: new Date().toISOString()
                });
            }
            
            return true;
        } catch (error) {
            console.error('Ошибка при сохранении QR-маппингов:', error);
            return false;
        }
    }

    // Добавление или обновление маппинга QR-кода
    function updateQrMapping(qrCode, cardKey) {
        try {
            const mappings = getQrMappings();
            mappings[qrCode] = cardKey;
            return saveQrMappings(mappings);
        } catch (error) {
            console.error('Ошибка при обновлении QR-маппинга:', error);
            return false;
        }
    }

    // Удаление маппинга QR-кода
    function removeQrMapping(qrCode) {
        try {
            const mappings = getQrMappings();
            if (mappings[qrCode]) {
                delete mappings[qrCode];
                return saveQrMappings(mappings);
            }
            return false;
        } catch (error) {
            console.error('Ошибка при удалении QR-маппинга:', error);
            return false;
        }
    }

    // Очистка всех QR-маппингов
    function clearQrMappings() {
        try {
            return saveQrMappings({});
        } catch (error) {
            console.error('Ошибка при очистке QR-маппингов:', error);
            return false;
        }
    }

    /**
     * Сохранение статистики использования API в localStorage
     */
    function saveStats() {
        try {
            apiStats.lastUpdate = new Date().toISOString();
            localStorage.setItem(API_STATS_STORAGE_KEY, JSON.stringify(apiStats));
            
            // Публикуем событие обновления статистики
            if (window.EventBus && typeof window.EventBus.publish === 'function') {
                window.EventBus.publish('API_STATS_UPDATED', {
                    stats: getStats(),
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Ошибка при сохранении статистики API в localStorage:', error);
        }
    }

    /**
     * Получение статистики использования API
     */
    function getStats() {
        return JSON.parse(JSON.stringify(apiStats)); // Возвращаем копию
    }

    /**
     * Сброс статистики использования API
     */
    function resetStats() {
        apiStats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            totalTokens: 0,
            lastRequest: null,
            history: []
        };
        
        saveStats();
        console.log('Статистика использования API сброшена');
        return true;
    }

    /**
     * Подготовка системного промта на основе шаблона
     * @param {Object} cardData - Данные карты
     * @param {string} question - Вопрос пользователя
     * @returns {string} - Готовый системный промт
     */
    function prepareSystemPrompt(cardData, question) {
        const cardTitle = cardData.title || 'Неизвестная карта';
        const cardDescription = cardData.description || '';
        
        // Перезагружаем промпт из localStorage для гарантии использования актуального значения
        const savedPrompt = localStorage.getItem(GPT_PROMPT_KEY) || systemPromptTemplate;
        
        console.log('Генерация системного промпта для карты:', cardTitle);
        console.log('Используемый шаблон промпта:', savedPrompt.substring(0, 50) + '...');
        
        let prompt = savedPrompt
            .replace('${cardTitle}', cardTitle)
            .replace('${question}', question);
        
        // Если есть описание карты, добавляем его в промт
        if (cardDescription) {
            prompt += `\n\nОписание карты: ${cardDescription}`;
        }
        
        console.log('Сгенерирован финальный промпт длиной:', prompt.length);
        return prompt;
    }

    /**
     * Генерация предсказания через API OpenAI
     * @param {Object} cardData - Данные карты
     * @param {string} question - Вопрос пользователя
     * @returns {Promise<string>} - Предсказание или ошибка
     */
    async function generatePredictionFromAPI(cardData, question) {
        // Проверяем, включен ли API и есть ли ключ
        if (!isEnabled || !apiKey) {
            console.warn('API отключен или отсутствует API ключ');
            throw new Error('API отключен или отсутствует API ключ');
        }
        
        // Проверяем наличие необходимых данных
        if (!cardData || !question) {
            console.error('Недостаточно данных для генерации предсказания');
            throw new Error('Недостаточно данных для генерации предсказания');
        }
        
        // Обновляем статистику запросов
        apiStats.totalRequests++;
        apiStats.lastRequest = new Date().toISOString();
        
        // Формируем системный промт
        const systemPrompt = prepareSystemPrompt(cardData, question);
        
        // Формируем запрос к API
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: question
                    }
                ],
                temperature: temperature
            })
        };
        
        try {
            // Используем базовый URL из настроек
            const apiEndpoint = `${apiBaseUrl}/chat/completions`;
            console.log('Отправка запроса к API:', apiEndpoint);
            
            // Отправляем запрос к API
            const response = await fetch(apiEndpoint, requestOptions);
            
            // Если ответ не OK, выбрасываем ошибку
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `API вернул статус ${response.status}`);
            }
            
            // Обрабатываем успешный ответ
            const data = await response.json();
            
            // Формируем историю запроса для статистики
            const requestRecord = {
                timestamp: new Date().toISOString(),
                card: cardData.title || 'Неизвестная карта',
                question: question,
                model: model,
                tokensUsed: data.usage?.total_tokens || 0,
                success: true
            };
            
            // Обновляем статистику
            apiStats.successfulRequests++;
            apiStats.totalTokens += (data.usage?.total_tokens || 0);
            
            // Добавляем запись в историю, ограничивая длину массива
            apiStats.history.unshift(requestRecord);
            if (apiStats.history.length > MAX_HISTORY_LENGTH) {
                apiStats.history = apiStats.history.slice(0, MAX_HISTORY_LENGTH);
            }
            
            // Сохраняем обновленную статистику
            saveStats();
            
            // Публикуем событие успешного запроса
            if (window.EventBus && typeof window.EventBus.publish === 'function') {
                window.EventBus.publish('API_REQUEST_SUCCESS', {
                    requestRecord,
                    timestamp: new Date().toISOString()
                });
            }
            
            // Возвращаем сгенерированное предсказание
            return data.choices[0].message.content;
        } catch (error) {
            // Обрабатываем ошибку запроса
            console.error('Ошибка при запросе к API:', error);
            
            // Формируем запись об ошибке
            const errorRecord = {
                timestamp: new Date().toISOString(),
                card: cardData.title || 'Неизвестная карта',
                question: question,
                model: model,
                error: error.message,
                success: false
            };
            
            // Обновляем статистику
            apiStats.failedRequests++;
            
            // Добавляем запись в историю, ограничивая длину массива
            apiStats.history.unshift(errorRecord);
            if (apiStats.history.length > MAX_HISTORY_LENGTH) {
                apiStats.history = apiStats.history.slice(0, MAX_HISTORY_LENGTH);
            }
            
            // Сохраняем обновленную статистику
            saveStats();
            
            // Публикуем событие ошибки запроса
            if (window.EventBus && typeof window.EventBus.publish === 'function') {
                window.EventBus.publish('API_REQUEST_FAILED', {
                    errorRecord,
                    timestamp: new Date().toISOString()
                });
            }
            
            // Выбрасываем ошибку для обработки вызывающей стороной
            throw error;
        }
    }

    /**
     * Тестирование API с заданным вопросом и картой
     * @param {Object} testData - Тестовые данные (вопрос и информация о карте)
     * @returns {Promise<Object>} - Результат тестирования
     */
    async function testApiRequest(testData) {
        const startTime = Date.now();
        
        // Диагностика перед запросом
        const settings = getSettings();
        const apiKeyStatus = apiKey ? `Ключ установлен (длина: ${apiKey.length})` : 'Ключ отсутствует';
        console.log('Тестирование API: диагностика', {
            isEnabled: isEnabled,
            apiKeyStatus: apiKeyStatus,
            model: model,
            temperature: temperature,
            hasApiKey: !!apiKey,
            isApiAvailable: isApiAvailable(),
            localStorageHasKey: !!localStorage.getItem('gptApiKey'),
            localStorageEnabled: localStorage.getItem('isGptEnabled') === 'true'
        });
        
        try {
            // Если API недоступен, выбрасываем ошибку перед запросом
            if (!isApiAvailable()) {
                throw new Error('API отключен или отсутствует API ключ');
            }
            
            const result = await generatePredictionFromAPI(
                testData.card || { title: 'Тестовая карта' },
                testData.question || 'Что ждет меня в будущем?'
            );
            
            return {
                success: true,
                result: result,
                time: Date.now() - startTime,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Ошибка при тестировании API:', error);
            
            return {
                success: false,
                error: error.message,
                time: Date.now() - startTime,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Проверка доступности API
     * @returns {boolean} - Доступен ли API
     */
    function isApiAvailable() {
        const keyAvailable = apiKey && apiKey.trim().length > 0;
        console.log('API проверка доступности:', { 
            isEnabled: isEnabled, 
            keyAvailable: keyAvailable,
            keyLength: apiKey ? apiKey.length : 0, 
            result: isEnabled && keyAvailable 
        });
        return isEnabled && keyAvailable;
    }

    /**
     * Обновление настроек API
     * @param {Object} settings - Новые настройки
     */
    function updateSettings(settings) {
        let updated = false;
        
        if (settings.hasOwnProperty('apiKey')) {
            apiKey = settings.apiKey;
            // Синхронизируем ключ в обоих форматах
            localStorage.setItem(GPT_API_KEY, apiKey);
            localStorage.setItem(ADMIN_API_KEY, apiKey);
            updated = true;
            console.log('API ключ обновлен, длина:', apiKey ? apiKey.length : 0);
        }
        
        if (settings.hasOwnProperty('isEnabled')) {
            isEnabled = settings.isEnabled;
            // Синхронизируем состояние в обоих форматах
            localStorage.setItem(GPT_ENABLED_KEY, isEnabled.toString());
            localStorage.setItem(ADMIN_ENABLED_KEY, isEnabled.toString());
            updated = true;
        }
        
        if (settings.hasOwnProperty('model')) {
            model = settings.model;
            localStorage.setItem(GPT_MODEL_KEY, model);
            updated = true;
        }
        
        if (settings.hasOwnProperty('temperature')) {
            temperature = settings.temperature;
            localStorage.setItem(GPT_TEMP_KEY, temperature.toString());
            updated = true;
        }
        
        if (settings.hasOwnProperty('systemPromptTemplate')) {
            systemPromptTemplate = settings.systemPromptTemplate;
            // Синхронизируем в обоих форматах
            localStorage.setItem(GPT_PROMPT_KEY, systemPromptTemplate);
            localStorage.setItem(ADMIN_PROMPT_KEY, systemPromptTemplate);
            updated = true;
            console.log('Системный промпт обновлен:', systemPromptTemplate.substring(0, 50) + '...');
        }
        
        if (settings.hasOwnProperty('apiBaseUrl')) {
            apiBaseUrl = settings.apiBaseUrl;
            localStorage.setItem(API_BASE_URL_KEY, apiBaseUrl);
            updated = true;
            console.log('Базовый URL API обновлен:', apiBaseUrl);
        }
        
        if (updated) {
            console.log('Настройки API обновлены:', { 
                enabled: isEnabled, 
                model: model, 
                hasKey: !!apiKey,
                keyLength: apiKey ? apiKey.length : 0,
                apiBaseUrl: apiBaseUrl
            });
            
            // Обновляем глобальную конфигурацию
            updateGlobalConfig();
            
            // Публикуем событие обновления настроек
            if (window.EventBus && typeof window.EventBus.publish === 'function') {
                window.EventBus.publish('API_SETTINGS_UPDATED', {
                    enabled: isEnabled,
                    model: model,
                    hasKey: !!apiKey,
                    apiBaseUrl: apiBaseUrl,
                    timestamp: new Date().toISOString()
                });
            }
        } else {
            console.warn('Вызов updateSettings без изменений');
        }
        
        return updated;
    }

    /**
     * Обновление глобальной конфигурации на основе текущих настроек
     */
    function updateGlobalConfig() {
        if (window.APP_CONFIG) {
            window.APP_CONFIG.apiKey = apiKey;
            window.APP_CONFIG.isApiEnabled = isEnabled;
            window.APP_CONFIG.apiModel = model;
            window.APP_CONFIG.temperature = temperature;
            window.APP_CONFIG.systemPrompt = systemPromptTemplate;
            window.APP_CONFIG.apiBaseUrl = apiBaseUrl;
            window.APP_CONFIG.lastUpdated = new Date().toISOString();
            
            console.log('Глобальная конфигурация обновлена');
            
            // Синхронизируем config.json через fetch с методом POST
            saveConfigToFile();
        } else {
            console.warn('Глобальная конфигурация APP_CONFIG не найдена, создаем новую');
            window.APP_CONFIG = {
                apiKey: apiKey,
                isApiEnabled: isEnabled,
                apiModel: model,
                temperature: temperature,
                systemPrompt: systemPromptTemplate,
                apiBaseUrl: apiBaseUrl,
                lastUpdated: new Date().toISOString()
            };
            
            // Синхронизируем config.json через fetch с методом POST
            saveConfigToFile();
        }
    }
    
    /**
     * Сохранение настроек в файл config.json через специальный серверный скрипт
     */
    function saveConfigToFile() {
        try {
            const configData = {
                apiBaseUrl: apiBaseUrl,
                apiKey: apiKey,
                apiModel: model,
                isApiEnabled: isEnabled,
                temperature: temperature,
                systemPrompt: systemPromptTemplate,
                lastUpdated: new Date().toISOString()
            };
            
            console.log('Сохранение конфигурации в файл config.json...');
            
            // Сохраняем локальную копию конфигурации
            const configString = JSON.stringify(configData, null, 2);
            localStorage.setItem('configBackup', configString);
            
            // Отправляем конфигурацию на сервер
            fetch('save-config.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: configString
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Конфигурация успешно сохранена в файл:', data.message);
                    
                    // Публикуем событие сохранения конфигурации
                    if (window.EventBus && typeof window.EventBus.publish === 'function') {
                        window.EventBus.publish('CONFIG_SAVED', {
                            success: true,
                            timestamp: data.timestamp
                        });
                    }
                } else {
                    console.error('Ошибка при сохранении конфигурации в файл:', data.message);
                }
            })
            .catch(error => {
                console.error('Ошибка при отправке конфигурации на сервер:', error);
                console.log('Конфигурация сохранена только в localStorage');
            });
        } catch (error) {
            console.error('Ошибка при подготовке конфигурации для сохранения:', error);
        }
    }

    /**
     * Получение текущих настроек API
     * @returns {Object} - Текущие настройки
     */
    function getSettings() {
        return {
            isEnabled: isEnabled,
            model: model,
            temperature: temperature,
            systemPromptTemplate: systemPromptTemplate,
            apiBaseUrl: apiBaseUrl,
            hasApiKey: !!apiKey
        };
    }

    // Добавляем новые методы для синхронизации между admin.html и index.html
    
    /**
     * Устанавливает API ключ и синхронизирует его между форматами
     * @param {string} key - API ключ
     */
    function setApiKey(key) {
        if (key && typeof key === 'string') {
            apiKey = key.trim();
            
            // Синхронизируем ключ в обоих форматах
            localStorage.setItem(GPT_API_KEY, apiKey);
            localStorage.setItem(ADMIN_API_KEY, apiKey);
            
            console.log('API ключ обновлен, длина:', apiKey.length);
            
            // Автоматически включаем API, если установлен корректный ключ
            if (apiKey.length > 10) {
                isEnabled = true;
                localStorage.setItem(GPT_ENABLED_KEY, 'true');
                localStorage.setItem(ADMIN_ENABLED_KEY, 'true');
                
                console.log('API автоматически включен при установке ключа');
            }
            
            return true;
        }
        return false;
    }
    
    /**
     * Включает API
     */
    function enableApi() {
        isEnabled = true;
        localStorage.setItem(GPT_ENABLED_KEY, 'true');
        localStorage.setItem(ADMIN_ENABLED_KEY, 'true');
        console.log('API включен вручную');
        return true;
    }
    
    /**
     * Отключает API
     */
    function disableApi() {
        isEnabled = false;
        localStorage.setItem(GPT_ENABLED_KEY, 'false');
        localStorage.setItem(ADMIN_ENABLED_KEY, 'false');
        console.log('API отключен вручную');
        return true;
    }

    // Публичный API
    return {
        init,
        getStats,
        resetStats,
        generatePredictionFromAPI,
        testApiRequest,
        isApiAvailable,
        updateSettings,
        getSettings,
        
        // Добавляем новые публичные методы
        setApiKey,
        enableApi,
        disableApi,
        
        // Методы для работы с QR-кодами
        loadQrConfig,
        saveQrConfig,
        updateQrConfig,
        getQrMappings,
        saveQrMappings,
        updateQrMapping,
        removeQrMapping,
        clearQrMappings
    };
})();

// Экспорт модуля в глобальное пространство имен
window.apiModule = ApiModule;

// Автоматическая инициализация модуля при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    if (window.apiModule && typeof window.apiModule.init === 'function') {
        setTimeout(function() {
            window.apiModule.init();
        }, 500); // Небольшая задержка для уверенности, что другие зависимости загружены
    }
}); 