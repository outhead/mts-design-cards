/**
 * app-main.js
 * Основной файл приложения с модульной архитектурой
 * Отвечает за загрузку и инициализацию всех модулей
 * 
 * Версия 2.0 (рефакторинг)
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('MTS Design Weekend - Карты предсказаний v2.0');
    
    // Конфигурация модулей
    const modules = [
        // Утилиты и сервисы - загружаются первыми
        { 
            name: 'Logger', 
            path: 'js/utils/logger.js',
            required: true
        },
        { 
            name: 'EventBus', 
            path: 'js/utils/eventBus.js',
            required: true
        },
        { 
            name: 'StateManager', 
            path: 'js/modules/core/stateManager.js',
            required: true
        },
        
        // Данные - загружаются после утилит
        { 
            name: 'CardsData', 
            path: 'js/cards-data.js',
            required: true
        },
        { 
            name: 'PredictionsData', 
            path: 'js/predictions.js',
            required: true
        },
        
        // API модуль - загружается перед основными модулями
        { 
            name: 'ApiModule', 
            path: 'js/modules/apiModule.js',
            required: false
        },
        
        // Модуль синхронизации карт
        { 
            name: 'CardSyncModule', 
            path: 'js/modules/cardSyncModule.js',
            required: false
        },
        
        // Загрузчик карт
        { 
            name: 'CardLoader', 
            path: 'js/components/cardLoader.js',
            required: false
        },
        
        // Основные модули приложения
        { 
            name: 'UIManager', 
            path: 'js/modules/uiManager.js',
            required: true
        },
        { 
            name: 'CameraModule', 
            path: 'js/modules/cameraModule.js',
            required: true
        },
        { 
            name: 'StatsModule', 
            path: 'js/modules/statsModule.js',
            required: false
        },
        { 
            name: 'PredictionModule', 
            path: 'js/modules/predictionModule.js',
            required: true
        },
        { 
            name: 'MainPage', 
            path: 'js/modules/mainPage.js',
            required: true
        },
        
        // Основной модуль приложения загружается последним
        { 
            name: 'AppModule', 
            path: 'js/modules/appModule.js',
            required: true
        },
        
        // Отладочная панель (загружается самой последней)
        { 
            name: 'DebugPanel', 
            path: 'js/debug-panel.js',
            required: false
        }
    ];
    
    // Массив для хранения промисов загрузки модулей
    const modulePromises = [];
    
    // Функция загрузки отдельного модуля
    function loadModule(module) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = module.path;
            script.async = false; // Загружаем синхронно для сохранения порядка
            
            script.onload = () => {
                console.log(`Загружен модуль: ${module.name}`);
                resolve(module);
            };
            
            script.onerror = () => {
                const error = `Ошибка загрузки модуля: ${module.name} (${module.path})`;
                console.error(error);
                
                if (module.required) {
                    reject(new Error(error));
                } else {
                    console.warn(`Модуль ${module.name} не является обязательным, продолжаем загрузку.`);
                    resolve(null);
                }
            };
            
            document.head.appendChild(script);
        });
    }
    
    // Последовательная загрузка модулей
    async function loadModules() {
        try {
            // Отображаем индикатор загрузки или начальный экран
            showLoadingIndicator(true);
            
            for (const module of modules) {
                await loadModule(module);
            }
            
            console.log('Все модули успешно загружены');
            
            // Инициализируем приложение
            initializeApp();
            
            // Скрываем экран начальной загрузки
            const loadingInitScreen = document.getElementById('loading-init-screen');
            if (loadingInitScreen) {
                // Плавное скрытие
                loadingInitScreen.style.opacity = '0';
                loadingInitScreen.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    loadingInitScreen.style.display = 'none';
                }, 500);
            }
            
        } catch (error) {
            console.error('Критическая ошибка при загрузке модулей:', error);
            showErrorMessage('Ошибка при загрузке приложения. Пожалуйста, перезагрузите страницу.');
        } finally {
            // Скрываем индикатор загрузки
            showLoadingIndicator(false);
        }
    }
    
    // Инициализация приложения после загрузки всех модулей
    function initializeApp() {
        // Проверяем, что все необходимые модули загружены, но делаем это более гибко
        const appModuleAvailable = window.AppModule || window.app || window.appModule;
        const stateManagerAvailable = window.StateManager || window.stateManager;
        const eventBusAvailable = window.EventBus || window.eventBus;
        
        if (!appModuleAvailable) {
            console.error('Не удалось загрузить AppModule. Проверьте, что модуль корректно загружен и экспортирован.');
            showErrorMessage('Ошибка при инициализации приложения. Пожалуйста, перезагрузите страницу.');
            return;
        }
        
        // Выводим предупреждение о проблемах с модулями, но продолжаем инициализацию
        if (!stateManagerAvailable || !eventBusAvailable) {
            console.warn('Некоторые модули отсутствуют или не экспортированы корректно:',
                !stateManagerAvailable ? 'StateManager' : '',
                !eventBusAvailable ? 'EventBus' : '');
            console.warn('Приложение может работать некорректно.');
        }
        
        try {
            // Создаем глобальный объект app, если его нет
            if (!window.app) {
                window.app = {};
                console.log('Создан новый глобальный объект window.app в initializeApp');
            }
            
            // Устанавливаем глобальные ссылки на модули, если они ещё не установлены
            window.app = window.app || appModuleAvailable;
            window.StateManager = stateManagerAvailable;
            window.EventBus = eventBusAvailable;
            
            // Определяем минимальное начальное состояние приложения
            const initialState = {
                app: { 
                    initialized: true,
                    currentScreen: 'welcome',
                    loading: false
                }
            };
            
            // Устанавливаем начальное состояние, если StateManager доступен
            if (window.StateManager && typeof window.StateManager.setState === 'function') {
                window.StateManager.setState(initialState);
            } else {
                console.warn('StateManager.setState недоступен, пропускаем установку начального состояния');
                // Создаем временное хранилище состояния, если StateManager недоступен
                window.appState = initialState;
            }
            
            // Публикуем событие о готовности приложения, если EventBus доступен
            if (window.EventBus && typeof window.EventBus.publish === 'function') {
                window.EventBus.publish('APP_INITIALIZED', { timestamp: new Date().getTime() });
            } else {
                console.warn('EventBus.publish недоступен, пропускаем публикацию события APP_INITIALIZED');
            }
            
            try {
                // Запускаем основной модуль приложения
                if (typeof window.app.init === 'function') {
                    window.app.init();
                } else if (typeof window.app.initApp === 'function') {
                    window.app.initApp();
                } else if (appModuleAvailable && typeof appModuleAvailable.init === 'function') {
                    appModuleAvailable.init();
                } else if (appModuleAvailable && typeof appModuleAvailable.initApp === 'function') {
                    appModuleAvailable.initApp();
                } else {
                    console.warn('Метод инициализации (init/initApp) не найден в AppModule');
                    // Попытка найти возможные альтернативные методы инициализации
                    const possibleInitMethods = ['initialize', 'start', 'run', 'boot'];
                    let methodFound = false;
                    
                    for (const method of possibleInitMethods) {
                        if (typeof window.app[method] === 'function') {
                            console.log(`Найден альтернативный метод инициализации: ${method}`);
                            try {
                                window.app[method]();
                                methodFound = true;
                                break;
                            } catch (initError) {
                                console.error(`Ошибка при вызове альтернативного метода ${method}:`, initError);
                            }
                        }
                    }
                    
                    if (!methodFound) {
                        // Если метод инициализации не найден, попробуем ручную инициализацию
                        console.warn('Метод инициализации не найден, выполняем базовую инициализацию UI');
                        
                        // Базовая инициализация UI - показываем начальный экран
                        const welcomeScreen = document.getElementById('welcome-screen');
                        if (welcomeScreen) {
                            // Скрываем все экраны
                            document.querySelectorAll('[id$="-screen"]').forEach(screen => {
                                screen.style.display = 'none';
                            });
                            
                            // Показываем welcome-screen
                            welcomeScreen.style.display = 'flex';
                            console.log('Начальный экран отображен вручную');
                        }
                    }
                }
                
                console.log('Приложение успешно инициализировано');
            } catch (initError) {
                console.error('Ошибка при инициализации приложения:', initError);
                console.warn('Пытаемся продолжить выполнение приложения, несмотря на ошибку...');
                
                // Базовая инициализация UI при ошибке
                const welcomeScreen = document.getElementById('welcome-screen');
                if (welcomeScreen) {
                    // Скрываем все экраны
                    document.querySelectorAll('[id$="-screen"]').forEach(screen => {
                        screen.style.display = 'none';
                    });
                    
                    // Показываем welcome-screen
                    welcomeScreen.style.display = 'flex';
                    console.log('Начальный экран отображен вручную после ошибки');
                }
            }
            
        } catch (error) {
            console.error('Критическая ошибка при инициализации приложения:', error);
            showErrorMessage('Ошибка при запуске приложения. Пожалуйста, перезагрузите страницу.');
        }
    }
    
    // Простой индикатор загрузки
    function showLoadingIndicator(show) {
        // Используем существующий элемент loading-screen если он есть
        const loadingScreen = document.getElementById('loading-screen');
        
        if (loadingScreen) {
            loadingScreen.style.display = show ? 'flex' : 'none';
        } else if (show) {
            console.log('Загрузка приложения...');
        }
    }
    
    // Отображение сообщения об ошибке
    function showErrorMessage(message) {
        // Скрываем индикатор загрузки
        showLoadingIndicator(false);
        
        // Используем новую функцию отображения ошибок, если она доступна
        if (typeof window.showAppError === 'function') {
            window.showAppError(message);
            return;
        }
        
        // Используем элемент для вывода ошибок или создаем новый (запасной вариант)
        let errorContainer = document.getElementById('error-container');
        
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.id = 'error-container';
            errorContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px;
                text-align: center;
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            document.body.appendChild(errorContainer);
        }
        
        errorContainer.innerHTML = `
            <div style="background-color: rgba(227, 6, 19, 0.9); padding: 30px; border-radius: 10px; max-width: 80%;">
                <h3 style="margin-top: 0; margin-bottom: 20px;">Ошибка</h3>
                <p>${message}</p>
                <button onclick="window.location.reload()" style="
                    background-color: white;
                    color: #E30613;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    margin-top: 20px;
                    cursor: pointer;
                    font-weight: bold;
                ">Перезагрузить</button>
            </div>
        `;
        
        errorContainer.style.display = 'flex';
        
        // Скрываем экран инициализации, если он есть
        const loadingInitScreen = document.getElementById('loading-init-screen');
        if (loadingInitScreen) {
            loadingInitScreen.style.display = 'none';
        }
    }
    
    // Запускаем загрузку модулей
    loadModules();
}); 