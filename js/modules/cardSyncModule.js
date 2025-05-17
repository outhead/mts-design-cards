/**
 * cardSyncModule.js
 * Модуль для синхронизации карт между компонентами системы
 * Обеспечивает централизованный доступ к данным о картах и их связям с QR-кодами
 */

const CardSyncModule = (function() {
    // Хранилище для карт
    let cardsData = {};
    // Кэш QR-маппингов
    let qrMappings = {};
    // Ключ для хранения в localStorage
    const CARDS_STORAGE_KEY = 'mts_design_cards_data';
    const QR_MAPPING_KEY = 'qrCardMappings';
    
    // События
    const EVENTS = {
        CARDS_UPDATED: 'cards_data_updated',
        QR_MAPPINGS_UPDATED: 'qr_mappings_updated',
        SYNC_COMPLETED: 'cards_sync_completed'
    };
    
    /**
     * Инициализация модуля
     */
    function init() {
        console.log('Инициализация модуля синхронизации карт...');
        loadCardsData();
        loadQrMappings();
        
        // Подписываемся на события обновления QR-маппингов из apiModule
        if (window.EventBus && typeof window.EventBus.subscribe === 'function') {
            window.EventBus.subscribe('QR_MAPPINGS_UPDATED', function(data) {
                console.log('Получено событие обновления QR-маппингов:', data);
                loadQrMappings();
                dispatchSyncEvent();
            });
        }
        
        console.log('Модуль синхронизации карт инициализирован, загружено карт:', Object.keys(cardsData).length);
    }
    
    /**
     * Загрузка данных о картах из localStorage
     */
    function loadCardsData() {
        try {
            const savedCards = localStorage.getItem(CARDS_STORAGE_KEY);
            if (savedCards) {
                cardsData = JSON.parse(savedCards);
                console.log('Загружены данные о картах из localStorage, количество:', Object.keys(cardsData).length);
            } else {
                console.log('Данные о картах не найдены в localStorage');
            }
            
            return cardsData;
        } catch (error) {
            console.error('Ошибка при загрузке данных о картах:', error);
            return {};
        }
    }
    
    /**
     * Сохранение данных о картах в localStorage
     */
    function saveCardsData() {
        try {
            localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cardsData));
            console.log('Данные о картах сохранены в localStorage, количество:', Object.keys(cardsData).length);
            
            // Отправляем событие обновления карт
            dispatchEvent(EVENTS.CARDS_UPDATED, {
                count: Object.keys(cardsData).length,
                timestamp: new Date().toISOString()
            });
            
            return true;
        } catch (error) {
            console.error('Ошибка при сохранении данных о картах:', error);
            return false;
        }
    }
    
    /**
     * Загрузка QR-маппингов из localStorage через apiModule
     */
    function loadQrMappings() {
        try {
            // Проверяем наличие apiModule
            if (window.apiModule && typeof window.apiModule.getQrMappings === 'function') {
                qrMappings = window.apiModule.getQrMappings();
                console.log('Загружены QR-маппинги через apiModule, количество:', Object.keys(qrMappings).length);
            } else {
                // Запасной вариант - загрузка напрямую
                const savedMappings = localStorage.getItem(QR_MAPPING_KEY);
                if (savedMappings) {
                    qrMappings = JSON.parse(savedMappings);
                    console.log('Загружены QR-маппинги напрямую из localStorage, количество:', Object.keys(qrMappings).length);
                }
            }
            
            return qrMappings;
        } catch (error) {
            console.error('Ошибка при загрузке QR-маппингов:', error);
            return {};
        }
    }
    
    /**
     * Сохранение QR-маппингов через apiModule
     */
    function saveQrMappings() {
        try {
            // Проверяем наличие apiModule
            if (window.apiModule && typeof window.apiModule.saveQrMappings === 'function') {
                window.apiModule.saveQrMappings(qrMappings);
                console.log('QR-маппинги сохранены через apiModule, количество:', Object.keys(qrMappings).length);
            } else {
                // Запасной вариант - сохранение напрямую
                localStorage.setItem(QR_MAPPING_KEY, JSON.stringify(qrMappings));
                
                // Отправляем событие обновления QR-маппингов
                dispatchEvent(EVENTS.QR_MAPPINGS_UPDATED, {
                    count: Object.keys(qrMappings).length,
                    timestamp: new Date().toISOString()
                });
                
                console.log('QR-маппинги сохранены напрямую в localStorage, количество:', Object.keys(qrMappings).length);
            }
            
            return true;
        } catch (error) {
            console.error('Ошибка при сохранении QR-маппингов:', error);
            return false;
        }
    }
    
    /**
     * Получение данных карты по ключу
     * @param {string} cardKey - Ключ карты
     * @returns {Object|null} - Данные карты или null, если карта не найдена
     */
    function getCardByKey(cardKey) {
        return cardsData[cardKey] || null;
    }
    
    /**
     * Получение данных карты по QR-коду
     * @param {string} qrCode - QR-код
     * @returns {Object|null} - Данные карты или null, если карта не найдена
     */
    function getCardByQrCode(qrCode) {
        const cardKey = qrMappings[qrCode];
        if (cardKey) {
            return getCardByKey(cardKey);
        }
        return null;
    }
    
    /**
     * Получение соответствия QR-кода и ключа карты
     * @param {string} qrCode - QR-код
     * @returns {string|null} - Ключ карты или null, если соответствие не найдено
     */
    function getCardKeyByQrCode(qrCode) {
        return qrMappings[qrCode] || null;
    }
    
    /**
     * Обновление или добавление карты
     * @param {string} cardKey - Ключ карты
     * @param {Object} cardData - Данные карты
     * @returns {boolean} - Результат операции
     */
    function updateCard(cardKey, cardData) {
        try {
            if (!cardKey || !cardData) {
                console.error('Недостаточно данных для обновления карты');
                return false;
            }
            
            cardsData[cardKey] = cardData;
            saveCardsData();
            
            console.log('Карта обновлена:', cardKey);
            return true;
        } catch (error) {
            console.error('Ошибка при обновлении карты:', error);
            return false;
        }
    }
    
    /**
     * Удаление карты
     * @param {string} cardKey - Ключ карты
     * @returns {boolean} - Результат операции
     */
    function deleteCard(cardKey) {
        try {
            if (!cardKey || !cardsData[cardKey]) {
                console.error('Карта не найдена:', cardKey);
                return false;
            }
            
            delete cardsData[cardKey];
            saveCardsData();
            
            // Удаляем также соответствующие QR-маппинги
            Object.keys(qrMappings).forEach(qrCode => {
                if (qrMappings[qrCode] === cardKey) {
                    delete qrMappings[qrCode];
                }
            });
            saveQrMappings();
            
            console.log('Карта удалена:', cardKey);
            return true;
        } catch (error) {
            console.error('Ошибка при удалении карты:', error);
            return false;
        }
    }
    
    /**
     * Обновление соответствия QR-кода и ключа карты
     * @param {string} qrCode - QR-код
     * @param {string} cardKey - Ключ карты
     * @returns {boolean} - Результат операции
     */
    function updateQrMapping(qrCode, cardKey) {
        try {
            if (!qrCode || !cardKey) {
                console.error('Недостаточно данных для обновления QR-маппинга');
                return false;
            }
            
            // Проверяем существование карты
            if (!cardsData[cardKey]) {
                console.warn('Внимание: карта не найдена при создании QR-маппинга:', cardKey);
            }
            
            qrMappings[qrCode] = cardKey;
            
            // Используем apiModule для сохранения, если доступен
            if (window.apiModule && typeof window.apiModule.updateQrMapping === 'function') {
                return window.apiModule.updateQrMapping(qrCode, cardKey);
            } else {
                return saveQrMappings();
            }
        } catch (error) {
            console.error('Ошибка при обновлении QR-маппинга:', error);
            return false;
        }
    }
    
    /**
     * Удаление соответствия QR-кода
     * @param {string} qrCode - QR-код
     * @returns {boolean} - Результат операции
     */
    function removeQrMapping(qrCode) {
        try {
            if (!qrCode || !qrMappings[qrCode]) {
                console.error('QR-маппинг не найден:', qrCode);
                return false;
            }
            
            // Используем apiModule для удаления, если доступен
            if (window.apiModule && typeof window.apiModule.removeQrMapping === 'function') {
                return window.apiModule.removeQrMapping(qrCode);
            } else {
                delete qrMappings[qrCode];
                return saveQrMappings();
            }
        } catch (error) {
            console.error('Ошибка при удалении QR-маппинга:', error);
            return false;
        }
    }
    
    /**
     * Получение всех данных о картах
     * @returns {Object} - Объект с данными о картах
     */
    function getAllCards() {
        return { ...cardsData };
    }
    
    /**
     * Получение всех QR-маппингов
     * @returns {Object} - Объект с маппингами QR-кодов на ключи карт
     */
    function getAllQrMappings() {
        return { ...qrMappings };
    }
    
    /**
     * Импорт данных карт
     * @param {Object} importedCards - Импортируемые данные карт
     * @returns {boolean} - Результат операции
     */
    function importCards(importedCards) {
        try {
            if (!importedCards || typeof importedCards !== 'object') {
                console.error('Неверный формат данных для импорта карт');
                return false;
            }
            
            cardsData = { ...importedCards };
            saveCardsData();
            
            console.log('Импортировано карт:', Object.keys(cardsData).length);
            return true;
        } catch (error) {
            console.error('Ошибка при импорте карт:', error);
            return false;
        }
    }
    
    /**
     * Импорт QR-маппингов
     * @param {Object} importedMappings - Импортируемые QR-маппинги
     * @returns {boolean} - Результат операции
     */
    function importQrMappings(importedMappings) {
        try {
            if (!importedMappings || typeof importedMappings !== 'object') {
                console.error('Неверный формат данных для импорта QR-маппингов');
                return false;
            }
            
            qrMappings = { ...importedMappings };
            
            // Используем apiModule для сохранения, если доступен
            if (window.apiModule && typeof window.apiModule.saveQrMappings === 'function') {
                return window.apiModule.saveQrMappings(qrMappings);
            } else {
                return saveQrMappings();
            }
        } catch (error) {
            console.error('Ошибка при импорте QR-маппингов:', error);
            return false;
        }
    }
    
    /**
     * Синхронизация с основным хранилищем карт
     * @returns {boolean} - Результат операции
     */
    function syncWithMainStorage() {
        try {
            // Проверяем наличие глобальных данных карт
            if (window.cardsData && typeof window.cardsData === 'object') {
                const mainCards = window.cardsData;
                
                // Объединяем данные из основного хранилища с текущими
                Object.keys(mainCards).forEach(cardKey => {
                    // Если карта не существует или имеет более новую версию
                    if (!cardsData[cardKey] || 
                        (mainCards[cardKey].version && 
                         (!cardsData[cardKey].version || mainCards[cardKey].version > cardsData[cardKey].version))) {
                        cardsData[cardKey] = { ...mainCards[cardKey] };
                    }
                });
                
                saveCardsData();
                console.log('Синхронизировано с основным хранилищем карт, текущее количество:', Object.keys(cardsData).length);
                
                // Отправляем событие завершения синхронизации
                dispatchSyncEvent();
                
                return true;
            } else {
                console.warn('Основное хранилище карт не найдено для синхронизации');
                return false;
            }
        } catch (error) {
            console.error('Ошибка при синхронизации с основным хранилищем карт:', error);
            return false;
        }
    }
    
    /**
     * Отправка события обновления данных через EventBus
     * @param {string} eventType - Тип события
     * @param {Object} data - Данные события
     */
    function dispatchEvent(eventType, data) {
        if (window.EventBus && typeof window.EventBus.publish === 'function') {
            window.EventBus.publish(eventType, {
                ...data,
                timestamp: new Date().toISOString()
            });
            console.log('Отправлено событие:', eventType, data);
        }
    }
    
    /**
     * Отправка события завершения синхронизации
     */
    function dispatchSyncEvent() {
        dispatchEvent(EVENTS.SYNC_COMPLETED, {
            cardsCount: Object.keys(cardsData).length,
            mappingsCount: Object.keys(qrMappings).length,
            timestamp: new Date().toISOString()
        });
    }
    
    // Публичный API
    return {
        init,
        loadCardsData,
        saveCardsData,
        loadQrMappings,
        saveQrMappings,
        getCardByKey,
        getCardByQrCode,
        getCardKeyByQrCode,
        updateCard,
        deleteCard,
        updateQrMapping,
        removeQrMapping,
        getAllCards,
        getAllQrMappings,
        importCards,
        importQrMappings,
        syncWithMainStorage,
        EVENTS
    };
})();

// Экспорт модуля в глобальное пространство имен
window.cardSyncModule = CardSyncModule;

// Автоматическая инициализация модуля при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    if (window.cardSyncModule && typeof window.cardSyncModule.init === 'function') {
        setTimeout(function() {
            window.cardSyncModule.init();
        }, 600); // Небольшая задержка для уверенности, что другие зависимости загружены
    }
}); 