/**
 * eventBus.js
 * Модуль для обмена событиями между модулями приложения (паттерн Publisher-Subscriber)
 */

const EventBus = (function() {
    // Приватное хранилище для подписчиков
    const subscribers = {};
    
    // Добавление обработчика события
    function subscribe(event, callback) {
        if (!subscribers[event]) {
            subscribers[event] = [];
        }
        
        // Проверка на дублирование подписки
        if (subscribers[event].indexOf(callback) === -1) {
            subscribers[event].push(callback);
        }
        
        // Возвращаем функцию для отписки
        return function unsubscribe() {
            const index = subscribers[event].indexOf(callback);
            if (index !== -1) {
                subscribers[event].splice(index, 1);
            }
        };
    }
    
    // Публикация события с данными
    function publish(event, data) {
        if (!subscribers[event]) {
            return;
        }
        
        // Вызываем всех подписчиков с переданными данными
        subscribers[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in EventBus handler for event "${event}":`, error);
            }
        });
    }
    
    // Очистка всех обработчиков для события
    function clear(event) {
        if (event) {
            subscribers[event] = [];
        } else {
            // Очистка всех событий если событие не указано
            Object.keys(subscribers).forEach(key => {
                subscribers[key] = [];
            });
        }
    }
    
    // Получение списка подписчиков (для отладки)
    function getSubscribers(event) {
        return event ? subscribers[event] : subscribers;
    }
    
    // Публичный API
    return {
        subscribe,
        publish,
        clear,
        getSubscribers
    };
})();

// Экспорт модуля
window.EventBus = EventBus; 