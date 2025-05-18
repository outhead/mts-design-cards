<?php
header('Content-Type: application/json');

// Проверка метода запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Метод не разрешен. Используйте POST.']);
    exit;
}

// Получаем данные из запроса
$postData = file_get_contents('php://input');
$config = json_decode($postData, true);

// Проверка валидности данных
if (!$config || !is_array($config)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Неверный формат данных.']);
    exit;
}

// Добавляем метку времени для отслеживания обновлений
$config['lastUpdated'] = date('Y-m-d\TH:i:s.v\Z');

// Пытаемся сохранить данные в файл
try {
    $configFile = 'config.json';
    $configJson = json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
    if (file_put_contents($configFile, $configJson) === false) {
        throw new Exception('Ошибка при записи файла конфигурации.');
    }
    
    // Успешный ответ
    http_response_code(200);
    echo json_encode([
        'success' => true, 
        'message' => 'Конфигурация успешно сохранена.', 
        'timestamp' => $config['lastUpdated']
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ошибка при сохранении конфигурации: ' . $e->getMessage()]);
} 