document.addEventListener('DOMContentLoaded', function () {
    // Set current year in footer
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function () {
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close mobile menu when clicking on a link
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link:not(.mobile-dropdown-toggle):not(.mobile-dropdown-toggle-submenu)');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function () {
                mobileMenuBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }

    // Dynamically show/hide mobileMenuBtn based on screen size
    const updateMobileMenuBtnVisibility = () => {
        if (mobileMenuBtn) {
            if (window.innerWidth <= 1024) {
                mobileMenuBtn.style.display = 'flex';
            } else {
                mobileMenuBtn.style.display = 'none';
            }
        }
    };

    // Initial check and add resize listener
    updateMobileMenuBtnVisibility();
    window.addEventListener('resize', updateMobileMenuBtnVisibility);

    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function () {
        if (header) {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > 50) {
                header.style.backgroundColor = 'rgba(10, 10, 18, 0.95)';
            } else {
                header.style.backgroundColor = 'rgba(10, 10, 18, 0.8)';
            }

            lastScrollTop = scrollTop;
        }
    });

    // Инициализация слайдера услуг
    initServicesSlider();

    // Form validation
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const nameInput = document.getElementById('name');
            const phoneInput = document.getElementById('phone');
            const messageInput = document.getElementById('message');
            const consentInput = document.getElementById('consent');

            let isValid = true;

            // Simple validation
            if (!nameInput.value.trim()) {
                nameInput.style.borderColor = 'var(--color-accent)';
                isValid = false;
            } else {
                nameInput.style.borderColor = '';
            }

            if (!phoneInput.value.trim()) {
                phoneInput.style.borderColor = 'var(--color-accent)';
                isValid = false;
            } else {
                phoneInput.style.borderColor = '';
            }

            if (!consentInput.checked) {
                consentInput.style.outline = '2px solid var(--color-accent)';
                isValid = false;
            } else {
                consentInput.style.outline = '';
            }

            if (isValid) {
                // In a real application, you would send the form data to the server here
                alert('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
                contactForm.reset();
            }
        });
    }

    // Phone input mask
    const phoneInput = document.getElementById('phone');

    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');

            if (value.length > 0) {
                if (value[0] === '7') {
                    value = value;
                } else if (value[0] === '8') {
                    value = '7' + value.substring(1);
                } else {
                    value = '7' + value;
                }

                let formattedValue = '+';

                if (value.length > 0) {
                    formattedValue += value.substring(0, 1);
                }

                if (value.length > 1) {
                    formattedValue += ' (' + value.substring(1, 4);
                }

                if (value.length > 4) {
                    formattedValue += ') ' + value.substring(4, 7);
                }

                if (value.length > 7) {
                    formattedValue += '-' + value.substring(7, 9);
                }

                if (value.length > 9) {
                    formattedValue += '-' + value.substring(9, 11);
                }

                e.target.value = formattedValue;
            }
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');

            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Animate elements on scroll
    const animateElements = document.querySelectorAll('.service-card, .benefit-card, .stat-card');

    function checkIfInView() {
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            const isVisible = (elementTop < window.innerHeight) && (elementBottom > 0);

            if (isVisible) {
                element.classList.add('fade-in');
            }
        });
    }

    // Check on load
    checkIfInView();

    // Check on scroll
    window.addEventListener('scroll', checkIfInView);

    // Mega Dropdown Menu functionality
    const servicesDropdownTrigger = document.querySelector('.services-dropdown-trigger');
    const megaDropdownParent = document.querySelector('.nav-item.has-mega-dropdown');
    const megaCategoryItems = document.querySelectorAll('.mega-category-item');
    const megaContentSections = document.querySelectorAll('.mega-content-section');
    const megaDropdownContent = document.querySelector('.mega-dropdown-content');
    const megaDropdownCategories = document.querySelector('.mega-dropdown-categories');


    if (servicesDropdownTrigger && megaDropdownParent) {
        // Toggle mega dropdown on click
        servicesDropdownTrigger.addEventListener('click', function (e) {
            e.preventDefault();
            megaDropdownParent.classList.toggle('active');

        });

        // Close mega dropdown when clicking outside
        document.addEventListener('click', function (e) {
            if (!megaDropdownParent.contains(e.target)) {
                megaDropdownParent.classList.remove('active');
            }
        });
    }

    // Handle mega category item interactions
    megaCategoryItems.forEach(item => {
        item.addEventListener('mouseenter', function () {
            // Fixed: Remove active class from all category items first
            megaCategoryItems.forEach(cat => cat.classList.remove('active'));

            const hasSubmenu = item.classList.contains('has-submenu');

            if (hasSubmenu) {
                // Add active class to current item
                item.classList.add('active');

                // Get category data attribute
                const category = item.dataset.category;

                // Hide all content sections
                megaContentSections.forEach(section => section.classList.remove('active'));

                // Show content section for current category
                if (category) {
                    const contentSection = document.querySelector(`.mega-content-section[data-category="${category}"]`);
                    if (contentSection) {
                        contentSection.classList.add('active');
                        megaDropdownContent.classList.add('active');
                        megaDropdownCategories.classList.add('active');

                    }
                }

            } else {
                // Hide content when hovering over item without submenu
                megaContentSections.forEach(section => section.classList.remove('active'));
                megaDropdownContent.classList.remove('active');
                megaDropdownCategories.classList.remove('active');
            }
        });
    });

    // Mobile dropdown toggles
    const mobileDropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');
    mobileDropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            const parent = this.closest('.mobile-dropdown');

            // Close other open dropdowns at the same level
            const siblings = document.querySelectorAll('.mobile-dropdown.active');
            siblings.forEach(sibling => {
                if (sibling !== parent) {
                    sibling.classList.remove('active');
                }
            });

            parent.classList.toggle('active');
        });
    });

    // Mobile submenu dropdown toggles
    const mobileSubmenuToggles = document.querySelectorAll('.mobile-dropdown-toggle-submenu');
    mobileSubmenuToggles.forEach(toggle => {
        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            const parent = this.closest('.mobile-dropdown-submenu');

            // Close other open submenus at the same level
            const siblings = document.querySelectorAll('.mobile-dropdown-submenu.active');
            siblings.forEach(sibling => {
                if (sibling !== parent) {
                    sibling.classList.remove('active');
                }
            });

            parent.classList.toggle('active');
        });
    });

    // Анимация счетчиков
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // Скорость анимации (меньше = быстрее)

    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const increment = target / speed;

        const updateCount = () => {
            const count = +counter.innerText;

            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(updateCount, 30);
            } else {
                counter.innerText = target;
            }
        };

        // Запускаем анимацию с небольшой задержкой
        setTimeout(updateCount, 500);
    });

    // Функция для обновления текста статуса работы
    function updateWorkStatus() {
        const statusText = document.querySelector('.status-text');

        if (!statusText) return;

        const now = new Date();
        const hours = now.getHours();

        // Проверяем, рабочее ли сейчас время (9:00 - 21:00)
        if (hours >= 9 && hours < 21) {
            statusText.textContent = 'Сейчас работаем';
        } else {
            statusText.textContent = 'Сейчас не работаем';
        }
    }

    // Обновляем статус при загрузке страницы
    updateWorkStatus();

    // Обновляем статус каждую минуту
    setInterval(updateWorkStatus, 60000);
});

// Функция инициализации слайдера услуг
function initServicesSlider() {
    const sliderTrack = document.querySelector('.services-slider-track');
    const sliderContainer = document.querySelector('.services-slider-container');
    const prevButton = document.querySelector('.slider-prev');
    const nextButton = document.querySelector('.slider-next');
    const paginationContainer = document.querySelector('.slider-pagination');

    if (!sliderTrack || !sliderContainer || !prevButton || !nextButton || !paginationContainer) return;

    // Получаем все карточки услуг
    const cards = Array.from(sliderTrack.querySelectorAll('.service-card'));
    if (cards.length === 0) return;

    // Применяем GPU-ускорение к карточкам
    cards.forEach(card => {
        // Включаем аппаратное ускорение для всех карточек
        card.style.transform = 'translateZ(0)';
        card.style.backfaceVisibility = 'hidden';

        // Предварительно растеризуем SVG иконки для улучшения производительности
        const icons = card.querySelectorAll('svg');
        icons.forEach(icon => {
            icon.style.transform = 'translateZ(0)';
        });
    });

    // Определяем количество видимых карточек в зависимости от ширины экрана
    function getVisibleCards() {
        if (window.innerWidth <= 768) {
            return 1; // Мобильные устройства
        } else if (window.innerWidth <= 1024) {
            return 2; // Планшеты
        } else {
            return 3; // Десктоп
        }
    }

    let visibleCards = getVisibleCards();
    let currentIndex = 0;
    let totalSlides = Math.ceil(cards.length / visibleCards);
    let isAnimating = false;
    let isTouchActive = false;

    // Создаем пагинацию
    function createPagination() {
        paginationContainer.innerHTML = '';
        totalSlides = Math.ceil(cards.length / visibleCards);

        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('div');
            dot.classList.add('pagination-dot');
            if (i === currentIndex) dot.classList.add('active');

            dot.addEventListener('click', () => {
                if (!isAnimating) goToSlide(i);
            });

            paginationContainer.appendChild(dot);
        }
    }

    // Обновляем активную точку пагинации
    function updatePagination() {
        const dots = paginationContainer.querySelectorAll('.pagination-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    // Выравниваем высоту карточек
    function equalizeCardHeights() {
        // Сбрасываем высоту всех карточек
        cards.forEach(card => {
            card.style.height = 'auto';
        });

        // Группируем карточки по слайдам
        const slides = [];
        for (let i = 0; i < cards.length; i += visibleCards) {
            slides.push(cards.slice(i, i + visibleCards));
        }

        // Для каждого слайда находим максимальную высоту и применяем её ко всем карточкам в слайде
        slides.forEach(slideCards => {
            let maxHeight = 0;
            slideCards.forEach(card => {
                const height = card.offsetHeight;
                if (height > maxHeight) {
                    maxHeight = height;
                }
            });

            slideCards.forEach(card => {
                card.style.height = `${maxHeight}px`;
            });
        });
    }

    // Перемещаем слайдер к определенному индексу с оптимизированной анимацией
    function goToSlide(index, useTransition = true) {
        if (isAnimating && useTransition) return;

        // Обеспечиваем бесконечную прокрутку
        if (index < 0) {
            index = totalSlides - 1;
        } else if (index >= totalSlides) {
            index = 0;
        }

        currentIndex = index;

        if (useTransition) {
            isAnimating = true;
            sliderTrack.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)';
        } else {
            sliderTrack.style.transition = 'none';
        }

        // Используем transform для лучшей производительности
        const offset = currentIndex * 100;

        // Используем translateX с translateZ(0) для включения GPU-ускорения
        sliderTrack.style.transform = `translate3d(-${offset}%, 0, 0)`;

        if (useTransition) {
            // Сбрасываем флаг анимации после завершения перехода
            const transitionEndHandler = () => {
                isAnimating = false;
                sliderTrack.removeEventListener('transitionend', transitionEndHandler);
            };

            sliderTrack.addEventListener('transitionend', transitionEndHandler);

            // Страховка на случай, если событие transitionend не сработает
            setTimeout(() => {
                isAnimating = false;
            }, 350);
        }

        updatePagination();
    }

    // Обработчики для кнопок
    prevButton.addEventListener('click', () => {
        if (!isAnimating) goToSlide(currentIndex - 1);
    });

    nextButton.addEventListener('click', () => {
        if (!isAnimating) goToSlide(currentIndex + 1);
    });

    // Устанавливаем начальную ширину карточек и применяем GPU-ускорение
    cards.forEach(card => {
        card.style.flex = `0 0 calc(${100 / visibleCards}% - 2rem)`;
    });

    // Оптимизируем стили для лучшей производительности
    sliderTrack.style.willChange = 'transform';
    sliderTrack.style.transform = 'translate3d(0, 0, 0)';
    sliderTrack.style.backfaceVisibility = 'hidden';
    sliderTrack.style.perspective = '1000px';

    // Инициализация
    createPagination();
    equalizeCardHeights();

    // Обработчик изменения размера окна с дебаунсингом
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newVisibleCards = getVisibleCards();

            if (newVisibleCards !== visibleCards) {
                visibleCards = newVisibleCards;

                // Пересчитываем ширину карточек
                cards.forEach(card => {
                    card.style.flex = `0 0 calc(${100 / visibleCards}% - 2rem)`;
                });

                // Обновляем пагинацию и позицию слайдера
                createPagination();
                currentIndex = 0;
                goToSlide(0, false);

                // Перерасчет высоты карточек
                setTimeout(equalizeCardHeights, 300);
            }
        }, 150);
    });

    // Оптимизированная поддержка свайпов для мобильных устройств
    let touchStartX = 0;
    let touchStartY = 0;
    let initialOffset = 0;
    let startTime = 0;
    let lastTouchX = 0;
    let isScrolling = false;

    // Функция для обработки начала касания
    function handleTouchStart(e) {
        if (isAnimating) return;

        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        lastTouchX = touchStartX;
        initialOffset = currentIndex * 100;
        startTime = Date.now();
        isScrolling = false;
        isTouchActive = true;

        // Отключаем переход на время свайпа
        sliderTrack.style.transition = 'none';
    }

    // Функция для обработки движения пальца
    function handleTouchMove(e) {
        if (!isTouchActive) return;

        const touch = e.touches[0];
        const currentX = touch.clientX;
        const currentY = touch.clientY;

        // Определяем направление движения
        const deltaX = touchStartX - currentX;
        const deltaY = touchStartY - currentY;

        // Если это вертикальная прокрутка, не обрабатываем свайп
        if (!isScrolling) {
            isScrolling = Math.abs(deltaY) > Math.abs(deltaX);
        }

        if (isScrolling) return;

        // Предотвращаем прокрутку страницы при горизонтальном свайпе
        e.preventDefault();

        lastTouchX = currentX;

        const containerWidth = sliderContainer.offsetWidth;
        const swipePercent = (deltaX / containerWidth) * 100;

        // Ограничиваем смещение с эффектом резинки
        const maxOffset = (totalSlides - 1) * 100;
        let newOffset = initialOffset + swipePercent;

        // Добавляем сопротивление при попытке свайпнуть за пределы
        if (newOffset < 0) {
            newOffset = newOffset / 3;
        } else if (newOffset > maxOffset) {
            newOffset = maxOffset + (newOffset - maxOffset) / 3;
        }

        // Применяем трансформацию с GPU-ускорением
        sliderTrack.style.transform = `translate3d(-${newOffset}%, 0, 0)`;
    }

    // Функция для обработки окончания касания
    function handleTouchEnd(e) {
        if (!isTouchActive) return;

        isTouchActive = false;

        if (isScrolling) return;

        // Возвращаем плавную анимацию
        sliderTrack.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)';

        const touch = e.changedTouches[0];
        const deltaX = touchStartX - touch.clientX;
        const elapsedTime = Date.now() - startTime;

        // Вычисляем скорость свайпа
        const velocity = Math.abs(deltaX) / elapsedTime;
        const isQuickSwipe = velocity > 0.3;

        // Порог для определения достаточного смещения
        const swipeThreshold = sliderContainer.offsetWidth * 0.15;

        if (Math.abs(deltaX) > swipeThreshold || isQuickSwipe) {
            if (deltaX > 0) {
                goToSlide(currentIndex + 1);
            } else {
                goToSlide(currentIndex - 1);
            }
        } else {
            goToSlide(currentIndex);
        }
    }

    // Функция для отмены свайпа
    function handleTouchCancel() {
        if (!isTouchActive) return;

        isTouchActive = false;
        sliderTrack.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)';
        goToSlide(currentIndex);
    }

    // Добавляем обработчики событий с оптимизацией для мобильных устройств
    sliderContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    sliderContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    sliderContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
    sliderContainer.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    // Инициализация слайдера
    goToSlide(0, false);
}
