document.addEventListener("DOMContentLoaded", () => {
  const accordionItems = document.querySelectorAll(".accordion-item")

  // Функция для открытия аккордеона
  function openAccordion(item) {
    // Закрываем все аккордеоны
    accordionItems.forEach((otherItem) => {
      if (otherItem !== item) {
        otherItem.classList.remove("active")
      }
    })

    // Открываем выбранный аккордеон
    item.classList.toggle("active")
  }

  // Добавляем обработчик события для каждого заголовка аккордеона
  accordionItems.forEach((item) => {
    const header = item.querySelector(".accordion-header")

    // Обработчик клика на весь заголовок
    header.addEventListener("click", () => {
      openAccordion(item)
    })
  })

  // Обработчик для кнопок "Подробнее"
  const moreLinks = document.querySelectorAll(".service-more-link")

  moreLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault() // Предотвращаем стандартное поведение ссылки

      // Получаем ID аккордеона из атрибута href ссылки
      const targetId = this.getAttribute("href")
      const targetAccordion = document.querySelector(targetId)

      if (targetAccordion) {
        // Определяем высоту фиксированного хедера (если есть)
        const header = document.querySelector(".header")
        const headerOffset = header ? header.offsetHeight : 0

        // Открываем нужный аккордеон
        if (!targetAccordion.classList.contains("active")) {
          openAccordion(targetAccordion)
        }

        // Прокручиваем к аккордеону с небольшой задержкой
        setTimeout(() => {
          // Получаем позицию аккордеона
          const accordionRect = targetAccordion.getBoundingClientRect()
          const absoluteAccordionTop = accordionRect.top + window.pageYOffset

          // Вычисляем позицию для прокрутки с учетом отступа
          const scrollPosition = absoluteAccordionTop - headerOffset - 20

          // Прокручиваем страницу к вычисленной позиции
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          })
        }, 100)
      }
    })
  })
})
