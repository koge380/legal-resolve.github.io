// Оптимизированный JavaScript для админ-панели
class BlogAdmin {
  constructor() {
    this.currentEditingSlug = null
    this.isEditMode = false
    this.apiUrl = "api/articles.php"

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
      if (command === "createLink") {
        const url = prompt("Введите URL:")
        if (url) {
          document.execCommand(command, false, url)
        }
      } else if (value) {
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
    }

    Object.entries(buttons).forEach(([id, handler]) => {
      const button = document.getElementById(id)
      if (button) {
        button.addEventListener("click", handler)
      }
    })
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

  // Инициализация счетчиков символов
  initCharCounters() {
    const elements = {
      metaTitle: document.getElementById("metaTitle"),
      metaDescription: document.getElementById("metaDescription"),
    }

    Object.values(elements).forEach((element) => {
      if (element) {
        element.addEventListener("input", () => this.updateCharCounters())
      }
    })
  }

  updateCharCounters() {
    const configs = [
      { element: "metaTitle", counter: "metaTitleCount", progress: "metaTitleProgress", max: 60 },
      { element: "metaDescription", counter: "metaDescCount", progress: "metaDescProgress", max: 160 },
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

  // Инициализация загрузки изображений
  initImageUpload() {
    const featuredImage = document.getElementById("featuredImage")
    const imagePreview = document.getElementById("imagePreview")

    if (!featuredImage || !imagePreview) return

    featuredImage.addEventListener("change", (e) => {
      const file = e.target.files[0]
      if (!file) return

      // Валидация файла
      if (!this.validateImageFile(file)) return

      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreview.style.backgroundImage = `url(${e.target.result})`
        imagePreview.classList.add("has-image")
      }
      reader.readAsDataURL(file)
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

  // Загрузка существующих статей
  async loadExistingArticles() {
    try {
      const response = await fetch(`${this.apiUrl}?action=list`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const articles = await response.json()
      this.displayArticlesList(articles)
    } catch (error) {
      console.error("Ошибка загрузки статей:", error)
      this.updateStatus("Ошибка загрузки статей", "error")
    }
  }

  // Отображение списка статей
  displayArticlesList(articles) {
    const sidebar = document.querySelector(".sidebar")
    if (!sidebar) return

    const existingList = sidebar.querySelector(".articles-management")
    if (existingList) existingList.remove()

    const articlesSection = document.createElement("div")
    articlesSection.className = "articles-management"
    articlesSection.innerHTML = this.generateArticlesListHTML(articles)

    sidebar.appendChild(articlesSection)
  }

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

  fillForm(article) {
    const fields = {
      postTitle: article.title || "",
      postUrl: article.slug || "",
      metaTitle: article.metaTitle || "",
      metaDescription: article.metaDescription || "",
      tags: article.tags || "",
      category: article.category || "",
    }

    Object.entries(fields).forEach(([id, value]) => {
      const element = document.getElementById(id)
      if (element) element.value = value
    })

    const editor = document.getElementById("editor")
    if (editor) editor.innerHTML = article.content || ""

    // Отображение изображения
    if (article.image) {
      const imagePreview = document.getElementById("imagePreview")
      if (imagePreview) {
        imagePreview.style.backgroundImage = `url(${article.image})`
        imagePreview.classList.add("has-image")
      }
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

  // Очистка формы
  clearForm() {
    const fields = ["postTitle", "postUrl", "metaTitle", "metaDescription", "tags", "category"]

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

  getFormData() {
    const elements = {
      title: document.getElementById("postTitle"),
      content: document.getElementById("editor"),
      metaTitle: document.getElementById("metaTitle"),
      metaDescription: document.getElementById("metaDescription"),
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

  updatePublishPreview(formData) {
    const previewTitle = document.getElementById("publishPreviewTitle")
    const previewDesc = document.getElementById("publishPreviewDesc")

    if (previewTitle) previewTitle.textContent = formData.title || "Без заголовка"
    if (previewDesc) previewDesc.textContent = formData.metaDescription || "Описание не указано"
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
                </style>
            </head>
            <body>
                <h1>${this.escapeHtml(title)}</h1>
                <div>${content}</div>
            </body>
            </html>
        `
  }

  // Подтверждение публикации
  async confirmPublishArticle() {
    const formData = this.getFormData()

    if (!this.validateFormData(formData)) return

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

  async sendArticleData(formData) {
    if (this.isEditMode) {
      return fetch(`${this.apiUrl}?slug=${encodeURIComponent(this.currentEditingSlug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          slug: formData.postUrl,
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          tags: formData.tags,
          category: formData.category,
        }),
      })
    } else {
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
