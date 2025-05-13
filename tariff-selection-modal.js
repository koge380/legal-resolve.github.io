document.addEventListener("DOMContentLoaded", () => {
  // Существующие элементы
  const contactModal = document.getElementById("contact-modal")
  const tariffNotification = document.getElementById("tariffNotification")
  const selectedTariffNameElement = document.getElementById("selectedTariffName")

  // Элементы модального окна выбора тарифа
  const tariffSelectionModal = document.getElementById("tariff-selection-modal")
  const tariffSelectionOverlay = tariffSelectionModal
    ? tariffSelectionModal.querySelector(".contact-modal-overlay")
    : null
  const tariffSelectionClose = tariffSelectionModal ? tariffSelectionModal.querySelector(".contact-modal-close") : null

  // Элементы форм
  const modalTariffName = document.querySelector("#modalContactForm .tariff-selection-name")
  const mainTariffName = document.querySelector("#contactForm .tariff-selection-name")

  // Ссылки изменения тарифа
  const changeTariffLinks = document.querySelectorAll(".tariff-selection-link")

  // Текст тарифа по умолчанию
  const defaultTariffText = "Бесплатная консультация"

  // Функция для показа уведомления о выборе тарифа
  function showTariffNotification(tariffName) {
    if (selectedTariffNameElement) {
      selectedTariffNameElement.textContent = tariffName
    }

    if (tariffNotification) {
      tariffNotification.classList.add("active")

      // Скрыть уведомление через 4 секунды
      setTimeout(() => {
        tariffNotification.classList.remove("active")
      }, 4000)
    }
  }

  // Функция для установки выбранного тарифа в формах
  function setSelectedTariff(tariffName) {
    if (modalTariffName) {
      modalTariffName.textContent = tariffName
    }

    if (mainTariffName) {
      mainTariffName.textContent = tariffName
    }
  }

  // Функция для открытия модального окна выбора тарифа
  function openTariffSelectionModal() {
    if (tariffSelectionModal) {
      tariffSelectionModal.classList.add("active")
      document.body.style.overflow = "hidden"
    }
  }

  // Функция для закрытия модального окна выбора тарифа
  function closeTariffSelectionModal() {
    if (tariffSelectionModal) {
      tariffSelectionModal.classList.remove("active")
      document.body.style.overflow = ""
    }
  }

  // Обработка выбора тарифа
  function handleTariffSelection(tariffName) {
    setSelectedTariff(tariffName)
    showTariffNotification(tariffName)
    closeTariffSelectionModal()
  }

  // Инициализация кнопок выбора тарифа
  function initTariffSelectionButtons() {
    const selectButtons = document.querySelectorAll(".tariff-select-button")

    selectButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const tariffRow = this.closest(".tariff-row")
        const tariffName = tariffRow.querySelector(".tariff-name-modal").textContent.trim()

        handleTariffSelection(tariffName)

        // Открыть контактное модальное окно, если оно было закрыто
        if (contactModal && !contactModal.classList.contains("active")) {
          contactModal.classList.add("active")
          document.body.style.overflow = "hidden"
        }
      })
    })

    // Обработка ссылок "подробнее"
    const detailLinks = document.querySelectorAll(".tariff-details-link")

    detailLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault()
        const targetId = this.getAttribute("href")

        // Закрыть модальное окно выбора тарифа
        closeTariffSelectionModal()

        // Закрыть контактное модальное окно, если оно открыто
        if (contactModal && contactModal.classList.contains("active")) {
          contactModal.classList.remove("active")
          document.body.style.overflow = ""
        }

        // Найти элемент аккордеона и прокрутить к нему
        const targetAccordion = document.querySelector(targetId)
        if (targetAccordion) {
          // Определить, открыт ли уже аккордеон
          const isOpen = targetAccordion.classList.contains("active")

          // Если не открыт, открыть его
          if (!isOpen) {
            targetAccordion.classList.add("active")
            const content = targetAccordion.querySelector(".accordion-content")
            if (content) {
              content.style.maxHeight = content.scrollHeight + "px"
            }
          }

          // Прокрутить к аккордеону
          const header = document.querySelector(".header")
          const headerOffset = header ? header.offsetHeight : 0

          setTimeout(() => {
            const accordionRect = targetAccordion.getBoundingClientRect()
            const absoluteAccordionTop = accordionRect.top + window.pageYOffset
            const scrollPosition = absoluteAccordionTop - headerOffset - 20

            window.scrollTo({
              top: scrollPosition,
              behavior: "smooth",
            })
          }, 50)
        }
      })
    })
  }

  // Обработка ссылок изменения тарифа
  changeTariffLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()

      // Проверить, была ли ссылка нажата из контактного модального окна
      const isFromModal = contactModal && contactModal.classList.contains("active")

      // Если нажата из модального окна, сначала закрыть его
      if (isFromModal) {
        contactModal.classList.remove("active")
      }

      // Открыть модальное окно выбора тарифа
      openTariffSelectionModal()
    })
  })

  // Закрыть модальное окно выбора тарифа при клике на оверлей или кнопку закрытия
  if (tariffSelectionOverlay) {
    tariffSelectionOverlay.addEventListener("click", closeTariffSelectionModal)
  }

  if (tariffSelectionClose) {
    tariffSelectionClose.addEventListener("click", closeTariffSelectionModal)
  }

  // Закрыть модальное окно выбора тарифа при нажатии ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && tariffSelectionModal && tariffSelectionModal.classList.contains("active")) {
      closeTariffSelectionModal()
    }
  })

  // Инициализация кнопок выбора тарифа
  initTariffSelectionButtons()

  // Тестовая функция для проверки модального окна
  window.openTariffModal = () => {
    openTariffSelectionModal()
  }
})
