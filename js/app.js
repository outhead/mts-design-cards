// Получаем экземпляр Telegram WebApp
const telegramWebApp = window.Telegram?.WebApp;

// Карты и их метафоры/описания (аналогично серверной части)
const cards = {
  'design001': 'Метафора трансформации: как гусеница превращается в бабочку, так и дизайн-проект проходит через стадии изменений.',
  'design002': 'Мост между мирами: дизайн соединяет технологию и человека, делая сложное понятным.',
  'design003': 'Садовник идей: каждый проект требует заботы, внимания и терпения, чтобы расцвести в полную силу.',
  'design004': 'Архитектор эмоций: создание пространств, которые вызывают определенные чувства и реакции.',
  'design005': 'Алхимик форм: превращение обычных элементов в нечто особенное и ценное.',
  'design006': 'Мастер равновесия: нахождение гармонии между эстетикой и функциональностью.',
  'design007': 'Путешественник по контекстам: умение адаптировать решения под различные ситуации и аудитории.',
  'design008': 'Хранитель наследия: уважение к традициям при создании нового.',
  'design009': 'Дирижёр оркестра деталей: управление многими элементами для создания целостной картины.',
  'design010': 'Исследователь неизведанного: смелость экспериментировать с новыми подходами и идеями.',
  'design011': 'Навигатор сложностей: умение находить путь в запутанных проблемах и требованиях.',
  'design012': 'Собиратель смыслов: поиск глубинного понимания задачи за поверхностными требованиями.',
  'design013': 'Переводчик с языка пользователя: превращение потребностей в конкретные решения.',
  'design014': 'Маяк в тумане: способность указывать направление в условиях неопределенности.',
  'design015': 'Кузнец впечатлений: создание запоминающихся и значимых взаимодействий.',
  'design016': 'Хранитель времени: дизайн, который остается актуальным спустя годы.',
  'design017': 'Дитя любопытства: постоянное стремление узнавать новое и развиваться.',
  'design018': 'Мастер пауз: умение создавать пространство для размышлений и осознанности.',
  'design019': 'Ткач повествований: создание историй, которые связывают пользователя с продуктом.',
  'design020': 'Картограф возможностей: исследование и отображение всех потенциальных решений.',
  'design021': 'Дипломат интересов: нахождение компромиссов между различными требованиями.',
  'design022': 'Скульптор простоты: умение отсекать лишнее для достижения ясности.',
  'design023': 'Хореограф взаимодействий: создание плавных и интуитивных последовательностей действий.',
  'design024': 'Шахматист проблем: стратегическое мышление на несколько ходов вперед.',
  'design025': 'Садовник экосистем: создание взаимосвязанных и устойчивых решений.',
  'design026': 'Проводник перемен: помощь людям и организациям в адаптации к новому.'
};

// Примеры предсказаний (для демонстрации без API OpenAI)
const samplePredictions = [
  'Как садовник, бережно ухаживающий за каждым растением в своем саду, так и вы находитесь на пути роста и развития своей идеи. Сейчас время терпеливо взращивать каждый аспект вашего проекта, удобрять его новыми знаниями и защищать от внешних преград.\n\nПомните, что даже самые величественные деревья начинались с маленького семени. Ваше терпение и внимание к деталям сейчас — это инвестиция в будущий расцвет.',
  'Подобно мосту, соединяющему две разные реальности, ваш подход к дизайну позволяет объединить технические ограничения и человеческие потребности. В вашем вопросе кроется желание найти равновесие между функциональностью и эстетикой.\n\nВ ближайшем будущем вы обнаружите ключевое звено, которое поможет соединить разрозненные элементы в гармоничное целое. Доверьтесь своей интуиции при выборе направления, но опирайтесь на факты и обратную связь, чтобы укрепить конструкцию вашего решения.',
  'Как алхимик древности трансформировал обычные металлы в золото, так и вы стоите на пороге превращения простых идей в уникальный продукт. Ваш творческий потенциал сейчас находится на пике, и то, что другим кажется обыденным, в ваших руках может приобрести новую ценность.\n\nЭксперименты и смелые комбинации — ваш ключ к успеху. Не бойтесь смешивать разные подходы и методики, именно в этом синтезе родится то особенное решение, которое вы ищете. Помните, что настоящий алхимик знает: неудачные опыты — это не провал, а шаг к открытию.',
  'Подобно архитектору, создающему пространства для различных эмоциональных переживаний, вы строите нечто большее, чем просто функциональный продукт. В вашем подходе к дизайну заложена способность вызывать глубокие эмоциональные отклики.\n\nВ данный момент вам важно прислушаться к своим собственным ощущениям от создаваемого продукта. Какие эмоции вызывает у вас взаимодействие с ним? Именно эта честность с самим собой станет ключом к созданию действительно резонирующего с аудиторией опыта. Не бойтесь быть уязвимым и открытым — это ваша сила.'
];

// DOM элементы
const elements = {
  startScreen: document.getElementById('start-screen'),
  loadingScreen: document.getElementById('loading-screen'),
  resultScreen: document.getElementById('result-screen'),
  questionInput: document.getElementById('question'),
  fileInput: document.getElementById('card-upload'),
  submitButton: document.getElementById('submit-button'),
  resetButton: document.getElementById('reset-button'),
  predictionText: document.getElementById('prediction-text'),
  imagePreviewContainer: document.getElementById('image-preview-container'),
  imagePreview: document.getElementById('image-preview'),
  removeImageButton: document.getElementById('remove-image'),
  resultCardImage: document.getElementById('result-card-image'),
  cardTitle: document.getElementById('card-title'),
  shareButton: document.getElementById('share-button')
};

// Функция для распознавания QR-кода с изображения
async function decodeQRCode(file) {
  return new Promise((resolve, reject) => {
    // Создаем объект FileReader для чтения изображения
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const img = new Image();
      img.src = e.target.result;
      
      img.onload = function() {
        // Создаем canvas для обработки изображения
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Рисуем изображение на canvas
        context.drawImage(img, 0, 0, img.width, img.height);
        
        // Получаем данные изображения
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Используем jsQR для декодирования QR-кода
        if (typeof jsQR === 'function') {
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            // QR-код успешно распознан
            resolve(code.data);
          } else {
            // QR-код не найден, выбираем случайную карту
            const cardKeys = Object.keys(cards);
            const randomCardKey = cardKeys[Math.floor(Math.random() * cardKeys.length)];
            resolve(randomCardKey);
          }
        } else {
          // Если jsQR не загружен, используем случайную карту
          console.warn('jsQR библиотека не загружена, выбираем случайную карту');
          const cardKeys = Object.keys(cards);
          const randomCardKey = cardKeys[Math.floor(Math.random() * cardKeys.length)];
          resolve(randomCardKey);
        }
      };
      
      img.onerror = function() {
        reject(new Error('Ошибка при загрузке изображения'));
      };
    };
    
    reader.onerror = function() {
      reject(new Error('Ошибка при чтении файла'));
    };
    
    // Читаем файл как Data URL
    reader.readAsDataURL(file);
  });
}

// Инициализация Telegram WebApp
function initTelegramWebApp() {
  if (telegramWebApp) {
    // Применяем стили Telegram к нашей странице
    document.body.classList.add('telegram-app');
    
    // Сообщаем приложению Telegram, что мы готовы к работе
    telegramWebApp.ready();
    
    // Показываем главную кнопку Telegram
    telegramWebApp.MainButton.setText('Получить предсказание');
    telegramWebApp.MainButton.onClick(handleSubmit);
    
    // Проверяем, заполнены ли поля для отображения кнопки
    updateMainButtonVisibility();
    
    // Устанавливаем высоту приложения
    telegramWebApp.expand();
  }
}

// Обновление видимости главной кнопки Telegram
function updateMainButtonVisibility() {
  if (!telegramWebApp) return;
  
  const question = elements.questionInput.value.trim();
  const file = elements.fileInput.files[0];
  
  if (question && file) {
    telegramWebApp.MainButton.show();
  } else {
    telegramWebApp.MainButton.hide();
  }
}

// Переключение между экранами
function showScreen(screenId) {
  // Скрыть все экраны
  elements.startScreen.classList.remove('active');
  elements.loadingScreen.classList.remove('active');
  elements.resultScreen.classList.remove('active');
  
  // Показать выбранный экран
  document.getElementById(screenId).classList.add('active');
}

// Создание предсказания
async function generatePrediction(question, cardKey) {
  // Проверяем, включен ли режим демонстрации
  const isDemoMode = true; // Установите в false для использования реального API

  if (isDemoMode) {
    // Для демонстрации мы просто используем примеры предсказаний
    return new Promise(resolve => {
      setTimeout(() => {
        // Выбираем случайное предсказание из примеров
        const randomIndex = Math.floor(Math.random() * samplePredictions.length);
        resolve(samplePredictions[randomIndex]);
      }, 2000); // Имитируем задержку запроса
    });
  } else {
    // Реальная интеграция с OpenAI API
    try {
      // Получаем API ключ из переменной окружения или из конфигурации
      const apiKey = 'YOUR_OPENAI_API_KEY'; // В реальном приложении получайте из безопасного хранилища
      
      // Формируем запрос к API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `Ты - мистический предсказатель, который интерпретирует карты в контексте дизайна и творчества. 
              Твои ответы метафоричны, но содержательны и вдохновляющи. 
              Используй метафору карты как основу для предсказания, но адаптируй его под конкретный вопрос пользователя.
              Ответ должен быть в пределах 2-4 абзацев, сохранять некоторую абстрактность и пространство для интерпретации.`
            },
            {
              role: "user",
              content: `Карта: "${cards[cardKey]}". Вопрос пользователя: "${question}". Дай мне метафорическое предсказание, основанное на этой карте.`
            }
          ],
          max_tokens: 500,
        })
      });
      
      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content.trim();
      } else {
        throw new Error('Некорректный ответ от API');
      }
    } catch (error) {
      console.error('Ошибка при получении предсказания от OpenAI:', error);
      return 'Произошла ошибка при создании предсказания. Пожалуйста, попробуйте снова.';
    }
  }
}

// Отправка данных в Telegram
function sendDataToTelegram(question, cardKey, prediction) {
  if (!telegramWebApp) return;
  
  const data = {
    question: question,
    cardKey: cardKey,
    prediction: prediction
  };
  
  // Отправляем данные обратно в бота
  telegramWebApp.sendData(JSON.stringify(data));
}

// Функция для поделиться предсказанием
function handleShare() {
  if (navigator.share) {
    navigator.share({
      title: 'Мое предсказание с MTS Design Weekend',
      text: elements.predictionText.textContent,
      url: window.location.href
    })
    .then(() => console.log('Успешно поделились'))
    .catch((error) => console.error('Ошибка при попытке поделиться:', error));
  } else if (telegramWebApp) {
    // Если Web Share API не поддерживается, но мы в Telegram
    telegramWebApp.MainButton.setText('Отправить в чат');
    telegramWebApp.MainButton.show();
  } else {
    // Если ничего не поддерживается, копируем в буфер обмена
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = elements.predictionText.textContent;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextarea);
    
    alert('Предсказание скопировано в буфер обмена');
  }
}

// Обработка отправки формы
async function handleSubmit() {
  const question = elements.questionInput.value.trim();
  const file = elements.fileInput.files[0];
  
  if (!question) {
    alert('Пожалуйста, задайте вопрос перед получением предсказания');
    return;
  }
  
  if (!file) {
    alert('Пожалуйста, загрузите фотографию карты');
    return;
  }
  
  // Показываем экран загрузки
  showScreen('loading-screen');
  
  // Пытаемся распознать QR-код с изображения
  try {
    const cardKey = await decodeQRCode(file);
    
    // Проверяем, есть ли такой ключ в нашем списке карт
    const cardDescription = cards[cardKey] || cards['design001'];
    
    // Сохраняем изображение для отображения на экране результатов
    elements.resultCardImage.src = URL.createObjectURL(file);
    elements.cardTitle.textContent = cardDescription;
    
    // Генерируем предсказание
    const prediction = await generatePrediction(question, cardKey);
    elements.predictionText.textContent = prediction;
    
    // Показываем экран с результатом
    showScreen('result-screen');
    
    // Если работаем в Telegram WebApp
    if (telegramWebApp) {
      telegramWebApp.MainButton.setText('Отправить в чат');
      telegramWebApp.MainButton.show();
      telegramWebApp.MainButton.onClick(() => {
        sendDataToTelegram(question, cardKey, prediction);
      });
    }
  } catch (error) {
    console.error('Ошибка при обработке изображения:', error);
    alert('Произошла ошибка при обработке изображения. Пожалуйста, попробуйте снова.');
    showScreen('start-screen');
  }
}

// Функция для отображения предпросмотра изображения
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  
  reader.onload = function(e) {
    elements.imagePreview.src = e.target.result;
    elements.imagePreviewContainer.style.display = 'block';
  };
  
  reader.onerror = function() {
    console.error('Ошибка при чтении файла для предпросмотра');
  };
  
  reader.readAsDataURL(file);
  
  // Обновляем видимость кнопки
  updateMainButtonVisibility();
}

// Обработчик удаления изображения
function handleRemoveImage() {
  elements.fileInput.value = '';
  elements.imagePreviewContainer.style.display = 'none';
  elements.imagePreview.src = '';
  
  // Обновляем видимость кнопки
  updateMainButtonVisibility();
}

// Обработка кнопки "Попробовать еще раз"
function handleReset() {
  elements.questionInput.value = '';
  elements.fileInput.value = '';
  elements.predictionText.textContent = '';
  elements.imagePreviewContainer.style.display = 'none';
  
  showScreen('start-screen');
  
  if (telegramWebApp) {
    telegramWebApp.MainButton.setText('Получить предсказание');
    telegramWebApp.MainButton.hide();
  }
}

// Устанавливаем обработчики событий
function setupEventListeners() {
  elements.submitButton.addEventListener('click', handleSubmit);
  elements.resetButton.addEventListener('click', handleReset);
  elements.fileInput.addEventListener('change', handleImageUpload);
  elements.removeImageButton.addEventListener('click', handleRemoveImage);
  elements.shareButton.addEventListener('click', handleShare);
  
  // Отслеживаем ввод для обновления видимости кнопки
  elements.questionInput.addEventListener('input', updateMainButtonVisibility);
}

// Инициализация приложения
function init() {
  initTelegramWebApp();
  setupEventListeners();
}

// Запускаем приложение после загрузки DOM
document.addEventListener('DOMContentLoaded', init); 