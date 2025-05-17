/**
 * Скрипт админ-панели для управления картами и предсказаниями
 * MTS Design Weekend
 */

// Данные карт из общего модуля - исправлена ошибка с повторным объявлением
console.log('Инициализация admin.js - проверяем наличие cardsData:', window.cardsData);

// Создаем пустой объект cards, если он не существует (для избежания ошибок)
const cards = window.cardsData?.cards || {};

// Используем уже существующие карты вместо повторного объявления
let adminCards = window.cardsData?.cards || {};

// Добавляем отладку для отслеживания данных
console.log('Карты в админке при инициализации:', adminCards ? Object.keys(adminCards).length : 0);

// Загружаем карты из localStorage если они там есть
function loadCardsFromStorage() {
    if (window.cardsData && typeof window.cardsData.loadCardsFromStorage === 'function') {
        adminCards = window.cardsData.loadCardsFromStorage();
        console.log('Карты загружены из общего модуля:', Object.keys(adminCards).length);
    } else {
        const savedCards = localStorage.getItem('designCards');
        if (savedCards) {
            try {
                const parsedCards = JSON.parse(savedCards);
                if (parsedCards && Object.keys(parsedCards).length > 0) {
                    adminCards = parsedCards;
                    console.log('Загружены карты из localStorage (запасной метод):', Object.keys(adminCards).length);
                }
            } catch (e) {
                console.error('Ошибка при загрузке карт из localStorage:', e);
            }
        }
    }
}

// Инициализация глобального объекта для хранения статистики
window.adminStats = {
    totalUsers: 0,
    totalPredictions: 0,
    todayPredictions: 0,
    shares: 0,
    lastUpdate: null
};

// Загрузка статистики из localStorage
function loadStatsFromStorage() {
    console.log('Попытка загрузки статистики из localStorage');
    
    // Пробуем загрузить статистику из модуля statsModule
    if (window.statsModule && typeof window.statsModule.getStats === 'function') {
        const moduleStats = window.statsModule.getStats();
        if (moduleStats) {
            console.log('Загружена статистика из модуля statsModule:', moduleStats);
            // Обновляем объект adminStats значениями из модуля
            Object.assign(window.adminStats, moduleStats);
            return true;
        }
    }
    
    // Запасной вариант - загрузка напрямую из localStorage
    const savedStats = localStorage.getItem('appStats');
    if (savedStats) {
        try {
            const parsedStats = JSON.parse(savedStats);
            if (parsedStats) {
                console.log('Загружена статистика из localStorage:', parsedStats);
                // Обновляем объект adminStats значениями из хранилища
                Object.assign(window.adminStats, parsedStats);
                return true;
            }
        } catch (e) {
            console.error('Ошибка при загрузке статистики из localStorage:', e);
        }
    }
    
    console.log('Статистика в localStorage не найдена, используем начальные значения');
    return false;
}

// API-ключ для GPT (будет храниться в localStorage)
let gptApiKey = localStorage.getItem('gptApiKey') || '';
let isGptEnabled = localStorage.getItem('isGptEnabled') === 'true';

// Активности из localStorage (реальные данные)
let activities = [];

// Попытка загрузить активности из localStorage
function loadActivitiesFromStorage() {
    console.log('------- Загрузка активностей пользователей -------');
    
    const savedActivities = localStorage.getItem('userActivities');
    console.log('Значение userActivities в localStorage:', savedActivities ? 'найдено' : 'не найдено');
    
    if (savedActivities) {
        try {
            const parsedActivities = JSON.parse(savedActivities);
            console.log('Данные успешно распарсены:', typeof parsedActivities, Array.isArray(parsedActivities));
            
            if (Array.isArray(parsedActivities) && parsedActivities.length > 0) {
                // Обновляем глобальную переменную
                window.activities = parsedActivities;
                activities = parsedActivities;
                
                // Выводим отладочную информацию о загруженных активностях
                console.log('Загружены активности из localStorage:', activities.length);
                
                // Подсчитываем количество активностей каждого типа
                const typeCounts = {
                    question: 0,
                    prediction: 0,
                    share: 0,
                    visit: 0,
                    other: 0
                };
                
                activities.forEach(activity => {
                    if (activity.type === 'question') {
                        typeCounts.question++;
                        console.log('Вопрос:', activity.details, 'Дата:', activity.timestamp);
                    } else if (activity.type === 'prediction') {
                        typeCounts.prediction++;
                    } else if (activity.type === 'share') {
                        typeCounts.share++;
                    } else if (activity.type === 'visit') {
                        typeCounts.visit++;
                    } else {
                        typeCounts.other++;
                    }
                });
                
                console.log('Статистика типов активностей:', typeCounts);
                return activities;
            }
        } catch (e) {
            console.error('Ошибка при загрузке активностей из localStorage:', e);
        }
    }
    
    // Если нет сохраненных активностей, создаем пустой массив
    window.activities = [];
    activities = [];
    console.log('Активности в localStorage не найдены или некорректны, используем пустой массив');
    console.log('------- Конец загрузки активностей пользователей -------');
    return activities;
}

// Объект для хранения ссылок на UI элементы
const elements = {
    totalUsers: null,
    totalPredictions: null,
    todayPredictions: null,
    totalShares: null,
    refreshStatsBtn: null
};

// Модуль аналитики админ-панели
const AdminAnalytics = {
  sessionStarted: false,
  sessionData: {},
  
  // Инициализация сессии администратора
  initSession: function() {
    if (this.sessionStarted) return;
    
    this.sessionData = {
      startTime: new Date().toISOString(),
      adminId: localStorage.getItem('adminId') || this.generateAdminId(),
      sessionActions: [],
      systemInfo: {
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        userAgent: navigator.userAgent,
        platform: navigator.platform
      }
    };
    
    // Сохраняем ID администратора, если его еще нет
    if (!localStorage.getItem('adminId')) {
      localStorage.setItem('adminId', this.sessionData.adminId);
    }
    
    this.sessionStarted = true;
    this.trackAction('session_start', { pageUrl: window.location.href });
    
    console.log('Админ-сессия инициализирована:', this.sessionData.adminId);
    
    // Отслеживаем завершение сессии
    window.addEventListener('beforeunload', () => {
      this.trackAction('session_end', { 
        duration: Math.floor((new Date() - new Date(this.sessionData.startTime)) / 1000),
        actionCount: this.sessionData.sessionActions.length
      });
      
      this.saveSessionData();
    });
  },
  
  // Генерация уникального ID администратора
  generateAdminId: function() {
    return 'admin-' + Math.random().toString(36).substring(2, 15);
  },
  
  // Отслеживание действий администратора
  trackAction: function(actionType, data = {}) {
    if (!this.sessionStarted) this.initSession();
    
    const actionData = {
      timestamp: new Date().toISOString(),
      type: actionType,
      ...data
    };
    
    this.sessionData.sessionActions.push(actionData);
    
    // Для отладки
    console.log('Админ-действие:', actionType, actionData);
    
    // Сохраняем данные сессии после важных действий
    if (['edit_card', 'add_card', 'delete_card', 'update_settings', 'export_data'].includes(actionType)) {
      this.saveSessionData();
    }
  },
  
  // Сохранение данных сессии
  saveSessionData: function() {
    // В реальном приложении данные отправлялись бы на сервер
    const sessionHistoryString = localStorage.getItem('adminSessionHistory');
    let sessionHistory = sessionHistoryString ? JSON.parse(sessionHistoryString) : [];
    
    // Ограничиваем историю до 10 последних сессий
    sessionHistory.unshift({
      adminId: this.sessionData.adminId,
      startTime: this.sessionData.startTime,
      endTime: new Date().toISOString(),
      actionCount: this.sessionData.sessionActions.length,
      lastAction: this.sessionData.sessionActions.length > 0 
        ? this.sessionData.sessionActions[this.sessionData.sessionActions.length - 1].type 
        : null
    });
    
    if (sessionHistory.length > 10) {
      sessionHistory = sessionHistory.slice(0, 10);
    }
    
    localStorage.setItem('adminSessionHistory', JSON.stringify(sessionHistory));
    
    console.log('Данные сессии сохранены');
  },
  
  // Сбор статистики использования системы
  collectUsageStatistics: function() {
    return {
      editOperations: this.sessionData.sessionActions.filter(a => a.type === 'edit_card').length,
      addOperations: this.sessionData.sessionActions.filter(a => a.type === 'add_card').length,
      deleteOperations: this.sessionData.sessionActions.filter(a => a.type === 'delete_card').length,
      viewOperations: this.sessionData.sessionActions.filter(a => a.type.startsWith('view_')).length,
      exportOperations: this.sessionData.sessionActions.filter(a => a.type.startsWith('export_')).length,
      totalActions: this.sessionData.sessionActions.length,
      mostUsedFeature: this.getMostUsedFeature()
    };
  },
  
  // Получение наиболее используемой функции
  getMostUsedFeature: function() {
    if (this.sessionData.sessionActions.length === 0) return null;
    
    const actionCounts = {};
    this.sessionData.sessionActions.forEach(action => {
      const type = action.type;
      actionCounts[type] = (actionCounts[type] || 0) + 1;
    });
    
    let maxCount = 0;
    let mostUsedFeature = null;
    
    for (const [feature, count] of Object.entries(actionCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostUsedFeature = feature;
      }
    }
    
    return { feature: mostUsedFeature, count: maxCount };
  }
};

// Модуль управления пользовательской аналитикой
const AnalyticsManager = {
  isEnabled: true,
  dataRetention: 90, // дней
  anonymizeLevel: 'partial',
  trackingFrequency: 'medium',
  
  // Инициализация настроек из сохраненных значений
  init: function() {
    // Загружаем настройки из localStorage
    this.isEnabled = localStorage.getItem('analyticsEnabled') !== 'false';
    this.dataRetention = parseInt(localStorage.getItem('dataRetention') || '90', 10);
    this.anonymizeLevel = localStorage.getItem('anonymizeLevel') || 'partial';
    this.trackingFrequency = localStorage.getItem('trackingFrequency') || 'medium';
    
    // Обновляем UI
    this.updateUI();
    
    // Настраиваем обработчики событий
    this.setupEventListeners();
    
    console.log('Менеджер аналитики инициализирован:', {
      isEnabled: this.isEnabled,
      dataRetention: this.dataRetention,
      anonymizeLevel: this.anonymizeLevel,
      trackingFrequency: this.trackingFrequency
    });
  },
  
  // Обновление UI в соответствии с текущими настройками
  updateUI: function() {
    const enabledCheckbox = document.getElementById('analytics-enabled');
    const dataRetentionSelect = document.getElementById('data-retention');
    const anonymizeLevelSelect = document.getElementById('anonymize-level');
    const trackingFrequencySelect = document.getElementById('tracking-frequency');
    
    if (enabledCheckbox) {
      enabledCheckbox.checked = this.isEnabled;
    }
    
    if (dataRetentionSelect) {
      dataRetentionSelect.value = this.dataRetention.toString();
    }
    
    if (anonymizeLevelSelect) {
      anonymizeLevelSelect.value = this.anonymizeLevel;
    }
    
    if (trackingFrequencySelect) {
      trackingFrequencySelect.value = this.trackingFrequency;
    }
  },
  
  // Настройка обработчиков событий
  setupEventListeners: function() {
    const saveButton = document.getElementById('save-analytics-settings');
    if (saveButton) {
      saveButton.addEventListener('click', () => this.saveSettings());
    }
    
    const testButton = document.getElementById('test-analytics');
    if (testButton) {
      testButton.addEventListener('click', () => this.testAnalytics());
    }
    
    const toggleSwitch = document.getElementById('analytics-enabled');
    if (toggleSwitch) {
      toggleSwitch.addEventListener('change', () => {
        this.isEnabled = toggleSwitch.checked;
        AdminAnalytics.trackAction('toggle_analytics', { enabled: this.isEnabled });
      });
    }
  },
  
  // Сохранение настроек
  saveSettings: function() {
    const enabledCheckbox = document.getElementById('analytics-enabled');
    const dataRetentionSelect = document.getElementById('data-retention');
    const anonymizeLevelSelect = document.getElementById('anonymize-level');
    const trackingFrequencySelect = document.getElementById('tracking-frequency');
    
    if (enabledCheckbox) this.isEnabled = enabledCheckbox.checked;
    if (dataRetentionSelect) this.dataRetention = parseInt(dataRetentionSelect.value, 10);
    if (anonymizeLevelSelect) this.anonymizeLevel = anonymizeLevelSelect.value;
    if (trackingFrequencySelect) this.trackingFrequency = trackingFrequencySelect.value;
    
    // Сохраняем настройки в localStorage
    localStorage.setItem('analyticsEnabled', this.isEnabled);
    localStorage.setItem('dataRetention', this.dataRetention);
    localStorage.setItem('anonymizeLevel', this.anonymizeLevel);
    localStorage.setItem('trackingFrequency', this.trackingFrequency);
    
    AdminAnalytics.trackAction('save_analytics_settings', {
      isEnabled: this.isEnabled,
      dataRetention: this.dataRetention,
      anonymizeLevel: this.anonymizeLevel,
      trackingFrequency: this.trackingFrequency
    });
    
    // Показываем уведомление о сохранении
    showNotification('Настройки аналитики сохранены', 'success');
  },
  
  // Тестирование сбора аналитики
  testAnalytics: function() {
    if (!this.isEnabled) {
      showNotification('Аналитика отключена. Включите её для тестирования.', 'error');
      return;
    }
    
    // Тестовое событие
    const testResult = {
      timestamp: new Date().toISOString(),
      success: true,
      sampleData: {
        sessionId: 'test-session-' + Math.random().toString(36).substring(2, 9),
        testAction: 'view_card',
        anonymizedIp: this.anonymizeIP('192.168.1.1'),
        device: 'desktop',
        browser: 'Chrome'
      }
    };
    
    console.log('Тест аналитики:', testResult);
    
    AdminAnalytics.trackAction('test_analytics', { result: 'success' });
    
    // Имитация отправки данных на сервер
    setTimeout(() => {
      showNotification('Тест аналитики успешно выполнен. Данные готовы к отправке.', 'success');
    }, 800);
  },
  
  // Анонимизация IP-адреса в зависимости от уровня
  anonymizeIP: function(ip) {
    if (this.anonymizeLevel === 'full') {
      return 'anonymized';
    } else if (this.anonymizeLevel === 'partial') {
      // Заменяем последний октет (192.168.1.xxx)
      return ip.replace(/\d+$/, 'xxx');
    } else {
      return ip; // minimal - не анонимизируем
    }
  },
  
  // Создание отчета об использовании данных
  generateDataUsageReport: function() {
    const report = {
      timestamp: new Date().toISOString(),
      settings: {
        isEnabled: this.isEnabled,
        dataRetention: this.dataRetention,
        anonymizeLevel: this.anonymizeLevel,
        trackingFrequency: this.trackingFrequency
      },
      estimatedDataSize: {
        daily: '~1.2 MB',
        monthly: '~36 MB',
        total: '~110 MB'
      },
      autoDeleteDate: new Date(Date.now() + this.dataRetention * 24 * 60 * 60 * 1000).toISOString(),
      userCount: window.adminStats.totalUsers,
      eventsCount: window.adminStats.totalPredictions * 3 // примерно 3 события на предсказание
    };
    
    return report;
  }
};

// Создание тестовых данных, если необходимо
function createTestDataIfNeeded() {
    console.log('Проверяем необходимость создания тестовых данных...');
    
    // Проверяем наличие статистики
    if (!window.adminStats) {
        console.log('window.adminStats не существует, создаем тестовые данные');
        window.adminStats = {
            totalUsers: Math.floor(Math.random() * 1000) + 100,
            totalPredictions: Math.floor(Math.random() * 5000) + 1000,
            todayPredictions: Math.floor(Math.random() * 200) + 50,
            shares: Math.floor(Math.random() * 500) + 100,
            lastUpdate: new Date().toISOString()
        };
        
        // Сохраняем тестовые данные в localStorage
        try {
            localStorage.setItem('statsData', JSON.stringify(window.adminStats));
            console.log('Сохранены тестовые данные статистики');
        } catch (e) {
            console.error('Ошибка при сохранении тестовых данных статистики:', e);
        }
    } else {
        console.log('window.adminStats существует, тестовые данные не нужны');
    }
    
    // Проверяем наличие активностей
    if (!activities || activities.length === 0) {
        console.log('Активности не найдены, создаем тестовые активности');
        
        const testActivities = [];
        const now = new Date();
        
        // Создаем тестовые вопросы
        [
            'Когда мне повысят зарплату?',
            'Что меня ждет на новом проекте?',
            'Сменить ли мне работу в этом году?',
            'Как будет развиваться мой проект?',
            'Стоит ли мне переехать в другой город?',
            'Будет ли успешен мой стартап?',
            'Когда я встречу свою любовь?',
            'Стоит ли вкладывать деньги в обучение?',
            'Какие изменения ждут меня в ближайшие 3 месяца?',
            'Как пройдет мое собеседование на новую должность?',
            'Стоит ли менять специализацию?',
            'Когда я получу повышение?',
            'Будет ли моя команда успешной?',
            'Как улучшить отношения с коллегами?',
            'Стоит ли переходить на фриланс?'
        ].forEach((question, index) => {
            // Создаем дату в прошлом с случайным смещением
            const date = new Date(now);
            date.setMinutes(date.getMinutes() - Math.floor(Math.random() * 600));
            
            testActivities.push({
                id: 'q-test-' + index,
                timestamp: date.toISOString(),
                userId: 'test-user-' + Math.floor(Math.random() * 100),
                type: 'question',
                details: question,
                cardId: 'card00' + Math.floor(Math.random() * 8 + 1)
            });
        });
        
        // Добавляем тестовые посещения и предсказания
        for (let i = 0; i < 15; i++) {
            const date = new Date(now);
            date.setMinutes(date.getMinutes() - Math.floor(Math.random() * 600));
            
            const activityType = Math.random() > 0.7 ? 'prediction' : (Math.random() > 0.5 ? 'share' : 'visit');
            
            testActivities.push({
                id: activityType + '-test-' + i,
                timestamp: date.toISOString(),
                userId: 'test-user-' + Math.floor(Math.random() * 100),
                type: activityType,
                details: activityType === 'prediction' ? 'Получено предсказание' : (activityType === 'share' ? 'Поделился в соцсетях' : 'Посетил приложение'),
                cardId: activityType === 'prediction' ? 'card00' + Math.floor(Math.random() * 8 + 1) : null
            });
        }
        
        // Сортируем по времени
        testActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Сохраняем в глобальный объект и localStorage
        activities = testActivities;
        
        try {
            localStorage.setItem('userActivities', JSON.stringify(activities));
            console.log('Сохранены тестовые активности пользователей');
        } catch (e) {
            console.error('Ошибка при сохранении тестовых активностей:', e);
        }
    } else {
        console.log('Активности найдены, тестовые данные не нужны');
    }
    
    return true;
}

// Функция для инициализации страницы
function initAdmin() {
    console.log('=======================================');
    console.log('Инициализация админ-панели...');
    console.log('Проверка наличия модуля статистики...');
    console.log('window.statsModule существует:', !!window.statsModule);
    if (window.statsModule) {
        console.log('Функции в statsModule:', 
            'init =', !!window.statsModule.init,
            'getStats =', !!window.statsModule.getStats,
            'registerPrediction =', !!window.statsModule.registerPrediction,
            'registerShare =', !!window.statsModule.registerShare
        );
    }
    
    // Инициализация UI элементов
    elements.totalUsers = document.getElementById('total-users');
    elements.totalPredictions = document.getElementById('total-predictions');
    elements.todayPredictions = document.getElementById('today-predictions');
    elements.totalShares = document.getElementById('total-shares');
    elements.refreshStatsBtn = document.getElementById('refresh-stats');
    
    // Загружаем данные
    console.log('Загрузка данных карт...');
    loadCardsFromStorage();
    console.log('Загрузка активностей...');
    loadActivitiesFromStorage();
    
    // Добавлено: загружаем статистику
    console.log('Загрузка статистики...');
    if (loadStatsFromStorage()) {
        // Обновляем UI статистики
        console.log('Статистика загружена, обновляем UI...');
        updateStatsUI();
    } else {
        // Если статистики нет, создаем тестовые данные
        console.log('Статистика не найдена, создаем тестовые данные...');
        createTestDataIfNeeded();
    }
    
    try {
        // Инициализация графиков
        console.log('Инициализация графиков...');
        if (typeof initCharts === 'function') {
            try {
                initCharts();
            } catch (error) {
                console.error('Ошибка при инициализации графиков:', error);
            }
        } else {
            console.warn('Функция initCharts не определена');
        }
        
        // Отрисовываем активности
        console.log('Отрисовка активностей...');
        if (typeof renderActivities === 'function') {
            try {
                renderActivities();
            } catch (error) {
                console.error('Ошибка при отрисовке активностей:', error);
            }
        } else {
            console.warn('Функция renderActivities не определена');
        }
        
        // Отрисовываем пользователей
        console.log('Отрисовка списка пользователей...');
        if (typeof renderUsers === 'function') {
            try {
                renderUsers();
            } catch (error) {
                console.error('Ошибка при отрисовке пользователей:', error);
            }
        } else {
            console.warn('Функция renderUsers не определена');
        }
        
        // Инициализация аналитики
        if (typeof AdminAnalytics !== 'undefined') {
            console.log('Инициализация аналитики...');
            AdminAnalytics.initSession();
        }
        
        // Настройка обработчиков событий
        console.log('Настройка обработчиков событий...');
        if (typeof setupEventListeners === 'function') {
            try {
                setupEventListeners();
            } catch (error) {
                console.error('Ошибка при настройке обработчиков событий:', error);
            }
        } else {
            console.warn('Функция setupEventListeners не определена');
        }
        
        // Добавляем обработчик обновления для кнопки обновления статистики
        if (elements.refreshStatsBtn) {
            console.log('Настройка кнопки обновления статистики...');
            elements.refreshStatsBtn.addEventListener('click', function() {
                console.log('Кнопка обновления статистики нажата');
                if (typeof refreshStats === 'function') {
                    refreshStats();
                } else {
                    console.warn('Функция refreshStats не определена');
                }
                if (typeof AdminAnalytics !== 'undefined') {
                    AdminAnalytics.trackAction('refresh_stats');
                }
            });
        } else {
            console.warn('Кнопка обновления статистики не найдена в DOM');
        }
    } catch (error) {
        console.error('Критическая ошибка при инициализации админ-панели:', error);
    }
    
    // Явно вызываем отрисовку активностей в конце инициализации, 
    // чтобы гарантировать, что вопросы пользователей будут отображены
    if (typeof renderActivities === 'function') {
        console.log('Повторная отрисовка активностей для обеспечения отображения...');
        renderActivities();
    }
    
    console.log('Админ-панель инициализирована успешно!');
    console.log('=======================================');
}

// Функция для обновления UI статистики
function updateStatsUI() {
    console.log('------- Запуск updateStatsUI -------');
    
    // Убеждаемся, что adminStats объект существует
    if (!window.adminStats) {
        console.error('window.adminStats не определен. Создаем объект...');
        window.adminStats = {
            totalUsers: 0,
            totalPredictions: 0,
            todayPredictions: 0,
            shares: 0,
            lastUpdate: new Date().toISOString()
        };
    }
    
    // Пробуем получить обновленную статистику из модуля перед обновлением UI
    if (window.statsModule && typeof window.statsModule.getStats === 'function') {
        console.log('statsModule найден, получаем данные...');
        const moduleStats = window.statsModule.getStats();
        if (moduleStats) {
            console.log('Получена свежая статистика из модуля statsModule:', moduleStats);
            // Обновляем объект adminStats значениями из модуля
            Object.assign(window.adminStats, moduleStats);
        } else {
            console.warn('Модуль statsModule.getStats() вернул пустые данные');
        }
    } else {
        console.warn('Модуль statsModule не найден или функция getStats отсутствует');
    }
    
    console.log('Обновление UI статистики:', window.adminStats);
    
    // Добавляем время последнего обновления для отладки
    const lastUpdateText = window.adminStats.lastUpdate ? 
        new Date(window.adminStats.lastUpdate).toLocaleString() : 
        'Не обновлялось';
    console.log('Последнее обновление статистики:', lastUpdateText);
    
    // Проверяем наличие элементов перед обновлением
    if (elements.totalUsers) {
        elements.totalUsers.textContent = window.adminStats.totalUsers;
        console.log('UI обновлен: totalUsers =', window.adminStats.totalUsers);
    } else {
        console.warn('Элемент totalUsers не найден в DOM');
    }
    
    if (elements.totalPredictions) {
        elements.totalPredictions.textContent = window.adminStats.totalPredictions;
        console.log('UI обновлен: totalPredictions =', window.adminStats.totalPredictions);
    } else {
        console.warn('Элемент totalPredictions не найден в DOM');
    }
    
    if (elements.todayPredictions) {
        elements.todayPredictions.textContent = window.adminStats.todayPredictions;
        console.log('UI обновлен: todayPredictions =', window.adminStats.todayPredictions);
    } else {
        console.warn('Элемент todayPredictions не найден в DOM');
    }
    
    if (elements.totalShares) {
        elements.totalShares.textContent = window.adminStats.shares;
        console.log('UI обновлен: totalShares =', window.adminStats.shares);
    } else {
        console.warn('Элемент totalShares не найден в DOM');
    }
    
    console.log('------- Завершение updateStatsUI -------');
}

// Переход на страницу генерации QR-кодов
function navigateToQrGenerator() {
    window.location.href = 'qr-generator.html';
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Проверяем, существует ли уже контейнер для уведомлений
    let notificationContainer = document.getElementById('notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '9999';
        document.body.appendChild(notificationContainer);
    }
    
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.backgroundColor = type === 'success' ? 'rgba(22, 160, 133, 0.9)' : 
                                        type === 'error' ? 'rgba(231, 76, 60, 0.9)' : 
                                        'rgba(52, 152, 219, 0.9)';
    notification.style.color = 'white';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '8px';
    notification.style.marginBottom = '10px';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    notification.style.animation = 'fadeIn 0.3s ease-out';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.backdropFilter = 'blur(5px)';
    
    // Иконка в зависимости от типа
    const icon = document.createElement('i');
    icon.className = type === 'success' ? 'fas fa-check-circle' : 
                     type === 'error' ? 'fas fa-exclamation-circle' : 
                     'fas fa-info-circle';
    icon.style.marginRight = '10px';
    icon.style.fontSize = '20px';
    
    notification.appendChild(icon);
    notification.appendChild(document.createTextNode(message));
    
    // Добавляем кнопку закрытия
    const closeBtn = document.createElement('i');
    closeBtn.className = 'fas fa-times';
    closeBtn.style.marginLeft = '15px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.opacity = '0.7';
    closeBtn.style.transition = 'opacity 0.3s ease';
    closeBtn.addEventListener('mouseover', () => {
        closeBtn.style.opacity = '1';
    });
    closeBtn.addEventListener('mouseout', () => {
        closeBtn.style.opacity = '0.7';
    });
    closeBtn.addEventListener('click', () => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notificationContainer.removeChild(notification);
        }, 300);
    });
    
    notification.appendChild(closeBtn);
    notificationContainer.appendChild(notification);
    
    // Автоматически удаляем уведомление через 5 секунд
    setTimeout(() => {
        if (notification.parentNode === notificationContainer) {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode === notificationContainer) {
                    notificationContainer.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Инициализация графиков
function initCharts() {
    const canvasElement = document.getElementById('weekly-stats-chart');
    if (!canvasElement) {
        console.warn('Элемент canvas для графика не найден');
        return;
    }
    
    // Проверяем, существует ли уже график для этого canvas
    if (typeof Chart !== 'undefined') {
        const existingChart = Chart.getChart(canvasElement);
        if (existingChart) {
            // Уничтожаем существующий график перед созданием нового
            console.log('Уничтожаем существующий график перед созданием нового');
            existingChart.destroy();
        }
    } else {
        console.warn('Библиотека Chart.js не загружена');
        return;
    }
    
    const ctx = canvasElement.getContext('2d');
    
    // Данные для графика
    const data = {
        labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
        datasets: [{
            label: 'Предсказания',
            data: [65, 78, 52, 74, 93, 82, 120],
            borderColor: '#E30613',
            backgroundColor: 'rgba(227, 6, 19, 0.1)',
            tension: 0.4,
            borderWidth: 3,
            fill: true
        }]
    };
    
    // Опции графика
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#FFFFFF'
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: {
                    color: '#8E8E93'
                }
            },
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: {
                    color: '#8E8E93'
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        },
        hover: {
            mode: 'nearest',
            intersect: true
        }
    };
    
    // Создаем график
        new Chart(ctx, {
            type: 'line',
            data: data,
            options: options
        });
}

// Показать модальное окно для настройки API GPT
function showGptSettingsModal() {
    // Создаем модальное окно, если его еще нет
    let gptModal = document.getElementById('gpt-settings-modal');
    
    if (!gptModal) {
        gptModal = document.createElement('div');
        gptModal.id = 'gpt-settings-modal';
        gptModal.className = 'modal';
        
        gptModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-robot"></i> Настройки API GPT</h3>
                    <button class="close-modal" id="close-gpt-modal">&times;</button>
                </div>
                <form id="gpt-settings-form">
                    <div class="form-group">
                        <label for="gpt-api-key">API-ключ OpenAI:</label>
                        <input type="password" id="gpt-api-key" class="form-control" placeholder="sk-..." value="${gptApiKey}">
                        <small style="color: var(--dark-gray); margin-top: 5px; display: block;">Ключ хранится только локально в вашем браузере.</small>
                    </div>
                    <div class="form-group">
                        <label class="switch-label">
                            <span>Включить генерацию предсказаний через GPT:</span>
                            <div class="switch">
                                <input type="checkbox" id="gpt-enabled" ${isGptEnabled ? 'checked' : ''}>
                                <span class="slider"></span>
                            </div>
                        </label>
                    </div>
                    <div class="form-group">
                        <label for="gpt-model">Модель:</label>
                        <select id="gpt-model" class="form-control">
                            <option value="gpt-4">GPT-4 (рекомендуется)</option>
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="gpt-prompt">Промпт для генерации:</label>
                        <textarea id="gpt-prompt" class="form-control" rows="4" placeholder="Инструкция для модели">Ты метафорическая карта предсказаний для дизайнеров. Создай творческое и вдохновляющее предсказание на основе названия карты "${id}" и вопроса пользователя. Предсказание должно быть полезным, позитивным и с долей юмора. Не более 3-4 предложений.</textarea>
                    </div>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Сохранить настройки</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(gptModal);
        
        // Добавляем стили для переключателя
        const style = document.createElement('style');
        style.textContent = `
            .switch-label {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .switch {
                position: relative;
                display: inline-block;
                width: 52px;
                height: 26px;
            }
            .switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            .slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(255, 255, 255, 0.1);
                transition: .4s;
                border-radius: 34px;
            }
            .slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: .4s;
                border-radius: 50%;
            }
            input:checked + .slider {
                background-color: var(--primary-color);
            }
            input:checked + .slider:before {
                transform: translateX(26px);
            }
        `;
        document.head.appendChild(style);
        
        // Привязываем обработчики событий
        document.getElementById('close-gpt-modal').addEventListener('click', () => {
            gptModal.style.display = 'none';
        });
        
        document.getElementById('gpt-settings-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const apiKey = document.getElementById('gpt-api-key').value;
            const isEnabled = document.getElementById('gpt-enabled').checked;
            const model = document.getElementById('gpt-model').value;
            const prompt = document.getElementById('gpt-prompt').value;
            
            // Сохраняем настройки
            localStorage.setItem('gptApiKey', apiKey);
            localStorage.setItem('isGptEnabled', isEnabled);
            localStorage.setItem('gptModel', model);
            localStorage.setItem('gptPrompt', prompt);
            
            // Обновляем переменные
            gptApiKey = apiKey;
            isGptEnabled = isEnabled;
            
            updateGptStatus();
            gptModal.style.display = 'none';
            
            showNotification('Настройки GPT сохранены', 'success');
        });
    }
    
    gptModal.style.display = 'flex';
}

// Обновление статуса API GPT
function updateGptStatus() {
    const gptStatusElement = document.getElementById('gpt-status');
    
    if (!gptStatusElement) {
        // Создаем индикатор статуса, если его еще нет
        const toolsSection = document.querySelector('.admin-section:last-child .admin-card > div:last-child');
        
        const gptStatus = document.createElement('div');
        gptStatus.id = 'gpt-status';
        gptStatus.style.marginTop = '25px';
        gptStatus.style.display = 'flex';
        gptStatus.style.alignItems = 'center';
        gptStatus.style.padding = '15px';
        gptStatus.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
        gptStatus.style.borderRadius = '12px';
        gptStatus.style.border = '1px solid rgba(255, 255, 255, 0.07)';
        
        const statusIcon = document.createElement('div');
        statusIcon.id = 'gpt-status-icon';
        statusIcon.style.width = '12px';
        statusIcon.style.height = '12px';
        statusIcon.style.borderRadius = '50%';
        statusIcon.style.backgroundColor = isGptEnabled ? '#4CD964' : '#FF3B30';
        statusIcon.style.marginRight = '10px';
        
        const statusText = document.createElement('div');
        statusText.id = 'gpt-status-text';
        statusText.textContent = isGptEnabled ? 'API GPT активирован' : 'API GPT отключен';
        statusText.style.flex = '1';
        
        gptStatus.appendChild(statusIcon);
        gptStatus.appendChild(statusText);
        
        if (gptApiKey) {
            const keyPreview = document.createElement('div');
            keyPreview.textContent = 'Ключ: ' + (gptApiKey ? '•••••••••••••••' : 'не задан');
            keyPreview.style.marginLeft = '10px';
            keyPreview.style.color = 'var(--dark-gray)';
            gptStatus.appendChild(keyPreview);
        }
        
        toolsSection.appendChild(gptStatus);
    } else {
        // Обновляем существующий индикатор
        const statusIcon = document.getElementById('gpt-status-icon');
        const statusText = document.getElementById('gpt-status-text');
        
        statusIcon.style.backgroundColor = isGptEnabled ? '#4CD964' : '#FF3B30';
        statusText.textContent = isGptEnabled ? 'API GPT активирован' : 'API GPT отключен';
    }
}

// Очистить все данные
function clearAllData() {
    if (confirm('Вы уверены, что хотите очистить ВСЕ данные? Это действие нельзя отменить.')) {
        // Очищаем данные из localStorage
        localStorage.removeItem('feedbackData');
        localStorage.removeItem('shareData');
        localStorage.removeItem('predictionData');
        localStorage.removeItem('gptSettings');
        localStorage.removeItem('analyticsSettings');
        
        // Обнуляем статистику
        window.adminStats.totalUsers = 0;
        window.adminStats.totalPredictions = 0;
        window.adminStats.todayPredictions = 0;
        window.adminStats.shares = 0;
        
        // Обновляем отображение
        document.getElementById('total-predictions').textContent = '0';
        document.getElementById('today-predictions').textContent = '0';
        document.getElementById('total-shares').textContent = '0';
        document.getElementById('total-users').textContent = '0';
        
        // Обновляем графики
        if (typeof Chart !== 'undefined') {
            const charts = [
                Chart.getChart('user-actions-chart'),
                Chart.getChart('ratings-chart'),
                Chart.getChart('weekly-stats-chart'),
                Chart.getChart('device-chart'),
                Chart.getChart('sources-chart')
            ];
            
            charts.forEach(chart => {
                if (chart) {
                    chart.data.datasets.forEach(dataset => {
                        dataset.data = dataset.data.map(() => 0);
                    });
                    chart.update();
                }
            });
        }
        
        showNotification('Все данные успешно очищены', 'success');
    }
}

// Показать модальное окно настроек
function showSettingsModal() {
    // Создаем модальное окно, если его еще нет
    let settingsModal = document.getElementById('settings-modal');
    
    if (!settingsModal) {
        settingsModal = document.createElement('div');
        settingsModal.id = 'settings-modal';
        settingsModal.className = 'modal';
        
        settingsModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-cog"></i> Настройки приложения</h3>
                    <button class="close-modal" id="close-settings-modal">&times;</button>
                </div>
                <form id="settings-form">
                    <div class="form-group">
                        <label for="app-theme">Тема оформления:</label>
                        <select id="app-theme" class="form-control">
                            <option value="dark" selected>Темная</option>
                            <option value="light">Светлая</option>
                            <option value="auto">Автоматически (системная)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="session-timeout">Тайм-аут сессии (минуты):</label>
                        <input type="number" id="session-timeout" class="form-control" value="30" min="5" max="120">
                    </div>
                    <div class="form-group">
                        <label class="switch-label">
                            <span>Показывать предупреждения:</span>
                            <div class="switch">
                                <input type="checkbox" id="show-warnings" checked>
                                <span class="slider"></span>
                            </div>
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="switch-label">
                            <span>Автоматические обновления:</span>
                            <div class="switch">
                                <input type="checkbox" id="auto-updates" checked>
                                <span class="slider"></span>
                            </div>
                        </label>
                    </div>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Сохранить настройки</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(settingsModal);
        
        // Привязываем обработчики событий
        document.getElementById('close-settings-modal').addEventListener('click', () => {
            settingsModal.style.display = 'none';
        });
        
        document.getElementById('settings-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const theme = document.getElementById('app-theme').value;
            const timeout = document.getElementById('session-timeout').value;
            const showWarnings = document.getElementById('show-warnings').checked;
            const autoUpdates = document.getElementById('auto-updates').checked;
            
            // Сохраняем настройки
            localStorage.setItem('appTheme', theme);
            localStorage.setItem('sessionTimeout', timeout);
            localStorage.setItem('showWarnings', showWarnings);
            localStorage.setItem('autoUpdates', autoUpdates);
            
            // Отслеживаем действие
            AdminAnalytics.trackAction('save_app_settings', { 
                theme, 
                timeout, 
                showWarnings, 
                autoUpdates 
            });
            
            settingsModal.style.display = 'none';
            showNotification('Настройки приложения сохранены', 'success');
            
            // Применяем новую тему, если она изменилась
            applyTheme(theme);
        });
    }
    
    // Заполняем форму текущими настройками
    document.getElementById('app-theme').value = localStorage.getItem('appTheme') || 'dark';
    document.getElementById('session-timeout').value = localStorage.getItem('sessionTimeout') || '30';
    document.getElementById('show-warnings').checked = localStorage.getItem('showWarnings') !== 'false';
    document.getElementById('auto-updates').checked = localStorage.getItem('autoUpdates') !== 'false';
    
    settingsModal.style.display = 'flex';
}

// Применение выбранной темы
function applyTheme(theme) {
    // В реальном приложении здесь был бы код для изменения темы
    // Для демонстрации просто показываем уведомление
    showNotification(`Тема "${theme}" применена`, 'info');
}

// Настройка фильтров аналитики
function setupAnalyticsFilters() {
    const deviceFilter = document.getElementById('device-filter');
    const sourceFilter = document.getElementById('source-filter');
    const cardFilter = document.getElementById('card-filter');
    const analyticsPeriod = document.getElementById('analytics-period');
    
    // Заполняем выпадающий список карт
    cardFilter.innerHTML = '<option value="all">Все карты</option>';
    for (const [id, card] of Object.entries(cards)) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = id;
        cardFilter.appendChild(option);
    }
    
    // Настраиваем обработчики изменения фильтров
    deviceFilter.addEventListener('change', applyFilters);
    sourceFilter.addEventListener('change', applyFilters);
    cardFilter.addEventListener('change', applyFilters);
    analyticsPeriod.addEventListener('change', applyFilters);
    
    // Функция применения фильтров
    function applyFilters() {
        const device = deviceFilter.value;
        const source = sourceFilter.value;
        const card = cardFilter.value;
        const period = analyticsPeriod.value;
        
        // Отслеживаем действие
        AdminAnalytics.trackAction('apply_analytics_filters', { 
            device, 
            source, 
            card, 
            period 
        });
        
        // Имитация фильтрации данных и обновления графиков
        showNotification('Фильтры применены', 'success');
        
        // В реальном приложении здесь был бы код для обновления данных
        // Для демонстрации перерисовываем графики с случайными данными
        updateChartsWithRandomData();
    }
}

// Обновление графиков случайными данными (для демонстрации работы фильтров)
function updateChartsWithRandomData() {
    // Обновляем график действий пользователей
    if (typeof Chart !== 'undefined') {
        const userActionsChart = Chart.getChart('user-actions-chart');
        if (userActionsChart) {
            userActionsChart.data.datasets[0].data = [
                Math.floor(Math.random() * 1000),
                Math.floor(Math.random() * 700),
                Math.floor(Math.random() * 500),
                Math.floor(Math.random() * 300),
                Math.floor(Math.random() * 200)
            ];
            userActionsChart.update();
        }
        
        // Обновляем график оценок
        const ratingsChart = Chart.getChart('ratings-chart');
        if (ratingsChart) {
            ratingsChart.data.datasets[0].data = [
                Math.floor(Math.random() * 200),
                Math.floor(Math.random() * 150),
                Math.floor(Math.random() * 100),
                Math.floor(Math.random() * 50)
            ];
            ratingsChart.update();
        }
        
        // Обновляем недельную статистику
        const weeklyChart = Chart.getChart('weekly-stats-chart');
        if (weeklyChart) {
            weeklyChart.data.datasets[0].data = [
                Math.floor(Math.random() * 100),
                Math.floor(Math.random() * 100),
                Math.floor(Math.random() * 100),
                Math.floor(Math.random() * 100),
                Math.floor(Math.random() * 100),
                Math.floor(Math.random() * 100),
                Math.floor(Math.random() * 100)
            ];
            weeklyChart.update();
        }
    }
}

// Функция настройки обработчиков событий
function setupEventListeners() {
    console.log('Настройка обработчиков событий...');
    
    // Добавляем обработчик для кнопки обновления активностей
    document.getElementById('refresh-activities')?.addEventListener('click', function() {
        console.log('Кнопка обновления активностей нажата');
        if (typeof refreshActivities === 'function') {
            refreshActivities();
        }
    });
    
    // Добавляем обработчик для кнопки обновления пользователей
    document.getElementById('refresh-users')?.addEventListener('click', function() {
        console.log('Кнопка обновления списка пользователей нажата');
        if (typeof renderUsers === 'function') {
            renderUsers();
            // Показываем уведомление
            showNotification('Список пользователей обновлен', 'success');
        } else {
            console.warn('Функция renderUsers не определена');
        }
    });
    
    // Обработчики для кнопок отладочной панели
    document.getElementById('clear-storage-btn')?.addEventListener('click', function() {
        console.log('Кнопка очистки данных нажата');
        if (typeof clearAllData === 'function') {
            clearAllData();
        }
    });
    
    // Основные обработчики событий
    const addCardBtn = document.getElementById('add-card-btn');
    if (addCardBtn) {
        if (typeof showAddCardModal === 'function') {
            addCardBtn.addEventListener('click', showAddCardModal);
        } else {
            console.warn('Функция showAddCardModal не определена');
            addCardBtn.addEventListener('click', function() {
                showNotification('Функция управления картами не реализована в этой версии', 'info');
            });
        }
    } else {
        console.warn('Элемент add-card-btn не найден в DOM');
    }
    
    const cardForm = document.getElementById('card-form');
    if (cardForm) {
        if (typeof handleCardFormSubmit === 'function') {
            cardForm.addEventListener('submit', handleCardFormSubmit);
        } else {
            console.warn('Функция handleCardFormSubmit не определена');
            cardForm.addEventListener('submit', function(event) {
                event.preventDefault();
                showNotification('Функция сохранения карты не реализована в этой версии', 'info');
            });
        }
    } else {
        console.warn('Элемент card-form не найден в DOM');
    }
    
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        if (typeof closeModal === 'function') {
            closeModalBtn.addEventListener('click', closeModal);
        } else {
            console.warn('Функция closeModal не определена');
            closeModalBtn.addEventListener('click', function() {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.style.display = 'none';
                });
            });
        }
    } else {
        console.warn('Элемент .close-modal не найден в DOM');
    }
    
    const closeBtns = document.querySelector('.close-btn');
    if (closeBtns) {
        if (typeof closeModal === 'function') {
            closeBtns.addEventListener('click', closeModal);
        } else {
            console.warn('Функция closeModal не определена');
            closeBtns.addEventListener('click', function() {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.style.display = 'none';
                });
            });
        }
    } else {
        console.warn('Элемент .close-btn не найден в DOM');
    }
    
    const refreshStatsBtn = document.getElementById('refresh-stats');
    if (refreshStatsBtn) {
        if (typeof refreshStats === 'function') {
            refreshStatsBtn.addEventListener('click', refreshStats);
        } else {
            console.warn('Функция refreshStats не определена');
            refreshStatsBtn.addEventListener('click', function() {
                showNotification('Функция обновления статистики не реализована', 'info');
            });
        }
    } else {
        console.warn('Элемент refresh-stats не найден в DOM');
    }
    
    const generateQrBtn = document.getElementById('generate-qr-btn');
    if (generateQrBtn) {
        if (typeof navigateToQrGenerator === 'function') {
            generateQrBtn.addEventListener('click', navigateToQrGenerator);
        } else {
            console.warn('Функция navigateToQrGenerator не определена');
            generateQrBtn.addEventListener('click', function() {
                window.location.href = 'qr-generator.html';
            });
        }
    } else {
        console.warn('Элемент generate-qr-btn не найден в DOM');
    }
    
    const gptSettingsBtn = document.getElementById('gpt-settings-btn');
    if (gptSettingsBtn) {
        if (typeof showGptSettingsModal === 'function') {
            gptSettingsBtn.addEventListener('click', showGptSettingsModal);
        } else {
            console.warn('Функция showGptSettingsModal не определена');
            gptSettingsBtn.addEventListener('click', function() {
                showNotification('Настройки GPT недоступны в этой версии', 'info');
            });
        }
    } else {
        console.warn('Элемент gpt-settings-btn не найден в DOM');
    }
    
    // Добавляем обработчики для остальных кнопок
    const clearDataBtn = document.getElementById('clear-data-btn');
    if (clearDataBtn) {
        if (typeof clearAllData === 'function') {
            clearDataBtn.addEventListener('click', clearAllData);
        } else {
            console.warn('Функция clearAllData не определена');
            clearDataBtn.addEventListener('click', function() {
                showNotification('Функция очистки данных не реализована', 'info');
            });
        }
    } else {
        console.warn('Элемент clear-data-btn не найден в DOM');
    }
    
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        if (typeof showSettingsModal === 'function') {
            settingsBtn.addEventListener('click', showSettingsModal);
        } else {
            console.warn('Функция showSettingsModal не определена');
            settingsBtn.addEventListener('click', function() {
                showNotification('Настройки недоступны в этой версии', 'info');
            });
        }
    } else {
        console.warn('Элемент settings-btn не найден в DOM');
    }
    
    // Настраиваем фильтры аналитики
    if (typeof setupAnalyticsFilters === 'function') {
        try {
            setupAnalyticsFilters();
        } catch (error) {
            console.error('Ошибка при настройке фильтров аналитики:', error);
        }
    } else {
        console.warn('Функция setupAnalyticsFilters не определена');
    }
}

// Настройка аналитики для управления картами 
function setupCardAnalytics() {
    // Отслеживаем все действия с картами
    const editButtons = document.querySelectorAll('.edit-card-btn');
    if (editButtons && editButtons.length > 0) {
        editButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const cardId = this.getAttribute('data-id');
            if (AdminAnalytics && AdminAnalytics.trackAction) {
                AdminAnalytics.trackAction('edit_card', { cardId });
            }
        });
    });
    } else {
        console.warn('Элементы .edit-card-btn не найдены в DOM');
    }
    
    const deleteButtons = document.querySelectorAll('.delete-card-btn');
    if (deleteButtons && deleteButtons.length > 0) {
        deleteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const cardId = this.getAttribute('data-id');
            if (AdminAnalytics && AdminAnalytics.trackAction) {
                AdminAnalytics.trackAction('delete_card', { cardId });
            }
        });
    });
    } else {
        console.warn('Элементы .delete-card-btn не найдены в DOM');
    }
}

// Функция для обновления статистики
function refreshStats() {
    console.log('------- Запуск refreshStats -------');
    
    // Загружаем и обновляем статистику из всех доступных источников
    console.log('Загрузка статистики...');
    if (loadStatsFromStorage()) {
        console.log('Статистика загружена из хранилища');
    } else {
        console.log('Статистика в хранилище не найдена, используем начальные значения');
    }
    
    // Запрашиваем свежие данные из модуля статистики
    if (window.statsModule && typeof window.statsModule.getStats === 'function') {
        console.log('Запрашиваем свежие данные из модуля статистики...');
        const freshStats = window.statsModule.getStats();
        if (freshStats) {
            console.log('Получены свежие данные из модуля статистики:', freshStats);
            // Обновляем объект adminStats значениями из модуля
            Object.assign(window.adminStats, freshStats);
        }
    }
    
    // Обновляем UI
    console.log('Обновление UI статистики...');
    updateStatsUI();
    
    // Обновляем графики случайными данными (для демонстрации)
    console.log('Обновление графиков...');
    if (typeof updateChartsWithRandomData === 'function') {
        try {
            updateChartsWithRandomData();
        } catch (error) {
            console.error('Ошибка при обновлении графиков:', error);
        }
    }
    
    // Загружаем и отображаем активности (вопросы пользователей)
    console.log('Обновление активностей пользователей...');
    loadActivitiesFromStorage();
    renderActivities();
    
    // Обновляем отображение списка пользователей
    console.log('Обновление списка пользователей...');
    if (typeof renderUsers === 'function') {
        try {
            renderUsers();
        } catch (error) {
            console.error('Ошибка при обновлении списка пользователей:', error);
        }
    } else {
        console.warn('Функция renderUsers не определена');
    }
    
    // Показываем уведомление об успешном обновлении
    showNotification('Статистика успешно обновлена', 'success');
    
    console.log('------- Завершение refreshStats -------');
}

// Функция для отрисовки активностей пользователей
function renderActivities() {
    console.log('Отрисовка вопросов пользователей...');
    
    // Получаем контейнер для активностей
    const activitiesContainer = document.getElementById('activities-list');
    if (!activitiesContainer) {
        console.warn('Контейнер для вопросов не найден в DOM');
        return;
    }
    
    // Очищаем контейнер
    activitiesContainer.innerHTML = '';
    
    // Проверяем наличие активностей
    if (!activities || activities.length === 0) {
        console.log('Загружаем активности из localStorage или создаем тестовые');
        
        // Пробуем загрузить из localStorage
        const savedActivities = localStorage.getItem('userActivities');
        if (savedActivities) {
            try {
                const parsedActivities = JSON.parse(savedActivities);
                if (Array.isArray(parsedActivities) && parsedActivities.length > 0) {
                    activities = parsedActivities;
                    console.log('Активности загружены из localStorage:', activities.length);
                }
            } catch (e) {
                console.error('Ошибка при загрузке активностей из localStorage:', e);
            }
        }
        
        // Если активностей нет, создаем тестовые
        if (!activities || activities.length === 0) {
            console.log('Создаем тестовые активности');
            activities = createTestActivities();
        }
    }
    
    // Фильтруем только вопросы
    const questionsOnly = activities.filter(activity => activity.type === 'question');
    
    // Если нет вопросов, показываем сообщение
    if (questionsOnly.length === 0) {
        console.log('Вопросы пользователей не найдены');
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'Пока нет вопросов от пользователей';
        activitiesContainer.appendChild(emptyMessage);
        return;
    }
    
    // Сортируем вопросы по дате (новые сверху)
    const sortedQuestions = [...questionsOnly].sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    // Ограничиваем количество отображаемых вопросов
    const questionsToShow = sortedQuestions.slice(0, 20);
    
    // Создаем элементы для каждого вопроса
    questionsToShow.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        // Форматируем дату
        const date = new Date(activity.timestamp);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        // Создаем HTML для вопроса
        activityItem.innerHTML = `
            <div class="activity-icon"><i class="fas fa-question"></i></div>
            <div class="activity-content">
                <div class="activity-details">${activity.details || ''}</div>
                <div class="activity-time">${formattedDate}</div>
            </div>
        `;
        
        // Добавляем обработчик клика для скрытия вопроса
        activityItem.addEventListener('click', function() {
            // Добавляем анимацию исчезновения
            this.style.opacity = '0';
            this.style.transform = 'translateX(20px)';
            
            // После анимации удаляем элемент
            setTimeout(() => {
                this.remove();
                
                // Также удаляем этот вопрос из массива и localStorage
                if (window.activities) {
                    // Находим индекс вопроса в массиве по его содержимому
                    const questionIndex = window.activities.findIndex(q => 
                        q.details === activity.details);
                    
                    if (questionIndex !== -1) {
                        // Удаляем вопрос из массива
                        window.activities.splice(questionIndex, 1);
                        
                        // Обновляем localStorage
                        try {
                            localStorage.setItem('userActivities', JSON.stringify(window.activities));
                            console.log('Вопрос удален и данные обновлены в localStorage');
                        } catch (e) {
                            console.error('Ошибка при обновлении localStorage:', e);
                        }
                    }
                }
                
                // Показываем уведомление
                if (typeof showNotification === 'function') {
                    showNotification('Вопрос скрыт', 'success');
                }
            }, 300);
        });
        
        // Добавляем элемент в контейнер
        activitiesContainer.appendChild(activityItem);
    });
    
    console.log(`Отрисовано ${questionsToShow.length} вопросов пользователей`);
}

// Вспомогательная функция для показа модального окна добавления карты
function showAddCardModal() {
    console.log('Показ модального окна добавления карты вызван, но функция не реализована');
    showNotification('Функция добавления карты не реализована в этой версии', 'info');
}

// Вспомогательная функция для закрытия модального окна
function closeModal() {
    console.log('Закрытие модального окна вызвано, но функция не реализована');
    // Находим все модальные окна и скрываем их
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Обработчик отправки формы карты
function handleCardFormSubmit(event) {
    event.preventDefault();
    console.log('Отправка формы карты вызвана, но функция не реализована');
    showNotification('Функция сохранения карты не реализована в этой версии', 'info');
    closeModal();
}

// Вызываем инициализацию при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, вызываем initAdmin()');
    initAdmin();
});

// Функция для обновления активностей пользователей
function refreshActivities() {
    console.log('------- Запуск refreshActivities -------');
    
    // Загружаем актуальные активности пользователей
    console.log('Обновление вопросов пользователей...');
    loadActivitiesFromStorage();
    renderActivities();
    
    // Показываем уведомление об успешном обновлении
    showNotification('Вопросы пользователей обновлены', 'success');
    
    // Записываем событие в аналитику
    if (typeof AdminAnalytics !== 'undefined' && AdminAnalytics.trackAction) {
        AdminAnalytics.trackAction('refresh_questions');
    }
    
    console.log('------- Завершение refreshActivities -------');
    return true;
}

// Функция для создания тестовых данных активностей, если нет реальных данных
function createTestActivities() {
    console.log('Создание тестовых вопросов...');
    
    const testActivities = [];
    const now = new Date();
    
    // Создаем тестовые вопросы
    [
        'Когда мне повысят зарплату?',
        'Что меня ждет на новом проекте?',
        'Сменить ли мне работу в этом году?',
        'Как будет развиваться мой проект?',
        'Стоит ли мне переехать в другой город?',
        'Будет ли успешен мой стартап?',
        'Когда я встречу свою любовь?',
        'Стоит ли вкладывать деньги в обучение?',
        'Какие изменения ждут меня в ближайшие 3 месяца?',
        'Как пройдет мое собеседование на новую должность?',
        'Стоит ли менять специализацию?',
        'Когда я получу повышение?',
        'Будет ли моя команда успешной?',
        'Как улучшить отношения с коллегами?',
        'Стоит ли переходить на фриланс?'
    ].forEach((question, index) => {
        // Создаем дату в прошлом с случайным смещением
        const date = new Date(now);
        date.setMinutes(date.getMinutes() - Math.floor(Math.random() * 600));
        
        testActivities.push({
            id: 'q-test-' + index,
            timestamp: date.toISOString(),
            userId: 'test-user-' + Math.floor(Math.random() * 100),
            type: 'question',
            details: question,
            cardId: 'card00' + Math.floor(Math.random() * 8 + 1)
        });
    });
    
    // Сортируем по времени
    testActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Сохраняем в глобальный объект и localStorage
    window.activities = testActivities;
    activities = testActivities;
    
    try {
        localStorage.setItem('userActivities', JSON.stringify(activities));
        console.log('Сохранены тестовые вопросы пользователей:', activities.length);
    } catch (e) {
        console.error('Ошибка при сохранении тестовых вопросов:', e);
    }
    
    return activities;
}

// Функция для загрузки данных о пользователях
function loadUsersData() {
  console.log('------- Загрузка данных о пользователях -------');
  
  const usersList = [];
  
  // Сканируем localStorage в поисках пользовательских ID
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('mts_design_cards_unique_user_id')) {
      const userId = localStorage.getItem(key);
      console.log('Найден пользователь:', userId);
      
      // Создаем объект с данными о пользователе
      const userObject = {
        id: userId,
        registeredAt: key.includes('_time_') ? key.split('_time_')[1] : 'Неизвестно',
        lastSeen: 'Неизвестно'
      };
      
      // Пробуем найти связанную активность для получения дополнительной информации
      try {
        const userActivities = activities.filter(activity => activity.userId === userId);
        if (userActivities.length > 0) {
          // Находим последнюю активность пользователя
          const latestActivity = userActivities.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp))[0];
          
          userObject.lastSeen = latestActivity.timestamp;
          userObject.activitiesCount = userActivities.length;
        }
      } catch (e) {
        console.error('Ошибка при анализе активностей пользователя:', e);
      }
      
      // Добавляем пользователя в список
      usersList.push(userObject);
    }
  }
  
  console.log('Загружено пользователей:', usersList.length);
  console.log('------- Завершение загрузки данных о пользователях -------');
  
  return usersList;
}

// Функция для отображения пользователей
function renderUsers() {
  console.log('Отрисовка списка пользователей...');
  
  // Получаем контейнер для списка пользователей
  const usersContainer = document.getElementById('users-list');
  if (!usersContainer) {
    console.warn('Контейнер для списка пользователей не найден в DOM');
    return;
  }
  
  // Очищаем контейнер
  usersContainer.innerHTML = '';
  
  // Загружаем данные о пользователях
  const usersList = loadUsersData();
  
  // Если пользователей нет, показываем сообщение
  if (usersList.length === 0) {
    console.log('Пользователи не найдены');
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-message';
    emptyMessage.textContent = 'Пока нет зарегистрированных пользователей';
    usersContainer.appendChild(emptyMessage);
    return;
  }
  
  // Сортируем пользователей по времени регистрации (новые сверху)
  const sortedUsers = usersList.sort((a, b) => {
    // Если у нас есть lastSeen, сортируем по нему, иначе по времени регистрации
    const dateA = a.lastSeen !== 'Неизвестно' ? new Date(a.lastSeen) : 
                 (a.registeredAt !== 'Неизвестно' ? new Date(a.registeredAt) : new Date(0));
    const dateB = b.lastSeen !== 'Неизвестно' ? new Date(b.lastSeen) : 
                 (b.registeredAt !== 'Неизвестно' ? new Date(b.registeredAt) : new Date(0));
    
    return dateB - dateA;
  });
  
  // Создаем элементы для каждого пользователя
  sortedUsers.forEach(user => {
    const userItem = document.createElement('div');
    userItem.className = 'user-item activity-item';
    
    // Форматируем даты
    const lastSeenDate = user.lastSeen !== 'Неизвестно' ? 
      new Date(user.lastSeen).toLocaleString() : 'Неизвестно';
    
    const registeredDate = user.registeredAt !== 'Неизвестно' ? 
      new Date(user.registeredAt).toLocaleString() : 'Неизвестно';
    
    // Создаем HTML для пользователя
    userItem.innerHTML = `
      <div class="activity-icon"><i class="fas fa-user"></i></div>
      <div class="activity-content">
        <div class="activity-details">ID: ${user.id.substring(0, 12)}...</div>
        <div class="activity-meta">
          ${user.activitiesCount ? `<span>Активностей: ${user.activitiesCount}</span>` : ''}
          <span>Последняя активность: ${lastSeenDate}</span>
        </div>
        <div class="activity-time">Зарегистрирован: ${registeredDate}</div>
      </div>
    `;
    
    // Добавляем элемент в контейнер
    usersContainer.appendChild(userItem);
  });
  
  console.log(`Отрисовано ${sortedUsers.length} пользователей`);
} 