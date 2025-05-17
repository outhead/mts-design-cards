/**
 * Основной модуль приложения - объединяет и координирует все модули
 * Инициализирует приложение, настраивает обработчики событий, управляет основным потоком
 */

// Глобальный объект для хранения всех модулей и состояния приложения
// Проверяем, существует ли уже window.app, чтобы не перезаписать существующее состояние
if (!window.app) {
  window.app = {
    // Будут заполнены при инициализации
    uiManager: null,
    cameraModule: null, 
    predictionModule: null,
    statsModule: null,
    
    // Состояние приложения
    state: {
      initialized: false,
      capturedPhotoDataUrl: null,
      selectedQuestion: null
    },

    // Добавляем новые свойства
    stateManager: null,
    eventBus: null
  };
  console.log('Инициализирован новый объект window.app');
} else {
  // Убедимся, что state существует даже если window.app был создан ранее
  if (!window.app.state) {
    window.app.state = {
      initialized: false,
      capturedPhotoDataUrl: null,
      selectedQuestion: null
    };
    console.log('Восстановлен объект state в существующем window.app');
  }
}

// Для удобства создаем локальную переменную app
const app = window.app;

// Инициализация приложения
function initApp() {
  console.log('Инициализация приложения...');
  
  // Проверка существования app.state и его создание при необходимости
  if (!app.state) {
    app.state = {
      initialized: false,
      capturedPhotoDataUrl: null,
      selectedQuestion: null
    };
    console.log('Создано новое состояние приложения в initApp');
  }
  
  // Загружаем модули, проверяя все возможные варианты их регистрации
  app.uiManager = window.uiManager || window.UIManager || {};
  app.cameraModule = window.cameraModule || window.CameraModule || {};
  app.predictionModule = window.predictionModule || window.PredictionModule || {};
  app.statsModule = window.statsModule || window.StatsModule || {};
  
  // Инициализируем StateManager
  app.stateManager = window.stateManager || window.StateManager || {};
  
  // Инициализируем EventBus
  app.eventBus = window.eventBus || window.EventBus || {};
  
  // Проверка наличия критически важных модулей и вывод предупреждений при необходимости
  const criticalModules = [
    { name: 'uiManager', instance: app.uiManager },
    { name: 'cameraModule', instance: app.cameraModule },
    { name: 'predictionModule', instance: app.predictionModule }
  ];
  
  const missingModules = criticalModules
    .filter(module => !module.instance || Object.keys(module.instance).length === 0)
    .map(module => module.name);
  
  if (missingModules.length > 0) {
    console.warn(`Не все модули загружены: ${missingModules.join(', ')}. Некоторые функции могут быть недоступны.`);
  }
  
  // Регистрация нового пользователя при инициализации приложения
  if (app.statsModule && typeof app.statsModule.registerUserVisit === 'function') {
    console.log('Регистрация нового пользователя через statsModule.registerUserVisit()');
    app.statsModule.registerUserVisit();
  } else if (window.statsModule && typeof window.statsModule.registerUserVisit === 'function') {
    console.log('Регистрация нового пользователя через window.statsModule.registerUserVisit()');
    window.statsModule.registerUserVisit();
  } else {
    console.warn('Функция registerUserVisit недоступна, пропускаем регистрацию пользователя');
  }
  
  // Инициализация UI элементов
  if (typeof app.uiManager?.initElements === 'function') {
    try {
      app.uiManager.initElements();
      console.log('UI элементы успешно инициализированы');
    } catch (error) {
      console.error('Ошибка при инициализации UI элементов:', error);
    }
  } else {
    console.warn('Функция initElements недоступна в uiManager');
  }
  
  // Загрузка данных карт
  if (typeof app.predictionModule?.loadCardsFromStorage === 'function') {
    try {
      app.predictionModule.loadCardsFromStorage();
      console.log('Данные карт успешно загружены');
    } catch (error) {
      console.error('Ошибка при загрузке данных карт:', error);
    }
  } else {
    console.warn('Функция loadCardsFromStorage недоступна в predictionModule');
  }
  
  // Настройка обработчиков событий
  try {
    setupEventListeners();
    console.log('Обработчики событий успешно настроены');
  } catch (error) {
    console.error('Ошибка при настройке обработчиков событий:', error);
  }
  
  // Инициализация опций вопросов
  if (typeof app.predictionModule?.setupQuestionOptions === 'function') {
    try {
      app.predictionModule.setupQuestionOptions();
      console.log('Опции вопросов успешно настроены');
    } catch (error) {
      console.error('Ошибка при настройке опций вопросов:', error);
    }
  } else {
    console.warn('Функция setupQuestionOptions недоступна в predictionModule');
  }
  
  // Отмечаем, что приложение инициализировано - с проверкой на существование app.state
  if (app.state) {
    app.state.initialized = true;
  } else {
    console.warn('app.state не существует, невозможно установить флаг initialized');
  }
  
  // Отображаем начальный экран
  if (typeof app.uiManager?.showScreen === 'function') {
    try {
      app.uiManager.showScreen('welcome-screen');
      console.log('Начальный экран успешно отображен');
    } catch (error) {
      console.error('Ошибка при отображении начального экрана:', error);
    }
  } else {
    console.warn('Функция showScreen недоступна в uiManager, пытаемся использовать альтернативные методы');
    
    // Пытаемся найти элемент welcome-screen и показать его вручную
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
  
  console.log('Приложение успешно инициализировано!');
}

// Настройка обработчиков событий
function setupEventListeners() {
  // Получаем элементы из UI модуля
  const elements = app.uiManager?.getElements?.() || {};
  
  // Добавляем обработчик для кнопки "Начать"
  const startButton = document.getElementById('start-button');
  if (startButton) {
    startButton.addEventListener('click', () => {
      console.log('Кнопка "Начать" нажата, открываем диалог выбора файла...');
      
      // Вместо показа модального окна, сразу активируем стандартный 
      // интерфейс выбора файла (который также предлагает использовать камеру)
      const fileInput = document.getElementById('file-upload-input');
      if (fileInput) {
        fileInput.click();
      } else {
        console.error('Элемент file-upload-input не найден');
      }
    });
  }
  
  // Обработчики навигации между экранами
  if (elements.toQuestionButton) {
    elements.toQuestionButton.addEventListener('click', () => {
      app.uiManager.showScreen('question-screen');
    });
  }
  
  if (elements.backToWelcomeButton) {
    elements.backToWelcomeButton.addEventListener('click', () => {
      app.uiManager.showScreen('welcome-screen');
    });
  }
  
  // Обработчики работы с камерой
  if (elements.takePhotoBtn) {
    elements.takePhotoBtn.addEventListener('click', () => {
      if (typeof app.cameraModule?.capturePhoto === 'function') {
        app.cameraModule.capturePhoto();
      }
    });
  }
  
  if (elements.usePhotoBtn) {
    elements.usePhotoBtn.addEventListener('click', () => {
      if (typeof app.cameraModule?.handleUsePhoto === 'function') {
        app.cameraModule.handleUsePhoto();
      }
    });
  }
  
  // Обработчик для загрузки файла
  const fileUploadInput = document.getElementById('file-upload-input');
  if (fileUploadInput) {
    fileUploadInput.addEventListener('change', (event) => {
      if (typeof app.cameraModule?.handleFileInputChange === 'function') {
        app.cameraModule.handleFileInputChange(event);
      } else {
        console.warn('Функция handleFileInputChange недоступна в cameraModule');
      }
    });
  }
  
  // Обработчики для экрана результатов и предсказаний
  if (elements.submitButton) {
    elements.submitButton.addEventListener('click', () => {
      if (typeof app.predictionModule?.handleFormSubmit === 'function') {
        app.predictionModule.handleFormSubmit();
      }
    });
  }
  
  // Добавляем обработчик для кнопки "Далее" на экране вопросов
  const nextButton = document.getElementById('next-button');
  if (nextButton) {
    // Сначала удаляем все существующие обработчики, чтобы избежать дублирования
    const newNextButton = nextButton.cloneNode(true);
    if (nextButton.parentNode) {
      nextButton.parentNode.replaceChild(newNextButton, nextButton);
    }
    
    // Добавляем новый обработчик
    newNextButton.addEventListener('click', () => {
      console.log('Кнопка "Далее" нажата');
      
      // Получаем выбранный вопрос
      let selectedQuestion = null;
      const selectedOption = document.querySelector('.question-option.selected');
      
      if (selectedOption) {
        const questionId = selectedOption.dataset.questionId;
        // Если выбран свой вопрос (id = 0), используем текст из поля ввода
        if (questionId === '0') {
          const questionField = document.getElementById('question');
          if (questionField && questionField.value.trim()) {
            selectedQuestion = {
              id: 0,
              text: questionField.value.trim()
            };
          }
        } else {
          // Иначе используем текст из выбранной опции
          selectedQuestion = {
            id: questionId,
            text: selectedOption.querySelector('p').textContent
          };
        }
      }
      
      // Проверяем, что у нас есть выбранный вопрос или фото
      const hasPhoto = app.state?.capturedPhotoDataUrl || 
                     (document.getElementById('image-preview') && 
                      document.getElementById('image-preview').src && 
                      document.getElementById('image-preview').src !== 'data:,');
      
      if (!selectedQuestion && !hasPhoto) {
        console.warn('Не выбран вопрос и нет фото');
        
        // Показываем уведомление, если есть такая функция
        if (app.uiManager && typeof app.uiManager.showNotification === 'function') {
          app.uiManager.showNotification('Пожалуйста, выберите вопрос или загрузите фото', 'warning');
        }
        return;
      }
      
      // Сохраняем выбранный вопрос в state
      if (selectedQuestion && app.state) {
        app.state.selectedQuestion = selectedQuestion;
      }
      
      // Отправляем данные в модуль предсказаний
      if (typeof app.predictionModule?.handleFormSubmit === 'function') {
        app.predictionModule.handleFormSubmit();
      } else {
        console.warn('Функция handleFormSubmit недоступна в predictionModule');
        
        // Если модуль предсказаний не доступен, переходим к экрану загрузки
        if (app.uiManager && typeof app.uiManager.showScreen === 'function') {
          app.uiManager.showScreen('loading-screen');
          
          // И затем через небольшую задержку к экрану результата
          setTimeout(() => {
            app.uiManager.showScreen('result-screen');
            
            // Устанавливаем некоторые тестовые данные
            const predictionTitle = document.getElementById('prediction-title');
            const predictionText = document.getElementById('prediction-text');
            
            if (predictionTitle) {
              predictionTitle.textContent = 'ДЕМО КАРТА';
            }
            
            if (predictionText) {
              predictionText.textContent = 'Это демонстрационное предсказание, поскольку модуль предсказаний недоступен.';
            }
          }, 1500);
        }
      }
    });
  }
  
  // Добавляем обработчик для кнопки "Назад" на экране вопросов
  const backButton = document.getElementById('back-button');
  if (backButton) {
    backButton.addEventListener('click', () => {
      console.log('Кнопка "Назад" нажата, возвращаемся на главный экран');
      
      // Очищаем превью изображения, если оно есть
      const imagePreview = document.getElementById('image-preview');
      const imagePreviewContainer = document.getElementById('image-preview-container');
      if (imagePreview) {
        imagePreview.src = '';
      }
      
      if (imagePreviewContainer) {
        imagePreviewContainer.style.display = 'none';
      }
      
      // Сбрасываем значение input файла, чтобы можно было повторно выбрать тот же файл
      const fileInput = document.getElementById('file-upload-input');
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Отменяем выделение вопросов
      const questionOptions = document.querySelectorAll('.question-option');
      questionOptions.forEach(opt => opt.classList.remove('selected'));
      
      // Скрываем поле для своего вопроса
      const customQuestionGroup = document.getElementById('custom-question-group');
      if (customQuestionGroup) {
        customQuestionGroup.style.display = 'none';
      }
      
      // Сбрасываем текстовое поле вопроса
      const questionInput = document.getElementById('question');
      if (questionInput) {
        questionInput.value = '';
      }
      
      // Переходим на главный экран
      if (typeof app.uiManager?.showScreen === 'function') {
        app.uiManager.showScreen('welcome-screen');
      } else {
        console.warn('Функция showScreen недоступна в uiManager');
      }
    });
  }
  
  if (elements.resetButton) {
    elements.resetButton.addEventListener('click', () => {
      if (typeof app.predictionModule?.resetAndGoToWelcome === 'function') {
        app.predictionModule.resetAndGoToWelcome();
      }
    });
  }
  
  if (elements.shareButton) {
    elements.shareButton.addEventListener('click', () => {
      if (typeof app.predictionModule?.handleShare === 'function') {
        app.predictionModule.handleShare();
      }
    });
  }
  
  // Обработчик для кнопки очистки кэша сопоставлений
  const clearCacheButton = document.getElementById('clear-cache-button');
  if (clearCacheButton) {
    clearCacheButton.addEventListener('click', () => {
      if (typeof app.predictionModule?.clearImageCardMappings === 'function') {
        app.predictionModule.clearImageCardMappings();
      }
    });
    
    // Добавляем интерактивность и подтверждение
    clearCacheButton.addEventListener('mouseenter', () => {
      clearCacheButton.style.opacity = '1';
    });
    
    clearCacheButton.addEventListener('mouseleave', () => {
      clearCacheButton.style.opacity = '0.3';
    });
  }
  
  // Синхронизация состояния приложения с модулями
  syncAppState();
}

// Синхронизация состояния приложения с модулями
function syncAppState() {
  // Проверка существования app.state и его создание при необходимости
  if (!app.state) {
    app.state = {
      initialized: false,
      capturedPhotoDataUrl: null,
      selectedQuestion: null
    };
    console.log('Создано новое состояние приложения, так как app.state был undefined');
  }
  
  try {
    // Обновляем capturedPhotoDataUrl из модуля камеры
    if (app.cameraModule && typeof app.cameraModule.getCapturedPhotoDataUrl === 'function') {
      app.state.capturedPhotoDataUrl = app.cameraModule.getCapturedPhotoDataUrl() || null;
    }
    
    // Обновляем selectedQuestion из модуля предсказаний
    if (app.predictionModule && typeof app.predictionModule.getSelectedQuestion === 'function') {
      app.state.selectedQuestion = app.predictionModule.getSelectedQuestion() || null;
    }
    
    // Безопасная установка наблюдателей для автоматического обновления состояния
    if (app.cameraModule && typeof app.cameraModule.setCapturedPhotoDataUrl === 'function') {
      const originalSetCapturedPhotoDataUrl = app.cameraModule.setCapturedPhotoDataUrl;
      app.cameraModule.setCapturedPhotoDataUrl = (dataUrl) => {
        const result = originalSetCapturedPhotoDataUrl(dataUrl);
        if (app.state) app.state.capturedPhotoDataUrl = dataUrl;
        return result;
      };
    }
    
    if (app.predictionModule && typeof app.predictionModule.setSelectedQuestion === 'function') {
      const originalSetSelectedQuestion = app.predictionModule.setSelectedQuestion;
      app.predictionModule.setSelectedQuestion = (question) => {
        const result = originalSetSelectedQuestion(question);
        if (app.state) app.state.selectedQuestion = question;
        return result;
      };
    }
    
    console.log('Состояние приложения успешно синхронизировано');
  } catch (error) {
    console.error('Ошибка при синхронизации состояния приложения:', error);
  }
}

// Метод для получения текущего состояния приложения
function getAppState() {
  return app.state;
}

// Обработка событий Telegram WebApp
function setupTelegramEvents() {
  const tgApp = window.Telegram?.WebApp;
  
  if (!tgApp) {
    console.warn('Telegram WebApp API не обнаружен');
    return;
  }
  
  // Устанавливаем готовность приложения
  tgApp.ready();
  
  // Настройка темы (светлая/темная)
  const isDarkTheme = tgApp.colorScheme === 'dark';
  document.body.classList.toggle('dark-theme', isDarkTheme);
  
  // Обработка изменения темы
  tgApp.onEvent('themeChanged', () => {
    const isDarkTheme = tgApp.colorScheme === 'dark';
    document.body.classList.toggle('dark-theme', isDarkTheme);
  });
  
  // Дополнительные настройки
  if (tgApp.isExpanded) {
    const mainContainer = document.querySelector('.main-container');
    if (mainContainer) {
      mainContainer.classList.add('expanded');
    }
  } else {
    // Обработка разворачивания приложения
    tgApp.onEvent('viewportChanged', () => {
      const mainContainer = document.querySelector('.main-container');
      if (mainContainer) {
        mainContainer.classList.toggle('expanded', tgApp.isExpanded);
      }
    });
  }
  
  console.log('Telegram WebApp события настроены');
}

// Функция для обновления состояния кнопки отправки
function updateSubmitButtonState() {
  if (typeof app.uiManager?.updateSubmitButtonState === 'function') {
    app.uiManager.updateSubmitButtonState();
  }
}

/**
 * Запуск камеры для создания фото
 * Функция вызывается при нажатии кнопки "Сделать фото"
 */
function startCamera() {
  console.log('Запуск камеры...');
  
  // Проверяем, доступен ли API камеры браузера
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.log('API камеры не поддерживается в этом браузере. Показываем интерфейс выбора файла.');
    // Добавляем интерфейс выбора файла вместо прямого вызова
    showFileSelectionInterface();
    return;
  }
  
  if (typeof app.cameraModule?.startCamera === 'function') {
    try {
      app.cameraModule.startCamera();
    } catch (error) {
      console.error('Ошибка при запуске камеры:', error);
      // Показываем интерфейс выбора файла вместо прямого вызова
      showFileSelectionInterface();
    }
  } else {
    console.log('Функция запуска камеры недоступна. Открываем экран вопросов напрямую.');
    // Временное решение - переходим к экрану вопросов
    if (typeof app.uiManager?.showScreen === 'function') {
      app.uiManager.showScreen('question-screen');
      // Показываем интерфейс выбора файла
      showFileSelectionInterface();
    } else {
      // Если UI Manager недоступен, используем прямое переключение экранов
      document.querySelectorAll('[id$="-screen"]').forEach(screen => screen.classList.remove('active'));
      const questionScreen = document.getElementById('question-screen');
      if (questionScreen) {
        questionScreen.classList.add('active');
        questionScreen.style.display = 'flex';
        // Показываем интерфейс выбора файла
        showFileSelectionInterface();
      }
    }
  }
}

/**
 * Показывает интерфейс для выбора файла
 * Эта функция добавлена для поддержки iOS 18, где прямой вызов fileInput.click() не работает
 */
function showFileSelectionInterface() {
  // Находим questionScreen, если он еще не отображается
  const questionScreen = document.getElementById('question-screen');
  if (!questionScreen) return;
  
  // Если уже есть контейнер для опций загрузки файла, не создаем новый
  if (document.getElementById('file-options-container')) return;
  
  // Создаем контейнер для опций выбора файла
  const optionsContainer = document.createElement('div');
  optionsContainer.id = 'file-options-container';
  optionsContainer.className = 'camera-options';
  optionsContainer.style.display = 'flex';
  optionsContainer.style.flexDirection = 'column';
  optionsContainer.style.alignItems = 'center';
  optionsContainer.style.gap = '15px';
  optionsContainer.style.margin = '20px 0';
  
  // Кнопка выбора из галереи
  const galleryButton = document.createElement('button');
  galleryButton.textContent = 'Выбрать из галереи';
  galleryButton.className = 'primary-button';
  galleryButton.addEventListener('click', () => {
    const fileInput = document.getElementById('file-upload-input');
    if (fileInput) {
      fileInput.click();
    }
  });
  
  optionsContainer.appendChild(galleryButton);
  
  // Вставляем контейнер в начало questionScreen
  const firstElement = questionScreen.querySelector('h2') || questionScreen.firstElementChild;
  if (firstElement) {
    questionScreen.insertBefore(optionsContainer, firstElement.nextSibling);
  } else {
    questionScreen.appendChild(optionsContainer);
  }
}

/**
 * Обработка выбранного изображения
 * @param {File} file - Загруженный файл изображения
 */
function processUploadedImage(file) {
  console.log('Обработка загруженного изображения...');
  
  if (!file) {
    console.error('Файл не выбран');
    return;
  }
  
  // Если доступен модуль камеры, используем его функцию обработки
  if (typeof app.cameraModule?.processImageFile === 'function') {
    app.cameraModule.processImageFile(file);
  } else {
    // Если нет, создаем временное решение
    const reader = new FileReader();
    reader.onload = function(e) {
      const imageDataUrl = e.target.result;
      
      // Сохраняем данные изображения в состоянии приложения
      app.state.capturedPhotoDataUrl = imageDataUrl;
      
      // Создаем экран вопросов, если его нет
      let questionScreen = document.getElementById('question-screen');
      if (!questionScreen) {
        // Создаем базовый экран вопросов
        questionScreen = document.createElement('div');
        questionScreen.id = 'question-screen';
        questionScreen.className = 'glass-card';
        questionScreen.style.display = 'none';
        
        // Добавляем заголовок
        const title = document.createElement('h2');
        title.className = 'screen-title';
        title.textContent = 'Выберите вопрос';
        questionScreen.appendChild(title);
        
        // Добавляем контейнер для превью изображения
        const previewContainer = document.createElement('div');
        previewContainer.id = 'image-preview-container';
        previewContainer.className = 'image-preview-container';
        previewContainer.style.display = 'none';
        
        const previewImage = document.createElement('img');
        previewImage.id = 'image-preview';
        previewImage.className = 'image-preview';
        previewImage.alt = 'Превью изображения';
        
        previewContainer.appendChild(previewImage);
        questionScreen.appendChild(previewContainer);
        
        // Добавляем экран в body
        document.body.appendChild(questionScreen);
      }
      
      // Показываем превью изображения, если есть соответствующий элемент
      const imagePreview = document.getElementById('image-preview');
      const imagePreviewContainer = document.getElementById('image-preview-container');
      
      if (imagePreview && imagePreviewContainer) {
        imagePreview.src = imageDataUrl;
        imagePreviewContainer.style.display = 'block';
      }
      
      // Переходим к экрану вопросов
      if (typeof app.uiManager?.showScreen === 'function') {
        app.uiManager.showScreen('question-screen');
      } else {
        // Если UI Manager недоступен, используем прямое переключение экранов
        document.querySelectorAll('[id$="-screen"]').forEach(screen => {
          if (screen) {
            screen.classList.remove('active');
            screen.style.display = 'none';
          }
        });
        
        questionScreen.classList.add('active');
        questionScreen.style.display = 'flex';
        
        // Добавляем класс active к контейнеру, чтобы гарантировать видимость
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) {
          mainContainer.classList.add('active');
        }
        
        // Логируем переход
        if (window.logger) {
          window.logger.info('Переход к экрану вопросов выполнен');
        } else {
          console.log('Переход к экрану вопросов выполнен');
        }
      }
    };
    
    // Читаем файл как Data URL
    reader.readAsDataURL(file);
  }
}

// Экспортируем функции модуля
window.appModule = {
  init: initApp,
  setupEventListeners,
  getAppState,
  setupTelegramEvents,
  updateSubmitButtonState,
  startCamera,
  processUploadedImage,
  showFileSelectionInterface
};

// Также экспортируем с заглавной буквы для совместимости
window.AppModule = window.appModule;

// Автоматически инициализируем приложение при полной загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM полностью загружен, инициализируем приложение...');
  initApp();
  setupTelegramEvents();
}); 