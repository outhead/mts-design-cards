/**
 * Модульная версия приложения MTS Design Weekend - Карты предсказаний
 * Подключает все модули и запускает приложение
 */

// Переменная для отслеживания состояния инициализации
let isAppInitialized = false;

// Порядок загрузки модулей важен, поэтому загружаем их напрямую тут
document.addEventListener('DOMContentLoaded', () => {
  console.log('Начало загрузки модульной версии приложения...');
  
  // Инициализация только если еще не инициализировано
  if (isAppInitialized) {
    console.log('Приложение уже инициализировано, пропускаем повторную загрузку модулей.');
    return;
  }
  
  // Вспомогательная функция для загрузки скрипта
  function loadScript(src, callback) {
    // Проверяем, был ли уже загружен этот скрипт
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      console.log(`Модуль ${src} уже был загружен ранее, пропускаем...`);
      if (callback) callback();
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.async = false; // Важно для правильного порядка загрузки
    
    // Добавляем обработчики событий
    script.onload = function() {
      console.log(`Модуль ${src} успешно загружен`);
      if (callback) callback();
    };
    
    script.onerror = function() {
      console.error(`Ошибка при загрузке модуля ${src}`);
    };
    
    // Добавляем скрипт в документ
    document.head.appendChild(script);
  }
  
  // Определяем модули для загрузки
  const modules = [
    'js/cards-data.js',       // Данные карт
    'js/modules/uiManager.js',       // Модуль управления интерфейсом
    'js/modules/cameraModule.js',    // Модуль работы с камерой
    'js/modules/statsModule.js',     // Модуль статистики
    'js/modules/predictionModule.js', // Модуль предсказаний
    'js/modules/mainPage.js',        // Модуль главной страницы
    'js/modules/appModule.js'        // Основной модуль приложения
  ];
  
  // Загружаем модули последовательно
  function loadModules(index) {
    if (index >= modules.length) {
      console.log('Все модули загружены. Приложение готово к работе!');
      
      // Устанавливаем флаг инициализации
      isAppInitialized = true;
      
      // Инициализация модулей после загрузки с небольшой задержкой,
      // чтобы гарантировать полную загрузку всех скриптов
      setTimeout(() => {
        // Проверяем, не выполнена ли уже инициализация через другие события
        if (window.app && window.app.state && window.app.state.initialized) {
          console.log('Приложение уже было инициализировано, пропускаем повторную инициализацию.');
          return;
        }
        
        // Инициализация модуля предсказаний
        if (window.predictionModule && window.predictionModule.init) {
          window.predictionModule.init();
        }
        
        // Инициализация модуля статистики
        if (window.statsModule && window.statsModule.init) {
          window.statsModule.init();
        }
        
        if (window.mainPageModule && window.mainPageModule.init) {
          window.mainPageModule.init();
        }
        
        if (window.appModule && window.appModule.init) {
          window.appModule.init();
        }
      }, 100);
      
      return;
    }
    
    // Проверяем, загружен ли уже модуль через глобальный объект
    const moduleName = modules[index].split('/').pop().replace('.js', '');
    if (window[moduleName]) {
      console.log(`Модуль ${moduleName} уже загружен, пропускаем...`);
      loadModules(index + 1);
      return;
    }
    
    loadScript(modules[index], function() {
      // Загружаем следующий модуль
      loadModules(index + 1);
    });
  }
  
  // Начинаем загрузку с первого модуля
  loadModules(0);
}); 