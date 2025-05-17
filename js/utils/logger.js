/**
 * Модуль для логирования и отладки
 * MTS Design Weekend
 */

// Установка режима отладки
let DEBUG_MODE = false;

// Функция для логирования отладочной информации
function logDebug(message) {
  if (DEBUG_MODE) {
    console.log(`[DEBUG] ${message}`);
  }
}

// Функция для логирования ошибок, всегда выводится
function logError(message, error) {
  console.error(`[ERROR] ${message}`, error || '');
}

// Функция для логирования предупреждений
function logWarning(message) {
  console.warn(`[WARNING] ${message}`);
}

// Функция для логирования информационных сообщений
function logInfo(message) {
  console.log(`[INFO] ${message}`);
}

// Функция для включения/отключения режима отладки
function setDebugMode(isEnabled) {
  DEBUG_MODE = !!isEnabled;
  logInfo(`Режим отладки ${DEBUG_MODE ? 'включен' : 'отключен'}`);
  return DEBUG_MODE;
}

// Функция для отладки предсказаний
function debugPredictionDisplay() {
  if (!DEBUG_MODE) return;
  
  logDebug('=== ОТЛАДКА ОТОБРАЖЕНИЯ ПРЕДСКАЗАНИЯ ===');
  
  // Проверяем состояние экрана результата
  const resultScreen = document.getElementById('result-screen');
  if (resultScreen) {
    logDebug(`Экран результата: найден в DOM, display: ${window.getComputedStyle(resultScreen).display}`);
  } else {
    logDebug('Экран результата не найден в DOM');
  }
  
  // Проверяем наличие изображения карты
  const cardImage = document.getElementById('result-card-image');
  if (cardImage) {
    logDebug(`Изображение карты: найдено в DOM, src: ${cardImage.src.substring(0, 30)}...`);
  } else {
    logDebug('Изображение карты не найдено в DOM');
  }
  
  // Проверяем текст предсказания
  const predictionText = document.getElementById('prediction-text');
  if (predictionText) {
    logDebug(`Текст предсказания: найден в DOM, содержимое: ${predictionText.textContent.substring(0, 30)}...`);
  } else {
    logDebug('Текст предсказания не найден в DOM');
  }
  
  // Проверяем заголовок карты
  const cardTitle = document.getElementById('card-title');
  if (cardTitle) {
    logDebug(`Заголовок карты: найден в DOM, содержимое: ${cardTitle.textContent}`);
  } else {
    logDebug('Заголовок карты не найден в DOM');
  }
}

// Экспортируем функции
window.logger = {
  logDebug,
  logError,
  logWarning,
  logInfo,
  setDebugMode,
  debugPredictionDisplay,
  
  // Включение режима отладки через URL параметр
  checkDebugParam() {
    if (window.location.search.includes('debug=true')) {
      setDebugMode(true);
    }
  }
}; 