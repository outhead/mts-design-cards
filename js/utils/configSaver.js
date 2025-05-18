/**
 * configSaver.js
 * Утилита для сохранения конфигурации в файл config.json
 * Используется как альтернатива save-config.php для работы без PHP сервера
 */

const ConfigSaver = (function() {

    /**
     * Сохраняет конфигурацию в localStorage 
     * @param {Object} config - Объект конфигурации для сохранения
     * @returns {Object} - Результат операции
     */
    function saveToLocalStorage(config) {
        try {
            // Добавляем метку времени для отслеживания обновлений
            config.lastUpdated = new Date().toISOString();
            
            // Преобразуем объект в JSON строку
            const configJson = JSON.stringify(config, null, 2);
            
            // Сохраняем в localStorage
            localStorage.setItem('configBackup', configJson);
            localStorage.setItem('APP_CONFIG', configJson);
            
            console.log('Конфигурация успешно сохранена в localStorage');
            
            // Возвращаем успешный результат
            return {
                success: true,
                message: 'Конфигурация успешно сохранена в localStorage.',
                timestamp: config.lastUpdated
            };
        } catch (error) {
            console.error('Ошибка при сохранении конфигурации в localStorage:', error);
            
            // Возвращаем ошибку
            return {
                success: false,
                message: 'Ошибка при сохранении конфигурации: ' + error.message
            };
        }
    }
    
    /**
     * Эмуляция сохранения конфигурации на сервер
     * Этот метод разработан как прямая замена для fetch вызова к save-config.php
     * @param {string} configJson - JSON строка с конфигурацией
     * @returns {Promise} - Promise с результатом операции
     */
    function saveConfigToServer(configJson) {
        return new Promise((resolve) => {
            try {
                // Парсим конфигурацию обратно в объект
                const config = JSON.parse(configJson);
                
                // Сохраняем в localStorage
                const result = saveToLocalStorage(config);
                
                // Задержка для имитации сетевого запроса
                setTimeout(() => {
                    // Успешный ответ
                    resolve(result);
                }, 300);
            } catch (error) {
                console.error('Ошибка при обработке конфигурации:', error);
                
                // Неуспешный ответ
                resolve({
                    success: false,
                    message: 'Ошибка при обработке конфигурации: ' + error.message
                });
            }
        });
    }
    
    // Публичное API
    return {
        saveToLocalStorage,
        saveConfigToServer
    };
})();

// Экспортируем утилиту в глобальное пространство имен
window.ConfigSaver = ConfigSaver; 