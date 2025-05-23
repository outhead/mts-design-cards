/**
 * Модуль с данными карт
 * MTS Design Weekend
 */

// Данные карт для использования во всем приложении
const cards = {
  'card001': {
    title: 'ДОСТИЖЕНИЕ',
    description: 'Каждый день ты становишься сильнее. Комментарий за комментарием. Правка за правкой. Но где-то очень в глубине души.'
  },
  'card002': {
    title: 'ЗНАЧИМОСТЬ',
    description: 'Ты создашь что-то очень большое и о тебе заговорит вся индустрия, надеемся, что хорошее тоже скажут.'
  },
  'card003': {
    title: 'ТВОРЕЦ',
    description: 'Твой мозг полон идей, твоё тело полно сил, твоё сердце открыто всему новому. Самое время наделать дел.'
  },
  'card004': {
    title: 'ВОЛШЕБНИК',
    description: 'Скрытые проблемы могут помешать реализации твоего следующего проекта. Пренебрегай и продолжай вальсировать.'
  },
  'card005': {
    title: 'ВЫБОР',
    description: 'Твой следующий проект определенно станет венцом твоей карьеры. Или венком. Тут уж от тебя зависит.'
  },
  'card006': {
    title: 'ВЕЛИЧИЕ',
    description: 'Твои работы станут революцией в дизайне. Всё, кепку можешь снимать и с броневичка слезать.'
  },
  'card007': {
    title: 'ПАРТНЕР',
    description: 'От твоих работ безоговорочно у всех захватывает дух. Главное, не испусти этот дух в процессе работы. Попроси помощи.'
  },
  'card008': {
    title: 'ВДОХНОВЕНИЕ',
    description: 'Твою следующую работу Тема Лебедев будет выдавать за свою, а может даже возьмёт тебя на работу.'
  },
  'card009': {
    title: 'ПРЕМИЯ',
    description: 'Ты изобретешь правкоотпугиватель и получишь за него Нобелевскую премию. Но возможно всё-таки Дарвиновскую.'
  },
  'card010': {
    title: 'ИЗВЕСТНОСТЬ',
    description: 'Твоя следующая работа произведет фурор в индустрии и станет вирусной. Главное, чтобы не мемной.'
  },
  'card011': {
    title: 'УЕДИНЕНИЕ',
    description: 'Работы меньше не станет, но ты держись, возможно тебя переведут на удаленку за твою любовь к сырному попкорну.'
  },
  'card012': {
    title: 'АРТ-ДИРЕКТОР',
    description: 'Совсем скоро ты создашь свою лучшую работу. А потом придут комментарии и ты сделаешь ещё лучше, чем было. И так до бесконечности.'
  },
  'card013': {
    title: 'НАЧАЛО',
    description: 'Ты стоишь у подножия нового сложного проекта. Не бойся, у тебя всё обязательно получится. Это же не Эверест.'
  },
  'card014': {
    title: 'АНАЛИТИК',
    description: 'Не бойся удивлять, разрушать устоявшиеся шаблоны и создавать что-то принципиально новое. Санитары уже выехали.'
  },
  'card015': {
    title: 'РЕШИМОСТЬ',
    description: 'Все твои новые идеи будут настолько смелые, что Чак Норрис побоится давать к ним комментарии.'
  },
  'card016': {
    title: 'ДУБЛЬ',
    description: 'Повторение - мать учения и отец безумия.'
  },
  'card017': {
    title: 'ПОВЫШЕНИЕ',
    description: 'Время для глубокого погружения в новый проект. Чем глубже, тем лучше, ведь только оттолкнувшись от дна можно подняться.'
  },
  'card018': {
    title: 'ДВИЖЕНИЕ',
    description: 'Стремись к гармонии, балансу и осознанности, ведь они – основа твоего успеха. Однако валерьянку далеко не убирай.'
  },
  'card019': {
    title: 'ФОРТУНА',
    description: 'Самое время выйти на новый круг. Работа работой, а ретроградный Меркурий никто не отменял. Поехали!'
  },
  'card020': {
    title: 'ПУТЬ',
    description: 'Не позволяй другим влезать и критиковать твои гениальные работы. Ты прекрасно можешь это сделать сам.'
  },
  'card021': {
    title: 'КРЕАТИВ',
    description: 'Твои идеи выйдут на следующий уровень и обретут новое сияние. Главное, чтобы не как в том самом фильме с Джеком Николсоном.'
  },
  'card022': {
    title: 'ПРЕВОСХОДСТВО',
    description: 'Твои работы настолько прекрасны, что душнилам нечего сказать, и они просто молча завидуют. Продолжай.'
  },
  'card023': {
    title: 'ПРАВКИ',
    description: 'Твой макет без правок может принять только твоя любимая бабушка. Так что терпим и вносим комментарии, коллеги.'
  },
  'card024': {
    title: 'ТРЕНД-СЕТТЕР',
    description: 'Твои идеи опережают тренды быстрее вирусного ролика в TikTok, а конкуренты уже лезут к тебе за рецептом успеха. Не забывай выключать уведомления, чтобы оставаться в зоне креатива.'
  },
  'card025': {
    title: 'ЗАВИСТЬ',
    description: 'Зависть — это похвала в маске. Пусть шепоты в офисе разгораются, а ты продолжай творить контент, который заставит их сначала завидовать, а потом просить у тебя совета.'
  },
  'card026': {
    title: 'ТРУДОГОЛИК',
    description: 'Кофе — твой вечный спутник, дедлайны — твои любимые треки, а сон — лишь миф. Только не забудь про перерывы, иначе клавиатура объявит забастовку.'
  }
};

// Функция для загрузки карт из localStorage
function loadCardsFromStorage() {
  const savedCards = localStorage.getItem('designCards');
  if (savedCards) {
    try {
      const parsedCards = JSON.parse(savedCards);
      if (parsedCards && Object.keys(parsedCards).length > 0) {
        console.log('Найдены карты в localStorage:', Object.keys(parsedCards).length);
        
        // Создаем новый объект, сначала копируя встроенные карты
        const updatedCards = { ...cards };
        
        // Затем перезаписываем новыми данными из localStorage
        Object.keys(parsedCards).forEach(key => {
          updatedCards[key] = parsedCards[key];
        });
        
        console.log('Обновленные карты:', Object.keys(updatedCards).length);
        return updatedCards;
      }
    } catch (e) {
      console.error('Ошибка при загрузке карт из localStorage:', e);
    }
  }
  console.log('Используем встроенные карты:', Object.keys(cards).length);
  return cards;
}

// Экспортируем данные и функции
window.cardsData = {
  cards,
  loadCardsFromStorage
}; 