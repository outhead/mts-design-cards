/**
 * cardLoader.js
 * Компонент для загрузки карт и работы с QR-кодами в основной странице
 */

const CardLoader = (function() {
    /**
     * Инициализация компонента
     */
    function init() {
        console.log('Инициализация компонента загрузки карт...');
        
        // Проверка доступности модуля синхронизации карт
        if (!window.cardSyncModule) {
            console.error('Модуль синхронизации карт недоступен. Проверьте подключение скриптов.');
            return;
        }
        
        // Проверка и загрузка карт из основного источника
        ensureCardsLoaded();
        
        // Синхронизируем карты между хранилищами
        window.cardSyncModule.syncWithMainStorage();
        
        // Проверяем QR-соответствия
        validateQrMappings();
        
        // Подписываемся на события обновления карт
        subscribeToEvents();
        
        console.log('Компонент загрузки карт инициализирован');
    }
    
    /**
     * Проверка и обеспечение загрузки карт из основного источника
     */
    function ensureCardsLoaded() {
        // Проверяем, доступны ли данные карт в глобальной переменной
        if (!window.cardsData || typeof window.cardsData !== 'object' || Object.keys(window.cardsData).length === 0) {
            console.warn('Основное хранилище карт не доступно или пусто');
            
            // Пытаемся загрузить из модуля синхронизации карт
            const syncedCards = window.cardSyncModule.getAllCards();
            if (Object.keys(syncedCards).length > 0) {
                console.log('Загружены карты из модуля синхронизации:', Object.keys(syncedCards).length);
                window.cardsData = syncedCards;
            } else {
                console.error('Не удалось найти карты ни в одном источнике');
            }
        } else {
            console.log('Основное хранилище карт доступно, количество карт:', Object.keys(window.cardsData).length);
        }
        
        return window.cardsData;
    }
    
    /**
     * Проверка QR-маппингов в соответствии с доступными картами
     */
    function validateQrMappings() {
        if (!window.cardSyncModule) {
            console.error('Модуль синхронизации карт недоступен');
            return;
        }
        
        // Получаем все карты и QR-маппинги
        const cards = window.cardSyncModule.getAllCards();
        const mappings = window.cardSyncModule.getAllQrMappings();
        
        console.log('Проверка QR-маппингов...');
        console.log('Доступно карт:', Object.keys(cards).length);
        console.log('Доступно QR-маппингов:', Object.keys(mappings).length);
        
        // Проверяем, есть ли маппинги на несуществующие карты
        Object.entries(mappings).forEach(([qrCode, cardKey]) => {
            if (!cards[cardKey]) {
                console.warn(`QR-код ${qrCode} ссылается на несуществующую карту ${cardKey}`);
            }
        });
        
        // Проверяем, у всех ли карт есть QR-код
        const cardKeys = Object.keys(cards);
        const mappedCardKeys = Object.values(mappings);
        
        const unmappedCards = cardKeys.filter(cardKey => !mappedCardKeys.includes(cardKey));
        if (unmappedCards.length > 0) {
            console.log(`Найдено ${unmappedCards.length} карт без QR-маппингов:`, unmappedCards);
        }
    }
    
    /**
     * Получение карты по QR-коду
     * @param {string} qrCode - QR-код
     * @returns {Object|null} - Данные карты или null, если карта не найдена
     */
    function getCardByQrCode(qrCode) {
        if (!window.cardSyncModule) {
            console.error('Модуль синхронизации карт недоступен');
            return null;
        }
        
        return window.cardSyncModule.getCardByQrCode(qrCode);
    }
    
    /**
     * Получение ключа карты по QR-коду
     * @param {string} qrCode - QR-код
     * @returns {string|null} - Ключ карты или null, если соответствие не найдено
     */
    function getCardKeyByQrCode(qrCode) {
        if (!window.cardSyncModule) {
            console.error('Модуль синхронизации карт недоступен');
            return null;
        }
        
        return window.cardSyncModule.getCardKeyByQrCode(qrCode);
    }
    
    /**
     * Получение всех карт
     * @returns {Object} - Объект с данными о картах
     */
    function getAllCards() {
        if (!window.cardSyncModule) {
            console.error('Модуль синхронизации карт недоступен');
            return {};
        }
        
        return window.cardSyncModule.getAllCards();
    }
    
    /**
     * Подписка на события обновления карт
     */
    function subscribeToEvents() {
        if (!window.EventBus || typeof window.EventBus.subscribe !== 'function') {
            console.warn('EventBus недоступен для подписки на события');
            return;
        }
        
        // Обновление данных при синхронизации карт
        window.EventBus.subscribe('cards_sync_completed', function(data) {
            console.log('Получено событие завершения синхронизации карт:', data);
            ensureCardsLoaded();
        });
        
        // Обновление при изменении карт
        window.EventBus.subscribe('cards_data_updated', function(data) {
            console.log('Получено событие обновления данных карт:', data);
            ensureCardsLoaded();
        });
        
        // Обновление при изменении QR-маппингов
        window.EventBus.subscribe('QR_MAPPINGS_UPDATED', function(data) {
            console.log('Получено событие обновления QR-маппингов:', data);
            validateQrMappings();
        });
    }
    
    // Публичный API
    return {
        init,
        ensureCardsLoaded,
        validateQrMappings,
        getCardByQrCode,
        getCardKeyByQrCode,
        getAllCards
    };
})();

// Экспорт компонента в глобальное пространство имен
window.cardLoader = CardLoader;

// Автоматическая инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    if (window.cardLoader && typeof window.cardLoader.init === 'function') {
        setTimeout(function() {
            window.cardLoader.init();
        }, 700); // Задержка для загрузки всех зависимостей
    }
}); 