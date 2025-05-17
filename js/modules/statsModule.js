/**
 * Модуль статистики для приложения карт предсказаний
 * Отвечает за сбор и сохранение статистики использования приложения
 * Данные сохраняются в localStorage для использования в админ-панели
 */

// Объект для хранения статистики
const stats = {
  totalUsers: 0,
  totalPredictions: 0,
  todayPredictions: 0,
  shares: 0,
  lastUpdate: null
};

// Ключ для хранения данных в localStorage
const STATS_STORAGE_KEY = 'appStats';

// Функция инициализации модуля
function init() {
  console.log('Инициализация модуля статистики...');
  
  // Загрузка сохраненных данных
  loadStats();
  
  // Закомментируем код с тестовыми данными, чтобы избежать их повторного появления
  /* 
  // Для отладки - добавим тестовые данные, если статистика пуста
  if (stats.totalUsers === 0 && stats.totalPredictions === 0) {
    console.log('Создаю тестовые данные для статистики...');
    
    // Добавляем некоторые тестовые данные
    stats.totalUsers = 125;
    stats.totalPredictions = 389;
    stats.todayPredictions = 42;
    stats.shares = 78;
    stats.lastUpdate = new Date().toISOString();
    
    // Сохраняем тестовые данные
    saveStats();
    console.log('Тестовые данные статистики созданы:', stats);
  }
  */
  
  // Регистрация нового пользователя при первом посещении
  registerUserVisit();
  
  // Проверка счетчика зарегистрированных пользователей
  countRegisteredUsers();
  
  // Добавим обработчик события хранилища для синхронизации между вкладками
  window.addEventListener('storage', storageChangeHandler);
  
  console.log('Модуль статистики успешно инициализирован');
}

// Загрузка статистики из localStorage
function loadStats() {
  try {
    const savedStats = localStorage.getItem(STATS_STORAGE_KEY);
    if (savedStats) {
      const parsedStats = JSON.parse(savedStats);
      
      // Обновляем только существующие поля, чтобы избежать перезаписи новых полей
      if (parsedStats) {
        Object.keys(parsedStats).forEach(key => {
          if (stats.hasOwnProperty(key)) {
            stats[key] = parsedStats[key];
          }
        });
        
        console.log('Статистика успешно загружена из localStorage:', stats);
      }
    } else {
      console.log('Данные статистики не найдены в localStorage, используются начальные значения');
    }
  } catch (error) {
    console.error('Ошибка при загрузке статистики из localStorage:', error);
  }
}

// Сохранение статистики в localStorage
function saveStats() {
  try {
    // Обновляем время последнего обновления
    stats.lastUpdate = new Date().toISOString();
    
    // Сохраняем данные
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    console.log('Статистика успешно сохранена в localStorage:', stats);
  } catch (error) {
    console.error('Ошибка при сохранении статистики в localStorage:', error);
  }
}

// Подсчет реального количества зарегистрированных пользователей
function countRegisteredUsers() {
  console.log('Проверка счетчика зарегистрированных пользователей...');
  
  // Счетчик пользователей
  let userCount = 0;
  
  // Перебираем все ключи в localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    // Считаем только ключи, соответствующие уникальным ID пользователей
    if (key && key === 'mts_design_cards_unique_user_id') {
      userCount++;
    }
  }
  
  // Если счетчик пользователей не соответствует реальному количеству, обновляем его
  if (userCount > 0 && userCount !== stats.totalUsers) {
    console.log(`Обнаружено несоответствие счетчика пользователей: было ${stats.totalUsers}, найдено ${userCount}`);
    stats.totalUsers = userCount;
    saveStats();
  }
  
  // Также проверяем общее количество уникальных ID в localStorage
  const allKeys = Object.keys(localStorage);
  const userKeys = allKeys.filter(key => key.includes('user_') || key === 'mts_design_cards_unique_user_id');
  
  if (userKeys.length > 0 && stats.totalUsers === 0) {
    console.log(`Счетчик пользователей равен 0, но найдены ключи пользователей: ${userKeys.length}`);
    stats.totalUsers = userKeys.length;
    saveStats();
  }
  
  console.log(`Текущее количество уникальных пользователей: ${stats.totalUsers}`);
  return stats.totalUsers;
}

// Регистрация посещения пользователя
function registerUserVisit() {
  // Используем sessionStorage для подсчета уникальных сеансов (сессий)
  const sessionKey = 'mts_design_cards_user_session';
  const uniqueUserKey = 'mts_design_cards_unique_user_id';
  const registeredUserKey = 'mts_design_cards_user_registered_unique';
  
  // Проверяем, есть ли уже зарегистрированный пользователь
  const hasRegisteredUser = localStorage.getItem(registeredUserKey);
  
  // Если у пользователя еще нет уникального ID, создаем и сохраняем его
  if (!localStorage.getItem(uniqueUserKey)) {
    const userId = 'user_' + new Date().getTime() + '_' + Math.floor(Math.random() * 1000000);
    localStorage.setItem(uniqueUserKey, userId);
    
    // Также сохраняем маркер зарегистрированного пользователя
    localStorage.setItem(registeredUserKey, userId);
    
    // Увеличиваем счетчик пользователей только для новых уникальных пользователей
    stats.totalUsers++;
    
    // Сохраняем обновленную статистику
    saveStats();
    
    console.log('Зарегистрирован новый уникальный пользователь, общее количество:', stats.totalUsers);
    return true;
  } else if (!hasRegisteredUser) {
    // Если есть uniqueUserKey, но нет registeredUserKey, также считаем пользователя новым
    localStorage.setItem(registeredUserKey, localStorage.getItem(uniqueUserKey));
    
    // Увеличиваем счетчик пользователей
    stats.totalUsers++;
    
    // Сохраняем обновленную статистику
    saveStats();
    
    console.log('Добавлен маркер зарегистрированного пользователя, общее количество:', stats.totalUsers);
    return true;
  }
  
  // Отмечаем текущую сессию
  if (!sessionStorage.getItem(sessionKey)) {
    sessionStorage.setItem(sessionKey, 'true');
    console.log('Зарегистрирована новая сессия для существующего пользователя');
  } else {
    console.log('Пользователь уже активен в текущей сессии');
  }
  
  return false;
}

// Регистрация нового предсказания
function registerPrediction() {
  // Увеличиваем общее количество предсказаний
  stats.totalPredictions++;
  
  // Проверяем, сегодняшний ли день
  const today = new Date().toISOString().split('T')[0];
  const lastPredictionDate = localStorage.getItem('last_prediction_date');
  
  if (lastPredictionDate === today) {
    // Увеличиваем счетчик предсказаний за сегодня
    stats.todayPredictions++;
  } else {
    // Сбрасываем счетчик и начинаем новый день
    stats.todayPredictions = 1;
    localStorage.setItem('last_prediction_date', today);
  }
  
  // Сохраняем обновленную статистику
  saveStats();
  
  console.log('Зарегистрировано новое предсказание, общее количество:', stats.totalPredictions);
  return stats.totalPredictions;
}

// Регистрация поделившегося результатом
function registerShare() {
  // Увеличиваем счетчик поделившихся
  stats.shares++;
  
  // Сохраняем обновленную статистику
  saveStats();
  
  console.log('Зарегистрирован новый поделившийся, общее количество:', stats.shares);
  return stats.shares;
}

// Сброс статистики пользователей и форсированный пересчет
function resetUserStats() {
  console.log('Сброс статистики пользователей...');
  
  // Удаляем все маркеры пользователей из localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('user_') || key.includes('mts_design_cards_unique_user_id') || key.includes('mts_design_cards_user_registered_unique'))) {
      localStorage.removeItem(key);
      console.log(`Удален ключ пользователя: ${key}`);
    }
  }
  
  // Сбрасываем счетчик пользователей в объекте статистики
  stats.totalUsers = 0;
  
  // Сохраняем обновленную статистику
  saveStats();
  
  console.log('Статистика пользователей сброшена. Текущее значение totalUsers:', stats.totalUsers);
  
  return stats.totalUsers;
}

// Получение текущей статистики
function getStats() {
  console.log('Запрошена статистика модуля, текущие значения:', stats);
  return { ...stats };
}

// Обработчик изменений в localStorage для синхронизации между вкладками
function storageChangeHandler(event) {
  // Проверяем, относится ли изменение к нашей статистике
  if (event.key === STATS_STORAGE_KEY) {
    console.log('Обнаружено внешнее изменение статистики, синхронизация...');
    
    // Загружаем обновленные данные
    loadStats();
    
    // Уведомляем об изменении статистики
    const event = new CustomEvent('stats-updated', { detail: { ...stats } });
    window.dispatchEvent(event);
  }
}

// Экспорт функций для использования в других модулях
window.statsModule = {
  init,
  loadStats,
  saveStats,
  registerPrediction,
  registerShare,
  registerUserVisit,
  resetUserStats,
  getStats,
  countRegisteredUsers
}; 