/**
 * Пример кода бота Telegram для интеграции с мини-приложением
 * 
 * Инструкция по использованию:
 * 1. Установите необходимые пакеты: npm install telegraf dotenv
 * 2. Создайте файл .env с вашими токенами (см. .env.example)
 * 3. Запустите с помощью: node bot-example.js
 */

const { Telegraf } = require('telegraf');
require('dotenv').config();

// Получаем токен бота из переменных окружения
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';

// URL вашего приложения
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://yourusername.github.io/mts-design-cards/';

// Информация о картах
const cards = {
  'design001': 'Метафора трансформации',
  'design002': 'Мост между мирами',
  'design003': 'Садовник идей',
  'design004': 'Архитектор эмоций',
  'design005': 'Алхимик форм',
  'design006': 'Мастер равновесия',
  'design007': 'Путешественник по контекстам',
  'design008': 'Хранитель наследия',
  'design009': 'Дирижёр оркестра деталей',
  'design010': 'Исследователь неизведанного',
  'design011': 'Навигатор сложностей',
  'design012': 'Собиратель смыслов',
  'design013': 'Переводчик с языка пользователя',
  'design014': 'Маяк в тумане',
  'design015': 'Кузнец впечатлений',
  'design016': 'Хранитель времени',
  'design017': 'Дитя любопытства',
  'design018': 'Мастер пауз',
  'design019': 'Ткач повествований',
  'design020': 'Картограф возможностей',
  'design021': 'Дипломат интересов',
  'design022': 'Скульптор простоты',
  'design023': 'Хореограф взаимодействий',
  'design024': 'Шахматист проблем',
  'design025': 'Садовник экосистем',
  'design026': 'Проводник перемен'
};

// Создаем экземпляр бота
const bot = new Telegraf(BOT_TOKEN);

// Обработка команды /start
bot.start((ctx) => {
  ctx.reply('👋 Добро пожаловать в бот Карты предсказаний MTS Design Weekend!', {
    reply_markup: {
      keyboard: [
        [{
          text: '🔮 Открыть карты предсказаний',
          web_app: { url: WEB_APP_URL }
        }]
      ],
      resize_keyboard: true
    }
  });
});

// Обработка команды /help
bot.help((ctx) => {
  ctx.reply(`
📱 Как использовать бота:

1️⃣ Нажмите на кнопку "Открыть карты предсказаний" ниже
2️⃣ Загадайте вопрос и введите его в форму
3️⃣ Вытяните карту из колоды и сфотографируйте её
4️⃣ Загрузите фото карты в приложении
5️⃣ Получите ваше уникальное предсказание
6️⃣ Поделитесь предсказанием или получите новое

💡 Подсказка: Каждая карта имеет QR-код для точной идентификации. Убедитесь, что QR-код виден на фото.

Если у вас возникли проблемы, пожалуйста, попробуйте перезапустить бота командой /start.
  `);
});

// Обработка команды /cards для просмотра списка карт
bot.command('cards', (ctx) => {
  let message = '📚 Список доступных карт и их метафоры:\n\n';
  
  for (const [id, title] of Object.entries(cards)) {
    message += `• ${id}: ${title}\n`;
  }
  
  ctx.reply(message);
});

// Обработка данных, полученных от WebApp
bot.on('web_app_data', (ctx) => {
  const data = ctx.webAppData.data;
  try {
    const parsedData = JSON.parse(data);
    
    // Если в данных есть предсказание, отправляем его пользователю
    if (parsedData.prediction) {
      let message = `🔮 *Ваше предсказание*\n\n`;
      
      // Добавляем информацию о карте, если она есть
      if (parsedData.cardKey && cards[parsedData.cardKey]) {
        message += `Карта: *${cards[parsedData.cardKey]}*\n\n`;
      }
      
      // Добавляем вопрос пользователя
      if (parsedData.question) {
        message += `Ваш вопрос: _${parsedData.question}_\n\n`;
      }
      
      // Добавляем само предсказание
      message += parsedData.prediction;
      
      ctx.replyWithMarkdown(message);
    } else {
      ctx.reply('Получены данные от приложения, но предсказание не найдено.');
    }
  } catch (e) {
    console.error('Ошибка при обработке данных от WebApp:', e);
    ctx.reply('Произошла ошибка при обработке данных.');
  }
});

// Запускаем бота
bot.launch()
  .then(() => console.log('Бот запущен 🚀'))
  .catch((err) => console.error('Ошибка при запуске бота:', err));

// Включаем graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 