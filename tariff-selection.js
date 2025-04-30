document.addEventListener('DOMContentLoaded', function () {
    // Элементы DOM
    const contactModal = document.getElementById('contact-modal');
    const tariffNotification = document.getElementById('tariffNotification');
    const selectedTariffNameElement = document.getElementById('selectedTariffName');

    // Элементы форм
    const modalTariffName = document.querySelector('#modalContactForm .tariff-selection-name');
    const mainTariffName = document.querySelector('#contactForm .tariff-selection-name');

    // Кнопки заказа тарифов в основной секции
    const orderButtons = document.querySelectorAll('.service-button');

    // Кнопки заказа тарифов в аккордеоне
    const accordionOrderButtons = document.querySelectorAll('.tariff-cta .order-button-large');

    // Кнопки изменения тарифа
    const changeTariffLinks = document.querySelectorAll('.tariff-selection-link');

    // Кнопки, открывающие модальное окно без выбора тарифа
    const defaultModalButtons = document.querySelectorAll('[data-modal="contact-modal"]:not(.service-button):not(.order-button-large)');

    // Значение по умолчанию
    const defaultTariffText = 'Бесплатная консультация';

    // Функция для показа уведомления о выборе тарифа
    function showTariffNotification(tariffName) {
        if (selectedTariffNameElement) {
            selectedTariffNameElement.textContent = tariffName;
        }

        if (tariffNotification) {
            tariffNotification.classList.add('active');

            // Скрыть уведомление через 4 секунды
            setTimeout(() => {
                tariffNotification.classList.remove('active');
            }, 4000);
        }
    }

    // Функция для установки выбранного тарифа в формах
    function setSelectedTariff(tariffName) {
        if (modalTariffName) {
            modalTariffName.textContent = tariffName;
        }

        if (mainTariffName) {
            mainTariffName.textContent = tariffName;
        }
    }

    // Функция для сброса форм к значению по умолчанию
    function resetToDefaultTariff() {
        setSelectedTariff(defaultTariffText);
    }

    // Обработчик для кнопок заказа тарифов в основной секции
    orderButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            // Находим название тарифа из родительской карточки
            const serviceCard = this.closest('.service-card');
            const tariffName = serviceCard.querySelector('.service-title').textContent.trim();

            // Устанавливаем выбранный тариф в формах
            setSelectedTariff(tariffName);

            // Показываем уведомление
            showTariffNotification(tariffName);

            // Открываем модальное окно
            if (contactModal) {
                contactModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Обработчик для кнопок заказа тарифов в аккордеоне
    accordionOrderButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            // Находим название тарифа из родительского аккордеона
            const accordionItem = this.closest('.accordion-item');
            const tariffName = accordionItem.querySelector('.tariff-name').textContent.trim();

            // Устанавливаем выбранный тариф в формах
            setSelectedTariff(tariffName);

            // Показываем уведомление
            showTariffNotification(tariffName);

            // Открываем модальное окно
            if (contactModal) {
                contactModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Обработчик для кнопок изменения тарифа
    changeTariffLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // Сбрасываем формы к значению по умолчанию
            resetToDefaultTariff();

            // Закрываем модальное окно
            if (contactModal) {
                contactModal.classList.remove('active');
                document.body.style.overflow = '';
            }

            // Прокрутка к секции тарифов происходит автоматически благодаря href="#tariffs"
        });
    });

    // Обработчик для кнопок, открывающих модальное окно без выбора тарифа
    defaultModalButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Сбрасываем формы к значению по умолчанию
            resetToDefaultTariff();
        });
    });

    // Инициализация форм со значением по умолчанию
    resetToDefaultTariff();
});