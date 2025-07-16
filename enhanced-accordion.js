/**
 * Accordion Animation Module
 * Provides smooth animations for accordion elements across all devices
 * @version 1.0.0
 */
(function () {
    'use strict';

    // Конфигурация
    const CONFIG = {
        selectors: {
            accordionItem: '.accordion-item',
            accordionHeader: '.accordion-header',
            accordionContent: '.accordion-content',
            tariffCta: '.tariff-cta'
        },
        classes: {
            active: 'active',
            animating: 'animating'
        },
        animation: {
            duration: 300, // ms
            easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Material Design стандарт
            mobileBreakpoint: 768 // px
        },
        attributes: {
            heightCache: 'data-height'
        }
    };

    // Переменные состояния
    let accordionItems;
    let isMobile;

    /**
     * Инициализация модуля
     */
    function init() {
        // Получаем все элементы аккордеона
        accordionItems = document.querySelectorAll(CONFIG.selectors.accordionItem);

        // Определяем тип устройства
        checkDeviceType();

        // Предварительно рассчитываем высоты для оптимизации
        cacheElementHeights();

        // Устанавливаем обработчики событий
        bindEvents();

        // Инициализируем начальное состояние
        initializeState();
    }

    /**
     * Определяет тип устройства (мобильное/десктоп)
     */
    function checkDeviceType() {
        isMobile = window.innerWidth <= CONFIG.animation.mobileBreakpoint;

        // Добавляем класс к body для CSS-оптимизаций
        document.body.classList.toggle('is-mobile', isMobile);
    }

    /**
     * Предварительно рассчитывает и кэширует высоты элементов
     */
    function cacheElementHeights() {
        accordionItems.forEach(item => {
            const content = item.querySelector(CONFIG.selectors.accordionContent);
            const cta = item.querySelector(CONFIG.selectors.tariffCta);

            // Временно делаем элементы видимыми для расчета высоты
            const originalStyles = {
                content: {
                    maxHeight: content.style.maxHeight,
                    overflow: content.style.overflow,
                    visibility: content.style.visibility,
                    position: content.style.position,
                    display: content.style.display
                },
                cta: cta ? {
                    maxHeight: cta.style.maxHeight,
                    overflow: cta.style.overflow,
                    visibility: cta.style.visibility,
                    position: cta.style.position,
                    display: cta.style.display
                } : null
            };

            // Устанавливаем стили для расчета
            content.style.maxHeight = 'none';
            content.style.overflow = 'visible';
            content.style.visibility = 'hidden';
            content.style.position = 'absolute';
            content.style.display = 'block';

            if (cta) {
                cta.style.maxHeight = 'none';
                cta.style.overflow = 'visible';
                cta.style.visibility = 'hidden';
                cta.style.position = 'absolute';
                cta.style.display = 'block';
            }

            // Сохраняем высоты в data-атрибутах
            content.setAttribute(CONFIG.attributes.heightCache, content.scrollHeight);
            if (cta) {
                cta.setAttribute(CONFIG.attributes.heightCache, cta.scrollHeight);
            }

            // Восстанавливаем оригинальные стили
            Object.assign(content.style, originalStyles.content);
            if (cta) {
                Object.assign(cta.style, originalStyles.cta);
            }
        });
    }

    /**
     * Устанавливает обработчики событий
     */
    function bindEvents() {
        // Обработчик клика на заголовок аккордеона
        accordionItems.forEach(item => {
            const header = item.querySelector(CONFIG.selectors.accordionHeader);

            header.addEventListener('click', () => {
                toggleAccordion(item);
            });
        });

        // Обработчик изменения размера окна
        window.addEventListener('resize', debounce(() => {
            const wasMobile = isMobile;
            checkDeviceType();

            // Если тип устройства изменился, пересчитываем высоты
            if (wasMobile !== isMobile) {
                cacheElementHeights();
            }
        }, 250));
    }

    /**
     * Инициализирует начальное состояние аккордеона
     */
    function initializeState() {
        accordionItems.forEach(item => {
            const isActive = item.classList.contains(CONFIG.classes.active);
            const content = item.querySelector(CONFIG.selectors.accordionContent);
            const cta = item.querySelector(CONFIG.selectors.tariffCta);

            if (isActive) {
                // Если элемент активен, устанавливаем правильную высоту
                const contentHeight = parseInt(content.getAttribute(CONFIG.attributes.heightCache), 10);
                content.style.maxHeight = `${contentHeight}px`;

                if (cta) {
                    const ctaHeight = parseInt(cta.getAttribute(CONFIG.attributes.heightCache), 10);
                    cta.style.maxHeight = `${ctaHeight}px`;
                    cta.style.opacity = '1';
                    cta.style.transform = 'translateY(0)';
                }
            } else {
                // Если элемент неактивен, скрываем его
                content.style.maxHeight = '0';

                if (cta) {
                    cta.style.maxHeight = '0';
                    cta.style.opacity = '0';
                    cta.style.transform = 'translateY(20px)';
                }
            }
        });
    }

    /**
     * Переключает состояние аккордеона
     * @param {HTMLElement} item - Элемент аккордеона
     */
    function toggleAccordion(item) {
        // Проверяем, не выполняется ли уже анимация
        if (item.classList.contains(CONFIG.classes.animating)) {
            return;
        }

        const isActive = item.classList.contains(CONFIG.classes.active);
        const content = item.querySelector(CONFIG.selectors.accordionContent);
        const cta = item.querySelector(CONFIG.selectors.tariffCta);

        // Если элемент уже активен, закрываем его
        if (isActive) {
            closeAccordion(item, content, cta);
        } else {
            // Иначе закрываем все остальные и открываем текущий
            accordionItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains(CONFIG.classes.active)) {
                    const otherContent = otherItem.querySelector(CONFIG.selectors.accordionContent);
                    const otherCta = otherItem.querySelector(CONFIG.selectors.tariffCta);
                    closeAccordion(otherItem, otherContent, otherCta);
                }
            });

            openAccordion(item, content, cta);
        }
    }

    /**
     * Открывает аккордеон
     * @param {HTMLElement} item - Элемент аккордеона
     * @param {HTMLElement} content - Содержимое аккордеона
     * @param {HTMLElement} cta - CTA-блок аккордеона
     */
    function openAccordion(item, content, cta) {
        // Устанавливаем флаг анимации
        item.classList.add(CONFIG.classes.animating);

        // Получаем кэшированные высоты
        const contentHeight = parseInt(content.getAttribute(CONFIG.attributes.heightCache), 10);

        // Оптимизация для мобильных устройств
        if (isMobile) {
            // На мобильных используем более простую и производительную анимацию
            item.classList.add(CONFIG.classes.active);

            // Анимируем с помощью requestAnimationFrame для лучшей производительности
            animateWithRAF(content, 0, contentHeight, CONFIG.animation.duration, value => {
                content.style.maxHeight = `${value}px`;
            }, () => {
                // Callback после завершения анимации контента
                if (cta) {
                    const ctaHeight = parseInt(cta.getAttribute(CONFIG.attributes.heightCache), 10);

                    // Анимируем CTA после завершения анимации контента
                    cta.style.display = 'block';
                    animateWithRAF(cta, 0, ctaHeight, CONFIG.animation.duration / 1.5, value => {
                        cta.style.maxHeight = `${value}px`;
                        cta.style.opacity = (value / ctaHeight).toString();
                    }, () => {
                        item.classList.remove(CONFIG.classes.animating);
                    });
                } else {
                    item.classList.remove(CONFIG.classes.animating);
                }
            });
        } else {
            // На десктопах используем CSS-анимации для плавности
            item.classList.add(CONFIG.classes.active);

            // Устанавливаем CSS-переходы
            content.style.transition = `max-height ${CONFIG.animation.duration}ms ${CONFIG.animation.easing}`;
            content.style.maxHeight = `${contentHeight}px`;

            if (cta) {
                // Задержка для CTA, чтобы она появлялась после раскрытия контента
                setTimeout(() => {
                    const ctaHeight = parseInt(cta.getAttribute(CONFIG.attributes.heightCache), 10);
                    cta.style.transition = `
              max-height ${CONFIG.animation.duration}ms ${CONFIG.animation.easing},
              opacity ${CONFIG.animation.duration}ms ${CONFIG.animation.easing},
              transform ${CONFIG.animation.duration}ms ${CONFIG.animation.easing}
            `;
                    cta.style.maxHeight = `${ctaHeight}px`;
                    cta.style.opacity = '1';
                    cta.style.transform = 'translateY(0)';
                }, CONFIG.animation.duration / 2);
            }

            // Снимаем флаг анимации после завершения
            setTimeout(() => {
                item.classList.remove(CONFIG.classes.animating);
            }, CONFIG.animation.duration + (cta ? CONFIG.animation.duration : 0));
        }
    }

    /**
     * Закрывает аккордеон
     * @param {HTMLElement} item - Элемент аккордеона
     * @param {HTMLElement} content - Содержимое аккордеона
     * @param {HTMLElement} cta - CTA-блок аккордеона
     */
    function closeAccordion(item, content, cta) {
        // Устанавливаем флаг анимации
        item.classList.add(CONFIG.classes.animating);

        // Оптимизация для мобильных устройств
        if (isMobile) {
            // Сначала скрываем CTA, если он есть
            if (cta) {
                const ctaHeight = parseInt(cta.getAttribute(CONFIG.attributes.heightCache), 10);

                animateWithRAF(cta, ctaHeight, 0, CONFIG.animation.duration / 1.5, value => {
                    cta.style.maxHeight = `${value}px`;
                    cta.style.opacity = (value / ctaHeight).toString();
                }, () => {
                    cta.style.display = 'none';

                    // Затем скрываем контент
                    const contentHeight = parseInt(content.getAttribute(CONFIG.attributes.heightCache), 10);
                    animateWithRAF(content, contentHeight, 0, CONFIG.animation.duration, value => {
                        content.style.maxHeight = `${value}px`;
                    }, () => {
                        item.classList.remove(CONFIG.classes.active);
                        item.classList.remove(CONFIG.classes.animating);
                    });
                });
            } else {
                // Если CTA нет, просто скрываем контент
                const contentHeight = parseInt(content.getAttribute(CONFIG.attributes.heightCache), 10);
                animateWithRAF(content, contentHeight, 0, CONFIG.animation.duration, value => {
                    content.style.maxHeight = `${value}px`;
                }, () => {
                    item.classList.remove(CONFIG.classes.active);
                    item.classList.remove(CONFIG.classes.animating);
                });
            }
        } else {
            // На десктопах используем CSS-анимации

            // Сначала скрываем CTA, если он есть
            if (cta) {
                cta.style.transition = `
            max-height ${CONFIG.animation.duration / 1.5}ms ${CONFIG.animation.easing},
            opacity ${CONFIG.animation.duration / 1.5}ms ${CONFIG.animation.easing},
            transform ${CONFIG.animation.duration / 1.5}ms ${CONFIG.animation.easing}
          `;
                cta.style.maxHeight = '0';
                cta.style.opacity = '0';
                cta.style.transform = 'translateY(20px)';

                // Затем скрываем контент с небольшой задержкой
                setTimeout(() => {
                    content.style.transition = `max-height ${CONFIG.animation.duration}ms ${CONFIG.animation.easing}`;
                    content.style.maxHeight = '0';
                }, CONFIG.animation.duration / 3);
            } else {
                // Если CTA нет, просто скрываем контент
                content.style.transition = `max-height ${CONFIG.animation.duration}ms ${CONFIG.animation.easing}`;
                content.style.maxHeight = '0';
            }

            // Снимаем классы после завершения анимации
            setTimeout(() => {
                item.classList.remove(CONFIG.classes.active);
                item.classList.remove(CONFIG.classes.animating);
            }, CONFIG.animation.duration + (cta ? CONFIG.animation.duration / 2 : 0));
        }
    }

    /**
     * Анимирует значение с использованием requestAnimationFrame
     * @param {HTMLElement} element - Анимируемый элемент
     * @param {number} start - Начальное значение
     * @param {number} end - Конечное значение
     * @param {number} duration - Длительность анимации в мс
     * @param {Function} updateCallback - Функция обновления значения
     * @param {Function} completeCallback - Функция завершения анимации
     */
    function animateWithRAF(element, start, end, duration, updateCallback, completeCallback) {
        const startTime = performance.now();
        const change = end - start;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Функция плавности (ease-out cubic)
            const easedProgress = 1 - Math.pow(1 - progress, 3);

            // Вычисляем текущее значение
            const value = start + change * easedProgress;

            // Обновляем значение через callback
            updateCallback(value);

            // Продолжаем анимацию, если не достигли конца
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                // Вызываем callback завершения
                if (completeCallback) {
                    completeCallback();
                }
            }
        }

        requestAnimationFrame(update);
    }

    /**
     * Функция debounce для оптимизации обработчиков событий
     * @param {Function} func - Функция для debounce
     * @param {number} wait - Время ожидания в мс
     * @return {Function} - Функция с debounce
     */
    function debounce(func, wait) {
        let timeout;

        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };

            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Инициализация при загрузке DOM
    document.addEventListener('DOMContentLoaded', init);
})();