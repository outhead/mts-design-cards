/**
 * Модуль управления UI элементами
 * Отвечает за взаимодействие с DOM, переключение экранов и обновление UI
 */

// Объект для хранения всех DOM элементов
const elements = {};

// Инициализация и кэширование DOM элементов
function initElements() {
  // Экраны
  elements.welcomeScreen = document.getElementById('welcome-screen');
  elements.questionScreen = document.getElementById('question-screen');
  elements.loadingScreen = document.getElementById('loading-screen');
  elements.resultScreen = document.getElementById('result-screen');
  
  // Поля ввода
  elements.questionField = document.getElementById('question');
  elements.fileUploadInput = document.getElementById('file-upload-input');
  
  // Кнопки
  elements.toQuestionButton = document.getElementById('to-question-button');
  elements.backToWelcomeButton = document.getElementById('back-to-welcome-button');
  elements.submitButton = document.getElementById('submit-button');
  elements.resetButton = document.getElementById('reset-button');
  elements.shareButton = document.getElementById('share-button');
  elements.takePhotoBtn = document.getElementById('take-photo-btn');
  elements.usePhotoBtn = document.getElementById('use-photo-btn');
  elements.uploadPhotoBtn = document.getElementById('upload-photo-btn');
  elements.removeImageButton = document.getElementById('remove-image');
  elements.nextButton = document.getElementById('next-button');
  elements.backButton = document.getElementById('back-button');
  
  // Контейнеры и элементы отображения
  elements.predictionText = document.getElementById('prediction-text');
  elements.imagePreviewContainer = document.getElementById('image-preview-container');
  elements.imagePreview = document.getElementById('image-preview');
  elements.resultCardImage = document.getElementById('result-card-image');
  elements.cardTitle = document.getElementById('card-title');
  elements.questionOptions = document.querySelectorAll('.question-option');
  elements.sampleQrCode = document.getElementById('sample-qr-code');
  elements.cameraStreamEl = document.getElementById('camera-stream');
  elements.cameraContainer = document.querySelector('.camera-container');
  elements.photoPreviewContainer = document.getElementById('photo-preview-container') || document.createElement('div');
  
  // Элементы для полноэкранного просмотра карты
  elements.fullscreenCardModal = document.getElementById('fullscreen-card-modal');
  elements.fullscreenCardImage = document.getElementById('fullscreen-card-image');
  elements.fullscreenCardTitle = document.getElementById('fullscreen-card-title');
  elements.closeModalBtn = document.querySelector('#fullscreen-card-modal .close-modal');
  elements.cardImageContainer = document.querySelector('.card-image-container');
  
  // Создаем photoPreviewContainer, если он отсутствует
  if (!document.getElementById('photo-preview-container') && elements.photoPreviewContainer) {
    elements.photoPreviewContainer.id = 'photo-preview-container';
    elements.photoPreviewContainer.classList.add('hidden');
    if (elements.cameraContainer && elements.cameraContainer.parentNode) {
      elements.cameraContainer.parentNode.insertBefore(elements.photoPreviewContainer, elements.cameraContainer.nextSibling);
    }
  }
  
  // Инициализируем обработчики для полноэкранного просмотра карты
  initCardFullscreenView();
  
  // Инициализируем новый обработчик просмотра карты (дублирование для надежности)
  setupCardPreview();
  
  return elements;
}

// Функция для инициализации полноэкранного просмотра карты
function initCardFullscreenView() {
  if (elements.cardImageContainer && elements.resultCardImage) {
    // Добавляем обработчик клика на контейнер с изображением карты
    elements.cardImageContainer.addEventListener('click', openFullscreenCardModal);
    
    // Обработчик для закрытия модального окна
    if (elements.closeModalBtn) {
      elements.closeModalBtn.addEventListener('click', closeFullscreenCardModal);
    }
    
    // Обработчик закрытия по клику на фоне
    if (elements.fullscreenCardModal) {
      elements.fullscreenCardModal.addEventListener('click', function(e) {
        if (e.target === elements.fullscreenCardModal) {
          closeFullscreenCardModal();
        }
      });
    }
    
    // Обработчик закрытия по Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && elements.fullscreenCardModal.style.display !== 'none') {
        closeFullscreenCardModal();
      }
    });
  }
}

// Открытие модального окна для полноэкранного просмотра карты
function openFullscreenCardModal() {
  if (!elements.fullscreenCardModal || !elements.resultCardImage) return;
  
  // Копируем данные из текущей карты в модальное окно
  elements.fullscreenCardImage.src = elements.resultCardImage.src;
  elements.fullscreenCardTitle.textContent = elements.cardTitle.textContent;
  
  // Открываем модальное окно
  elements.fullscreenCardModal.style.display = 'flex';
  
  // Предотвращаем прокрутку страницы при открытом модальном окне
  document.body.style.overflow = 'hidden';
}

// Закрытие модального окна
function closeFullscreenCardModal() {
  if (!elements.fullscreenCardModal) return;
  
  // Добавляем анимацию исчезания
  elements.fullscreenCardModal.style.animation = 'fadeOut 0.3s ease';
  
  // Закрываем с небольшой задержкой для анимации
  setTimeout(() => {
    elements.fullscreenCardModal.style.display = 'none';
    elements.fullscreenCardModal.style.animation = 'fadeIn 0.3s ease';
    
    // Восстанавливаем прокрутку страницы
    document.body.style.overflow = '';
  }, 300);
}

// Функция для переключения между экранами
function showScreen(screenId) {
  // Преобразование идентификатора в формат с суффиксом "-screen"
  const elementId = screenId.includes('-') ? screenId : `${screenId}-screen`;
  
  // Получение всех экранов
  const allScreens = document.querySelectorAll('[id$="-screen"]');
  const isMobile = window.innerWidth <= 480;
  
  // Управление хедером
  const header = document.querySelector('header');
  if (header) {
    // Если это экран вопросов - всегда скрываем хедер
    if (elementId === 'question-screen') {
      header.style.display = 'none';
      header.style.visibility = 'hidden';
      header.style.opacity = '0';
      document.body.classList.add('header-hidden');
    } 
    // Показываем хедер только на главном экране
    else if (elementId === 'welcome-screen') {
      header.style.display = 'block';
      header.style.visibility = 'visible';
      header.style.opacity = '1';
      document.body.classList.remove('header-hidden');
    } 
    // Скрываем хедер на всех остальных экранах
    else {
      header.style.display = 'none';
      header.style.visibility = 'hidden';
      header.style.opacity = '0';
      document.body.classList.add('header-hidden');
    }
  }
  
  // Скрытие всех экранов
  allScreens.forEach(screen => {
    screen.style.display = 'none';
    screen.classList.remove('active');
    screen.style.opacity = '0';
    screen.style.visibility = 'hidden';
    
    // Дополнительные стили для мобильных устройств
    if (isMobile) {
      screen.style.position = 'absolute';
      screen.style.zIndex = '-1';
      screen.style.pointerEvents = 'none';
    }
  });
  
  // Показ выбранного экрана
  const screenElement = document.getElementById(elementId);
  if (screenElement) {
    // Сброс скрывающих стилей
    screenElement.style.position = '';
    screenElement.style.zIndex = '';
    screenElement.style.pointerEvents = '';
    
    // Правильный стиль отображения
    const displayStyle = elementId === 'result-screen' ? 'block' : 'flex';
    
    // Применение стилей отображения
    screenElement.style.display = displayStyle;
    screenElement.style.visibility = 'visible';
    screenElement.style.opacity = '1';
    screenElement.classList.add('active');
    
    // Компенсируем отсутствие хедера для всех экранов кроме welcome-screen
    if (elementId !== 'welcome-screen' && header) {
      screenElement.style.marginTop = '20px'; // Компенсируем отсутствие хедера
    } else {
      screenElement.style.marginTop = '';
    }
    
    // Принудительный перерасчет макета
    screenElement.offsetHeight;
    
    // Инициализация конкретного экрана
    initSpecificScreen(elementId);
  }
}

// Инициализация специфичных элементов для каждого экрана
function initSpecificScreen(screenId) {
  // Экспортируем методы других модулей, чтобы избежать циклических зависимостей
  const { stopCamera } = app.cameraModule || {};
  const { capturedPhotoDataUrl } = app.state || {};
  
  // Вызываем остановку камеры при любом переключении экрана
  if (typeof stopCamera === 'function') {
    stopCamera();
  }
  
  // Обновляем состояние кнопки "Далее" на экране вопросов
  const updateNextButtonState = () => {
    const nextButton = document.getElementById('next-button');
    if (!nextButton) return;
    
    const hasImage = capturedPhotoDataUrl || 
                    (elements.imagePreview && elements.imagePreview.src && 
                    elements.imagePreview.src !== 'data:,' && 
                    elements.imagePreview.src !== window.location.href);
    
    const hasSelectedQuestion = document.querySelector('.question-option.selected') !== null ||
                               (document.getElementById('question') && 
                               document.getElementById('question').value.trim() !== '');
    
    // Активируем кнопку если выбран вопрос ИЛИ загружено изображение
    if (hasImage || hasSelectedQuestion) {
      nextButton.disabled = false;
      nextButton.classList.remove('disabled');
    } else {
      nextButton.disabled = true;
      nextButton.classList.add('disabled');
    }
  };
  
  switch (screenId) {
    case 'welcome-screen':
      // Скрываем превью изображения при возврате на главный экран
      if (elements.imagePreviewContainer) {
        elements.imagePreviewContainer.style.display = 'none';
      }
      
      // Сбрасываем URL захваченного фото при возврате на главный экран
      if (app.state) {
        app.state.capturedPhotoDataUrl = null;
      }
      
      // Скрываем контейнер с камерой
      if (elements.cameraContainer) {
        elements.cameraContainer.classList.add('hidden');
      }
      
      // Скрываем контейнер с превью фото
      if (elements.photoPreviewContainer) {
        elements.photoPreviewContainer.classList.add('hidden');
      }
      break;
      
    case 'question-screen':
      // Обновляем состояние кнопки "Далее"
      updateNextButtonState();
      
      // Настраиваем обработчики для вопросов и изображений
      setupQuestionScreen();
      
      // Убираем автоматический запуск камеры здесь, чтобы пользователь сам выбирал источник фото
      break;
      
    case 'result-screen':
      // Настраиваем отображение обратной связи
      setupFeedbackButtons();
      
      // Добавляем возможность просмотра карты
      setupCardFullscreenView();
      break;
      
    case 'loading-screen':
      // Показываем случайные факты во время загрузки
      setupLoadingFacts();
      break;
      
    default:
      break;
  }
}

// Настройка экрана с вопросами
function setupQuestionScreen() {
  // Обработчики для опций вопросов
  document.querySelectorAll('.question-option').forEach(option => {
    option.addEventListener('click', function() {
      // Снимаем выбор со всех опций
      document.querySelectorAll('.question-option').forEach(opt => {
        opt.classList.remove('selected');
      });
      
      // Выбираем текущую опцию
      this.classList.add('selected');
      
      // Обновляем состояние кнопки "Далее"
      updateSubmitButtonState();
    });
  });
  
  // Обновляем состояние кнопки при изменении текста в поле вопроса
  const questionField = document.getElementById('question');
  if (questionField) {
    questionField.addEventListener('input', updateSubmitButtonState);
  }
}

// Обновление состояния кнопки "Далее" на экране вопросов
function updateSubmitButtonState() {
  const submitButton = document.getElementById('next-button');
  if (!submitButton) return;
  
  const hasSelectedOption = document.querySelector('.question-option.selected') !== null;
  const hasCustomQuestion = document.getElementById('question') && 
                           document.getElementById('question').value.trim() !== '';
  const hasImage = elements.imagePreview && 
                  elements.imagePreview.src && 
                  elements.imagePreview.src !== 'data:,' && 
                  elements.imagePreview.src !== window.location.href;
  
  // Проверяем изображение в app.state
  const stateHasImage = app.state && app.state.capturedPhotoDataUrl;
  
  // Активируем кнопку только если выбран вопрос И есть изображение
  if ((hasSelectedOption || hasCustomQuestion) && (hasImage || stateHasImage)) {
    submitButton.disabled = false;
    submitButton.classList.remove('disabled');
  } else {
    submitButton.disabled = true;
    submitButton.classList.add('disabled');
  }
}

// Показать уведомление
function showNotification(message, type = 'info') {
  // Удаляем существующие уведомления
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => {
    notification.remove();
  });
  
  // Создаем элемент уведомления
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Добавляем в DOM
  document.body.appendChild(notification);
  
  // Показываем с анимацией
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Автоматически скрываем через 3 секунды
  setTimeout(() => {
    notification.classList.remove('show');
    
    // Удаляем из DOM после анимации
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Отображение карточки в результате
function displayCard(cardKey, cardData, selectionMethod = 'image') {
  if (!cardData || !elements.resultCardImage) {
    console.error('Не удалось отобразить карту: отсутствуют данные или элементы DOM');
    return;
  }
  
  // Добавляем индикатор метода выбора карты
  const indicatorText = selectionMethod === 'image' 
    ? 'Карта выбрана на основе вашего изображения' 
    : 'Карта выбрана случайным образом';
  
  // Ищем или создаем элемент для индикатора
  let selectionIndicator = document.getElementById('card-selection-method');
  if (!selectionIndicator) {
    selectionIndicator = document.querySelector('.selection-method-indicator');
  }
  
  // Устанавливаем текст индикатора
  if (selectionIndicator) {
    selectionIndicator.textContent = indicatorText;
    selectionIndicator.className = `selection-method-indicator ${selectionMethod === 'image' ? 'image-based' : 'random-based'}`;
  }
  
  // Установка заголовка карты
  const cardTitle = cardData.title || 'Предсказание';
  
  // Изменяем заголовок экрана результата на название карты
  const predictionTitle = document.getElementById('prediction-title');
  if (predictionTitle) {
    predictionTitle.textContent = cardTitle;
  }
  
  // Также устанавливаем заголовок для полноэкранного режима
  const fullscreenCardTitle = document.getElementById('fullscreen-card-title');
  if (fullscreenCardTitle) {
    fullscreenCardTitle.textContent = cardTitle;
  }
  
  // Используем настоящие файлы карт из папки img/cards (поддержка WebP вместо PNG)
  const cardImagePath = `img/cards/${cardKey}.webp`;
  
  // Встроенное Base64 изображение как запасной вариант
  const fallbackImage = 'data:image/png;base64,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';
  
  // Обработчик ошибки загрузки изображения
  elements.resultCardImage.onerror = function() {
    console.warn(`Не удалось загрузить изображение карты ${cardKey} из ${cardImagePath}, используем запасной вариант`);
    elements.resultCardImage.src = fallbackImage;
    elements.resultCardImage.style.opacity = '1';
  };
  
  // Обработчик успешной загрузки
  elements.resultCardImage.onload = function() {
    console.log(`Изображение карты ${cardKey} успешно загружено`);
    elements.resultCardImage.style.opacity = '1';
    
    // После загрузки карты инициализируем обработчики для полноэкранного просмотра
    setupCardFullscreenView();
  };
  
  // Устанавливаем изображение карты
  try {
    elements.resultCardImage.src = cardImagePath;
  } catch (error) {
    console.error('Ошибка при установке изображения карты:', error);
    elements.resultCardImage.src = fallbackImage;
  }
}

// Отображение текста предсказания
function displayPrediction(text) {
  if (!elements.predictionText) {
    console.error('Не удалось отобразить предсказание: отсутствует элемент DOM');
    return;
  }
  
  // Установка текста предсказания
  elements.predictionText.textContent = text;
  
  // Показываем текст с анимацией
  elements.predictionText.style.opacity = '1';
}

// Добавляем функцию для обработки полноэкранного просмотра карты
function setupCardPreview() {
    const cardImageContainer = document.querySelector('.card-image-container');
    const fullscreenModal = document.getElementById('fullscreen-card-modal');
    
    if (!cardImageContainer || !fullscreenModal) {
        console.warn('Не найдены элементы для полноэкранного просмотра карты');
        return;
    }
    
    const fullscreenImage = document.getElementById('fullscreen-card-image');
    const fullscreenTitle = document.getElementById('fullscreen-card-title');
    const closeModal = document.querySelector('.close-modal');
    
    if (cardImageContainer) {
        cardImageContainer.addEventListener('click', function() {
            // Получаем источник картинки и текст заголовка
            const cardImage = document.getElementById('result-card-image');
            const predictionTitle = document.getElementById('prediction-title');
            
            // Устанавливаем значения для модального окна
            if (fullscreenImage && cardImage) {
                fullscreenImage.src = cardImage.src;
            }
            
            // Обновляем регулярное выражение для распознавания карт в формате WebP
            const cardMatch = cardImage.src.match(/card(\d+)\.webp/);
            
            if (fullscreenTitle && predictionTitle) {
                fullscreenTitle.textContent = predictionTitle.textContent;
            }
            
            // Показываем модальное окно
            if (fullscreenModal) {
                fullscreenModal.style.display = 'flex';
                console.log('Открыто полноэкранное изображение карты');
            }
        });
    }
    
    // Закрытие модального окна
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            if (fullscreenModal) {
                fullscreenModal.style.display = 'none';
                console.log('Закрыто полноэкранное изображение карты');
            }
        });
    }
    
    // Закрытие при клике вне картинки
    if (fullscreenModal) {
        fullscreenModal.addEventListener('click', function(event) {
            if (event.target === fullscreenModal) {
                fullscreenModal.style.display = 'none';
                console.log('Закрыто полноэкранное изображение карты (клик вне изображения)');
            }
        });
    }
    
    console.log('Настроен обработчик для просмотра карты на весь экран');
}

// Настройка полноэкранного просмотра карты
function setupCardFullscreenView() {
  const cardImageContainer = document.querySelector('.card-image-container');
  const fullscreenModal = document.getElementById('card-fullscreen-modal');
  
  if (!cardImageContainer || !fullscreenModal) {
    console.error('Элементы для полноэкранного просмотра не найдены');
    return;
  }
  
  const fullscreenImg = document.getElementById('fullscreen-card-img');
  const fullscreenTitle = document.getElementById('fullscreen-card-title');
  const closeModalBtn = document.querySelector('#card-fullscreen-modal .close-modal');
  
  if (!fullscreenImg || !fullscreenTitle) {
    console.error('Элементы изображения или заголовка для полноэкранного просмотра не найдены');
    return;
  }
  
  // Обработчик клика по контейнеру с картой
  cardImageContainer.onclick = function() {
    // Получаем источник картинки и текст заголовка
    const cardImage = document.getElementById('result-card-image');
    const predictionTitle = document.getElementById('prediction-title');
    
    if (cardImage && predictionTitle) {
      fullscreenImg.src = cardImage.src;
      fullscreenTitle.textContent = predictionTitle.textContent;
      
      // Показываем модальное окно
      fullscreenModal.style.display = 'block';
      console.log('Открыто полноэкранное изображение карты');
    }
  };
  
  // Обработчик клика по кнопке закрытия
  if (closeModalBtn) {
    closeModalBtn.onclick = function() {
      if (fullscreenModal) {
        fullscreenModal.style.display = 'none';
        console.log('Закрыто полноэкранное изображение карты');
      }
    };
  }
  
  // Обработчик клика по фону модального окна
  if (fullscreenModal) {
    fullscreenModal.onclick = function(event) {
      if (event.target === fullscreenModal) {
        fullscreenModal.style.display = 'none';
        console.log('Закрыто полноэкранное изображение карты (клик вне изображения)');
      }
    };
  }
  
  console.log('Настроены обработчики для полноэкранного просмотра карты');
  
  // Настройка кнопок эмодзи для обратной связи
  setupFeedbackButtons();
}

// Функция для настройки кнопок обратной связи (эмодзи)
function setupFeedbackButtons() {
  const feedbackButtons = document.querySelectorAll('.btn-feedback');
  
  feedbackButtons.forEach(button => {
    // Очищаем существующие обработчики, чтобы избежать дублирования
    button.removeEventListener('click', handleFeedbackClick);
    
    // Добавляем новый обработчик клика
    button.addEventListener('click', handleFeedbackClick);
  });
  
  console.log('Настроены кнопки обратной связи');
}

// Обработчик клика по кнопке обратной связи
function handleFeedbackClick(event) {
  const button = event.currentTarget;
  const value = button.dataset.value;
  
  // Снимаем выделение со всех кнопок
  document.querySelectorAll('.btn-feedback').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // Добавляем класс выбранной кнопке
  button.classList.add('selected');
  
  // Отправляем данные обратной связи в систему статистики
  sendFeedbackToStats(value);
  
  console.log(`Получена обратная связь: ${value}`);
}

// Отправка данных обратной связи в систему статистики
function sendFeedbackToStats(value) {
  // Получаем текущую карту и предсказание
  const cardTitle = document.getElementById('prediction-title')?.textContent || 'Неизвестная карта';
  const cardImage = document.getElementById('result-card-image')?.src || '';
  
  // Определяем ID карты из URL изображения
  let cardId = 'unknown';
  if (cardImage) {
    const cardMatch = cardImage.match(/card(\d+)\.webp/);
    if (cardMatch && cardMatch[1]) {
      cardId = cardMatch[1];
    }
  }
  
  // Создаем объект с данными обратной связи
  const feedbackData = {
    cardId,
    cardTitle,
    rating: parseInt(value),
    timestamp: new Date().toISOString()
  };
  
  // Отправляем событие в систему статистики
  if (window.EventBus && typeof window.EventBus.publish === 'function') {
    window.EventBus.publish('USER_FEEDBACK', feedbackData);
    console.log('Отправлены данные обратной связи:', feedbackData);
  } else {
    console.warn('EventBus недоступен, невозможно отправить данные обратной связи');
  }
}

// Функция для отображения случайных фактов на экране загрузки
function setupLoadingFacts() {
  // Массив интересных фактов для отображения во время загрузки
  const facts = [
    "Метафорические карты впервые появились в психотерапии в 1970-х годах.",
    "Изображения на картах помогают установить связь между сознательным и бессознательным.",
    "Каждый человек видит в картах разные смыслы и интерпретации.",
    "В метафорических картах нет правильных или неправильных толкований.",
    "Карты помогают раскрыть творческий потенциал и найти нестандартные решения.",
    "Работа с картами активизирует образное мышление и интуицию.",
    "МТС Design Weekend собирает лучших специалистов в дизайне и разработке.",
    "Первые метафорические карты создал немецкий художник и психотерапевт Морitz Егетмейер.",
    "Исследования показывают, что визуальные образы обрабатываются мозгом быстрее, чем текст.",
    "Карты предсказаний — это мост между аналитическим и интуитивным мышлением."
  ];
  
  // Получаем контейнер для отображения фактов
  const factContainer = document.querySelector('.loading-fact');
  if (!factContainer) return;
  
  // Устанавливаем начальный факт
  const randomFact = facts[Math.floor(Math.random() * facts.length)];
  factContainer.textContent = randomFact;
  
  // Показываем новый факт каждые 5 секунд
  let currentFactIndex = 0;
  const factInterval = setInterval(() => {
    // Плавно скрываем текущий факт
    factContainer.style.opacity = '0';
    
    setTimeout(() => {
      // Определяем следующий факт циклически
      currentFactIndex = (currentFactIndex + 1) % facts.length;
      
      // Устанавливаем новый факт
      factContainer.textContent = facts[currentFactIndex];
      
      // Плавно показываем новый факт
      factContainer.style.opacity = '1';
    }, 500); // 500ms для исчезновения
  }, 5000); // 5 секунд на факт
  
  // Очищаем интервал при скрытии экрана загрузки
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' || mutation.attributeName === 'style') {
          if (!loadingScreen.classList.contains('active') || 
              loadingScreen.style.display === 'none' || 
              loadingScreen.style.visibility === 'hidden') {
            clearInterval(factInterval);
            observer.disconnect();
          }
        }
      });
    });
    
    observer.observe(loadingScreen, { attributes: true });
  }
  
  // Также очистим интервал после определенного времени (2 минуты)
  setTimeout(() => {
    clearInterval(factInterval);
  }, 120000);
}

// Экспорт модуля
window.uiManager = {
  initElements,
  showScreen,
  showNotification,
  updateSubmitButtonState,
  displayCard,
  displayPrediction,
  openFullscreenCardModal,
  closeFullscreenCardModal,
  setupCardFullscreenView,
  setupFeedbackButtons,
  getElements: () => elements
}; 