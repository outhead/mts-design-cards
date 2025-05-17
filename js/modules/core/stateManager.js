/**
 * stateManager.js
 * Модуль для централизованного управления состоянием приложения
 * Реализует упрощенный вариант паттерна Redux
 */

const StateManager = (function() {
    // Приватное состояние приложения
    let state = {
        // Пользовательские данные
        user: {
            id: null,
            telegramId: null,
            name: null,
            language: 'ru'
        },
        
        // Текущее состояние приложения
        app: {
            currentScreen: 'welcome', // welcome, question, loading, result
            initialized: false,
            loading: false,
            error: null
        },
        
        // Данные для предсказания
        prediction: {
            questionId: null,
            questionText: '',
            customQuestion: '',
            cardId: null,
            resultText: '',
            timestamp: null,
            selectionMethod: 'random', // 'random', 'image'
        },
        
        // Камера и изображение
        camera: {
            active: false,
            permissionGranted: false,
            capturedImage: null,
        },
        
        // Настройки
        settings: {
            darkMode: false,
            animationsEnabled: true,
            language: 'ru',
        }
    };
    
    // Обработчики подписок на изменения
    const subscribers = [];
    
    // История состояний (для отмены действий)
    const history = [];
    const maxHistoryLength = 10;
    
    // Получение текущего состояния (копия, чтобы избежать прямого изменения)
    function getState() {
        return JSON.parse(JSON.stringify(state));
    }
    
    // Получение части состояния
    function getStateSlice(path) {
        const keys = path.split('.');
        let slice = state;
        
        for (const key of keys) {
            if (slice[key] === undefined) {
                return undefined;
            }
            slice = slice[key];
        }
        
        return JSON.parse(JSON.stringify(slice));
    }
    
    // Обновление состояния
    function setState(newState, actionType = 'UPDATE_STATE') {
        // Сохраняем текущее состояние в истории
        if (history.length >= maxHistoryLength) {
            history.shift();
        }
        history.push(JSON.parse(JSON.stringify(state)));
        
        // Обновляем состояние
        state = { ...state, ...newState };
        
        // Уведомляем подписчиков
        notifySubscribers(actionType);
        
        // Публикуем событие в шину событий, если она доступна
        if (window.EventBus && typeof window.EventBus.publish === 'function') {
            window.EventBus.publish('stateChanged', { 
                state: getState(),
                actionType
            });
        }
        
        return state;
    }
    
    // Обновление части состояния по пути
    function setStateByPath(path, value, actionType = 'UPDATE_PATH') {
        const keys = path.split('.');
        const newState = JSON.parse(JSON.stringify(state));
        let current = newState;
        
        // Проходим по пути до предпоследнего ключа
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (current[key] === undefined) {
                current[key] = {};
            }
            current = current[key];
        }
        
        // Устанавливаем значение последнего ключа
        current[keys[keys.length - 1]] = value;
        
        // Обновляем состояние
        return setState(newState, actionType);
    }
    
    // Отмена последнего действия
    function undo() {
        if (history.length === 0) {
            return state;
        }
        
        state = history.pop();
        notifySubscribers('UNDO');
        
        return state;
    }
    
    // Подписка на изменения состояния
    function subscribe(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Subscriber must be a function');
        }
        
        if (subscribers.indexOf(callback) === -1) {
            subscribers.push(callback);
        }
        
        // Возвращаем функцию отписки
        return function unsubscribe() {
            const index = subscribers.indexOf(callback);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
        };
    }
    
    // Уведомление подписчиков
    function notifySubscribers(actionType) {
        subscribers.forEach(callback => {
            try {
                callback(state, actionType);
            } catch (error) {
                console.error('Error in state subscriber:', error);
            }
        });
    }
    
    // Сброс состояния к начальному
    function resetState() {
        return setState({
            // Пользовательские данные
            user: {
                id: state.user.id, // Сохраняем ID пользователя
                telegramId: state.user.telegramId, // Сохраняем Telegram ID
                name: state.user.name, // Сохраняем имя пользователя
                language: state.user.language // Сохраняем язык
            },
            
            // Текущее состояние приложения
            app: {
                currentScreen: 'welcome',
                initialized: true,
                loading: false,
                error: null
            },
            
            // Данные для предсказания
            prediction: {
                questionId: null,
                questionText: '',
                customQuestion: '',
                cardId: null,
                resultText: '',
                timestamp: null,
                selectionMethod: 'random',
            },
            
            // Камера и изображение
            camera: {
                active: false,
                permissionGranted: state.camera.permissionGranted, // Сохраняем разрешение на камеру
                capturedImage: null,
            },
            
            // Настройки сохраняем
            settings: { ...state.settings }
        }, 'RESET_STATE');
    }
    
    // Публичный API
    return {
        getState,
        getStateSlice,
        setState,
        setStateByPath,
        subscribe,
        undo,
        resetState
    };
})();

// Экспорт модуля
window.StateManager = StateManager; 