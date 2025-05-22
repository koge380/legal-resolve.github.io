document.addEventListener("DOMContentLoaded", function () {
  // Инициализация аккордеона
  initAccordion();

  // Обработчик изменения размера окна
  window.addEventListener('resize', function () {
    updateAllAccordions();
  });

  // Обработчик для ссылок "Подробнее"
  initMoreLinks();
});

function initAccordion() {
  // Получаем все элементы аккордеона
  const accordionItems = document.querySelectorAll('.accordion-item');

  // Если аккордеонов нет, выходим
  if (!accordionItems.length) return;

  // Инициализируем каждый аккордеон
  accordionItems.forEach(function (item) {
    // Получаем элементы аккордеона
    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');
    const detailsInner = item.querySelector('.tariff-details-inner');

    // Если нет заголовка или контента, пропускаем
    if (!header || !content || !detailsInner) return;

    // Устанавливаем начальные стили
    setupInitialStyles(item, content, detailsInner);

    // Добавляем обработчик клика на заголовок
    header.addEventListener('click', function () {
      toggleAccordion(item);
    });

    // Добавляем ARIA-атрибуты для доступности
    header.setAttribute('aria-expanded', item.classList.contains('active') ? 'true' : 'false');
    header.setAttribute('aria-controls', item.id + '-content');
    content.setAttribute('id', item.id + '-content');
    content.setAttribute('aria-hidden', item.classList.contains('active') ? 'false' : 'true');
  });

  // Обновляем все аккордеоны после инициализации
  updateAllAccordions();
}

// Устанавливает начальные стили для аккордеона
function setupInitialStyles(item, content, detailsInner) {
  // Устанавливаем position: relative для item, если не установлено
  if (getComputedStyle(item).position === 'static') {
    item.style.position = 'relative';
  }

  // Устанавливаем стили для контента
  content.style.position = 'absolute';
  content.style.left = '0';
  content.style.right = '0';
  content.style.top = '100%';
  content.style.zIndex = '1';
  content.style.overflow = 'hidden';

  // Если аккордеон не активен, скрываем контент
  if (!item.classList.contains('active')) {
    content.style.height = '0';
    content.style.opacity = '0';
    content.style.visibility = 'hidden';
  } else {
    // Если активен, показываем контент
    const contentHeight = calculateContentHeight(content);
    content.style.height = contentHeight + 'px';
    content.style.opacity = '1';
    content.style.visibility = 'visible';

    // Устанавливаем отступ для item, чтобы освободить место для контента
    item.style.marginBottom = (contentHeight + 20) + 'px';
  }
}

// Вычисляет общую высоту контента
function calculateContentHeight(content) {
  // Временно делаем контент видимым для измерения его высоты
  const originalVisibility = content.style.visibility;
  const originalHeight = content.style.height;
  const originalOpacity = content.style.opacity;
  const originalPosition = content.style.position;

  content.style.visibility = 'hidden';
  content.style.height = 'auto';
  content.style.opacity = '0';
  content.style.position = 'absolute';

  // Измеряем высоту
  const contentHeight = content.scrollHeight;

  // Возвращаем оригинальные стили
  content.style.visibility = originalVisibility;
  content.style.height = originalHeight;
  content.style.opacity = originalOpacity;
  content.style.position = originalPosition;

  return contentHeight;
}

// Переключает состояние аккордеона
function toggleAccordion(item) {
  const isActive = item.classList.contains('active');
  const header = item.querySelector('.accordion-header');

  // Если аккордеон активен, закрываем его
  if (isActive) {
    closeAccordion(item);
    // Обновляем ARIA-атрибуты
    if (header) {
      header.setAttribute('aria-expanded', 'false');
      const content = item.querySelector('.accordion-content');
      if (content) {
        content.setAttribute('aria-hidden', 'true');
      }
    }
  } else {
    // Закрываем все другие аккордеоны
    const allItems = document.querySelectorAll('.accordion-item');
    allItems.forEach(function (otherItem) {
      if (otherItem !== item && otherItem.classList.contains('active')) {
        closeAccordion(otherItem);
        // Обновляем ARIA-атрибуты
        const otherHeader = otherItem.querySelector('.accordion-header');
        if (otherHeader) {
          otherHeader.setAttribute('aria-expanded', 'false');
          const otherContent = otherItem.querySelector('.accordion-content');
          if (otherContent) {
            otherContent.setAttribute('aria-hidden', 'true');
          }
        }
      }
    });

    // Открываем текущий аккордеон
    openAccordion(item);
    // Обновляем ARIA-атрибуты
    if (header) {
      header.setAttribute('aria-expanded', 'true');
      const content = item.querySelector('.accordion-content');
      if (content) {
        content.setAttribute('aria-hidden', 'false');
      }
    }
  }
}

// Открывает аккордеон
function openAccordion(item) {
  // Получаем элементы аккордеона
  const content = item.querySelector('.accordion-content');
  const cta = item.querySelector('.tariff-cta');

  // Если нет контента, выходим
  if (!content) return;

  // Добавляем класс active
  item.classList.add('active');

  // Измеряем высоту контента
  const contentHeight = calculateContentHeight(content);

  // Показываем контент
  content.style.visibility = 'visible';
  content.style.height = contentHeight + 'px';
  content.style.opacity = '1';

  // Устанавливаем отступ для item, чтобы освободить место для контента
  item.style.marginBottom = (contentHeight + 20) + 'px';

  // Если есть блок с кнопкой, показываем его
  if (cta) {
    cta.style.visibility = 'visible';
    cta.style.opacity = '1';
  }

  // Сохраняем высоту контента как data-атрибут
  item.setAttribute('data-content-height', contentHeight);
}

// Закрывает аккордеон
function closeAccordion(item) {
  // Получаем элементы аккордеона
  const content = item.querySelector('.accordion-content');
  const cta = item.querySelector('.tariff-cta');

  // Если нет контента, выходим
  if (!content) return;

  // Анимируем закрытие
  content.style.height = '0';
  content.style.opacity = '0';

  // Если есть блок с кнопкой, скрываем его
  if (cta) {
    cta.style.opacity = '0';
  }

  // После завершения анимации
  setTimeout(function () {
    // Удаляем класс active
    item.classList.remove('active');

    // Скрываем контент
    content.style.visibility = 'hidden';

    // Сбрасываем отступ
    item.style.marginBottom = '';

    // Если есть блок с кнопкой, скрываем его
    if (cta) {
      cta.style.visibility = 'hidden';
    }
  }, 400); // Должно соответствовать длительности transition
}

// Обновляет все аккордеоны
function updateAllAccordions() {
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(function (item) {
    if (item.classList.contains('active')) {
      // Получаем элементы аккордеона
      const content = item.querySelector('.accordion-content');

      // Если нет контента, выходим
      if (!content) return;

      // Измеряем высоту контента
      const contentHeight = calculateContentHeight(content);

      // Обновляем высоту контента
      content.style.height = contentHeight + 'px';

      // Обновляем отступ для item
      item.style.marginBottom = (contentHeight + 20) + 'px';

      // Обновляем data-атрибут
      item.setAttribute('data-content-height', contentHeight);
    }
  });
}

// Инициализирует ссылки "Подробнее"
function initMoreLinks() {
  const moreLinks = document.querySelectorAll('.service-more-link');

  moreLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();

      // Получаем ID аккордеона из атрибута href
      const targetId = this.getAttribute('href');
      const targetAccordion = document.querySelector(targetId);

      if (targetAccordion) {
        // Открываем аккордеон
        openAccordion(targetAccordion);

        // Обновляем ARIA-атрибуты
        const header = targetAccordion.querySelector('.accordion-header');
        if (header) {
          header.setAttribute('aria-expanded', 'true');
          const content = targetAccordion.querySelector('.accordion-content');
          if (content) {
            content.setAttribute('aria-hidden', 'false');
          }
        }

        // Прокручиваем к аккордеону
        setTimeout(function () {
          // Определяем высоту фиксированного хедера (если есть)
          const header = document.querySelector('.header');
          const headerOffset = header ? header.offsetHeight : 0;

          // Получаем позицию аккордеона
          const accordionRect = targetAccordion.getBoundingClientRect();
          const absoluteAccordionTop = accordionRect.top + window.pageYOffset;

          // Прокручиваем к аккордеону
          window.scrollTo({
            top: absoluteAccordionTop - headerOffset - 20,
            behavior: 'smooth'
          });
        }, 100);
      }
    });
  });
}

// Создаем MutationObserver для отслеживания изменений в контенте
const observer = new MutationObserver(function (mutations) {
  // Проверяем, были ли изменения в аккордеонах
  let needsUpdate = false;

  mutations.forEach(function (mutation) {
    if (mutation.target.closest('.accordion-item')) {
      needsUpdate = true;
    }
  });

  // Если были изменения в аккордеонах, обновляем их
  if (needsUpdate) {
    updateAllAccordions();
  }
});

// Запускаем наблюдение за изменениями в документе
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: true
});

// Добавляем поддержку клавиатуры
document.addEventListener('keydown', function (e) {
  // Если нажата клавиша Enter или Space на элементе аккордеона
  if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.accordion-header')) {
    e.preventDefault();
    const item = e.target.closest('.accordion-item');
    if (item) {
      toggleAccordion(item);
    }
  }
});
