// Современный JavaScript для админ-панели с поддержкой вложенных списков и внутренних ссылок
class BlogAdmin {
  constructor() {
    this.currentEditingSlug = null
    this.isEditMode = false
    this.apiUrl = "api/articles.php"
    this.availableArticles = []
    this.currentSelection = null
    this.allArticles = [] // Для поиска

    this.init()
  }

  init() {
    document.addEventListener("DOMContentLoaded", () => {
      this.initEditor()
      this.initCharCounters()
      this.initImageUpload()
      this.initModals()
      this.initActionButtons()
      this.initTabs()
      this.initWordCounter()
      this.initToolbar()
      this.initLinkModal()
      this.loadExistingArticles()
      this.updateStatus("Готов к работе")
    })
  }

  // Инициализация редактора
  initEditor() {
    const editor = document.getElementById("editor")
    if (!editor) return

    editor.addEventListener(
      "focus",
      () => {
        if (editor.innerHTML === "<p>Начните писать вашу статью здесь...</p>") {
          editor.innerHTML = "<p><br></p>"
        }
      },
      { once: true },
    )

    // Обработка клавиш для списков
    editor.addEventListener("keydown", (e) => {
      this.handleEditorKeydown(e)
    })

    // Обновление списка якорей при изменении контента
    editor.addEventListener("input", () => {
      this.updateAnchorsList()
    })
  }

  // Обработка нажатий клавиш в редакторе
  handleEditorKeydown(e) {
    if (e.key === "Tab") {
      e.preventDefault()
      const selection = window.getSelection()
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const listItem = this.getParentListItem(range.startContainer)

        if (listItem) {
          if (e.shiftKey) {
            this.outdentListItem()
          } else {
            this.indentListItem()
          }
        }
      }
    }
  }

  // Инициализация панели инструментов
  initToolbar() {
    const toolbarButtons = document.querySelectorAll(".toolbar-btn[data-command]")
    const editor = document.getElementById("editor")

    if (!editor) return

    toolbarButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault()
        this.executeCommand(button, editor)
      })
    })

    // Специальные кнопки
    this.initSpecialButtons()
  }

  executeCommand(button, editor) {
    const command = button.dataset.command
    const value = button.dataset.value

    try {
      if (value) {
        document.execCommand(command, false, value)
      } else {
        document.execCommand(command, false, null)
      }
      editor.focus()
    } catch (error) {
      console.error("Ошибка выполнения команды:", error)
    }
  }

  initSpecialButtons() {
    const buttons = {
      insertImage: () => {
        const url = prompt("Введите URL изображения:")
        if (url) {
          const img = `<img src="${url}" alt="Изображение" style="max-width: 100%; height: auto;">`
          document.execCommand("insertHTML", false, img)
        }
      },
      codeBlock: () => {
        const code = prompt("Введите код:")
        if (code) {
          const codeBlock = `<pre><code>${this.escapeHtml(code)}</code></pre>`
          document.execCommand("insertHTML", false, codeBlock)
        }
      },
      quoteBlock: () => {
        document.execCommand("formatBlock", false, "blockquote")
      },
      indentList: () => this.indentListItem(),
      outdentList: () => this.outdentListItem(),
      createInternalLink: () => this.openLinkModal("internal"),
      createExternalLink: () => this.openLinkModal("external"),
      createAnchor: () => this.openLinkModal("anchor"),
      removeAnchor: () => this.removeAnchor(),
      autoCreateAnchors: () => this.autoCreateAnchors(),
    }

    Object.entries(buttons).forEach(([id, handler]) => {
      const button = document.getElementById(id)
      if (button) {
        button.addEventListener("click", handler)
      }
    })

    // Специальная обработка для кнопки очистки форматирования
    const removeFormatBtn = document.querySelector('[data-command="removeFormat"]')
    if (removeFormatBtn) {
      removeFormatBtn.addEventListener("click", (e) => {
        e.preventDefault()
        this.clearAllFormatting()
      })
    }
  }

  // ИСПРАВЛЕННЫЕ функции для работы с вложенными списками
  indentListItem() {
    const selection = window.getSelection()
    if (selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const listItem = this.getParentListItem(range.startContainer)

    if (!listItem) return

    const previousItem = listItem.previousElementSibling
    if (!previousItem) return

    // Сохраняем позицию курсора
    const cursorPosition = this.saveCursorPosition(range)

    // Создаем вложенный список
    let nestedList = previousItem.querySelector("ul, ol")
    if (!nestedList) {
      const parentList = listItem.parentElement
      nestedList = document.createElement(parentList.tagName.toLowerCase())
      previousItem.appendChild(nestedList)
    }

    // Перемещаем элемент в вложенный список
    nestedList.appendChild(listItem)

    // Восстанавливаем курсор
    this.restoreCursorPosition(listItem, cursorPosition)
  }

  outdentListItem() {
    const selection = window.getSelection()
    if (selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const listItem = this.getParentListItem(range.startContainer)

    if (!listItem) return

    const parentList = listItem.parentElement
    const grandParentItem = parentList.parentElement

    if (!grandParentItem || grandParentItem.tagName !== "LI") return

    const grandParentList = grandParentItem.parentElement

    // Сохраняем позицию курсора
    const cursorPosition = this.saveCursorPosition(range)

    // Перемещаем элемент на уровень выше
    const nextSibling = grandParentItem.nextElementSibling
    if (nextSibling) {
      grandParentList.insertBefore(listItem, nextSibling)
    } else {
      grandParentList.appendChild(listItem)
    }

    // Удаляем пустой список
    if (parentList.children.length === 0) {
      parentList.remove()
    }

    // Восстанавливаем курсор
    this.restoreCursorPosition(listItem, cursorPosition)
  }

  getParentListItem(node) {
    while (node && node !== document.body) {
      if (node.tagName === "LI") {
        return node
      }
      node = node.parentElement
    }
    return null
  }

  // НОВЫЕ функции для сохранения и восстановления позиции курсора
  saveCursorPosition(range) {
    const container = range.startContainer
    const offset = range.startOffset
    return { container, offset }
  }

  restoreCursorPosition(listItem, cursorPosition) {
    try {
      const range = document.createRange()
      const selection = window.getSelection()

      // Пытаемся найти исходный контейнер в новом месте
      let targetContainer = cursorPosition.container

      // Если контей��ер больше не существует в DOM, используем первый текстовый узел в элементе списка
      if (!listItem.contains(targetContainer)) {
        const textNode = this.findFirstTextNode(listItem)
        targetContainer = textNode || listItem
      }

      const offset = Math.min(cursorPosition.offset, targetContainer.textContent?.length || 0)

      if (targetContainer.nodeType === Node.TEXT_NODE) {
        range.setStart(targetContainer, offset)
      } else {
        range.setStart(targetContainer, 0)
      }

      range.collapse(true)

      selection.removeAllRanges()
      selection.addRange(range)
    } catch (error) {
      console.error("Ошибка восстановления курсора:", error)
      // Fallback: устанавливаем курсор в начало элемента
      this.restoreSelection(listItem)
    }
  }

  findFirstTextNode(element) {
    if (element.nodeType === Node.TEXT_NODE) {
      return element
    }

    for (const child of element.childNodes) {
      const textNode = this.findFirstTextNode(child)
      if (textNode) return textNode
    }

    return null
  }

  restoreSelection(element) {
    const range = document.createRange()
    const selection = window.getSelection()

    range.setStart(element, 0)
    range.collapse(true)

    selection.removeAllRanges()
    selection.addRange(range)
  }

  // Инициализация модального окна для ссылок
  initLinkModal() {
    const linkTabs = document.querySelectorAll(".link-tab-btn")
    const internalTypeRadios = document.querySelectorAll('input[name="internalType"]')
    const createLinkBtn = document.getElementById("createLinkBtn")

    // Переключение вкладок
    linkTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const tabType = tab.dataset.tab
        this.switchLinkTab(tabType)
      })
    })

    // Переключение типа внутренней ссылки
    internalTypeRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        this.toggleInternalLinkType(radio.value)
      })
    })

    // Создание ссылки
    if (createLinkBtn) {
      createLinkBtn.addEventListener("click", () => {
        this.createLink()
      })
    }

    // Загрузка статей при изменении выбора
    const articleSelect = document.getElementById("articleSelect")
    if (articleSelect) {
      articleSelect.addEventListener("change", () => {
        this.loadArticleAnchors(articleSelect.value)
      })
    }
  }

  // Открытие модального окна для создания ссылок
  openLinkModal(type = "internal") {
    // Сохраняем текущее выделение
    this.currentSelection = window.getSelection().getRangeAt(0).cloneRange()

    // Получаем выделенный текст
    const selectedText = window.getSelection().toString()
    const linkTextInput = document.getElementById("linkText")
    if (linkTextInput) {
      linkTextInput.value = selectedText
    }

    // Переключаем на нужную вкладку
    this.switchLinkTab(type)

    // Обновляем список якорей и статей
    this.updateAnchorsList()
    this.loadArticlesList()

    this.openModal("linkModal")
  }

  // Переключение вкладок в модальном окне ссылок
  switchLinkTab(tabType) {
    // Обновляем кнопки вкладок
    document.querySelectorAll(".link-tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabType)
    })

    // Обновляем содержимое вкладок
    document.querySelectorAll(".link-tab-content").forEach((content) => {
      content.classList.toggle("active", content.id === tabType + "Tab")
    })
  }

  // Переключение типа внутренней ссылки
  toggleInternalLinkType(type) {
    const sameArticleSection = document.getElementById("sameArticleSection")
    const otherArticleSection = document.getElementById("otherArticleSection")

    if (type === "same") {
      sameArticleSection.style.display = "block"
      otherArticleSection.style.display = "none"
    } else {
      sameArticleSection.style.display = "none"
      otherArticleSection.style.display = "block"
    }
  }

  // Обновление списка якорей в текущей статье
  updateAnchorsList() {
    const editor = document.getElementById("editor")
    const anchorSelect = document.getElementById("anchorSelect")

    if (!editor || !anchorSelect) return

    // Получаем заголовки
    const headings = editor.querySelectorAll("h1, h2, h3, h4, h5, h6")

    // Получаем все созданные вручную якоря
    const manualAnchors = editor.querySelectorAll(".anchor-point")

    // Очищаем список
    anchorSelect.innerHTML = '<option value="">Выберите заголовок или якорь...</option>'

    // Добавляем заголовки
    headings.forEach((heading) => {
      const text = heading.textContent.trim()
      if (text) {
        const id = heading.id || this.generateAnchorId(text)
        const option = document.createElement("option")
        option.value = id
        option.textContent = `📄 ${text}`
        anchorSelect.appendChild(option)
      }
    })

    // Добавляем созданные вручную якоря
    manualAnchors.forEach((anchor) => {
      if (anchor.id) {
        // Пытаемся найти текст рядом с якорем для отображения
        let displayText = anchor.id

        // Ищем текст в следующих элементах
        const nextElement = anchor.nextElementSibling || anchor.parentElement?.nextElementSibling
        if (nextElement) {
          const text = nextElement.textContent?.trim().substring(0, 50)
          if (text) {
            displayText = `${anchor.id} (${text}${text.length > 50 ? "..." : ""})`
          }
        }

        const option = document.createElement("option")
        option.value = anchor.id
        option.textContent = `⚓ ${displayText}`
        anchorSelect.appendChild(option)
      }
    })
  }

  // Загрузка списка статей
  async loadArticlesList() {
    const articleSelect = document.getElementById("articleSelect")
    if (!articleSelect) return

    try {
      const response = await fetch(`${this.apiUrl}?action=list`)
      const articles = await response.json()

      this.availableArticles = articles

      articleSelect.innerHTML = '<option value="">Выберите статью...</option>'

      articles.forEach((article) => {
        if (article.slug !== this.currentEditingSlug) {
          const option = document.createElement("option")
          option.value = article.slug
          option.textContent = article.title
          articleSelect.appendChild(option)
        }
      })
    } catch (error) {
      console.error("Ошибка загрузки статей:", error)
    }
  }

  // Загрузка якорей для выбранной статьи
  async loadArticleAnchors(slug) {
    const otherAnchorSelect = document.getElementById("otherAnchorSelect")
    if (!otherAnchorSelect || !slug) return

    try {
      const response = await fetch(`${this.apiUrl}?slug=${encodeURIComponent(slug)}`)
      const article = await response.json()

      otherAnchorSelect.innerHTML = '<option value="">Ссылка на начало статьи</option>'

      if (article.content) {
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = article.content

        // Получаем заголовки
        const headings = tempDiv.querySelectorAll("h1, h2, h3, h4, h5, h6")

        // Получаем созданные вручную якоря
        const manualAnchors = tempDiv.querySelectorAll(".anchor-point")

        // Добавляем заголовки
        headings.forEach((heading) => {
          const text = heading.textContent.trim()
          if (text) {
            const id = heading.id || this.generateAnchorId(text)
            const option = document.createElement("option")
            option.value = id
            option.textContent = `📄 ${text}`
            otherAnchorSelect.appendChild(option)
          }
        })

        // Добавляем созданные вручную якоря
        manualAnchors.forEach((anchor) => {
          if (anchor.id) {
            let displayText = anchor.id

            const nextElement = anchor.nextElementSibling || anchor.parentElement?.nextElementSibling
            if (nextElement) {
              const text = nextElement.textContent?.trim().substring(0, 50)
              if (text) {
                displayText = `${anchor.id} (${text}${text.length > 50 ? "..." : ""})`
              }
            }

            const option = document.createElement("option")
            option.value = anchor.id
            option.textContent = `⚓ ${displayText}`
            otherAnchorSelect.appendChild(option)
          }
        })
      }
    } catch (error) {
      console.error("Ошибка загрузки якорей статьи:", error)
    }
  }

  // Создание ссылки
  createLink() {
    const activeTab = document.querySelector(".link-tab-btn.active").dataset.tab
    const linkText = document.getElementById("linkText").value.trim()

    if (!linkText) {
      alert("Введите текст ссылки")
      return
    }

    let href = ""
    let target = ""
    let dataModal = ""

    switch (activeTab) {
      case "internal":
        href = this.createInternalHref()
        // Определяем target в зависимости от типа внутренней ссылки
        const internalType = document.querySelector('input[name="internalType"]:checked').value
        target = internalType === "other" ? "_blank" : "" // Только для ссылок на другие статьи
        break
      case "external":
        const externalType = document.querySelector('input[name="externalType"]:checked')?.value
        if (externalType === "contact") {
          href = "#"
          dataModal = "contact-modal"
        } else {
          href = document.getElementById("externalUrl").value.trim()
          target = "_blank"
        }
        break
      case "anchor":
        const anchorId = document.getElementById("anchorId").value.trim()
        if (!anchorId) {
          alert("Введите ID якоря")
          return
        }
        this.insertAnchor(anchorId)
        this.closeModal("linkModal")
        return
    }

    if (!href) {
      alert("Заполните все необходимые поля")
      return
    }

    this.insertLink(href, linkText, target, dataModal)
    this.closeModal("linkModal")
  }

  // Создание href для внутренней ссылки
  createInternalHref() {
    const internalType = document.querySelector('input[name="internalType"]:checked').value

    if (internalType === "same") {
      const anchorId = document.getElementById("anchorSelect").value
      return anchorId ? `#${anchorId}` : ""
    } else {
      const articleSlug = document.getElementById("articleSelect").value
      const anchorId = document.getElementById("otherAnchorSelect").value

      if (!articleSlug) return ""

      return anchorId ? `${articleSlug}.html#${anchorId}` : `${articleSlug}.html`
    }
  }

  // ОБНОВЛЕННАЯ вставка ссылки в редактор
  insertLink(href, text, target = "", dataModal = "") {
    if (!this.currentSelection) return

    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(this.currentSelection)

    const link = document.createElement("a")
    link.href = href
    link.textContent = text

    // Устанавливаем target только если он не пустой
    if (target) {
      link.target = target
    }

    // Устанавливаем data-modal только если он не пустой
    if (dataModal) {
      link.setAttribute("data-modal", dataModal)
    }

    try {
      this.currentSelection.deleteContents()
      this.currentSelection.insertNode(link)
    } catch (error) {
      console.error("Ошибка вставки ссылки:", error)
    }
  }

  // ИСПРАВЛЕННАЯ вставка якоря
  insertAnchor(anchorId) {
    if (!this.currentSelection) return

    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(this.currentSelection)

    // Создаем якорь который не влияет на макет
    const anchor = document.createElement("span")
    anchor.id = anchorId
    anchor.className = "anchor-point"
    // ИСПРАВЛЕНО: делаем якорь полностью невидимым и не влияющим на макет
    anchor.style.cssText =
      "position: absolute !important; visibility: hidden !important; pointer-events: none !important; width: 0 !important; height: 0 !important; margin: 0 !important; padding: 0 !important; border: 0 !important; display: inline !important;"

    try {
      // Вставляем якорь перед текущей позицией курсора
      this.currentSelection.insertNode(anchor)

      this.updateStatus("Якорь создан: " + anchorId)

      // Обновляем список якорей
      setTimeout(() => this.updateAnchorsList(), 100)
    } catch (error) {
      console.error("Ошибка вставки якоря:", error)
    }
  }

  // Новая функция для поиска ближайшего заголовка
  findNearestHeading(element) {
    let current = element.nextElementSibling || element.parentElement?.nextElementSibling

    // Ищем следующий заголовок
    while (current) {
      if (current.tagName && /^H[1-6]$/.test(current.tagName)) {
        return current
      }
      current = current.nextElementSibling
    }

    // Если не найден следующий, ищем предыдущий
    current = element.previousElementSibling || element.parentElement?.previousElementSibling
    while (current) {
      if (current.tagName && /^H[1-6]$/.test(current.tagName)) {
        return current
      }
      current = current.previousElementSibling
    }

    return null
  }

  // Удаление якоря
  removeAnchor() {
    const selection = window.getSelection()
    if (selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    let currentNode = range.startContainer

    // Ищем якорь в текущем элементе или его родителях
    while (currentNode && currentNode !== document.body) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        // Проверяем, является ли текущий элемент якорем
        if (currentNode.classList && currentNode.classList.contains("anchor-point")) {
          if (confirm(`Удалить якорь "${currentNode.id}"?`)) {
            currentNode.remove()
            this.updateAnchorsList()
            this.updateStatus("Якорь удален")
          }
          return
        }

        // Ищем якорь внутри текущего элемента
        const anchor = currentNode.querySelector(".anchor-point")
        if (anchor) {
          if (confirm(`Удалить якорь "${anchor.id}"?`)) {
            anchor.remove()
            this.updateAnchorsList()
            this.updateStatus("Якорь удален")
          }
          return
        }
      }
      currentNode = currentNode.parentNode
    }

    // Если якорь не найден, показываем список всех якорей для выбора
    this.showAnchorRemovalDialog()
  }

  // Показать диалог для выбора якоря для удаления
  showAnchorRemovalDialog() {
    const editor = document.getElementById("editor")
    if (!editor) return

    const anchors = editor.querySelectorAll(".anchor-point")

    if (anchors.length === 0) {
      alert("В статье нет якорей для удаления")
      return
    }

    const anchorList = Array.from(anchors)
      .map((anchor, index) => `${index + 1}. ${anchor.id}`)
      .join("\n")

    const choice = prompt(`Выберите якорь для удаления (введите номер):\n\n${anchorList}`)

    if (choice) {
      const index = Number.parseInt(choice) - 1
      if (index >= 0 && index < anchors.length) {
        const anchorToRemove = anchors[index]
        if (confirm(`Удалить якорь "${anchorToRemove.id}"?`)) {
          anchorToRemove.remove()
          this.updateAnchorsList()
          this.updateStatus("Якорь удален")
        }
      } else {
        alert("Неверный номер якоря")
      }
    }
  }

  // Генерация ID для якоря
  generateAnchorId(text) {
    // Улучшенная транслитерация
    const translitMap = {
      а: "a",
      б: "b",
      в: "v",
      г: "g",
      д: "d",
      е: "e",
      ё: "yo",
      ж: "zh",
      з: "z",
      и: "i",
      й: "y",
      к: "k",
      л: "l",
      м: "m",
      н: "n",
      о: "o",
      п: "p",
      р: "r",
      с: "s",
      т: "t",
      у: "u",
      ф: "f",
      х: "h",
      ц: "ts",
      ч: "ch",
      ш: "sh",
      щ: "sch",
      ъ: "",
      ы: "y",
      ь: "",
      э: "e",
      ю: "yu",
      я: "ya",
    }

    let result = text
      .toLowerCase()
      .trim()
      .split("")
      .map((char) => translitMap[char] || char)
      .join("")
      .replace(/[^a-z0-9\s-]/g, "") // Удаляем все кроме букв, цифр, пробелов и дефисов
      .replace(/\s+/g, "-") // Заменяем пробелы на дефисы
      .replace(/-+/g, "-") // Убираем множественные дефисы
      .replace(/^-+|-+$/g, "") // Убираем дефисы в начале и конце

    // Если результат пустой, генерируем случайный ID
    if (!result) {
      result = "anchor-" + Date.now()
    }

    return result
  }

  // Автоматическое создание якорей для всех заголовков
  autoCreateAnchors() {
    const editor = document.getElementById("editor")
    if (!editor) return

    const headings = editor.querySelectorAll("h1, h2, h3, h4, h5, h6")

    headings.forEach((heading) => {
      if (!heading.id) {
        const text = heading.textContent.trim()
        if (text) {
          const anchorId = this.generateAnchorId(text)
          heading.id = anchorId
        }
      }
    })

    this.updateAnchorsList()
    this.updateStatus("Якоря созданы для всех заголовков")
  }

  // Улучшенная функция очистки форматирования
  clearAllFormatting() {
    const editor = document.getElementById("editor")
    if (!editor) return

    const selection = window.getSelection()
    if (selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)

    // Если ничего не выделено, выделяем все содержимое
    if (range.collapsed) {
      range.selectNodeContents(editor)
      selection.removeAllRanges()
      selection.addRange(range)
    }

    try {
      // Стандартная очистка форматирования
      document.execCommand("removeFormat", false, null)
      document.execCommand("unlink", false, null)

      // Очистка дополнительных стилей
      const selectedContent = range.extractContents()
      const tempDiv = document.createElement("div")
      tempDiv.appendChild(selectedContent)

      // Удаляем все атрибуты style и class
      const allElements = tempDiv.querySelectorAll("*")
      allElements.forEach((element) => {
        element.removeAttribute("style")
        element.removeAttribute("class")
        element.removeAttribute("color")
        element.removeAttribute("face")
        element.removeAttribute("size")

        // Удаляем ссылки, оставляя только текст
        if (element.tagName === "A") {
          const textNode = document.createTextNode(element.textContent)
          element.parentNode.replaceChild(textNode, element)
        }
      })

      // Вставляем очищенный контент обратно
      range.insertNode(tempDiv.firstChild || document.createTextNode(""))

      // Восстанавливаем выделение
      selection.removeAllRanges()
      selection.addRange(range)

      editor.focus()
    } catch (error) {
      console.error("Ошибка очистки форматирования:", error)
      // Fallback: простая очистка
      document.execCommand("removeFormat", false, null)
      document.execCommand("unlink", false, null)
    }
  }

  // Обновление статуса
  updateStatus(message, type = "success") {
    const statusIndicator = document.getElementById("statusIndicator")
    if (!statusIndicator) return

    const statusText = statusIndicator.querySelector(".status-text")
    const statusDot = statusIndicator.querySelector(".status-dot")

    if (statusText) statusText.textContent = message

    // Сброс классов
    statusIndicator.className = "status-indicator"

    // Применение стилей
    const styles = {
      error: { bg: "var(--error-light)", color: "var(--error-color)" },
      warning: { bg: "var(--warning-light)", color: "var(--warning-color)" },
      success: { bg: "var(--success-light)", color: "var(--success-color)" },
    }

    const style = styles[type] || styles.success
    statusIndicator.style.background = style.bg
    statusIndicator.style.color = style.color
    if (statusDot) statusDot.style.background = style.color
  }

  // ОБНОВЛЕННАЯ инициализация счетчиков символов с поддержкой нового поля
  initCharCounters() {
    const elements = {
      metaTitle: document.getElementById("metaTitle"),
      metaDescription: document.getElementById("metaDescription"),
      cardExcerpt: document.getElementById("cardExcerpt"), // НОВОЕ поле
    }

    Object.values(elements).forEach((element) => {
      if (element) {
        element.addEventListener("input", () => this.updateCharCounters())
      }
    })
  }

  // ОБНОВЛЕННАЯ функция обновления счетчиков
  updateCharCounters() {
    const configs = [
      { element: "metaTitle", counter: "metaTitleCount", progress: "metaTitleProgress", max: 60 },
      { element: "metaDescription", counter: "metaDescCount", progress: "metaDescProgress", max: 160 },
      { element: "cardExcerpt", counter: "cardExcerptCount", progress: "cardExcerptProgress", max: 200 }, // НОВОЕ поле
    ]

    configs.forEach((config) => {
      const element = document.getElementById(config.element)
      const counter = document.getElementById(config.counter)
      const progress = document.getElementById(config.progress)

      if (!element) return

      const length = element.value.length
      const percent = (length / config.max) * 100

      if (counter) counter.textContent = length
      if (progress) progress.style.width = `${Math.min(percent, 100)}%`

      // Цветовая индикация
      const color =
        length > config.max
          ? "var(--error-color)"
          : length > config.max * 0.8
            ? "var(--warning-color)"
            : "var(--text-muted)"
      const progressColor =
        length > config.max
          ? "var(--error-color)"
          : length > config.max * 0.8
            ? "var(--warning-color)"
            : "var(--primary-color)"

      if (counter) counter.style.color = color
      if (progress) progress.style.background = progressColor
    })
  }

  // ПРОСТАЯ инициализация загрузки изображений
  initImageUpload() {
    const featuredImage = document.getElementById("featuredImage")
    const imagePreview = document.getElementById("imagePreview")

    if (!featuredImage || !imagePreview) return

    // Обработчик для основного поля загрузки изображения
    featuredImage.addEventListener("change", (e) => {
      const file = e.target.files[0]
      if (!file) {
        // Если файл не выбран, очищаем превью
        imagePreview.style.backgroundImage = ""
        imagePreview.classList.remove("has-image")
        return
      }

      // Валидация файла
      if (!this.validateImageFile(file)) return

      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreview.style.backgroundImage = `url(${e.target.result})`
        imagePreview.classList.add("has-image")
      }
      reader.readAsDataURL(file)
    })

    // Обработчик клика на превью изображения - всегда открывает диалог выбора файла
    imagePreview.addEventListener("click", () => {
      featuredImage.click()
    })

    // Добавляем подсказки при наведении
    imagePreview.addEventListener("mouseenter", () => {
      imagePreview.style.cursor = "pointer"
      if (this.isEditMode) {
        imagePreview.title = "Нажмите для выбора нового изображения"
      } else {
        imagePreview.title = "Нажмите для выбора изображения"
      }
    })
  }

  validateImageFile(file) {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      this.updateStatus("Неподдерживаемый тип файла", "error")
      return false
    }

    if (file.size > maxSize) {
      this.updateStatus("Размер файла превышает 5MB", "error")
      return false
    }

    return true
  }

  // Инициализация модальных окон
  initModals() {
    const modals = document.querySelectorAll(".modal")
    const closeButtons = document.querySelectorAll(".close-modal")

    closeButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const modal = button.closest(".modal")
        if (modal) this.closeModal(modal.id)
      })
    })

    modals.forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) this.closeModal(modal.id)
      })
    })
  }

  // Инициализация кнопок действий
  initActionButtons() {
    const buttons = {
      publishBtn: () => this.publishArticle(),
      previewBtn: () => this.previewArticle(),
      confirmPublish: () => this.confirmPublishArticle(),
      viewPublished: () => this.viewPublishedArticle(),
      createNew: () => this.createNewArticle(),
    }

    Object.entries(buttons).forEach(([id, handler]) => {
      const button = document.getElementById(id)
      if (button) {
        button.addEventListener("click", handler)
      }
    })

    // Инициализация даты публикации
    this.initPublishDate()
  }

  initPublishDate() {
    const publishDateInput = document.getElementById("publishDate")
    const publishNowCheckbox = document.getElementById("publishNow")

    if (publishDateInput) {
      const now = new Date()
      publishDateInput.value = now.toISOString().slice(0, 16)
    }

    if (publishNowCheckbox && publishDateInput) {
      publishNowCheckbox.addEventListener("change", () => {
        publishDateInput.disabled = publishNowCheckbox.checked
      })
    }
  }

  // Инициализация вкладок
  initTabs() {
    const tabButtons = document.querySelectorAll(".tab-btn")
    const tabContents = document.querySelectorAll(".tab-content")

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetTab = button.dataset.tab

        tabButtons.forEach((btn) => btn.classList.remove("active"))
        tabContents.forEach((content) => content.classList.remove("active"))

        button.classList.add("active")
        const targetContent = document.getElementById(targetTab + "Tab")
        if (targetContent) targetContent.classList.add("active")
      })
    })
  }

  // Инициализация счетчика слов
  initWordCounter() {
    const editor = document.getElementById("editor")
    const wordCount = document.getElementById("wordCount")
    const charCount = document.getElementById("charCount")

    if (!editor) return

    const updateWordCount = () => {
      const text = editor.textContent || editor.innerText || ""
      const words = text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0)
      const characters = text.length

      if (wordCount) wordCount.textContent = `${words.length} слов`
      if (charCount) charCount.textContent = `${characters} символов`
    }

    editor.addEventListener("input", updateWordCount)
    updateWordCount()
  }

  // ОБНОВЛЕННАЯ загрузка существующих статей с поиском
  async loadExistingArticles() {
    try {
      console.log("Загружаем список статей...")
      const response = await fetch(`${this.apiUrl}?action=list`)
      console.log("Response status:", response.status)

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const articles = await response.json()
      console.log("Загружено статей:", articles.length, articles)

      this.allArticles = articles // Сохраняем для поиска
      this.displayArticlesList(articles)
    } catch (error) {
      console.error("Ошибка загрузки статей:", error)
      this.updateStatus("Ошибка загрузки статей", "error")
    }
  }

  // ОБНОВЛЕННАЯ функция отображения списка статей с поиском
  displayArticlesList(articles) {
    const sidebar = document.querySelector(".sidebar")
    if (!sidebar) return

    const existingList = sidebar.querySelector(".articles-management")
    if (existingList) existingList.remove()

    const articlesSection = document.createElement("div")
    articlesSection.className = "articles-management"
    articlesSection.innerHTML = this.generateArticlesListHTML(articles)

    sidebar.appendChild(articlesSection)

    // Инициализируем поиск
    this.initArticlesSearch()
  }

  // НОВАЯ функция инициализации поиска статей
  initArticlesSearch() {
    const searchInput = document.getElementById("articlesSearch")
    if (!searchInput) return

    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase().trim()
      this.filterArticles(searchTerm)
    })
  }

  // НОВАЯ функция фильтрации статей
  filterArticles(searchTerm) {
    const articleItems = document.querySelectorAll(".article-item")

    articleItems.forEach((item) => {
      const title = item.querySelector("h4")?.textContent.toLowerCase() || ""
      const category = item.querySelector(".article-category-tag")?.textContent.toLowerCase() || ""

      const matches = title.includes(searchTerm) || category.includes(searchTerm)

      if (matches || searchTerm === "") {
        item.classList.remove("hidden")
      } else {
        item.classList.add("hidden")
      }
    })
  }

  // ОБНОВЛЕННАЯ функция генерации HTML списка статей с поиском
  generateArticlesListHTML(articles) {
    const articlesHTML =
      articles.length === 0
        ? "<p>Статьи не найдены</p>"
        : articles.map((article) => this.generateArticleItemHTML(article)).join("")

    return `
            <h3>Управление статьями</h3>
            <div class="articles-actions">
                <button onclick="blogAdmin.createNewArticle()" class="btn secondary" style="width: 100%; margin-bottom: 15px;">
                    + Создать новую статью
                </button>
            </div>
            <div class="articles-search">
                <input type="text" id="articlesSearch" class="search-input" placeholder="Поиск статей по заголовку...">
            </div>
            <div class="articles-list">
                ${articlesHTML}
            </div>
        `
  }

  generateArticleItemHTML(article) {
    const date = article.updated || article.created
    const formattedDate = date ? new Date(date).toLocaleDateString("ru-RU") : ""

    return `
            <div class="article-item" data-slug="${article.slug}">
                <div class="article-info">
                    <h4>${this.escapeHtml(article.title)}</h4>
                    <small>${formattedDate}</small>
                    ${article.category ? `<span class="article-category-tag">${this.escapeHtml(article.category)}</span>` : ""}
                </div>
                <div class="article-actions">
                    <button onclick="blogAdmin.editArticle('${article.slug}')" class="btn-small primary">Изменить</button>
                    <button onclick="blogAdmin.deleteArticle('${article.slug}')" class="btn-small danger">Удалить</button>
                </div>
            </div>
        `
  }

  // Создание новой статьи
  createNewArticle() {
    this.clearForm()
    this.isEditMode = false
    this.currentEditingSlug = null

    const publishBtn = document.getElementById("publishBtn")
    if (publishBtn) {
      publishBtn.textContent = "Опубликовать"
      publishBtn.className = "btn primary"
    }

    const titleInput = document.getElementById("postTitle")
    if (titleInput) titleInput.focus()

    this.updateStatus("Создание новой статьи")
  }

  // Редактирование статьи
  async editArticle(slug) {
    try {
      this.updateStatus("Загрузка статьи...", "warning")

      const response = await fetch(`${this.apiUrl}?slug=${encodeURIComponent(slug)}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const article = await response.json()

      if (article.error) {
        throw new Error(article.error)
      }

      this.fillForm(article)
      this.switchToEditMode(slug)

      this.updateStatus("Статья загружена для редактирования")
      window.scrollTo(0, 0)
    } catch (error) {
      console.error("Ошибка загрузки статьи:", error)
      this.updateStatus("Ошибка загрузки статьи: " + error.message, "error")
    }
  }

  // ОБНОВЛЕННАЯ функция заполнения формы с поддержкой нового поля
  fillForm(article) {
    const fields = {
      postTitle: article.title || "",
      postUrl: article.slug || "",
      metaTitle: article.metaTitle || "",
      metaDescription: article.metaDescription || "",
      cardExcerpt: article.cardExcerpt || "", // НОВОЕ поле
      tags: article.tags || "",
      category: article.category || "",
    }

    Object.entries(fields).forEach(([id, value]) => {
      const element = document.getElementById(id)
      if (element) element.value = value
    })

    const editor = document.getElementById("editor")
    if (editor) {
      editor.innerHTML = article.content || ""
      // Обновляем список якорей после загрузки контента
      setTimeout(() => this.updateAnchorsList(), 100)
    }

    // Отображение существующего изображения
    const imagePreview = document.getElementById("imagePreview")
    const featuredImage = document.getElementById("featuredImage")

    if (imagePreview) {
      if (article.image) {
        imagePreview.style.backgroundImage = `url(${article.image})`
        imagePreview.classList.add("has-image")
      } else {
        imagePreview.style.backgroundImage = ""
        imagePreview.classList.remove("has-image")
      }
    }

    // Очищаем поле выбора файла
    if (featuredImage) {
      featuredImage.value = ""
    }

    this.updateCharCounters()
  }

  switchToEditMode(slug) {
    this.isEditMode = true
    this.currentEditingSlug = slug

    const publishBtn = document.getElementById("publishBtn")
    if (publishBtn) {
      publishBtn.textContent = "Обновить статью"
      publishBtn.className = "btn warning"
    }
  }

  // Удаление статьи
  async deleteArticle(slug) {
    if (!confirm("Вы уверены, что хотите удалить эту статью? Это действие нельзя отменить.")) {
      return
    }

    try {
      this.updateStatus("Удаление статьи...", "warning")

      const response = await fetch(`${this.apiUrl}?slug=${encodeURIComponent(slug)}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const result = await response.json()

      if (result.success) {
        this.updateStatus("Статья успешно удалена")
        this.loadExistingArticles()

        if (this.currentEditingSlug === slug) {
          this.createNewArticle()
        }
      } else {
        throw new Error(result.error || "Неизвестная ошибка")
      }
    } catch (error) {
      console.error("Ошибка удаления статьи:", error)
      this.updateStatus("Ошибка удаления: " + error.message, "error")
    }
  }

  // ОБНОВЛЕННАЯ очистка формы с новым полем
  clearForm() {
    const fields = ["postTitle", "postUrl", "metaTitle", "metaDescription", "cardExcerpt", "tags", "category"] // Добавлено cardExcerpt

    fields.forEach((id) => {
      const element = document.getElementById(id)
      if (element) element.value = ""
    })

    const editor = document.getElementById("editor")
    if (editor) editor.innerHTML = "<p>Начните писать вашу статью здесь...</p>"

    const imagePreview = document.getElementById("imagePreview")
    if (imagePreview) {
      imagePreview.style.backgroundImage = ""
      imagePreview.classList.remove("has-image")
    }

    const featuredImage = document.getElementById("featuredImage")
    if (featuredImage) featuredImage.value = ""

    this.updateCharCounters()
  }

  // Публикация статьи
  async publishArticle() {
    const formData = this.getFormData()

    if (!this.validateFormData(formData)) return

    this.updatePublishPreview(formData)
    this.openModal("publishModal")
  }

  // ОБНОВЛЕННАЯ функция получения данных формы с новым полем
  getFormData() {
    const elements = {
      title: document.getElementById("postTitle"),
      content: document.getElementById("editor"),
      metaTitle: document.getElementById("metaTitle"),
      metaDescription: document.getElementById("metaDescription"),
      cardExcerpt: document.getElementById("cardExcerpt"), // НОВОЕ поле
      tags: document.getElementById("tags"),
      category: document.getElementById("category"),
      postUrl: document.getElementById("postUrl"),
      featuredImage: document.getElementById("featuredImage"),
    }

    return {
      title: elements.title?.value?.trim() || "",
      content: elements.content?.innerHTML || "",
      metaTitle: elements.metaTitle?.value?.trim() || "",
      metaDescription: elements.metaDescription?.value?.trim() || "",
      cardExcerpt: elements.cardExcerpt?.value?.trim() || "", // НОВОЕ поле
      tags: elements.tags?.value || "",
      category: elements.category?.value || "",
      postUrl: elements.postUrl?.value || this.generateSlug(elements.title?.value || ""),
      featuredImage: elements.featuredImage?.files?.[0] || null,
    }
  }

  validateFormData(formData) {
    const validations = [
      { field: "title", message: "Введите заголовок статьи", element: "postTitle" },
      {
        field: "content",
        message: "Добавьте содержимое статьи",
        element: "editor",
        check: (content) =>
          content && content !== "<p>Начните писать вашу статью здесь...</p>" && content !== "<p><br></p>",
      },
      { field: "metaTitle", message: "Заполните Meta заголовок для SEO", element: "metaTitle" },
      { field: "metaDescription", message: "Заполните Meta описание для SEO", element: "metaDescription" },
    ]

    for (const validation of validations) {
      const value = formData[validation.field]
      const isValid = validation.check ? validation.check(value) : value

      if (!isValid) {
        this.updateStatus(validation.message, "error")
        const element = document.getElementById(validation.element)
        if (element) element.focus()
        return false
      }
    }

    return true
  }

  // ОБНОВЛЕННАЯ функция обновления предпросмотра публикации
  updatePublishPreview(formData) {
    const previewTitle = document.getElementById("publishPreviewTitle")
    const previewDesc = document.getElementById("publishPreviewDesc")

    if (previewTitle) previewTitle.textContent = formData.title || "Без заголовка"

    // Используем кастомное описание или автогенерированное
    let description = formData.cardExcerpt
    if (!description) {
      // Автогенерация из контента
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = formData.content
      const textContent = tempDiv.textContent || tempDiv.innerText || ""
      description = textContent.substring(0, 150)
      if (textContent.length > 150) {
        description += "..."
      }
    }

    if (previewDesc) previewDesc.textContent = description || "Описание не указано"
  }

  // Предпросмотр статьи
  previewArticle() {
    const title = document.getElementById("postTitle")?.value || "Без заголовка"
    const content = document.getElementById("editor")?.innerHTML || ""

    const previewWindow = window.open("", "_blank")
    previewWindow.document.write(this.generatePreviewHTML(title, content))
    previewWindow.document.close()
  }

  generatePreviewHTML(title, content) {
    return `
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${this.escapeHtml(title)}</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        line-height: 1.6;
                    }
                    h1 { color: #333; margin-bottom: 20px; }
                    img { max-width: 100%; height: auto; }
                    blockquote {
                        border-left: 4px solid #3b82f6;
                        padding-left: 16px;
                        margin: 20px 0;
                        color: #666;
                        font-style: italic;
                    }
                    pre {
                        background: #f8f9fa;
                        padding: 16px;
                        border-radius: 4px;
                        overflow-x: auto;
                    }
                    ul, ol {
                        margin: 16px 0;
                        padding-left: 24px;
                    }
                    ul ul, ol ol, ul ol, ol ul {
                        margin: 8px 0;
                        padding-left: 20px;
                    }
                    .anchor-point {
                        display: block;
                        height: 0;
                        margin-top: -60px;
                        padding-top: 60px;
                        visibility: hidden;
                    }
                </style>
            </head>
            <body>
                <h1>${this.escapeHtml(title)}</h1>
                <div>${content}</div>
            </body>
            </html>
        `
  }

  // ОБНОВЛЕННАЯ подтверждение публикации с поддержкой даты
  async confirmPublishArticle() {
    const formData = this.getFormData()

    if (!this.validateFormData(formData)) return

    // НОВОЕ: Получаем дату публикации
    const publishNow = document.getElementById("publishNow")?.checked
    const publishDate = document.getElementById("publishDate")?.value

    // Добавляем дату публикации к данным формы
    if (!publishNow && publishDate) {
      formData.publishDate = publishDate
    }

    this.updateStatus("Публикация статьи...", "warning")

    try {
      const response = await this.sendArticleData(formData)
      const result = await this.handleResponse(response)

      if (result.success) {
        this.handleSuccessfulPublish(result, formData)
      } else {
        throw new Error(result.error || "Неизвестная ошибка")
      }
    } catch (error) {
      console.error("Ошибка публикации:", error)
      this.updateStatus("Ошибка публикации: " + error.message, "error")
    }
  }

  // ОБНОВЛЕННАЯ функция отправки данных статьи с новыми полями
  async sendArticleData(formData) {
    const hasNewImage = formData.featuredImage && formData.featuredImage.size > 0

    if (this.isEditMode) {
      if (hasNewImage) {
        // Если есть новое изображение, используем POST с action=update
        const postFormData = new FormData()

        // Добавляем все поля
        postFormData.append("action", "update")
        postFormData.append("oldSlug", this.currentEditingSlug)
        postFormData.append("title", formData.title)
        postFormData.append("content", formData.content)
        postFormData.append("slug", formData.postUrl)
        postFormData.append("metaTitle", formData.metaTitle)
        postFormData.append("metaDescription", formData.metaDescription)
        postFormData.append("cardExcerpt", formData.cardExcerpt) // НОВОЕ поле
        postFormData.append("tags", formData.tags)
        postFormData.append("category", formData.category)
        postFormData.append("image", formData.featuredImage)

        // НОВОЕ: Добавляем дату публикации если есть
        if (formData.publishDate) {
          postFormData.append("publishDate", formData.publishDate)
        }

        return fetch(this.apiUrl, {
          method: "POST",
          body: postFormData,
        })
      } else {
        // Если нет нового изображения, используем PUT с JSON
        const updateData = {
          title: formData.title,
          content: formData.content,
          slug: formData.postUrl,
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          cardExcerpt: formData.cardExcerpt, // НОВОЕ поле
          tags: formData.tags,
          category: formData.category,
        }

        // НОВОЕ: Добавляем дату публикации если есть
        if (formData.publishDate) {
          updateData.publishDate = formData.publishDate
        }

        return fetch(`${this.apiUrl}?slug=${encodeURIComponent(this.currentEditingSlug)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        })
      }
    } else {
      // При создании новой статьи
      const postFormData = new FormData()

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "featuredImage" && value) {
          postFormData.append("image", value)
        } else if (key === "postUrl") {
          postFormData.append("slug", value)
        } else if (key !== "featuredImage") {
          postFormData.append(key, value)
        }
      })

      return fetch(this.apiUrl, {
        method: "POST",
        body: postFormData,
      })
    }
  }

  async handleResponse(response) {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const text = await response.text()

    try {
      return JSON.parse(text)
    } catch (e) {
      console.error("Ошибка парсинга JSON:", e)
      console.error("Ответ сервера:", text)
      throw new Error("Некорректный ответ сервера")
    }
  }

  handleSuccessfulPublish(result, formData) {
    const message = this.isEditMode ? "Статья успешно обновлена!" : "Статья успешно создана!"
    this.updateStatus(message)

    this.showPublishSuccess(result, formData)
    this.loadExistingArticles()

    // Если изменился slug при редактировании, обновляем текущий slug
    if (this.isEditMode && result.newSlug && result.slugChanged) {
      this.currentEditingSlug = result.newSlug

      // Обновляем URL в форме
      const postUrlInput = document.getElementById("postUrl")
      if (postUrlInput) {
        postUrlInput.value = result.newSlug
      }
    }

    // Если было обновлено изображение, обновляем превью
    if (this.isEditMode && result.newImagePath) {
      const imagePreview = document.getElementById("imagePreview")
      if (imagePreview) {
        const imageUrl = `${result.newImagePath}?t=${new Date().getTime()}`
        imagePreview.style.backgroundImage = `url('${imageUrl}')`
        imagePreview.classList.add("has-image")
      }

      // Очищаем поле выбора файла
      const featuredImage = document.getElementById("featuredImage")
      if (featuredImage) {
        featuredImage.value = ""
      }
    }

    if (!this.isEditMode && result.url) {
      setTimeout(() => window.open(result.url, "_blank"), 1000)
    }
  }

  showPublishSuccess(result, formData) {
    const publishForm = document.getElementById("publishForm")
    const publishSuccess = document.getElementById("publishSuccess")

    if (publishForm) publishForm.style.display = "none"
    if (publishSuccess) publishSuccess.style.display = "block"

    const publishedUrl = document.getElementById("publishedUrl")
    const articleUrl = result.url || `${formData.postUrl}.html`

    if (publishedUrl) {
      publishedUrl.href = articleUrl
      publishedUrl.textContent = articleUrl
    }
  }

  viewPublishedArticle() {
    const publishedUrl = document.getElementById("publishedUrl")
    if (publishedUrl) {
      window.open(publishedUrl.href, "_blank")
    }
  }

  // Модальные окна
  openModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) modal.style.display = "block"
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.style.display = "none"

      if (modalId === "publishModal") {
        const publishForm = document.getElementById("publishForm")
        const publishSuccess = document.getElementById("publishSuccess")

        if (publishForm) publishForm.style.display = "block"
        if (publishSuccess) publishSuccess.style.display = "none"
      }
    }
  }

  // Утилиты
  generateSlug(title) {
    const translitMap = {
      а: "a",
      б: "b",
      в: "v",
      г: "g",
      д: "d",
      е: "e",
      ё: "yo",
      ж: "zh",
      з: "z",
      и: "i",
      й: "y",
      к: "k",
      л: "l",
      м: "m",
      н: "n",
      о: "o",
      п: "p",
      р: "r",
      с: "s",
      т: "t",
      у: "u",
      ф: "f",
      х: "h",
      ц: "ts",
      ч: "ch",
      ш: "sh",
      щ: "sch",
      ъ: "",
      ы: "y",
      ь: "",
      э: "e",
      ю: "yu",
      я: "ya",
    }

    return (
      title
        .toLowerCase()
        .split("")
        .map((char) => translitMap[char] || char)
        .join("")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "") || `article-${Date.now()}`
    )
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  copyToClipboard(text) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.updateStatus("Ссылка скопирована в буфер обмена")
        setTimeout(() => this.updateStatus("Готов к работе"), 2000)
      })
      .catch(() => {
        this.updateStatus("Ошибка копирования", "error")
        setTimeout(() => this.updateStatus("Готов к работе"), 2000)
      })
  }
}

// Инициализация
const blogAdmin = new BlogAdmin()

// Глобальные функции для совместимости с HTML
window.blogAdmin = blogAdmin
