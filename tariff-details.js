document.addEventListener("DOMContentLoaded", () => {
  // Проверяем, загружен ли GSAP
  if (typeof gsap === "undefined") {
    console.error("GSAP не загружен. Пожалуйста, добавьте библиотеку GSAP.")
    return
  }

  const accordionItems = document.querySelectorAll(".accordion-item")

  // Подготавливаем все аккордеоны
  accordionItems.forEach((item) => {
    const content = item.querySelector(".accordion-content")
    const inner = item.querySelector(".tariff-details-inner")

    // Устанавливаем начальное состояние
    gsap.set(content, {
      height: 0,
      opacity: 0,
      overflow: "hidden",
      display: "none",
    })

    // Измеряем высоту содержимого и сохраняем её как атрибут
    if (inner) {
      // Временно делаем видимым для измерения
      gsap.set(content, { display: "block", visibility: "hidden", height: "auto" })
      const height = inner.offsetHeight
      // Возвращаем в исходное состояние
      gsap.set(content, { display: "none", visibility: "visible", height: 0 })

      // Сохраняем высоту как атрибут
      content.setAttribute("data-height", height)
    }
  })

  // Функция для открытия/закрытия аккордеона
  function toggleAccordion(item) {
    const isActive = item.classList.contains("active")
    const content = item.querySelector(".accordion-content")
    const height = Number.parseInt(content.getAttribute("data-height") || 0)

    // Если аккордеон закрыт и его нужно открыть
    if (!isActive) {
      // Сначала закрываем все другие аккордеоны
      accordionItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("active")) {
          const otherContent = otherItem.querySelector(".accordion-content")
          otherItem.classList.remove("active")

          // Анимация закрытия с GSAP
          gsap.to(otherContent, {
            height: 0,
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
            onComplete: () => {
              gsap.set(otherContent, { display: "none" })
            },
          })
        }
      })

      // Открываем текущий аккордеон
      item.classList.add("active")

      // Показываем контент перед анимацией
      gsap.set(content, { display: "block", height: 0 })

      // Анимация открытия с GSAP
      gsap.to(content, {
        height: height,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      })
    } else {
      // Закрываем текущий аккордеон
      item.classList.remove("active")

      // Анимация закрытия с GSAP
      gsap.to(content, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          gsap.set(content, { display: "none" })
        },
      })
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

          // Используем GSAP для плавной прокрутки
          gsap.to(window, {
            scrollTo: scrollPosition,
            duration: 0.8,
            ease: "power2.out",
          })
        }, 300)
      }
    })
  })

  // Обновление высоты при изменении размера окна
  window.addEventListener(
    "resize",
    debounce(() => {
      accordionItems.forEach((item) => {
        const content = item.querySelector(".accordion-content")
        const inner = item.querySelector(".tariff-details-inner")

        if (inner && item.classList.contains("active")) {
          // Для открытых аккордеонов обновляем высоту
          gsap.set(content, { height: "auto" })
          const height = inner.offsetHeight
          content.setAttribute("data-height", height)
        } else if (inner) {
          // Для закрытых аккордеонов измеряем и сохраняем
          gsap.set(content, { display: "block", visibility: "hidden", height: "auto" })
          const height = inner.offsetHeight
          gsap.set(content, { display: "none", visibility: "visible", height: 0 })
          content.setAttribute("data-height", height)
        }
      })
    }, 250),
  )

  // Функция debounce для оптимизации обработчика resize
  function debounce(func, wait) {
    let timeout
    return function () {

      const args = arguments
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    }
  }
})
