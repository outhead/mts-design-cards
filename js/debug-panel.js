/**
 * Отладочная панель для тестирования работы статистики в MTS Design Weekend
 * Этот файл можно безопасно удалить в продакшен-версии
 */

(function() {
    // Функция для создания отладочной панели
    function createDebugPanel() {
        // Создаем контейнер для отладочной панели
        const debugPanel = document.createElement('div');
        debugPanel.id = 'stats-debug-panel';
        debugPanel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 280px;
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            padding: 15px;
            border-radius: 10px;
            font-family: monospace;
            z-index: 9999;
            font-size: 12px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
            transform: translateX(300px);
            opacity: 0;
        `;

        // Содержимое панели
        debugPanel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 5px;">
                <h3 style="margin: 0; font-size: 14px;">Отладка статистики</h3>
                <div style="display: flex; gap: 10px;">
                    <button id="debug-panel-collapse" style="background: none; border: none; color: #999; cursor: pointer; font-size: 14px; padding: 0; width: 20px; height: 20px;">_</button>
                    <button id="debug-panel-close" style="background: none; border: none; color: #999; cursor: pointer; font-size: 14px; padding: 0; width: 20px; height: 20px;">×</button>
                </div>
            </div>
            <div id="debug-panel-content">
                <div style="margin-bottom: 10px;">
                    <strong>Статистика:</strong>
                    <pre id="debug-stats" style="margin: 5px 0; background: #222; padding: 5px; border-radius: 5px; max-height: 100px; overflow: auto; color: #0f0; font-size: 11px;">Загрузка...</pre>
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Последние действия:</strong>
                    <div id="debug-actions" style="margin: 5px 0; background: #222; padding: 5px; border-radius: 5px; max-height: 100px; overflow: auto; color: #0f0; font-size: 11px;">
                        <div>Запуск модуля отладки</div>
                    </div>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px;">
                    <button id="debug-test-prediction" style="flex: 1; min-width: 120px; background: #107c10; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 11px;">Тест предсказания</button>
                    <button id="debug-test-share" style="flex: 1; min-width: 120px; background: #0078d7; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 11px;">Тест шеринга</button>
                </div>
            </div>
        `;

        // Добавляем панель в документ
        document.body.appendChild(debugPanel);

        // Кнопка для показа отладочной панели
        const showButton = document.createElement('button');
        showButton.id = 'show-debug-panel-btn';
        showButton.textContent = 'Отладка';
        showButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #333;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            z-index: 9998;
            opacity: 0.7;
            transition: opacity 0.3s ease;
        `;
        showButton.addEventListener('mouseover', () => {
            showButton.style.opacity = '1';
        });
        showButton.addEventListener('mouseout', () => {
            showButton.style.opacity = '0.7';
        });
        document.body.appendChild(showButton);

        // Показываем панель с анимацией
        setTimeout(() => {
            debugPanel.style.transform = 'translateX(0)';
            debugPanel.style.opacity = '1';
        }, 500);

        return {
            panel: debugPanel,
            showButton: showButton,
            statsEl: document.getElementById('debug-stats'),
            actionsEl: document.getElementById('debug-actions')
        };
    }

    // Функция для добавления обработчиков событий панели
    function setupPanelHandlers(elements) {
        const { panel, showButton, statsEl, actionsEl } = elements;

        // Кнопка закрытия панели
        document.getElementById('debug-panel-close').addEventListener('click', () => {
            panel.style.transform = 'translateX(300px)';
            panel.style.opacity = '0';
            
            setTimeout(() => {
                showButton.style.display = 'block';
            }, 300);
        });

        // Кнопка сворачивания/разворачивания панели
        let isCollapsed = false;
        const contentEl = document.getElementById('debug-panel-content');
        const collapseBtn = document.getElementById('debug-panel-collapse');
        
        collapseBtn.addEventListener('click', () => {
            if (isCollapsed) {
                contentEl.style.display = 'block';
                collapseBtn.textContent = '_';
                isCollapsed = false;
            } else {
                contentEl.style.display = 'none';
                collapseBtn.textContent = '□';
                isCollapsed = true;
            }
        });

        // Кнопка показа панели
        showButton.addEventListener('click', () => {
            panel.style.transform = 'translateX(0)';
            panel.style.opacity = '1';
            showButton.style.display = 'none';
        });

        // Кнопка тестирования предсказания
        document.getElementById('debug-test-prediction').addEventListener('click', () => {
            if (window.statsModule && typeof window.statsModule.registerPrediction === 'function') {
                window.statsModule.registerPrediction();
                addAction('Тест: Зарегистрировано предсказание');
                updateStatsInfo();
            } else {
                addAction('Ошибка: Модуль статистики недоступен');
            }
        });

        // Кнопка тестирования шеринга
        document.getElementById('debug-test-share').addEventListener('click', () => {
            if (window.statsModule && typeof window.statsModule.registerShare === 'function') {
                window.statsModule.registerShare();
                addAction('Тест: Зарегистрирован шеринг');
                updateStatsInfo();
            } else {
                addAction('Ошибка: Модуль статистики недоступен');
            }
        });
    }

    // Функция для обновления информации о статистике
    function updateStatsInfo() {
        const statsEl = document.getElementById('debug-stats');
        
        if (!statsEl) return;
        
        let statsText = 'Статистика недоступна';
        
        try {
            // Получаем данные из модуля статистики
            if (window.statsModule && typeof window.statsModule.getStats === 'function') {
                const stats = window.statsModule.getStats();
                statsText = JSON.stringify(stats, null, 2);
            } else {
                // Если модуль недоступен, пробуем получить данные из localStorage
                const savedStats = localStorage.getItem('appStats');
                if (savedStats) {
                    statsText = JSON.stringify(JSON.parse(savedStats), null, 2);
                } else {
                    statsText = 'Статистика не найдена';
                }
            }
        } catch (err) {
            statsText = 'Ошибка: ' + err.message;
        }
        
        statsEl.textContent = statsText;
    }

    // Функция для добавления действия в лог
    function addAction(text) {
        const actionsEl = document.getElementById('debug-actions');
        if (!actionsEl) return;
        
        const actionEl = document.createElement('div');
        const time = new Date().toLocaleTimeString();
        actionEl.innerHTML = `<span style="color:#999;">[${time}]</span> ${text}`;
        
        actionsEl.prepend(actionEl);
        
        // Ограничиваем количество отображаемых действий
        if (actionsEl.children.length > 10) {
            actionsEl.removeChild(actionsEl.lastChild);
        }
    }

    // Перехватываем вызовы функций модуля статистики
    function monkeyPatchStatsModule() {
        if (!window.statsModule) {
            console.warn('Модуль статистики не найден, перехват невозможен');
            return;
        }
        
        // Сохраняем оригинальные функции
        const originalRegisterPrediction = window.statsModule.registerPrediction;
        const originalRegisterShare = window.statsModule.registerShare;
        
        // Заменяем функцию регистрации предсказания
        window.statsModule.registerPrediction = function() {
            // Вызываем оригинальную функцию
            const result = originalRegisterPrediction.apply(this, arguments);
            
            // Логируем вызов
            addAction('Зарегистрировано предсказание');
            updateStatsInfo();
            
            return result;
        };
        
        // Заменяем функцию регистрации шеринга
        window.statsModule.registerShare = function() {
            // Вызываем оригинальную функцию
            const result = originalRegisterShare.apply(this, arguments);
            
            // Логируем вызов
            addAction('Зарегистрирован шеринг');
            updateStatsInfo();
            
            return result;
        };
        
        addAction('Функции модуля статистики перехвачены');
    }

    // Функция для сброса статистики
    function resetIndexStats() {
        // Создаем пустую статистику
        const emptyStats = {
            totalUsers: 0,
            totalPredictions: 0,
            todayPredictions: 0,
            shares: 0,
            lastUpdate: new Date().toISOString()
        };
        
        // Сохраняем в localStorage
        localStorage.setItem('appStats', JSON.stringify(emptyStats));
        console.log('Статистика успешно сброшена:', emptyStats);
        
        // Обновляем в модуле статистики
        if (window.statsModule && window.statsModule.loadStats) {
            window.statsModule.loadStats();
        }
        
        // Принудительно сохраняем в localStorage через функцию модуля
        if (window.statsModule && window.statsModule.saveStats) {
            window.statsModule.saveStats();
        }
        
        // Обновляем содержимое отладочной панели
        updateStatsInfo();
        
        return 'Статистика успешно сброшена';
    }

    // Инициализация отладочной панели
    function initDebugPanel() {
        console.log('Инициализация отладочной панели статистики...');
        
        // Проверяем, включен ли режим отладки через URL-параметр
        const urlParams = new URLSearchParams(window.location.search);
        const debugEnabled = urlParams.get('debug') === 'true';
        
        // Если отладка не включена, просто выходим
        if (!debugEnabled) {
            console.log('Режим отладки не активирован. Для активации добавьте ?debug=true к URL');
            
            // Добавляем маленькую кнопку для включения отладки
            const enableButton = document.createElement('button');
            enableButton.textContent = 'D';
            enableButton.style.cssText = `
                position: fixed;
                bottom: 5px;
                left: 5px;
                width: 20px;
                height: 20px;
                background: rgba(0, 0, 0, 0.3);
                color: rgba(255, 255, 255, 0.5);
                border: none;
                border-radius: 50%;
                font-size: 10px;
                cursor: pointer;
                z-index: 9998;
                opacity: 0.3;
            `;
            enableButton.addEventListener('click', () => {
                // Добавляем параметр debug=true к текущему URL и перезагружаем страницу
                const url = new URL(window.location.href);
                url.searchParams.set('debug', 'true');
                window.location.href = url.toString();
            });
            document.body.appendChild(enableButton);
            
            return;
        }
        
        // Создаем панель и настраиваем обработчики
        const elements = createDebugPanel();
        setupPanelHandlers(elements);
        
        // Заменяем функции модуля статистики для логирования
        monkeyPatchStatsModule();
        
        // Обновляем информацию о статистике
        updateStatsInfo();
        
        // Регулярное обновление статистики
        setInterval(updateStatsInfo, 5000);
        
        // Добавление кнопки сброса на отладочную панель
        const buttonContainer = elements.panel.querySelector('div[style*="display: flex"]');
        if (buttonContainer) {
            // Проверяем, что кнопки еще нет
            if (!document.getElementById('index-reset-btn')) {
                const resetBtn = document.createElement('button');
                resetBtn.textContent = 'Сброс';
                resetBtn.id = 'index-reset-btn';
                resetBtn.style.background = '#FF5722';
                resetBtn.style.color = 'white';
                resetBtn.style.border = 'none';
                resetBtn.style.padding = '4px 8px';
                resetBtn.style.borderRadius = '5px';
                resetBtn.style.cursor = 'pointer';
                resetBtn.style.fontSize = '10px';
                
                resetBtn.addEventListener('click', function() {
                    if (confirm('Вы уверены, что хотите сбросить всю статистику?')) {
                        resetIndexStats();
                        alert('Статистика была сброшена до нуля');
                    }
                });
                
                buttonContainer.appendChild(resetBtn);
                console.log('Кнопка сброса статистики добавлена на отладочную панель');
            } else {
                console.log('Кнопка сброса уже существует на панели');
            }
        } else {
            console.error('Не найден контейнер для кнопок в отладочной панели');
        }
        
        console.log('Отладочная панель статистики инициализирована');
    }

    // Запускаем инициализацию после полной загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDebugPanel);
    } else {
        initDebugPanel();
    }
})(); 