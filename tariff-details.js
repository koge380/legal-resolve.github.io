document.addEventListener("DOMContentLoaded", () => {
  const accordionItems = document.querySelectorAll(".accordion-item");

  // Функция для открытия аккордеона
  function openAccordion(item, withAnimation = true) {
    // Закрываем все аккордеоны
    accordionItems.forEach((otherItem) => {
      if (otherItem !== item) {
        otherItem.classList.remove("active");
        otherItem.querySelector(".accordion-content").style.maxHeight = "0";
      }
    });

    // Открываем выбранный аккордеон
    const content = item.querySelector(".accordion-content");
    item.classList.add("active");

    if (withAnimation) {
      // С анимацией (стандартное поведение)
      content.style.maxHeight = content.scrollHeight + "px";
    } else {
      // Без анимации (мгновенное открытие)
      content.style.transition = "none";
      content.style.maxHeight = content.scrollHeight + "px";

      // Возвращаем анимацию после короткой задержки
      setTimeout(() => {
        content.style.transition = "";
      }, 50);
    }
  }

  // Функция для закрытия всех аккордеонов без анимации
  function closeAllAccordions() {
    accordionItems.forEach((item) => {
      const content = item.querySelector(".accordion-content");
      item.classList.remove("active");
      content.style.transition = "none";
      content.style.maxHeight = "0";

      // Возвращаем анимацию после короткой задержки
      setTimeout(() => {
        content.style.transition = "";
      }, 50);
    });
  }

  // Функция для проверки, открыт ли хотя бы один аккордеон
  function isAnyAccordionOpen() {
    return Array.from(accordionItems).some(item => item.classList.contains("active"));
  }

  // Добавляем обработчик события для каждого заголовка аккордеона
  accordionItems.forEach((item) => {
    const header = item.querySelector(".accordion-header");
    const content = item.querySelector(".accordion-content");

    // Обработчик клика на весь заголовок
    header.addEventListener("click", () => {
      // Проверяем, активен ли текущий элемент
      const isActive = item.classList.contains("active");

      if (isActive) {
        // Закрываем текущий аккордеон
        item.classList.remove("active");
        content.style.maxHeight = "0";
      } else {
        // Открываем текущий аккордеон с анимацией
        openAccordion(item, true);
      }
    });
  });

  // Обработчик для кнопок "Подробнее"
  const moreLinks = document.querySelectorAll(".service-more-link");

  moreLinks.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault(); // Предотвращаем стандартное поведение ссылки

      // Получаем ID аккордеона из атрибута href ссылки
      const targetId = this.getAttribute("href");
      const targetAccordion = document.querySelector(targetId);

      if (targetAccordion) {
        // Определяем высоту фиксированного хедера (если есть)
        const header = document.querySelector('.header');
        const headerOffset = header ? header.offsetHeight : 0;

        // Проверяем, открыт ли хотя бы один аккордеон
        if (isAnyAccordionOpen()) {
          // Если открыт хотя бы один аккордеон, закрываем все без анимации
          closeAllAccordions();

          // Затем открываем нужный аккордеон без анимации
          setTimeout(() => {
            openAccordion(targetAccordion, false);

            // После открытия аккордеона прокручиваем к нему
            setTimeout(() => {
              // Получаем позицию аккордеона
              const accordionRect = targetAccordion.getBoundingClientRect();
              const absoluteAccordionTop = accordionRect.top + window.pageYOffset;

              // Вычисляем позицию для прокрутки с учетом отступа
              const scrollPosition = absoluteAccordionTop - headerOffset - 20;

              // Прокручиваем страницу к вычисленной позиции
              window.scrollTo({
                top: scrollPosition,
                behavior: 'smooth'
              });
            }, 50);
          }, 50);
        } else {
          // Если не открыт ни один аккордеон, просто открываем нужный без анимации
          openAccordion(targetAccordion, false);

          // После открытия аккордеона прокручиваем к нему
          setTimeout(() => {
            // Получаем позицию аккордеона
            const accordionRect = targetAccordion.getBoundingClientRect();
            const absoluteAccordionTop = accordionRect.top + window.pageYOffset;

            // Вычисляем позицию для прокрутки с учетом отступа
            const scrollPosition = absoluteAccordionTop - headerOffset - 20;

            // Прокручиваем страницу к вычисленной позиции
            window.scrollTo({
              top: scrollPosition,
              behavior: 'smooth'
            });
          }, 50);
        }
      }
    });
  });
});
