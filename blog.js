document.addEventListener('DOMContentLoaded', function () {
    // Функционал поиска по блогу
    const searchInput = document.getElementById('blogSearch');
    const blogGrid = document.getElementById('blogGrid');
    const blogCards = document.querySelectorAll('.blog-card');
    const articlesPerPage = 6; // Максимальное количество статей на странице

    // Инициализация пагинации при загрузке страницы
    initializePagination();

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase().trim();

            // Если поле поиска пустое, показываем все карточки и восстанавливаем пагинацию
            if (searchTerm === '') {
                // Сбрасываем отображение статей на первую страницу
                showArticlesForPage(1);
                // Обновляем пагинацию
                updatePaginationVisibility(true);
                return;
            }

            // Скрываем пагинацию при поиске
            updatePaginationVisibility(false);

            // Фильтруем карточки по заголовкам
            let visibleCount = 0;
            blogCards.forEach(card => {
                const title = card.querySelector('.blog-card-title').textContent.toLowerCase();

                if (title.includes(searchTerm)) {
                    card.style.display = 'flex';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Если нет видимых карточек, показываем сообщение
            if (visibleCount === 0 && !document.querySelector('.no-results-message')) {
                const noResultsMessage = document.createElement('div');
                noResultsMessage.className = 'no-results-message';
                noResultsMessage.style.textAlign = 'center';
                noResultsMessage.style.padding = '2rem';
                noResultsMessage.style.width = '100%';
                noResultsMessage.style.color = 'var(--color-text-muted)';
                noResultsMessage.innerHTML = `
                    <p>По запросу "${searchTerm}" ничего не найдено.</p>
                    <p>Попробуйте изменить поисковый запрос.</p>
                `;
                blogGrid.appendChild(noResultsMessage);
            } else if (visibleCount > 0) {
                // Удаляем сообщение, если есть видимые карточки
                const noResultsMessage = document.querySelector('.no-results-message');
                if (noResultsMessage) {
                    noResultsMessage.remove();
                }
            }
        });

        // Обработка отправки формы поиска
        const searchForm = searchInput.closest('form');
        if (searchForm) {
            searchForm.addEventListener('submit', function (e) {
                e.preventDefault();
                searchInput.dispatchEvent(new Event('input'));
            });
        }

        // Обработка клика на кнопку поиска
        const searchButton = document.querySelector('.blog-search-button');
        if (searchButton) {
            searchButton.addEventListener('click', function () {
                searchInput.dispatchEvent(new Event('input'));
            });
        }
    }

    // Функция инициализации пагинации
    function initializePagination() {
        // Показываем только первые 6 статей при загрузке страницы
        showArticlesForPage(1);

        // Генерируем пагинацию
        generatePagination(1);
    }

    // Функция для отображения статей для выбранной страницы
    function showArticlesForPage(page) {
        const startIndex = (page - 1) * articlesPerPage;
        const endIndex = startIndex + articlesPerPage;

        // Скрываем все статьи
        blogCards.forEach((card, index) => {
            if (index >= startIndex && index < endIndex) {
                card.style.display = 'flex'; // Показываем статьи для текущей страницы
            } else {
                card.style.display = 'none'; // Скрываем остальные статьи
            }
        });
    }

    // Функция для обновления видимости пагинации
    function updatePaginationVisibility(show) {
        const paginationContainer = document.getElementById('blogPagination');
        if (paginationContainer) {
            paginationContainer.style.display = show ? 'flex' : 'none';
        }
    }

    // Генерация оптимизированной пагинации для большого количества статей
    function generatePagination(currentPage = 1) {
        const paginationContainer = document.getElementById('blogPagination');
        if (!paginationContainer) return;

        // Получаем все статьи
        const totalArticles = blogCards.length;

        // Вычисляем общее количество страниц
        const totalPages = Math.ceil(totalArticles / articlesPerPage);

        // Если страница всего одна, не показываем пагинацию
        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }

        // Создаем HTML для пагинации
        let paginationHTML = '';

        // Добавляем кнопку "В начало" и "Предыдущая"
        if (currentPage > 1) {
            paginationHTML += `
                <a href="#" class="pagination-first" data-page="1" title="В начало">
                    <svg class="icon-left" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </a>
                <a href="#" class="pagination-prev" data-page="${currentPage - 1}" title="Предыдущая">
                    <svg class="icon-left" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </a>
            `;
        }

        // Определяем, сколько страниц показывать до и после текущей
        const maxVisiblePages = 5; // Максимальное количество видимых кнопок страниц
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Корректируем startPage, если endPage достиг максимума
        if (endPage === totalPages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Добавляем первую страницу и многоточие, если нужно
        if (startPage > 1) {
            paginationHTML += `<a href="#" class="pagination-item" data-page="1">1</a>`;
            if (startPage > 2) {
                paginationHTML += `<span class="pagination-dots">...</span>`;
            }
        }

        // Добавляем кнопки страниц
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === currentPage ? 'active' : '';
            paginationHTML += `<a href="#" class="pagination-item ${isActive}" data-page="${i}">${i}</a>`;
        }

        // Добавляем многоточие и последнюю страницу, если нужно
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="pagination-dots">...</span>`;
            }
            paginationHTML += `<a href="#" class="pagination-item" data-page="${totalPages}">${totalPages}</a>`;
        }

        // Добавляем кнопки "Следующая" и "В конец"
        if (currentPage < totalPages) {
            paginationHTML += `
                <a href="#" class="pagination-next" data-page="${currentPage + 1}" title="Следующая">
                    <svg class="icon-right" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </a>
                <a href="#" class="pagination-last" data-page="${totalPages}" title="В конец">
                    <svg class="icon-right" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                        <path d="M5 12h14m0 0l-7 7m7-7l-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </a>
            `;
        }

        // Вставляем HTML в контейнер
        paginationContainer.innerHTML = paginationHTML;

        // Добавляем обработчики событий для кнопок пагинации
        const paginationItems = document.querySelectorAll('.pagination-item, .pagination-next, .pagination-prev, .pagination-first, .pagination-last');
        paginationItems.forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                const page = parseInt(this.getAttribute('data-page'));

                // Показываем статьи для выбранной страницы
                showArticlesForPage(page);

                // Обновляем пагинацию
                generatePagination(page);

                // Прокручиваем страницу вверх
                window.scrollTo({
                    top: blogGrid.offsetTop - 100,
                    behavior: 'smooth'
                });
            });
        });
    }

    // Установка текущего года в футере
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
});