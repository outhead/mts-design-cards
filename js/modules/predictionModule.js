/**
 * Модуль для работы с предсказаниями и картами
 * Отвечает за выбор карт, генерацию предсказаний, взаимодействие с данными карт
 */

// Состояние предсказаний
let selectedCardKey = null;
let selectedCardData = null;
let selectedQuestion = null;
let predictionText = '';

// Примеры предсказаний (для демонстрации)
const samplePredictions = [
  'Как садовник, бережно ухаживающий за каждым растением в своем саду, так и вы находитесь на пути роста и развития своей идеи. Сейчас время терпеливо взращивать каждый аспект вашего проекта, удобрять его новыми знаниями и защищать от внешних преград.\n\nПомните, что даже самые величественные деревья начинались с маленького семени. Ваше терпение и внимание к деталям сейчас — это инвестиция в будущий расцвет.',
  'Подобно мосту, соединяющему две разные реальности, ваш подход к дизайну позволяет объединить технические ограничения и человеческие потребности. В вашем вопросе кроется желание найти равновесие между функциональностью и эстетикой.\n\nВ ближайшем будущем вы обнаружите ключевое звено, которое поможет соединить разрозненные элементы в гармоничное целое. Доверьтесь своей интуиции при выборе направления, но опирайтесь на факты и обратную связь, чтобы укрепить конструкцию вашего решения.',
  'Как алхимик древности трансформировал обычные металлы в золото, так и вы стоите на пороге превращения простых идей в уникальный продукт. Ваш творческий потенциал сейчас находится на пике, и то, что другим кажется обыденным, в ваших руках может приобрести новую ценность.\n\nЭксперименты и смелые комбинации — ваш ключ к успеху. Не бойтесь смешивать разные подходы и методики, именно в этом синтезе родится то особенное решение, которое вы ищете. Помните, что настоящий алхимик знает: неудачные опыты — это не провал, а шаг к открытию.',
  'Подобно архитектору, создающему пространства для различных эмоциональных переживаний, вы строите нечто большее, чем просто функциональный продукт. В вашем подходе к дизайну заложена способность вызывать глубокие эмоциональные отклики.\n\nВ данный момент вам важно прислушаться к своим собственным ощущениям от создаваемого продукта. Какие эмоции вызывает у вас взаимодействие с ним? Именно эта честность с самим собой станет ключом к созданию действительно резонирующего с аудиторией опыта. Не бойтесь быть уязвимым и открытым — это ваша сила.'
];

// Получение данных карт от общего модуля
let cardsStore = {};

// Загрузка карт из хранилища
function loadCardsFromStorage() {
  // Получаем карты из глобального модуля, если он существует
  let newCardsLoaded = false;
  
  if (window.cardsData && typeof window.cardsData.loadCardsFromStorage === 'function') {
    cardsStore = window.cardsData.loadCardsFromStorage();
    console.log('Загружены карты из модуля cardsData:', Object.keys(cardsStore).length);
    newCardsLoaded = true;
    return cardsStore;
  } else if (window.cardsData && window.cardsData.cards) {
    // Если нет функции, но есть сами карты в модуле
    cardsStore = window.cardsData.cards;
    console.log('Взяты карты напрямую из модуля cardsData:', Object.keys(cardsStore).length);
    newCardsLoaded = true;
    return cardsStore;
  }
  
  // Резервный способ - загрузка напрямую из localStorage
  try {
    const savedCards = localStorage.getItem('designCards');
    if (savedCards) {
      const parsedCards = JSON.parse(savedCards);
      if (parsedCards && Object.keys(parsedCards).length > 0) {
        cardsStore = parsedCards;
        console.log('Загружены карты из localStorage:', Object.keys(cardsStore).length);
        newCardsLoaded = true;
      }
    }
  } catch (e) {
    console.error('Ошибка при загрузке карт из localStorage:', e);
  }
  
  // Проверяем наличие карт
  if (!cardsStore || Object.keys(cardsStore).length === 0) {
    console.warn('Карты не найдены в хранилище, используем встроенные данные');
    
    // Если есть модуль cardsData, но выше не получилось его использовать
    if (window.cardsData && window.cardsData.cards) {
      cardsStore = window.cardsData.cards;
      console.log('Взяты карты из модуля cardsData (резервный путь):', Object.keys(cardsStore).length);
      newCardsLoaded = true;
    } else {
      console.error('Модуль cardsData не найден или не содержит карт. Предсказания будут использовать заглушки.');
      // Создаем минимальный набор карт для работы приложения
      cardsStore = {
        'default': {
          title: 'Предсказание',
          description: 'Не удалось загрузить данные карт. Пожалуйста, обновите страницу или свяжитесь с администратором.'
        }
      };
    }
  }
  
  // Если были загружены новые карты, сбрасываем кэш сопоставлений
  if (newCardsLoaded) {
    console.log('Обнаружены обновленные данные карт, очищаем кэш сопоставлений...');
    clearImageCardMappings(false); // false - не показывать уведомление
  }
  
  return cardsStore;
}

// Выбор карты на основе данных изображения
function selectCardByImage(imageDataUrl) {
  console.log('Запуск функции selectCardByImage...');
  
  const cardsStore = loadCardsFromStorage();
  
  // Получаем все ключи карт
  const cardKeys = Object.keys(cardsStore);
  
  if (cardKeys.length === 0) {
    console.error('Нет доступных карт для выбора');
    return null;
  }
  
  // Если изображение не передано, возвращаем null
  if (!imageDataUrl) {
    console.warn('Изображение не предоставлено для анализа');
    return null;
  }

  // Отладка: проверяем тип полученных данных
  console.log('Получены данные изображения, тип:', typeof imageDataUrl);
  console.log('Длина данных изображения:', imageDataUrl.length);
  console.log('Начало данных изображения:', imageDataUrl.substring(0, 50));
  
  // Проверяем наличие QR-кода в изображении
  if (typeof jsQR === 'function') {
    console.log('Библиотека jsQR доступна, пытаемся найти QR-код...');
    
    try {
      // Создаем изображение для анализа
      const img = new Image();
      img.src = imageDataUrl;
      
      // Поиск QR-кода выполняем после полной загрузки изображения
      return new Promise((resolve) => {
        img.onload = function() {
          // Создаем canvas для обработки изображения
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Рисуем изображение на canvas для анализа
          ctx.drawImage(img, 0, 0);
          
          // Получаем данные изображения
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Находим QR-код
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          
          if (qrCode && qrCode.data) {
            console.log('Найден QR-код в изображении:', qrCode.data);
            
            // Получаем данные QR-кода
            const qrCodeData = qrCode.data;
            
            // Проверяем наличие модуля синхронизации карт
            if (window.cardSyncModule) {
              console.log('Используем cardSyncModule для поиска карты по QR-коду:', qrCodeData);
              
              // Получаем ключ карты из модуля синхронизации
              const cardKey = window.cardSyncModule.getCardKeyByQrCode(qrCodeData);
              
              if (cardKey) {
                console.log('Найдено соответствие для QR-кода через cardSyncModule:', qrCodeData, '->', cardKey);
                
                // Получаем данные карты
                const cardData = window.cardSyncModule.getCardByKey(cardKey);
                
                if (cardData) {
                  console.log('Получены данные карты через cardSyncModule:', cardKey);
                  
                  // Обновляем выбранную карту в состоянии модуля
                  selectedCardKey = cardKey;
                  selectedCardData = cardData;
                  
                  // Добавляем ключ карты в объект данных для использования в других функциях
                  selectedCardData.key = cardKey;
                  
                  // Возвращаем найденную карту
                  resolve({
                    key: cardKey,
                    data: selectedCardData
                  });
                  return;
                } else {
                  console.warn('Карта не найдена по ключу из cardSyncModule:', cardKey);
                }
              } else {
                console.log('Соответствие для QR-кода не найдено в cardSyncModule:', qrCodeData);
              }
            }
            
            // Запасной вариант - используем apiModule для получения маппингов QR-кодов
            if (window.apiModule && typeof window.apiModule.getQrMappings === 'function') {
              const qrMappings = window.apiModule.getQrMappings() || {};
              console.log('Загружены пользовательские маппинги QR-кодов через apiModule:', Object.keys(qrMappings).length);
              
              // Проверяем, есть ли прямое соответствие в маппингах
              if (qrMappings[qrCodeData]) {
                const mappedCardKey = qrMappings[qrCodeData];
                console.log('Найдено пользовательское соответствие для QR-кода через apiModule:', qrCodeData, '->', mappedCardKey);
                
                // Проверяем, существует ли карта с таким ключом
                if (cardsStore[mappedCardKey]) {
                  console.log('Карта найдена по пользовательскому маппингу:', mappedCardKey);
                  
                  // Обновляем выбранную карту в состоянии модуля
                  selectedCardKey = mappedCardKey;
                  selectedCardData = cardsStore[mappedCardKey];
                  
                  // Добавляем ключ карты в объект данных для использования в других функциях
                  selectedCardData.key = mappedCardKey;
                  
                  // Сохраняем в cardSyncModule для последующего использования
                  if (window.cardSyncModule) {
                    window.cardSyncModule.updateQrMapping(qrCodeData, mappedCardKey);
                    console.log('Обновлено соответствие QR-кода в cardSyncModule:', qrCodeData, '->', mappedCardKey);
                  }
                  
                  // Возвращаем найденную карту
                  resolve({
                    key: mappedCardKey,
                    data: selectedCardData
                  });
                  return;
                } else {
                  console.warn('В маппинге указана несуществующая карта:', mappedCardKey);
                }
              } else {
                console.log('Пользовательское соответствие для QR-кода не найдено:', qrCodeData);
              }
            }
            
            // Загружаем конфигурацию QR-кодов, если API модуль доступен
            let qrPrefix = 'design';
            let cardPrefix = 'card';
            
            if (window.apiModule && typeof window.apiModule.loadQrConfig === 'function') {
              const qrConfig = window.apiModule.loadQrConfig() || {};
              qrPrefix = qrConfig.qrPrefix || qrPrefix;
              cardPrefix = qrConfig.cardPrefix || cardPrefix;
              console.log('Загружена конфигурация QR-кодов:', { qrPrefix, cardPrefix });
            }
            
            // Подготавливаем вид ключа для поиска в хранилище
            // Если формат дизайнерской карты (design001) преобразуем в формат карты (card001)
            let cardKey = qrCodeData;
            
            // Если QR-код начинается с qrPrefix, преобразуем его в формат cardPrefix
            if (qrCodeData.startsWith(qrPrefix)) {
              const numericPart = qrCodeData.substring(qrPrefix.length);
              cardKey = cardPrefix + numericPart;
              console.log('Преобразован ключ QR-кода в формат карты:', qrCodeData, '->', cardKey);
            }
            
            // Прямой поиск в cardsStore
            if (cardsStore[cardKey]) {
              console.log('Найдена карта по QR-коду:', cardKey, cardsStore[cardKey]);
              
              // Обновляем выбранную карту в состоянии модуля
              selectedCardKey = cardKey;
              selectedCardData = cardsStore[cardKey];
              
              // Добавляем ключ карты в объект данных для использования в других функциях
              selectedCardData.key = cardKey;
              
              // Сохраняем соответствие в cardSyncModule (предпочтительно) или apiModule
              if (window.cardSyncModule) {
                window.cardSyncModule.updateQrMapping(qrCodeData, cardKey);
                console.log('Сохранено соответствие для QR-кода в cardSyncModule:', qrCodeData, '->', cardKey);
              } else if (window.apiModule && typeof window.apiModule.updateQrMapping === 'function') {
                window.apiModule.updateQrMapping(qrCodeData, cardKey);
                console.log('Сохранено соответствие для QR-кода в apiModule:', qrCodeData, '->', cardKey);
              }
              
              // Возвращаем найденную карту
              resolve({
                key: cardKey,
                data: selectedCardData
              });
              return;
            } else {
              console.log('QR-код найден, но карта не найдена в хранилище:', cardKey);
            }
          } else {
            console.log('QR-код не найден в изображении, используем алгоритм хеширования');
          }
          
          // Если QR-код не найден или карта не найдена, используем алгоритм хеширования
          const result = hashImageAndSelectCard(imageDataUrl, cardsStore, cardKeys);
          resolve(result);
        };
        
        img.onerror = function() {
          console.error('Ошибка при загрузке изображения для анализа QR-кода');
          const result = hashImageAndSelectCard(imageDataUrl, cardsStore, cardKeys);
          resolve(result);
        };
      });
    } catch (error) {
      console.error('Ошибка при анализе QR-кода:', error);
      // В случае ошибки используем алгоритм хеширования
      return hashImageAndSelectCard(imageDataUrl, cardsStore, cardKeys);
    }
  } else {
    console.log('Библиотека jsQR не найдена, используем алгоритм хеширования');
    return hashImageAndSelectCard(imageDataUrl, cardsStore, cardKeys);
  }
}

// Вспомогательная функция для выбора карты на основе хеширования изображения
function hashImageAndSelectCard(imageDataUrl, cardsStore, cardKeys) {
  // Упрощаем алгоритм хеширования для стабильности
  // Используем первые 1000 символов строки данных после начала base64
  const dataPrefix = "base64,";
  let startPos = imageDataUrl.indexOf(dataPrefix);
  
  if (startPos === -1) {
    console.log('Префикс base64 не найден, используем строку с начала');
    startPos = 0;
  } else {
    console.log('Найден префикс base64 на позиции:', startPos);
    startPos += dataPrefix.length;
  }
  
  // Берем часть строки для хеширования (стабильная часть данных)
  const dataSlice = imageDataUrl.substring(startPos, startPos + 1000);
  console.log('Взят срез данных длиной:', dataSlice.length);
  
  // Простой алгоритм хеширования
  let hashValue = 0;
  for (let i = 0; i < dataSlice.length; i++) {
    const char = dataSlice.charCodeAt(i);
    hashValue = ((hashValue << 5) - hashValue) + char;
    hashValue = hashValue & hashValue; // Конвертация в 32-битное целое
  }
  
  // Берем абсолютное значение хеша для избежания отрицательных чисел
  hashValue = Math.abs(hashValue);
  console.log('Сгенерирован хеш изображения:', hashValue);
  
  // Используем кэширование сопоставлений для стабильности
  const cardMappingsKey = 'designCardsImageMappings';
  let cardMappings = {};
  
  try {
    const savedMappings = localStorage.getItem(cardMappingsKey);
    if (savedMappings) {
      cardMappings = JSON.parse(savedMappings);
      console.log('Загружены сохраненные сопоставления карт:', Object.keys(cardMappings).length);
    }
  } catch (e) {
    console.error('Ошибка при загрузке кэша сопоставлений карт:', e);
  }
  
  // Проверяем, есть ли этот хеш в кэше
  const hashKey = hashValue.toString();
  
  if (cardMappings[hashKey]) {
    // Если хеш уже сопоставлен с картой, используем это сопоставление
    console.log('Найдено сохраненное сопоставление для хеша:', hashKey);
    const cachedCardKey = cardMappings[hashKey];
    
    // Проверяем, существует ли еще эта карта в хранилище
    if (cardsStore[cachedCardKey]) {
      console.log('Используем кэшированное сопоставление карты:', cachedCardKey);
      const cardData = cardsStore[cachedCardKey];
      
      // Обновляем выбранную карту в состоянии модуля
      selectedCardKey = cachedCardKey;
      selectedCardData = cardData;
      
      // Добавляем ключ карты в объект данных для использования в других функциях
      cardData.key = cachedCardKey;
      
      return {
        key: cachedCardKey,
        data: cardData
      };
    }
  }
  
  // Если кэшированное сопоставление не найдено или карта не существует, создаем новое
  console.log('Создание нового сопоставления карты...');
  
  // Преобразуем хеш в индекс карты
  const cardIndex = hashValue % cardKeys.length;
  console.log('Индекс карты на основе хеша:', cardIndex, 'из', cardKeys.length);
  
  // Получаем ключ и данные карты
  const cardKey = cardKeys[cardIndex];
  const cardData = cardsStore[cardKey];
  
  // Сохраняем сопоставление в кэш
  cardMappings[hashKey] = cardKey;
  try {
    localStorage.setItem(cardMappingsKey, JSON.stringify(cardMappings));
    console.log('Сохранено новое сопоставление хеша и карты:', hashKey, cardKey);
  } catch (e) {
    console.error('Ошибка при сохранении кэша сопоставлений карт:', e);
  }
  
  console.log('Выбрана карта на основе анализа изображения (детерминированно):', cardKey, cardData);
  console.log('Хеш значение:', hashValue, 'Индекс карты:', cardIndex);
  
  // Обновляем выбранную карту в состоянии модуля
  selectedCardKey = cardKey;
  selectedCardData = cardData;
  
  // Добавляем ключ карты в объект данных для использования в других функциях
  cardData.key = cardKey;
  
  return {
    key: cardKey,
    data: cardData
  };
}

// Функция для выбора карты - теперь с поддержкой выбора на основе изображения
function selectRandomCard() {
  console.log('Запуск функции selectRandomCard...');
  
  // Загружаем карты
  const cardsStore = loadCardsFromStorage();
  
  // Получаем все ключи карт
  const cardKeys = Object.keys(cardsStore);
  
  if (cardKeys.length === 0) {
    console.error('Нет доступных карт для выбора');
    return null;
  }
  
  // Выбираем случайный индекс
  const randomIndex = Math.floor(Math.random() * cardKeys.length);
  console.log('Выбран случайный индекс карты:', randomIndex, 'из', cardKeys.length);
  
  // Получаем ключ и данные карты
  selectedCardKey = cardKeys[randomIndex];
  selectedCardData = cardsStore[selectedCardKey];
  
  // Добавляем ключ карты в объект данных для использования в других функциях
  selectedCardData.key = selectedCardKey;
  
  console.log('Выбрана случайная карта:', selectedCardKey, selectedCardData);
  
  return {
    key: selectedCardKey,
    data: selectedCardData
  };
}

// Генерация предсказания на основе выбранной карты и вопроса
async function generatePrediction(cardData, question) {
  if (!cardData) {
    console.error('Нет данных о карте для генерации предсказания');
    return '';
  }
  
  // Дополнительная проверка - пытаемся получить самые свежие данные карты из хранилища
  if (cardData.id || cardData.key) {
    const cardKey = cardData.id || cardData.key;
    const freshCards = loadCardsFromStorage(); // Загружаем актуальные данные
    
    if (freshCards[cardKey]) {
      console.log('Найдены актуальные данные для карты:', cardKey);
      cardData = freshCards[cardKey];
    }
  }
  
  // Проверяем наличие API модуля
  if (window.apiModule) {
    // Если модуль присутствует, но не инициализирован, инициализируем его
    if (typeof window.apiModule.init === 'function' && !window.apiModule.isApiAvailable()) {
      console.log('API модуль требует инициализации...');
      checkAndInitApiModule();
    } else {
      // Даже если модуль API инициализирован, обновляем системный промпт для гарантии
      const savedPrompt = localStorage.getItem('gptPrompt') || localStorage.getItem('openai_system_prompt');
      if (savedPrompt && typeof window.apiModule.updateSettings === 'function') {
        console.log('Обновляем системный промпт перед генерацией предсказания');
        window.apiModule.updateSettings({
          systemPromptTemplate: savedPrompt
        });
      }
    }
    
    // Проверяем доступность API после инициализации
    if (typeof window.apiModule.generatePredictionFromAPI === 'function' && 
        typeof window.apiModule.isApiAvailable === 'function' && 
        window.apiModule.isApiAvailable()) {
      try {
        console.log('Пытаемся получить предсказание через API...');
        const apiPrediction = await window.apiModule.generatePredictionFromAPI(cardData, question);
        console.log('Получено предсказание от API:', apiPrediction);
        return apiPrediction;
      } catch (apiError) {
        console.error('Ошибка при получении предсказания через API:', apiError);
        console.log('Используем резервный вариант - описание карты');
        
        // Показываем уведомление об ошибке API, если есть UI Manager
        if (window.uiManager && typeof window.uiManager.showNotification === 'function') {
          window.uiManager.showNotification('Не удалось получить предсказание через API, используем описание карты', 'warning');
        }
      }
    } else {
      console.log('API недоступен, используем описание карты');
    }
  } else {
    console.log('API модуль не найден, используем описание карты');
  }
  
  // Используем описание карты из данных карты
  if (cardData.description) {
    console.log('Используем реальное описание карты:', cardData.title);
    predictionText = cardData.description;
    return predictionText;
  }
  
  // Только если нет описания карты, используем примеры предсказаний
  const randomIndex = Math.floor(Math.random() * samplePredictions.length);
  predictionText = samplePredictions[randomIndex];
  console.warn('Описание карты не найдено, используем заготовленный пример предсказания');
  
  console.log('Сгенерировано предсказание на основе карты:', cardData.title);
  
  return predictionText;
}

// Обработка выбора вопроса пользователем
function setSelectedQuestion(question) {
  selectedQuestion = question;
  
  // Вызываем обновление состояния кнопки отправки из UI модуля
  const { updateSubmitButtonState } = window.uiManager || {};
  if (typeof updateSubmitButtonState === 'function') {
    updateSubmitButtonState();
  }
  
  return selectedQuestion;
}

// Получение выбранного вопроса
function getSelectedQuestion() {
  return selectedQuestion;
}

// Обработка отправки формы для получения предсказания
async function handleFormSubmit() {
  // Регистрируем новое предсказание в статистике
  if (window.statsModule && typeof window.statsModule.registerPrediction === 'function') {
    window.statsModule.registerPrediction();
    console.log('Предсказание зарегистрировано в статистике');
  } else {
    console.warn('Модуль статистики не найден, предсказание не зарегистрировано');
  }

  // Получаем модуль UI
  const { showScreen, showNotification, displayCard, displayPrediction } = window.uiManager || {};
  
  // Проверяем наличие вопроса
  const questionField = document.getElementById('question');
  const selectedQuestionOption = document.querySelector('.question-option.selected');
  
  // Если вопрос введен в поле, используем его
  if (questionField && questionField.value.trim()) {
    selectedQuestion = questionField.value.trim();
  } 
  // Иначе если выбран предустановленный вопрос, используем его
  else if (selectedQuestionOption) {
    // Пытаемся получить вопрос из атрибута data-question
    let questionFromAttribute = selectedQuestionOption.getAttribute('data-question');
    
    // Если атрибута нет, берем текст из параграфа внутри опции
    if (!questionFromAttribute) {
      const textElement = selectedQuestionOption.querySelector('p');
      if (textElement) {
        questionFromAttribute = textElement.textContent;
      }
    }
    
    if (questionFromAttribute) {
      selectedQuestion = questionFromAttribute;
    }
  }
  
  // Проверка на наличие выбранного вопроса или загруженного изображения
  const capturedPhotoDataUrl = window.cameraModule?.getCapturedPhotoDataUrl() || null;
  const hasImage = capturedPhotoDataUrl !== null;
  
  if (!selectedQuestion && !hasImage) {
    if (typeof showNotification === 'function') {
      showNotification('Пожалуйста, задайте вопрос или загрузите изображение', 'warning');
    }
    return;
  }
  
  // Сохраняем вопрос пользователя в список активностей
  if (selectedQuestion) {
    saveUserQuestion(selectedQuestion);
  }
  
  // Переходим на экран загрузки
  if (typeof showScreen === 'function') {
    showScreen('loading-screen');
  }
  
  try {
    // Имитируем задержку для имитации обработки
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Выбираем карту на основе изображения или случайным образом
    let card;
    let selectionMethod = 'random'; // По умолчанию - случайный выбор
    
    // Отладка: проверяем наличие изображения
    console.log('Проверка наличия изображения:', hasImage);
    if (hasImage) {
      console.log('Длина данных изображения:', capturedPhotoDataUrl.length);
      
      // Если есть изображение, выбираем карту на его основе
      console.log('Вызываем selectCardByImage...');
      try {
        // Обрабатываем возможный Promise, который возвращается из selectCardByImage
        const cardResult = selectCardByImage(capturedPhotoDataUrl);
        
        // Проверяем, является ли результат Promise
        if (cardResult instanceof Promise) {
          console.log('selectCardByImage вернул Promise, ожидаем результат...');
          card = await cardResult;
        } else {
          card = cardResult;
        }
        
        console.log('Результат выбора карты по изображению:', card);
        if (card) {
          selectionMethod = 'image';
          console.log('Выбрана карта на основе загруженного изображения:', card.key);
        } else {
          console.warn('Не удалось выбрать карту по изображению, будет использован случайный выбор');
        }
      } catch (imageError) {
        console.error('Ошибка при выборе карты по изображению:', imageError);
        console.warn('Из-за ошибки будет использован случайный выбор карты');
        card = null;
      }
    } 
    
    // Если карта не была выбрана по изображению, используем случайный выбор
    if (!card) {
      console.log('Используем случайный выбор карты...');
      card = selectRandomCard();
      selectionMethod = 'random';
      console.log('Выбрана случайная карта:', card?.key);
    }
    
    if (!card) {
      throw new Error('Не удалось выбрать карту для предсказания');
    }
    
    // Генерируем предсказание
    console.log('Начинаем генерацию предсказания для карты', card.data.title);
    predictionText = await generatePrediction(card.data, selectedQuestion);
    console.log('Получено предсказание:', predictionText ? 'текст длиной ' + predictionText.length : 'нет результата');
    
    // Переходим на экран результата
    if (typeof showScreen === 'function') {
      showScreen('result-screen');
    }
    
    // Отображаем карту и предсказание
    if (typeof displayCard === 'function') {
      displayCard(card.key, card.data, selectionMethod);
    }
    
    if (typeof displayPrediction === 'function') {
      displayPrediction(predictionText);
    }
    
  } catch (error) {
    console.error('Ошибка при генерации предсказания:', error);
    
    if (typeof showNotification === 'function') {
      showNotification('Не удалось получить предсказание. Попробуйте еще раз.', 'error');
    }
    
    // Возвращаемся на экран вопроса
    if (typeof showScreen === 'function') {
      showScreen('question-screen');
    }
  }
}

// Функция для подготовки данных перед отправкой на сервер
function prepareDataForApiRequest() {
  const capturedPhotoDataUrl = window.cameraModule?.getCapturedPhotoDataUrl() || null;
  
  return {
    question: selectedQuestion,
    imageDataUrl: capturedPhotoDataUrl,
    telegramUser: window.Telegram?.WebApp?.initDataUnsafe?.user || null
  };
}

// Функция для обработки опций вопросов
function setupQuestionOptions() {
  const questionOptions = document.querySelectorAll('.question-option');
  const nextButton = document.getElementById('next-button');
  
  questionOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Снимаем выделение со всех опций
      questionOptions.forEach(opt => opt.classList.remove('selected'));
      
      // Выделяем текущую опцию
      option.classList.add('selected');
      
      // Получаем id вопроса
      const questionId = option.getAttribute('data-question-id');
      
      // Если выбран свой вопрос, показываем textarea
      const customQuestionGroup = document.getElementById('custom-question-group');
      const questionField = document.getElementById('question');
      
      if (customQuestionGroup && questionField) {
        // Показываем/скрываем поле в зависимости от выбора
        const isSelfQuestion = questionId === '0';
        customQuestionGroup.style.display = isSelfQuestion ? 'block' : 'none';
        
        // Если выбран свой вопрос, ставим фокус на поле ввода
        if (isSelfQuestion) {
          // Небольшая задержка для гарантированного отображения поля
          setTimeout(() => {
            questionField.focus();
            console.log('Фокус установлен на поле ввода вопроса');
          }, 100);
        }
      }
      
      // Активируем кнопку "Далее", если выбран вопрос
      if (nextButton) {
        nextButton.disabled = false;
      }
      
      // Устанавливаем выбранный вопрос
      let questionText = '';
      
      // Получаем текст вопроса из атрибута или из параграфа внутри опции
      if (option.getAttribute('data-question')) {
        questionText = option.getAttribute('data-question');
      } else {
        const textElement = option.querySelector('p');
        if (textElement) {
          questionText = textElement.textContent;
        }
      }
      
      setSelectedQuestion(questionText);
      
      // Обновляем состояние кнопки отправки
      if (window.app && window.app.uiManager && window.app.uiManager.updateSubmitButtonState) {
        window.app.uiManager.updateSubmitButtonState();
      }
    });
  });
}

// Функция для сброса состояния и возврата на начальный экран
function resetAndGoToWelcome() {
  // Сбрасываем состояние
  selectedCardKey = null;
  selectedCardData = null;
  selectedQuestion = null;
  predictionText = '';
  
  // Очищаем поля, если они существуют
  const questionInput = document.getElementById('question');
  if (questionInput) {
    questionInput.value = '';
  }
  
  // Сбрасываем значение input файла, чтобы можно было повторно выбрать тот же файл
  const fileInput = document.getElementById('file-upload-input');
  if (fileInput) {
    fileInput.value = '';
  }
  
  // Сбрасываем выбранное фото
  if (window.cameraModule && typeof window.cameraModule.setCapturedPhotoDataUrl === 'function') {
    window.cameraModule.setCapturedPhotoDataUrl(null);
  }
  
  // Очищаем превью изображения, если оно есть
  const imagePreview = document.getElementById('image-preview');
  const imagePreviewContainer = document.getElementById('image-preview-container');
  if (imagePreview) {
    imagePreview.src = '';
  }
  
  if (imagePreviewContainer) {
    imagePreviewContainer.style.display = 'none';
  }
  
  // Отменяем выделение вопросов
  const questionOptions = document.querySelectorAll('.question-option');
  questionOptions.forEach(opt => opt.classList.remove('selected'));
  
  // Скрываем поле для своего вопроса
  const customQuestionGroup = document.getElementById('custom-question-group');
  if (customQuestionGroup) {
    customQuestionGroup.style.display = 'none';
  }
  
  // Переходим на начальный экран
  const { showScreen } = window.uiManager || {};
  if (typeof showScreen === 'function') {
    showScreen('welcome-screen');
  }
}

// Функция для очистки кэша сопоставлений изображений с картами
function clearImageCardMappings(showNotification = true) {
  const cardMappingsKey = 'designCardsImageMappings';
  
  try {
    // Удаляем сохраненные сопоставления из localStorage
    localStorage.removeItem(cardMappingsKey);
    console.log('Кэш сопоставлений изображений с картами очищен успешно');
    
    // Показываем уведомление об успехе, если требуется и если функция доступна
    if (showNotification) {
      const { showNotification: uiShowNotification } = window.uiManager || {};
      if (typeof uiShowNotification === 'function') {
        uiShowNotification('Связи между изображениями и картами сброшены', 'success');
      }
    }
    
    return true;
  } catch (e) {
    console.error('Ошибка при очистке кэша сопоставлений:', e);
    
    // Показываем уведомление об ошибке, если требуется и если функция доступна
    if (showNotification) {
      const { showNotification: uiShowNotification } = window.uiManager || {};
      if (typeof uiShowNotification === 'function') {
        uiShowNotification('Не удалось сбросить связи между изображениями и картами', 'error');
      }
    }
    
    return false;
  }
}

// Обработка отправки формы для получения предсказания
async function handleShare() {
  // Добавляем регистрацию шеринга в статистике
  if (window.statsModule && typeof window.statsModule.registerShare === 'function') {
    window.statsModule.registerShare();
    console.log('Шеринг зарегистрирован в статистике');
  } else {
    console.warn('Модуль статистики не найден, шеринг не зарегистрирован');
  }

  if (!selectedCardData || !predictionText) {
    console.error('Нет данных для шеринга');
    return;
  }
  
  const shareText = `🔮 Моя карта: ${selectedCardData.title}\n\n${predictionText}\n\nПолучи своё предсказание на MTS Design Weekend!`;
  const shareUrl = window.location.href;
  
  // Создаем и показываем модальное окно с опциями шеринга
  showShareModal(shareText, shareUrl);
}

// Функция для отображения модального окна с опциями шеринга
function showShareModal(shareText, shareUrl) {
  // Проверяем, существует ли уже модальное окно
  let shareModal = document.getElementById('share-modal');
  
  if (!shareModal) {
    // Создаем модальное окно, если его нет
    shareModal = document.createElement('div');
    shareModal.id = 'share-modal';
    shareModal.className = 'share-modal';
    
    // Создаем содержимое модального окна
    shareModal.innerHTML = `
      <div class="share-modal-content">
        <span class="close-share-modal">&times;</span>
        <h3>Поделиться предсказанием</h3>
        <div class="share-preview">
          <p class="share-preview-text">${shareText.substring(0, 140)}${shareText.length > 140 ? '...' : ''}</p>
        </div>
        <div class="share-options">
          <button class="share-option telegram-share">
            <i class="fab fa-telegram"></i> Telegram
          </button>
          <button class="share-option vk-share">
            <i class="fab fa-vk"></i> ВКонтакте
          </button>
          <button class="share-option whatsapp-share">
            <i class="fab fa-whatsapp"></i> WhatsApp
          </button>
          <button class="share-option copy-link">
            <i class="fas fa-link"></i> Копировать ссылку
          </button>
          <button class="share-option copy-text">
            <i class="fas fa-copy"></i> Копировать текст
          </button>
        </div>
      </div>
    `;
    
    // Добавляем стили для модального окна
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .share-modal {
        display: none;
        position: fixed;
        z-index: 9999;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        animation: fadeIn 0.3s ease;
      }
      
      .share-modal-content {
        position: relative;
        background-color: rgba(30, 30, 50, 0.9);
        margin: 10% auto;
        padding: 25px;
        width: 90%;
        max-width: 500px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
        animation: slideUp 0.3s ease forwards;
      }
      
      @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      .close-share-modal {
        position: absolute;
        top: 15px;
        right: 15px;
        color: var(--white);
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
      }
      
      .close-share-modal:hover {
        background-color: rgba(227, 6, 19, 0.7);
        transform: scale(1.1);
      }
      
      .share-modal h3 {
        margin-top: 0;
        text-align: center;
        color: var(--white);
        font-size: 22px;
      }
      
      .share-preview {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 10px;
        padding: 15px;
        margin: 15px 0;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .share-preview-text {
        color: var(--white);
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
      }
      
      .share-options {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 10px;
        margin-top: 20px;
      }
      
      .share-option {
        padding: 12px;
        border-radius: 8px;
        border: none;
        background-color: rgba(255, 255, 255, 0.1);
        color: var(--white);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s ease;
      }
      
      .share-option:hover {
        background-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }
      
      .telegram-share { background-color: rgba(0, 136, 204, 0.3); }
      .telegram-share:hover { background-color: rgba(0, 136, 204, 0.5); }
      
      .vk-share { background-color: rgba(76, 117, 163, 0.3); }
      .vk-share:hover { background-color: rgba(76, 117, 163, 0.5); }
      
      .whatsapp-share { background-color: rgba(37, 211, 102, 0.3); }
      .whatsapp-share:hover { background-color: rgba(37, 211, 102, 0.5); }
      
      .copy-link, .copy-text { background-color: rgba(80, 80, 80, 0.3); }
      .copy-link:hover, .copy-text:hover { background-color: rgba(80, 80, 80, 0.5); }
      
      @media (max-width: 480px) {
        .share-modal-content {
          width: 95%;
          margin: 5% auto;
          padding: 20px;
        }
        
        .share-options {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `;
    
    document.head.appendChild(styleElement);
    document.body.appendChild(shareModal);
    
    // Добавляем обработчики событий для опций шеринга
    initShareOptions(shareModal, shareText, shareUrl);
  } else {
    // Обновляем текст в существующем модальном окне
    const previewText = shareModal.querySelector('.share-preview-text');
    if (previewText) {
      previewText.textContent = `${shareText.substring(0, 140)}${shareText.length > 140 ? '...' : ''}`;
    }
    
    // Обновляем обработчики, если модальное окно уже существует
    initShareOptions(shareModal, shareText, shareUrl);
  }
  
  // Показываем модальное окно
  shareModal.style.display = 'block';
  
  // Предотвращаем прокрутку страницы при открытом модальном окне
  document.body.style.overflow = 'hidden';
}

// Инициализация обработчиков для опций шеринга
function initShareOptions(shareModal, shareText, shareUrl) {
  // Закрытие модального окна
  const closeBtn = shareModal.querySelector('.close-share-modal');
  if (closeBtn) {
    closeBtn.onclick = function() {
      shareModal.style.display = 'none';
      document.body.style.overflow = '';
    };
  }
  
  // Закрытие по клику вне модального окна
  window.onclick = function(event) {
    if (event.target === shareModal) {
      shareModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };
  
  // Шеринг в Telegram
  const telegramBtn = shareModal.querySelector('.telegram-share');
  if (telegramBtn) {
    telegramBtn.onclick = function() {
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
      window.open(telegramUrl, '_blank');
    };
  }
  
  // Шеринг во ВКонтакте
  const vkBtn = shareModal.querySelector('.vk-share');
  if (vkBtn) {
    vkBtn.onclick = function() {
      const vkUrl = `https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent('Моё предсказание на MTS Design Weekend')}&description=${encodeURIComponent(shareText)}`;
      window.open(vkUrl, '_blank');
    };
  }
  
  // Шеринг в WhatsApp
  const whatsappBtn = shareModal.querySelector('.whatsapp-share');
  if (whatsappBtn) {
    whatsappBtn.onclick = function() {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;
      window.open(whatsappUrl, '_blank');
    };
  }
  
  // Копирование ссылки
  const copyLinkBtn = shareModal.querySelector('.copy-link');
  if (copyLinkBtn) {
    copyLinkBtn.onclick = function() {
      navigator.clipboard.writeText(shareUrl)
        .then(() => showShareNotification('Ссылка скопирована в буфер обмена'))
        .catch(err => console.error('Ошибка при копировании ссылки:', err));
    };
  }
  
  // Копирование текста
  const copyTextBtn = shareModal.querySelector('.copy-text');
  if (copyTextBtn) {
    copyTextBtn.onclick = function() {
      navigator.clipboard.writeText(shareText)
        .then(() => showShareNotification('Текст предсказания скопирован в буфер обмена'))
        .catch(err => {
          console.error('Ошибка при копировании текста:', err);
          // Запасной метод копирования для старых браузеров
          const textArea = document.createElement('textarea');
          textArea.value = shareText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          showShareNotification('Текст предсказания скопирован в буфер обмена');
        });
    };
  }
}

// Показать уведомление о копировании
function showShareNotification(message) {
  const { showNotification } = window.uiManager || {};
  if (typeof showNotification === 'function') {
    showNotification(message, 'success');
  } else {
    alert(message);
  }
}

// Инициализация модуля
function init() {
  console.log('Инициализация модуля предсказаний...');
  
  // Проверяем наличие модуля синхронизации карт и загружаем его
  checkAndInitCardSyncModule();
  
  // Проверяем наличие API модуля и загружаем его
  checkAndInitApiModule();
  
  // Загружаем карты из хранилища
  loadCardsFromStorage();
  
  // Настраиваем варианты вопросов
  setupQuestionOptions();
  
  // Проверяем наличие функции jsQR
  if (typeof jsQR !== 'function') {
    console.warn('Библиотека jsQR не найдена. Распознавание QR-кодов недоступно.');
  }
  
  console.log('Модуль предсказаний инициализирован');
}

// Проверка и инициализация модуля синхронизации карт
function checkAndInitCardSyncModule() {
  if (window.cardSyncModule) {
    console.log('Модуль синхронизации карт доступен');
    
    // Синхронизируем с основным хранилищем
    if (typeof window.cardSyncModule.syncWithMainStorage === 'function') {
      window.cardSyncModule.syncWithMainStorage();
      console.log('Выполнена синхронизация с основным хранилищем карт');
    }
    
    // Подписываемся на события обновления данных
    if (window.EventBus && typeof window.EventBus.subscribe === 'function') {
      window.EventBus.subscribe('cards_data_updated', function(data) {
        console.log('Получено событие обновления данных карт:', data);
        loadCardsFromStorage();
      });
    }
  } else {
    console.warn('Модуль синхронизации карт недоступен. Будет использоваться только локальное хранилище.');
  }
}

// Функция для проверки и инициализации API модуля
function checkAndInitApiModule() {
  console.log('Проверка API модуля...');
  
  // Проверяем наличие модуля API
  if (!window.apiModule) {
    console.warn('Модуль API не найден в window.apiModule');
    return false;
  }
  
  try {
    // Проверяем и инициализируем API модуль
    if (typeof window.apiModule.init === 'function') {
      window.apiModule.init();
      console.log('API модуль инициализирован');
    }
    
    // Проверяем доступность API
    if (typeof window.apiModule.isApiAvailable === 'function') {
      const isApiAvailable = window.apiModule.isApiAvailable();
      console.log('Статус доступности API:', isApiAvailable);
      
      // Принудительно синхронизируем системный промпт, независимо от состояния API
      // Проверяем наличие сохраненного промпта в localStorage
      const savedPrompt = localStorage.getItem('gptPrompt') || localStorage.getItem('openai_system_prompt');
      
      if (savedPrompt && typeof window.apiModule.updateSettings === 'function') {
        console.log('Найден сохраненный системный промпт в localStorage, применяем его');
        window.apiModule.updateSettings({
          systemPromptTemplate: savedPrompt
        });
      } else {
        console.log('Сохраненный системный промпт не найден в localStorage');
      }
      
      // Если API недоступен, проверяем, есть ли ключ в localStorage
      if (!isApiAvailable) {
        // Проверяем оба возможных формата хранения ключа
        const apiKey = localStorage.getItem('gptApiKey') || localStorage.getItem('openai_api_key');
        
        if (apiKey && apiKey.trim() && typeof window.apiModule.updateSettings === 'function') {
          console.log('Найден API ключ в localStorage, активируем API');
          window.apiModule.updateSettings({
            apiKey: apiKey,
            isEnabled: true
          });
          
          // Отображаем уведомление об успешной активации API
          if (window.uiManager && typeof window.uiManager.showNotification === 'function') {
            window.uiManager.showNotification('API активирован с сохраненным ключом', 'success');
          }
        } else {
          console.log('API ключ не найден в localStorage');
        }
      } else {
        console.log('API уже активирован');
      }
      
      return isApiAvailable;
    }
  } catch (error) {
    console.error('Ошибка при инициализации API модуля:', error);
    return false;
  }
  
  return false;
}

// Функция для сохранения вопроса пользователя
function saveUserQuestion(question) {
  console.log('Сохранение вопроса пользователя:', question);
  
  try {
    // Получаем текущие активности
    const userActivitiesKey = 'userActivities';
    let activities = [];
    
    // Пытаемся загрузить существующие активности
    const savedActivities = localStorage.getItem(userActivitiesKey);
    if (savedActivities) {
      try {
        const parsedActivities = JSON.parse(savedActivities);
        if (Array.isArray(parsedActivities)) {
          activities = parsedActivities;
        }
      } catch (e) {
        console.error('Ошибка при загрузке существующих активностей:', e);
      }
    }
    
    // Создаем новую запись активности
    const newActivity = {
      id: 'q-' + new Date().getTime(),
      timestamp: new Date().toISOString(),
      userId: localStorage.getItem('mts_design_cards_user_registered_unique') || 'anonymous',
      type: 'question',
      details: question,
      cardId: selectedCardKey || null
    };
    
    // Добавляем новую активность в начало массива
    activities.unshift(newActivity);
    
    // Ограничиваем количество хранимых активностей (например, до 100)
    if (activities.length > 100) {
      activities = activities.slice(0, 100);
    }
    
    // Сохраняем обновленный список активностей
    localStorage.setItem(userActivitiesKey, JSON.stringify(activities));
    console.log('Вопрос успешно сохранен в активностях пользователя', activities.length);
    
    return true;
  } catch (error) {
    console.error('Ошибка при сохранении вопроса пользователя:', error);
    return false;
  }
}

// Экспортируем модуль
window.predictionModule = {
  init,
  loadCardsFromStorage,
  selectCardByImage,
  selectRandomCard,
  generatePrediction,
  handleFormSubmit,
  setupQuestionOptions,
  resetAndGoToWelcome,
  clearImageCardMappings,
  saveUserQuestion,
  handleShare,
  setSelectedQuestion,
  getSelectedQuestion,
  checkAndInitApiModule
}; 