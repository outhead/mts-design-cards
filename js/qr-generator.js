/**
 * Генератор QR-кодов для карт предсказаний MTS Design Weekend
 * 
 * Этот скрипт генерирует QR-коды для всех идентификаторов карт.
 * Используйте его локально для создания QR-кодов, которые затем можно
 * распечатать и прикрепить к физическим картам.
 */

// Массив всех идентификаторов карт
const cardIds = [
  'design001', 'design002', 'design003', 'design004', 'design005', 'design006', 'design007',
  'design008', 'design009', 'design010', 'design011', 'design012', 'design013', 'design014', 
  'design015', 'design016', 'design017', 'design018', 'design019', 'design020', 'design021',
  'design022', 'design023', 'design024', 'design025', 'design026'
];

// Функция для создания QR-кода
function generateQRCode(cardId) {
  // Получаем контейнер для QR-кодов
  const container = document.getElementById('qr-container');
  
  // Создаем блок для карты
  const cardBlock = document.createElement('div');
  cardBlock.className = 'qr-card';
  
  // Создаем заголовок с ID карты
  const heading = document.createElement('h3');
  heading.textContent = cardId;
  
  // Создаем div для QR-кода
  const qrDiv = document.createElement('div');
  qrDiv.id = `qr-${cardId}`;
  qrDiv.className = 'qr-code';
  
  // Добавляем элементы в блок карты
  cardBlock.appendChild(heading);
  cardBlock.appendChild(qrDiv);
  
  // Добавляем блок карты в контейнер
  container.appendChild(cardBlock);
  
  // Используем библиотеку QRCode.js для генерации QR-кода
  return new QRCode(qrDiv, {
    text: cardId,
    width: 128,
    height: 128,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

// Функция для загрузки всех QR-кодов
function generateAllQRCodes() {
  // Очищаем контейнер
  const container = document.getElementById('qr-container');
  container.innerHTML = '';
  
  // Генерируем QR-код для каждого ID карты
  cardIds.forEach(cardId => {
    generateQRCode(cardId);
  });
}

// Запускаем генерацию при загрузке страницы
document.addEventListener('DOMContentLoaded', generateAllQRCodes); 