/**
 * Модуль для управления функциональностью главной страницы
 */
(function() {
    // Переменные для хранения элементов DOM
    let takePhotoBtn;
    let uploadPhotoBtn;
    let fileUploadInput;
    
    // Флаг для отслеживания инициализации обработчиков
    let _eventsInitialized = false;
    
    // Сохраняем ссылки на функции-обработчики для возможности их удаления
    let boundTakePhotoHandler;
    let boundUploadPhotoHandler;
    let boundFileSelectedHandler;

    /**
     * Инициализация компонентов главной страницы
     */
    function init() {
        // Получаем ссылки на DOM элементы
        takePhotoBtn = document.getElementById('take-photo-btn');
        uploadPhotoBtn = document.getElementById('upload-photo-btn');
        fileUploadInput = document.getElementById('file-upload-input');

        // Добавляем обработчики событий только если они еще не инициализированы
        // или если нужно пересоздать их (например при динамическом обновлении DOM)
        unbindEvents(); // Сначала удаляем все предыдущие обработчики
        bindEvents();   // Затем добавляем новые
        _eventsInitialized = true;
        
        // Логируем успешную инициализацию
        if (window.logger) {
            window.logger.info('Модуль главной страницы инициализирован');
        } else {
            console.log('Модуль главной страницы инициализирован');
        }
    }

    /**
     * Привязка обработчиков событий
     */
    function bindEvents() {
        // Создаем функции-обработчики с привязкой контекста
        boundTakePhotoHandler = handleTakePhoto.bind(this);
        boundFileSelectedHandler = handleFileSelected.bind(this);
        
        // Обработчик для кнопки "Выбрать изображение"
        if (takePhotoBtn) {
            takePhotoBtn.addEventListener('click', boundTakePhotoHandler);
        }

        // Обработчик для выбора файла
        if (fileUploadInput) {
            fileUploadInput.addEventListener('change', boundFileSelectedHandler);
        }
        
        if (window.logger) {
            window.logger.info('Обработчики событий главной страницы привязаны');
        } else {
            console.log('Обработчики событий главной страницы привязаны');
        }
    }
    
    /**
     * Удаление обработчиков событий
     */
    function unbindEvents() {
        if (takePhotoBtn && boundTakePhotoHandler) {
            takePhotoBtn.removeEventListener('click', boundTakePhotoHandler);
        }
        
        if (fileUploadInput && boundFileSelectedHandler) {
            fileUploadInput.removeEventListener('change', boundFileSelectedHandler);
        }
        
        if (window.logger) {
            window.logger.info('Обработчики событий главной страницы удалены');
        } else {
            console.log('Обработчики событий главной страницы удалены');
        }
    }

    /**
     * Обработка клика по кнопке "Выбрать изображение"
     */
    function handleTakePhoto(event) {
        // Предотвращаем стандартное поведение и всплытие события
        event.preventDefault();
        event.stopPropagation();
        
        if (window.logger) {
            window.logger.info('Нажата кнопка "Выбрать изображение"');
        } else {
            console.log('Нажата кнопка "Выбрать изображение"');
        }
        
        // Открываем системный диалог выбора файла/фото
        if (fileUploadInput) {
            // На мобильных устройствах этот диалог предложит выбор между камерой и галереей
            fileUploadInput.click();
        } else {
            console.error('Элемент выбора файла недоступен');
        }
    }

    /**
     * Обработка клика по кнопке "Загрузить"
     */
    function handleUploadPhoto(event) {
        // Предотвращаем стандартное поведение и всплытие события
        event.preventDefault();
        event.stopPropagation();
        
        if (window.logger) {
            window.logger.info('Нажата кнопка "Загрузить"');
        } else {
            console.log('Нажата кнопка "Загрузить"');
        }
        
        // Имитация клика по скрытому input[type="file"]
        if (fileUploadInput) {
            fileUploadInput.click();
        }
    }

    /**
     * Обработка выбора файла
     */
    function handleFileSelected(event) {
        // Предотвращаем всплытие события
        event.stopPropagation();
        
        if (window.logger) {
            window.logger.info('Файл выбран');
        } else {
            console.log('Файл выбран');
        }
        
        const file = event.target.files[0];
        if (file) {
            // Передача файла в основной модуль приложения
            if (window.appModule && window.appModule.processUploadedImage) {
                window.appModule.processUploadedImage(file);
            } else {
                console.error('Функция processUploadedImage недоступна');
            }
            
            // Сбрасываем значение input, чтобы можно было выбрать тот же файл повторно
            fileUploadInput.value = '';
        }
    }

    // Инициализация модуля при загрузке страницы (только один раз)
    const onDOMLoaded = function() {
        document.removeEventListener('DOMContentLoaded', onDOMLoaded);
        init();
    };
    document.addEventListener('DOMContentLoaded', onDOMLoaded);

    // Экспорт публичного API модуля
    window.mainPageModule = {
        init: init,
        unbindEvents: unbindEvents
    };
})(); 