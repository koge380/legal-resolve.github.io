document.addEventListener("DOMContentLoaded", () => {
  const accordionItems = document.querySelectorAll(".accordion-item")

  // Функция для открытия/закрытия аккордеона
  function toggleAccordion(item) {
    const isActive = item.classList.contains("active")
    const content = item.querySelector(".accordion-content")

    // Если аккордеон закрыт и его нужно открыть
    if (!isActive) {
      // Сначала закрываем все другие аккордеоны
      accordionItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("active")) {
          const otherContent = otherItem.querySelector(".accordion-content")
          otherItem.classList.remove("active")

          // Анимация закрытия для других аккордеонов
          otherContent.style.maxHeight = "0"
          otherContent.style.opacity = "0"
          otherContent.style.transform = "translateY(-10px)"
        }
      })

      // Затем открываем текущий аккордеон
      item.classList.add("active")

      // Устанавливаем начальное состояние для анимации
      content.style.display = "block"
      content.style.maxHeight = "0"
      content.style.opacity = "0"
      content.style.transform = "translateY(-10px)"

      // Запускаем анимацию открытия после небольшой задержки
      setTimeout(() => {
        content.style.maxHeight = content.scrollHeight + "px"
        content.style.opacity = "1"
        content.style.transform = "translateY(0)"
      }, 10)
    } else {
      // Закрываем текущий аккордеон
      item.classList.remove("active")

      // Анимация закрытия
      content.style.maxHeight = "0"
      content.style.opacity = "0"
      content.style.transform = "translateY(-10px)"
    }
  }

  // Добавляем обработчик события для каждого заголовка аккордеона
  accordionItems.forEach((item) => {
    const header = item.querySelector(".accordion-header")

    header.addEventListener("click", () => {
      toggleAccordion(item)
    })
  })

  // Обработчик для кнопок "Подробнее"
  const moreLinks = document.querySelectorAll(".service-more-link")

  moreLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      const targetId = this.getAttribute("href")
      const targetAccordion = document.querySelector(targetId)

      if (targetAccordion) {
        // Определяем высоту фиксированного хедера
        const header = document.querySelector(".header")
        const headerOffset = header ? header.offsetHeight : 0

        // Открываем аккордеон
        if (!targetAccordion.classList.contains("active")) {
          toggleAccordion(targetAccordion)
        }

        // Прокручиваем к аккордеону после небольшой задержки
        setTimeout(() => {
          const accordionRect = targetAccordion.getBoundingClientRect()
          const absoluteAccordionTop = accordionRect.top + window.pageYOffset
          const scrollPosition = absoluteAccordionTop - headerOffset - 20

          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          })
        }, 300) // Задержка для завершения анимации открытия
      }
    })
  })
})
