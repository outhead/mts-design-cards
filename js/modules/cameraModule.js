/**
 * Модуль для работы с камерой
 * Отвечает за получение доступа к камере, захват фото, обработку файлов
 */

// Состояние камеры
let cameraStream = null;
let capturedPhotoDataUrl = null;

// Асинхронная функция для запуска камеры
async function startCamera(showFileDialog = false) {
  // Проверяем доступность API камеры в браузере
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.error('API камеры не поддерживается в этом браузере');
    handleCameraError(new Error('API камеры не поддерживается'), showFileDialog);
    return;
  }
  
  // Показываем контейнер камеры
  const cameraContainer = document.querySelector('.camera-container');
  if (cameraContainer) {
    cameraContainer.style.display = 'flex';
    cameraContainer.classList.remove('hidden');
  }
  
  // Проверяем, есть ли элемент видео для отображения потока с камеры
  const videoEl = document.getElementById('camera-stream');
  if (!videoEl) {
    console.error('Не найден элемент видео для потока камеры');
    handleCameraError(new Error('Не найден элемент видео для потока камеры'), showFileDialog);
    return;
  }
  
  // Останавливаем предыдущий поток, если он существует
  if (cameraStream) {
    try {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    } catch (e) {
      console.warn('Не удалось остановить предыдущий поток камеры:', e);
    }
  }
  
  // Убедимся, что видео отображается
  videoEl.style.display = 'block';
  
  try {
    console.log('Запрашиваем доступ к камере...');
    
    // Запрашиваем доступ к камере с предпочтением задней камеры для мобильных устройств
    const constraints = {
      video: {
        facingMode: 'environment', // для мобильных использовать заднюю камеру
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };
    
    // Получаем поток с камеры
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    console.log('Доступ к камере получен. Настраиваем видеопоток...');
    
    // Сохраняем ссылку на поток для последующей остановки
    cameraStream = stream;
    
    // Устанавливаем поток в элемент видео
    videoEl.srcObject = stream;
    
    // Добавляем обработчик ошибок для видео
    videoEl.onerror = function(err) {
      console.error('Ошибка при воспроизведении видео:', err);
      handleCameraError(err, showFileDialog);
    };
    
    // Добавляем обработчик загрузки видео
    videoEl.onloadedmetadata = function() {
      console.log('Метаданные видео загружены. Запускаем воспроизведение...');
      videoEl.play().catch(err => {
        console.error('Ошибка при воспроизведении видео после загрузки метаданных:', err);
      });
    };
    
    // Показываем видео
    videoEl.style.display = 'block';
    
    // Показываем интерфейс камеры
    if (cameraContainer) {
      cameraContainer.classList.remove('hidden');
      cameraContainer.style.display = 'flex';
    }
    
    // Показываем кнопку "Сделать фото" и скрываем "Использовать это фото"
    const takePhotoBtn = document.getElementById('take-photo-btn');
    const usePhotoBtn = document.getElementById('use-photo-btn');
    
    if (takePhotoBtn) {
      takePhotoBtn.classList.remove('hidden');
      takePhotoBtn.style.display = 'block';
    }
    
    if (usePhotoBtn) {
      usePhotoBtn.style.display = 'none';
      usePhotoBtn.classList.add('hidden');
    }
    
    // Добавим явную попытку воспроизведения
    videoEl.play().catch(err => {
      console.error('Ошибка при воспроизведении видео:', err);
      
      // При проблемах с воспроизведением попробуем еще раз с задержкой
      setTimeout(() => {
        videoEl.play().catch(err => {
          console.error('Повторная попытка воспроизведения не удалась:', err);
          handleCameraError(err, showFileDialog);
        });
      }, 500);
    });
    
    console.log('Камера успешно запущена');
  } catch (error) {
    console.error('Ошибка при получении доступа к камере:', error);
    
    // Передаем флаг showFileDialog, чтобы управлять автоматическим открытием диалога выбора файла
    handleCameraError(error, showFileDialog);
  }
}

// Обработка ошибок камеры
function handleCameraError(error, showFileDialog = false) {
  console.error('Ошибка при получении доступа к камере:', error);
  
  // Получаем ссылку на UI модуль для отображения уведомлений
  const { showNotification } = window.uiManager || {};
  
  // Выводим сообщение об ошибке
  if (typeof showNotification === 'function') {
    showNotification('Не удалось получить доступ к камере. Проверьте разрешения или загрузите фото.', 'error');
  }
  
  // Отображаем диалог выбора файла только если явно запрошено
  if (showFileDialog) {
    showFileSelectionInterface();
  }
}

// Функция для отображения интерфейса выбора файла
function showFileSelectionInterface() {
  const cameraContainer = document.querySelector('.camera-container');
  
  // Если уже есть альтернативный блок, не создаем новый
  if (!document.getElementById('file-options-container')) {
    // Создаем контейнер с кнопками для выбора
    const optionsContainer = document.createElement('div');
    optionsContainer.id = 'file-options-container';
    optionsContainer.className = 'camera-options';
    optionsContainer.style.display = 'flex';
    optionsContainer.style.flexDirection = 'column';
    optionsContainer.style.alignItems = 'center';
    optionsContainer.style.gap = '15px';
    optionsContainer.style.margin = '20px 0';
    
    // Кнопка выбора изображения с галереи
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
    
    // Вставляем контейнер в DOM после элемента камеры или в начало screen-а
    if (cameraContainer && cameraContainer.parentNode) {
      cameraContainer.parentNode.insertBefore(optionsContainer, cameraContainer.nextSibling);
    } else {
      const questionScreen = document.getElementById('question-screen');
      if (questionScreen) {
        const firstElement = questionScreen.firstElementChild;
        if (firstElement) {
          questionScreen.insertBefore(optionsContainer, firstElement.nextSibling);
        } else {
          questionScreen.appendChild(optionsContainer);
        }
      }
    }
  }
}

// Добавление элементов управления камерой
function addCameraControls() {
  const { getElements } = window.uiManager || {};
  
  // Получаем элементы из UI модуля
  const elements = typeof getElements === 'function' ? getElements() : {};
  
  // Настраиваем кнопку фотографирования
  const takePhotoBtn = elements.takePhotoBtn || document.getElementById('take-photo-btn');
  if (takePhotoBtn) {
    // Очищаем существующие слушатели
    const newTakePhotoBtn = takePhotoBtn.cloneNode(true);
    if (takePhotoBtn.parentNode) {
      takePhotoBtn.parentNode.replaceChild(newTakePhotoBtn, takePhotoBtn);
    }
    
    // Добавляем новый обработчик
    newTakePhotoBtn.addEventListener('click', capturePhoto);
    
    // Делаем кнопку видимой
    newTakePhotoBtn.style.display = 'block';
    newTakePhotoBtn.classList.remove('hidden');
  }
  
  // Настраиваем кнопку загрузки фото
  const uploadPhotoBtn = elements.uploadPhotoBtn || document.getElementById('upload-photo-btn');
  if (uploadPhotoBtn) {
    uploadPhotoBtn.style.display = 'block';
    uploadPhotoBtn.classList.remove('hidden');
  }
  
  // Изначально скрываем кнопку использования фото
  const usePhotoBtn = elements.usePhotoBtn || document.getElementById('use-photo-btn');
  if (usePhotoBtn) {
    usePhotoBtn.style.display = 'none';
  }
  
  // Скрываем контейнер превью фото
  const photoPreviewContainer = elements.photoPreviewContainer || document.getElementById('photo-preview-container');
  if (photoPreviewContainer) {
    photoPreviewContainer.classList.add('hidden');
  }
}

// Захват фото с камеры
function capturePhoto() {
  if (!cameraStream) {
    console.error('Нет доступа к камере');
    
    const { showNotification } = window.uiManager || {};
    if (typeof showNotification === 'function') {
      showNotification('Нет доступа к камере. Попробуйте загрузить фото.', 'error');
    }
    return;
  }
  
  try {
    // Получаем видео элемент
    const videoEl = document.getElementById('camera-stream');
    if (!videoEl) {
      console.error('Видео элемент не найден');
      return;
    }
    
    // Создаем canvas для захвата кадра
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    
    // Рисуем текущий кадр на canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    
    // Получаем dataURL для фотографии
    capturedPhotoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    
    // Сохраняем в состоянии приложения
    if (window.app && window.app.state) {
      window.app.state.capturedPhotoDataUrl = capturedPhotoDataUrl;
    }
    
    // Показываем превью фотографии
    const photoPreviewContainer = document.getElementById('photo-preview-container');
    if (photoPreviewContainer) {
      // Создаем или обновляем img элемент для превью
      let previewImg = photoPreviewContainer.querySelector('img');
      if (!previewImg) {
        previewImg = document.createElement('img');
        previewImg.className = 'photo-preview';
        photoPreviewContainer.appendChild(previewImg);
      }
      
      // Устанавливаем источник изображения
      previewImg.src = capturedPhotoDataUrl;
      
      // Показываем контейнер превью
      photoPreviewContainer.classList.remove('hidden');
      photoPreviewContainer.style.display = 'block';
    }
    
    // Также обновляем превью на экране вопросов
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    
    if (imagePreviewContainer && imagePreview) {
      imagePreview.src = capturedPhotoDataUrl;
      imagePreviewContainer.style.display = 'block';
      
      // Добавляем кнопку для удаления изображения
      let removeButton = imagePreviewContainer.querySelector('.remove-image-btn');
      if (!removeButton) {
        removeButton = document.createElement('button');
        removeButton.id = 'remove-image-button';
        removeButton.className = 'remove-image-btn';
        removeButton.innerHTML = '✕';
        removeButton.addEventListener('click', handleRemoveImage);
        
        imagePreviewContainer.appendChild(removeButton);
      }
    }
    
    // Показываем кнопку "Использовать фото"
    const usePhotoBtn = document.getElementById('use-photo-btn');
    const takePhotoBtn = document.getElementById('take-photo-btn');
    
    if (usePhotoBtn) {
      usePhotoBtn.style.display = 'block';
      usePhotoBtn.classList.remove('hidden');
    }
    
    if (takePhotoBtn) {
      takePhotoBtn.style.display = 'none';
      takePhotoBtn.classList.add('hidden');
    }
    
    // Скрываем видео с камеры
    videoEl.style.display = 'none';
    
    // Обновляем состояние кнопки "Далее"
    if (window.app && window.app.uiManager && typeof window.app.uiManager.updateSubmitButtonState === 'function') {
      window.app.uiManager.updateSubmitButtonState();
    }
    
    console.log('Фото успешно снято');
  } catch (error) {
    console.error('Ошибка при захвате фото:', error);
    
    const { showNotification } = window.uiManager || {};
    if (typeof showNotification === 'function') {
      showNotification('Не удалось сделать фото. Попробуйте загрузить изображение.', 'error');
    }
  }
}

// Остановка камеры
function stopCamera() {
  if (cameraStream) {
    try {
      // Останавливаем все треки в потоке
      cameraStream.getTracks().forEach(track => {
        track.stop();
      });
      
      // Очищаем видео элемент
      const videoEl = document.getElementById('camera-stream');
      if (videoEl) {
        videoEl.srcObject = null;
        videoEl.style.display = 'none';
      }
      
      // Сбрасываем переменную потока
      cameraStream = null;
      
      console.log('Камера остановлена');
    } catch (error) {
      console.error('Ошибка при остановке камеры:', error);
    }
  }
}

// Обработчик для кнопки "Далее"
function handleUsePhoto() {
  try {
    if (!capturedPhotoDataUrl) {
      console.error('Нет данных фотографии');
      return;
    }
    
    // Получаем модуль UI
    const { showScreen, getElements } = window.uiManager || {};
    const elements = typeof getElements === 'function' ? getElements() : {};
    
    // Скрываем контейнер камеры
    const cameraContainer = elements.cameraContainer || document.querySelector('.camera-container');
    if (cameraContainer) {
      cameraContainer.style.display = 'none';
      cameraContainer.classList.add('hidden');
    }
    
    // Скрываем контейнер превью фото
    const photoPreviewContainer = elements.photoPreviewContainer || document.getElementById('photo-preview-container');
    if (photoPreviewContainer) {
      photoPreviewContainer.style.display = 'none';
      photoPreviewContainer.classList.add('hidden');
    }
    
    // Останавливаем камеру
    stopCamera();
    
    // Сохраняем фото в state приложения
    if (window.app && window.app.state) {
      window.app.state.capturedPhotoDataUrl = capturedPhotoDataUrl;
    }
    
    // Показываем превью изображения на экране вопроса и переходим к экрану вопросов
    // Убираем задержку для более быстрого перехода
    const imagePreviewContainer = elements.imagePreviewContainer || document.getElementById('image-preview-container');
    const imagePreview = elements.imagePreview || document.getElementById('image-preview');
    
    if (imagePreviewContainer && imagePreview) {
      imagePreview.src = capturedPhotoDataUrl;
      imagePreviewContainer.style.display = 'block';
      
      // Удаляем кнопку удаления, если она уже есть
      const existingRemoveBtn = imagePreviewContainer.querySelector('.remove-image-btn');
      if (existingRemoveBtn) {
        existingRemoveBtn.remove();
      }
      
      // Добавляем кнопку для удаления изображения
      const removeButton = document.createElement('button');
      removeButton.id = 'remove-image-button';
      removeButton.className = 'remove-image-btn';
      removeButton.innerHTML = '✕';
      removeButton.addEventListener('click', handleRemoveImage);
      
      imagePreviewContainer.appendChild(removeButton);
    }
    
    // Переходим на экран вопроса
    if (typeof showScreen === 'function') {
      showScreen('question-screen');
      
      // Обновляем состояние кнопки "Далее" на экране вопросов
      if (window.app && window.app.uiManager && typeof window.app.uiManager.updateSubmitButtonState === 'function') {
        window.app.uiManager.updateSubmitButtonState();
      }
    }
    
    console.log('Переход к экрану вопросов с полученной фотографией.');
  } catch (error) {
    console.error('Ошибка при использовании фото:', error);
    
    const { showNotification } = window.uiManager || {};
    if (typeof showNotification === 'function') {
      showNotification('Не удалось обработать фото. Попробуйте загрузить изображение.', 'error');
    }
  }
}

// Обработчик для кнопки загрузки фото
function handleUploadPhoto() {
  const fileInput = document.getElementById('file-upload-input');
  if (fileInput) {
    fileInput.click();
  }
}

// Обработка выбранного файла
function handleFileInputChange(event) {
  const files = event.target.files;
  
  if (!files || files.length === 0) {
    console.warn('Файлы не выбраны');
    return;
  }
  
  const file = files[0];
  console.log('Выбран файл:', file.name, 'Тип:', file.type, 'Размер:', file.size);
  
  // Проверка, является ли файл изображением
  if (!file.type.match('image.*')) {
    console.error('Выбранный файл не является изображением');
    
    const { showNotification } = window.uiManager || {};
    if (typeof showNotification === 'function') {
      showNotification('Пожалуйста, выберите файл изображения', 'error');
    }
    
    return;
  }
  
  // Создаем FileReader для чтения файла
  const reader = new FileReader();
  
  reader.onload = function(e) {
    // Результат чтения файла
    const imageDataUrl = e.target.result;
    console.log('Файл успешно прочитан, длина данных:', imageDataUrl.length);
    
    // Устанавливаем данные захваченного фото
    capturedPhotoDataUrl = imageDataUrl;
    
    // Сначала создаем превью изображения
    createPreview(imageDataUrl);
    
    // ВАЖНО: переходим на экран вопросов только после загрузки изображения
    if (typeof app.uiManager?.showScreen === 'function') {
      app.uiManager.showScreen('question-screen');
      
      // Показываем контейнер с превью изображения на экране вопросов
      const imagePreviewContainer = document.getElementById('image-preview-container');
      const imagePreview = document.getElementById('image-preview');
      
      if (imagePreviewContainer && imagePreview) {
        imagePreview.src = imageDataUrl;
        imagePreviewContainer.style.display = 'block';
        
        // Добавляем кнопку для удаления изображения
        let removeButton = imagePreviewContainer.querySelector('.remove-image-btn');
        if (!removeButton) {
          removeButton = document.createElement('button');
          removeButton.id = 'remove-image-button';
          removeButton.className = 'remove-image-btn';
          removeButton.innerHTML = '✕';
          removeButton.addEventListener('click', handleRemoveImage);
          
          imagePreviewContainer.appendChild(removeButton);
        }
      }
    }
    
    // Обращаемся к модулю appModule для обработки фото
    if (window.appModule && typeof window.appModule.processUploadedImage === 'function') {
      window.appModule.processUploadedImage(file);
    } else {
      // Если модуль недоступен, используем альтернативный метод
      processImageFile(file);
    }
    
    if (window.logger) {
      window.logger.logInfo('Файл изображения успешно обработан');
    }
  };
  
  reader.onerror = function(error) {
    console.error('Ошибка при чтении файла:', error);
    
    const { showNotification } = window.uiManager || {};
    if (typeof showNotification === 'function') {
      showNotification('Ошибка при чтении файла', 'error');
    }
  };
  
  // Читаем файл как Data URL
  console.log('Начинаем чтение файла...');
  reader.readAsDataURL(file);
}

// Обработка загруженного изображения
function processImageFile(file) {
  console.log('Начинаем обработку файла изображения:', file.name);
  
  if (!file) {
    console.error('Файл не выбран для обработки');
    return;
  }
  
  // Если данные изображения уже были прочитаны, используем их
  if (capturedPhotoDataUrl) {
    console.log('Используем уже загруженные данные изображения');
    
    // Показываем превью изображения
    createPreview(capturedPhotoDataUrl);
    
    // Переходим к экрану вопросов после загрузки изображения
    const { showScreen } = window.uiManager || {};
    if (typeof showScreen === 'function') {
      console.log('Переходим к экрану вопросов');
      showScreen('question-screen');
      
      // Показываем контейнер с превью изображения на экране вопросов
      const imagePreviewContainer = document.getElementById('image-preview-container');
      const imagePreview = document.getElementById('image-preview');
      
      if (imagePreviewContainer && imagePreview) {
        imagePreview.src = capturedPhotoDataUrl;
        imagePreviewContainer.style.display = 'block';
        
        // Добавляем кнопку для удаления изображения
        let removeButton = imagePreviewContainer.querySelector('.remove-image-btn');
        if (!removeButton) {
          removeButton = document.createElement('button');
          removeButton.id = 'remove-image-button';
          removeButton.className = 'remove-image-btn';
          removeButton.innerHTML = '✕';
          removeButton.addEventListener('click', handleRemoveImage);
          
          imagePreviewContainer.appendChild(removeButton);
        }
      }
    } else {
      console.warn('Функция showScreen недоступна');
    }
    
    return;
  }
  
  // Иначе создаем новый FileReader
  console.log('Создаем новый FileReader для обработки изображения');
  const reader = new FileReader();
  
  reader.onload = function(e) {
    // Результат чтения файла
    const imageDataUrl = e.target.result;
    console.log('Файл успешно прочитан через processImageFile, длина данных:', imageDataUrl.length);
    
    // Устанавливаем данные захваченного фото
    capturedPhotoDataUrl = imageDataUrl;
    
    // Создаем предварительный просмотр
    createPreview(imageDataUrl);
    
    // Переходим к экрану вопросов после загрузки изображения
    const { showScreen } = window.uiManager || {};
    if (typeof showScreen === 'function') {
      console.log('Переходим к экрану вопросов');
      showScreen('question-screen');
      
      // Показываем контейнер с превью изображения на экране вопросов
      const imagePreviewContainer = document.getElementById('image-preview-container');
      const imagePreview = document.getElementById('image-preview');
      
      if (imagePreviewContainer && imagePreview) {
        imagePreview.src = imageDataUrl;
        imagePreviewContainer.style.display = 'block';
        
        // Добавляем кнопку для удаления изображения
        let removeButton = imagePreviewContainer.querySelector('.remove-image-btn');
        if (!removeButton) {
          removeButton = document.createElement('button');
          removeButton.id = 'remove-image-button';
          removeButton.className = 'remove-image-btn';
          removeButton.innerHTML = '✕';
          removeButton.addEventListener('click', handleRemoveImage);
          
          imagePreviewContainer.appendChild(removeButton);
        }
      }
    } else {
      console.warn('Функция showScreen недоступна');
    }
  };
  
  reader.onerror = function(error) {
    console.error('Ошибка при чтении файла в processImageFile:', error);
    
    const { showNotification } = window.uiManager || {};
    if (typeof showNotification === 'function') {
      showNotification('Ошибка при чтении файла', 'error');
    }
  };
  
  // Читаем файл как Data URL
  console.log('Начинаем чтение файла в processImageFile...');
  reader.readAsDataURL(file);
}

// Удаление загруженного изображения
function handleRemoveImage() {
  // Сбрасываем capturedPhotoDataUrl
  capturedPhotoDataUrl = null;
  
  // Сбрасываем значение input файла, чтобы можно было повторно выбрать тот же файл
  const fileInput = document.getElementById('file-upload-input');
  if (fileInput) {
    fileInput.value = '';
  }
  
  // Получаем модуль UI
  const { getElements } = window.uiManager || {};
  const elements = typeof getElements === 'function' ? getElements() : {};
  
  // Скрываем превью
  const imagePreviewContainer = elements.imagePreviewContainer || document.getElementById('image-preview-container');
  if (imagePreviewContainer) {
    imagePreviewContainer.style.display = 'none';
  }
  
  // Если есть модуль UI, обновляем состояние кнопки отправки
  const { updateSubmitButtonState } = window.uiManager || {};
  if (typeof updateSubmitButtonState === 'function') {
    updateSubmitButtonState();
  }
  
  console.log('Изображение удалено');
}

// Создание превью изображения
function createPreview(imageDataUrl) {
  console.log('Создание превью изображения...');
  
  if (!imageDataUrl) {
    console.warn('Нет данных изображения для превью');
    return;
  }
  
  // Сохраняем изображение в состоянии приложения
  if (window.app && window.app.state) {
    window.app.state.capturedPhotoDataUrl = imageDataUrl;
  }
  
  // Получаем модуль UI
  const { getElements } = window.uiManager || {};
  const elements = typeof getElements === 'function' ? getElements() : {};
  
  // Находим элементы
  const imagePreviewContainer = elements.imagePreviewContainer || document.getElementById('image-preview-container');
  const imagePreview = elements.imagePreview || document.getElementById('image-preview');
  
  if (!imagePreviewContainer || !imagePreview) {
    console.warn('Не найдены элементы для отображения превью изображения, но данные сохранены');
    return;
  }
  
  // Устанавливаем изображение в превью
  imagePreview.src = imageDataUrl;
  imagePreviewContainer.style.display = 'block';
  
  console.log('Превью изображения создано');
  
  // Добавляем кнопку удаления, если её ещё нет
  let removeButton = imagePreviewContainer.querySelector('.remove-image-btn');
  
  if (!removeButton) {
    removeButton = document.createElement('button');
    removeButton.id = 'remove-image-button';
    removeButton.className = 'remove-image-btn';
    removeButton.innerHTML = '✕';
    removeButton.addEventListener('click', handleRemoveImage);
    imagePreviewContainer.appendChild(removeButton);
  }
}

// Геттер для получения capturedPhotoDataUrl
function getCapturedPhotoDataUrl() {
  console.log('Запрошены данные захваченного фото:', capturedPhotoDataUrl ? `Данные есть (длина: ${capturedPhotoDataUrl.length})` : 'Нет данных');
  return capturedPhotoDataUrl;
}

// Сеттер для установки capturedPhotoDataUrl
function setCapturedPhotoDataUrl(dataUrl) {
  capturedPhotoDataUrl = dataUrl;
  console.log('Установлены данные захваченного фото:', dataUrl ? `Данные установлены (длина: ${dataUrl.length})` : 'Данные сброшены');
  return capturedPhotoDataUrl;
}

// Экспортируем модуль
window.cameraModule = {
  startCamera,
  stopCamera,
  capturePhoto,
  handleUsePhoto,
  handleUploadPhoto,
  handleFileInputChange,
  handleRemoveImage,
  processImageFile,
  createPreview,
  getCapturedPhotoDataUrl,
  setCapturedPhotoDataUrl
}; 