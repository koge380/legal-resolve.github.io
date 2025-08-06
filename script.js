/**
 * Refactor script.js(main) JavaScript Module
 * @version 1.0.0
 * @description Main functionality for index html and slider including navigation, forms, sliders, and animations
 */

(function (window, document) {
    'use strict';

    // Configuration constants
    const CONFIG = {
        BREAKPOINTS: {
            MOBILE: 768,
            TABLET: 1024
        },
        ANIMATION: {
            SCROLL_THRESHOLD: 50,
            COUNTER_SPEED: 200,
            SLIDER_TRANSITION: 500
        },
        WORKING_HOURS: {
            START: 9,
            END: 21
        },
        SWIPE: {
            MIN_DISTANCE: 15,
            DIRECTION_THRESHOLD: 1.5,
            ACTIVATION_DISTANCE: 25,
            SWIPE_THRESHOLD: 0.2
        },
        MESSAGES: {
            FORM_SUCCESS: 'Thank you! Your request has been sent. We will contact you shortly.',
            VALIDATION_ERROR: 'Please fill in all required fields correctly.'
        }
    };

    // Utility functions
    const Utils = {
        /**
         * Debounce function to limit function calls
         * @param {Function} func - Function to debounce
         * @param {number} wait - Wait time in milliseconds
         * @returns {Function} Debounced function
         */
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        /**
         * Get scrollbar width
         * @returns {number} Scrollbar width in pixels
         */
        getScrollbarWidth() {
            return window.innerWidth - document.documentElement.clientWidth;
        },

        /**
         * Check if element is in viewport
         * @param {HTMLElement} element - Element to check
         * @returns {boolean} True if element is visible
         */
        isInViewport(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top < window.innerHeight &&
                rect.bottom > 0
            );
        },

        /**
         * Log messages with timestamp
         * @param {string} level - Log level (info, warn, error)
         * @param {string} message - Message to log
         * @param {*} data - Additional data to log
         */
        log(level, message, data = null) {
            if (typeof console !== 'undefined') {
                const timestamp = new Date().toISOString();
                const logMessage = `[${timestamp}] ${message}`;

                switch (level) {
                    case 'error':
                        console.error(logMessage, data);
                        break;
                    case 'warn':
                        console.warn(logMessage, data);
                        break;
                    default:
                        console.log(logMessage, data);
                }
            }
        }
    };

    // Form validation module
    const FormValidator = {
        /**
         * Validate form fields
         * @param {Object} fields - Object containing form fields
         * @returns {boolean} True if all fields are valid
         */
        validateFields(fields) {
            let isValid = true;

            Object.entries(fields).forEach(([key, field]) => {
                if (!field.element) {
                    Utils.log('warn', `Form field element not found: ${key}`);
                    return;
                }

                const value = field.element.value.trim();
                let fieldValid = true;

                // Required field validation
                if (field.required && !value) {
                    fieldValid = false;
                }

                // Phone validation
                if (field.type === 'phone' && value && !this.isValidPhone(value)) {
                    fieldValid = false;
                }

                // Email validation
                if (field.type === 'email' && value && !this.isValidEmail(value)) {
                    fieldValid = false;
                }

                // Checkbox validation
                if (field.type === 'checkbox' && field.required && !field.element.checked) {
                    fieldValid = false;
                }

                // Apply visual feedback
                this.setFieldValidation(field.element, fieldValid, field.type);

                if (!fieldValid) {
                    isValid = false;
                }
            });

            return isValid;
        },

        /**
         * Set visual validation feedback for field
         * @param {HTMLElement} element - Form field element
         * @param {boolean} isValid - Whether field is valid
         * @param {string} type - Field type
         */
        setFieldValidation(element, isValid, type) {
            try {
                if (type === 'checkbox') {
                    element.style.outline = isValid ? '' : '2px solid var(--color-accent, #ff0000)';
                } else {
                    element.style.borderColor = isValid ? '' : 'var(--color-accent, #ff0000)';
                }
            } catch (error) {
                Utils.log('error', 'Error setting field validation', error);
            }
        },

        /**
         * Validate phone number format
         * @param {string} phone - Phone number to validate
         * @returns {boolean} True if valid
         */
        isValidPhone(phone) {
            const phoneRegex = /^\+7\s$$\d{3}$$\s\d{3}-\d{2}-\d{2}$/;
            return phoneRegex.test(phone);
        },

        /**
         * Validate email format
         * @param {string} email - Email to validate
         * @returns {boolean} True if valid
         */
        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }
    };

    // Phone input formatter
    const PhoneFormatter = {
        /**
         * Format phone input with Russian phone mask
         * @param {HTMLInputElement} input - Phone input element
         */
        format(input) {
            if (!input) return;

            let value = input.value.replace(/\D/g, '');

            if (value.length > 0) {
                // Handle different starting digits
                if (value[0] === '7') {
                    value = value;
                } else if (value[0] === '8') {
                    value = '7' + value.substring(1);
                } else {
                    value = '7' + value;
                }

                // Format the number
                let formatted = '+';
                if (value.length > 0) formatted += value.substring(0, 1);
                if (value.length > 1) formatted += ' (' + value.substring(1, 4);
                if (value.length > 4) formatted += ') ' + value.substring(4, 7);
                if (value.length > 7) formatted += '-' + value.substring(7, 9);
                if (value.length > 9) formatted += '-' + value.substring(9, 11);

                input.value = formatted;
            }
        }
    };

    // Navigation module
    const Navigation = {
        init() {
            this.initMobileMenu();
            this.initMegaDropdown();
            this.initSmoothScroll();
            this.initHeaderScroll();
        },

        /**
         * Initialize mobile menu functionality
         */
        initMobileMenu() {
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            const mobileMenu = document.getElementById('mobileMenu');

            if (!mobileMenuBtn || !mobileMenu) {
                Utils.log('warn', 'Mobile menu elements not found');
                return;
            }

            // Toggle mobile menu
            mobileMenuBtn.addEventListener('click', () => {
                this.toggleMobileMenu(mobileMenuBtn, mobileMenu);
            });

            // Close menu on link click
            const mobileNavLinks = document.querySelectorAll('.mobile-nav-link:not(.mobile-dropdown-toggle):not(.mobile-dropdown-toggle-submenu)');
            mobileNavLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMobileMenu(mobileMenuBtn, mobileMenu);
                });
            });

            // Handle mobile menu visibility on resize
            const updateVisibility = Utils.debounce(() => {
                if (window.innerWidth <= CONFIG.BREAKPOINTS.TABLET) {
                    mobileMenuBtn.style.display = 'flex';
                } else {
                    mobileMenuBtn.style.display = 'none';
                    this.closeMobileMenu(mobileMenuBtn, mobileMenu);
                }
            }, 250);

            window.addEventListener('resize', updateVisibility);
            updateVisibility(); // Initial call
        },

        /**
         * Toggle mobile menu state
         * @param {HTMLElement} btn - Menu button
         * @param {HTMLElement} menu - Menu element
         */
        toggleMobileMenu(btn, menu) {
            btn.classList.toggle('active');
            menu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        },

        /**
         * Close mobile menu
         * @param {HTMLElement} btn - Menu button
         * @param {HTMLElement} menu - Menu element
         */
        closeMobileMenu(btn, menu) {
            btn.classList.remove('active');
            menu.classList.remove('active');
            document.body.classList.remove('menu-open');
        },

        /**
         * Initialize mega dropdown functionality
         */
        initMegaDropdown() {
            const trigger = document.querySelector('.services-dropdown-trigger');
            const parent = document.querySelector('.nav-item.has-mega-dropdown');
            const categoryItems = document.querySelectorAll('.mega-category-item');
            const contentSections = document.querySelectorAll('.mega-content-section');

            if (!trigger || !parent) return;

            // Toggle dropdown
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                parent.classList.toggle('active');
            });

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!parent.contains(e.target)) {
                    parent.classList.remove('active');
                }
            });

            // Handle category hover
            categoryItems.forEach(item => {
                item.addEventListener('mouseenter', () => {
                    this.handleCategoryHover(item, categoryItems, contentSections);
                });
            });
        },

        /**
         * Handle mega dropdown category hover
         * @param {HTMLElement} item - Hovered category item
         * @param {NodeList} allItems - All category items
         * @param {NodeList} contentSections - All content sections
         */
        handleCategoryHover(item, allItems, contentSections) {
            // Remove active class from all items
            allItems.forEach(cat => cat.classList.remove('active'));

            if (item.classList.contains('has-submenu')) {
                item.classList.add('active');
                const category = item.dataset.category;

                // Hide all content sections
                contentSections.forEach(section => section.classList.remove('active'));

                // Show relevant content
                if (category) {
                    const contentSection = document.querySelector(`.mega-content-section[data-category="${category}"]`);
                    if (contentSection) {
                        contentSection.classList.add('active');
                    }
                }
            }
        },

        /**
         * Initialize smooth scrolling for anchor links
         */
        initSmoothScroll() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = anchor.getAttribute('href');

                    if (targetId === '#') return;

                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        const header = document.querySelector('.header');
                        const headerHeight = header ? header.offsetHeight : 0;
                        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        },

        /**
         * Initialize header scroll effects
         */
        initHeaderScroll() {
            const header = document.querySelector('.header');
            if (!header) return;

            const handleScroll = Utils.debounce(() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                if (scrollTop > CONFIG.ANIMATION.SCROLL_THRESHOLD) {
                    header.style.backgroundColor = 'rgba(10, 10, 18, 0.95)';
                } else {
                    header.style.backgroundColor = 'rgba(10, 10, 18, 0.8)';
                }
            }, 10);

            window.addEventListener('scroll', handleScroll);
        }
    };

    // Forms module
    const Forms = {
        init() {
            this.initContactForm();
            this.initModalForm();
            this.initPhoneInputs();
        },

        /**
         * Initialize main contact form
         */
        initContactForm() {
            const form = document.getElementById('contactForm');
            if (!form) return;

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form, {
                    name: { element: document.getElementById('name'), required: true },
                    phone: { element: document.getElementById('phone'), required: true, type: 'phone' },
                    message: { element: document.getElementById('message'), required: false },
                    consent: { element: document.getElementById('consent'), required: true, type: 'checkbox' }
                });
            });
        },

        /**
         * Initialize modal contact form
         */
        initModalForm() {
            const form = document.getElementById('modalContactForm');
            if (!form) return;

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form, {
                    name: { element: document.getElementById('modalName'), required: true },
                    phone: { element: document.getElementById('modalPhone'), required: true, type: 'phone' },
                    message: { element: document.getElementById('modalMessage'), required: false },
                    consent: { element: document.getElementById('modalConsent'), required: true, type: 'checkbox' }
                });
            });
        },

        /**
         * Handle form submission
         * @param {HTMLFormElement} form - Form element
         * @param {Object} fields - Form fields configuration
         */
        handleFormSubmit(form, fields) {
            try {
                const isValid = FormValidator.validateFields(fields);

                if (isValid) {
                    // Here you would typically send data to server
                    this.showSuccessMessage();
                    form.reset();
                    Utils.log('info', 'Form submitted successfully');
                } else {
                    Utils.log('warn', 'Form validation failed');
                }
            } catch (error) {
                Utils.log('error', 'Error handling form submission', error);
            }
        },

        /**
         * Show success message
         */
        showSuccessMessage() {
            // Using a more professional approach instead of alert
            if (window.showNotification) {
                window.showNotification(CONFIG.MESSAGES.FORM_SUCCESS, 'success');
            } else {
                alert(CONFIG.MESSAGES.FORM_SUCCESS);
            }
        },

        /**
         * Initialize phone input formatting
         */
        initPhoneInputs() {
            const phoneInputs = document.querySelectorAll('#phone, #modalPhone');
            phoneInputs.forEach(input => {
                if (input) {
                    input.addEventListener('input', () => {
                        PhoneFormatter.format(input);
                    });
                }
            });
        }
    };

    // Animations module
    const Animations = {
        init() {
            this.initScrollAnimations();
            this.initCounters();
            this.initWorkStatus();
        },

        /**
         * Initialize scroll-based animations
         */
        initScrollAnimations() {
            const animateElements = document.querySelectorAll('.service-card, .benefit-card, .stat-card');

            const checkVisibility = Utils.debounce(() => {
                animateElements.forEach(element => {
                    if (Utils.isInViewport(element)) {
                        element.classList.add('fade-in');
                    }
                });
            }, 50);

            window.addEventListener('scroll', checkVisibility);
            checkVisibility(); // Initial check
        },

        /**
         * Initialize counter animations
         */
        initCounters() {
            const counters = document.querySelectorAll('.counter');

            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-target'), 10);
                if (isNaN(target)) return;

                const increment = target / CONFIG.ANIMATION.COUNTER_SPEED;
                let current = 0;

                const updateCounter = () => {
                    if (current < target) {
                        current = Math.min(current + increment, target);
                        counter.textContent = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };

                // Start animation with delay
                setTimeout(updateCounter, 500);
            });
        },

        /**
         * Initialize and update work status
         */
        initWorkStatus() {
            const updateStatus = () => {
                const statusText = document.querySelector('.status-text');
                if (!statusText) return;

                const now = new Date();
                const hours = now.getHours();
                const isWorking = hours >= CONFIG.WORKING_HOURS.START && hours < CONFIG.WORKING_HOURS.END;

                statusText.textContent = isWorking ? 'Currently working' : 'Currently closed';
            };

            updateStatus();
            setInterval(updateStatus, 60000); // Update every minute
        }
    };

    // Modal module
    const Modal = {
        init() {
            this.initContactModal();
        },

        /**
         * Initialize contact modal
         */
        initContactModal() {
            const modal = document.getElementById('contact-modal');
            const closeBtn = document.querySelector('.contact-modal-close');
            const overlay = document.querySelector('.contact-modal-overlay');

            if (!modal) return;

            // Open modal triggers
            document.querySelectorAll('[data-modal="contact-modal"]').forEach(trigger => {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openModal(modal);
                });
            });

            // Close modal triggers
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal(modal));
            }
            if (overlay) {
                overlay.addEventListener('click', () => this.closeModal(modal));
            }

            // ESC key handler
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    this.closeModal(modal);
                }
            });
        },

        /**
         * Open modal
         * @param {HTMLElement} modal - Modal element
         */
        openModal(modal) {
            modal.classList.add('active');
            const scrollBarWidth = Utils.getScrollbarWidth();
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = scrollBarWidth + 'px';
        },

        /**
         * Close modal
         * @param {HTMLElement} modal - Modal element
         */
        closeModal(modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
    };

    // Services Slider module
    const ServicesSlider = {
        init() {
            const sliderTrack = document.querySelector('.services-slider-track');
            const sliderContainer = document.querySelector('.services-slider-container');
            const prevButton = document.querySelector('.slider-prev');
            const nextButton = document.querySelector('.slider-next');
            const paginationContainer = document.querySelector('.slider-pagination');

            if (!sliderTrack || !sliderContainer || !prevButton || !nextButton || !paginationContainer) {
                Utils.log('warn', 'Slider elements not found');
                return;
            }

            this.sliderTrack = sliderTrack;
            this.sliderContainer = sliderContainer;
            this.prevButton = prevButton;
            this.nextButton = nextButton;
            this.paginationContainer = paginationContainer;
            this.cards = Array.from(sliderTrack.querySelectorAll('.service-card'));
            this.currentIndex = 0;

            if (this.cards.length === 0) return;

            this.setupSlider();
            this.bindEvents();
            this.initSwipeHandlers();
        },

        /**
         * Setup slider initial state
         */
        setupSlider() {
            this.updateVisibleCards();
            this.createPagination();
            this.updateCardWidths();
            this.sliderTrack.style.transition = 'transform 0.5s ease-out';
        },

        /**
         * Update number of visible cards based on screen size
         */
        updateVisibleCards() {
            if (window.innerWidth <= CONFIG.BREAKPOINTS.MOBILE) {
                this.visibleCards = 1;
            } else if (window.innerWidth <= CONFIG.BREAKPOINTS.TABLET) {
                this.visibleCards = 2;
            } else {
                this.visibleCards = 3;
            }
            this.totalSlides = Math.ceil(this.cards.length / this.visibleCards);
        },

        /**
         * Create pagination dots
         */
        createPagination() {
            this.paginationContainer.innerHTML = '';

            for (let i = 0; i < this.totalSlides; i++) {
                const dot = document.createElement('div');
                dot.classList.add('pagination-dot');
                if (i === this.currentIndex) dot.classList.add('active');

                dot.addEventListener('click', () => this.goToSlide(i));
                this.paginationContainer.appendChild(dot);
            }
        },

        /**
         * Update card widths based on visible cards
         */
        updateCardWidths() {
            this.cards.forEach(card => {
                card.style.flex = `0 0 calc(${100 / this.visibleCards}% - 2rem)`;
            });
        },

        /**
         * Go to specific slide
         * @param {number} index - Slide index
         */
        goToSlide(index) {
            // Handle infinite scroll
            if (index < 0) {
                index = this.totalSlides - 1;
            } else if (index >= this.totalSlides) {
                index = 0;
            }

            this.currentIndex = index;
            const offset = this.currentIndex * 100;
            this.sliderTrack.style.transform = `translateX(-${offset}%)`;
            this.updatePagination();
        },

        /**
         * Update pagination active state
         */
        updatePagination() {
            const dots = this.paginationContainer.querySelectorAll('.pagination-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentIndex);
            });
        },

        /**
         * Bind event listeners
         */
        bindEvents() {
            this.prevButton.addEventListener('click', () => {
                this.goToSlide(this.currentIndex - 1);
            });

            this.nextButton.addEventListener('click', () => {
                this.goToSlide(this.currentIndex + 1);
            });

            const handleResize = Utils.debounce(() => {
                const newVisibleCards = this.getVisibleCardsCount();

                if (newVisibleCards !== this.visibleCards) {
                    this.visibleCards = newVisibleCards;
                    this.updateCardWidths();
                    this.createPagination();
                    this.currentIndex = 0;
                    this.goToSlide(0);
                }
            }, 300);

            window.addEventListener('resize', handleResize);
        },

        /**
         * Get visible cards count based on screen size
         * @returns {number} Number of visible cards
         */
        getVisibleCardsCount() {
            if (window.innerWidth <= CONFIG.BREAKPOINTS.MOBILE) return 1;
            if (window.innerWidth <= CONFIG.BREAKPOINTS.TABLET) return 2;
            return 3;
        },

        /**
         * Initialize swipe handlers for touch devices
         */
        initSwipeHandlers() {
            let touchStartX = 0;
            let touchStartY = 0;
            let isDragging = false;
            let swipeDirection = null;
            let isSwipeActive = false;

            this.sliderContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].clientX;
                touchStartY = e.changedTouches[0].clientY;
                isDragging = true;
                swipeDirection = null;
                isSwipeActive = false;
                this.sliderTrack.style.transition = 'none';
            }, { passive: true });

            this.sliderContainer.addEventListener('touchmove', (e) => {
                if (!isDragging) return;

                const currentX = e.changedTouches[0].clientX;
                const currentY = e.changedTouches[0].clientY;
                const diffX = Math.abs(touchStartX - currentX);
                const diffY = Math.abs(touchStartY - currentY);
                const totalDistance = Math.sqrt(diffX * diffX + diffY * diffY);

                // Determine swipe direction
                if (swipeDirection === null && totalDistance > CONFIG.SWIPE.MIN_DISTANCE) {
                    if (diffX > diffY * CONFIG.SWIPE.DIRECTION_THRESHOLD) {
                        swipeDirection = 'horizontal';
                    } else if (diffY > diffX * CONFIG.SWIPE.DIRECTION_THRESHOLD) {
                        swipeDirection = 'vertical';
                    }
                }

                // Activate swipe after minimum distance
                if (!isSwipeActive && totalDistance > CONFIG.SWIPE.ACTIVATION_DISTANCE) {
                    isSwipeActive = true;
                }

                // Handle horizontal swipes
                if (swipeDirection === 'horizontal' && isSwipeActive) {
                    e.preventDefault();
                    // Add visual feedback during swipe if needed
                }
            }, { passive: false });

            this.sliderContainer.addEventListener('touchend', (e) => {
                if (!isDragging) return;

                const touchEndX = e.changedTouches[0].clientX;
                isDragging = false;
                this.sliderTrack.style.transition = 'transform 0.5s ease-out';

                if (swipeDirection === 'horizontal' && isSwipeActive) {
                    const diff = touchStartX - touchEndX;
                    const swipeThreshold = this.sliderContainer.offsetWidth * CONFIG.SWIPE.SWIPE_THRESHOLD;

                    if (Math.abs(diff) > swipeThreshold) {
                        if (diff > 0) {
                            this.goToSlide(this.currentIndex + 1);
                        } else {
                            this.goToSlide(this.currentIndex - 1);
                        }
                    } else {
                        this.goToSlide(this.currentIndex);
                    }
                } else {
                    this.goToSlide(this.currentIndex);
                }

                swipeDirection = null;
                isSwipeActive = false;
            }, { passive: true });
        }
    };

    // Main application initialization
    const App = {
        /**
         * Initialize the application
         */
        init() {
            try {
                Utils.log('info', 'Initializing website application');

                Navigation.init();
                Forms.init();
                Animations.init();
                Modal.init();
                ServicesSlider.init();

                // Set current year in footer
                this.setCurrentYear();

                Utils.log('info', 'Application initialized successfully');
            } catch (error) {
                Utils.log('error', 'Error initializing application', error);
            }
        },

        /**
         * Set current year in footer
         */
        setCurrentYear() {
            const currentYearElement = document.getElementById('currentYear');
            if (currentYearElement) {
                currentYearElement.textContent = new Date().getFullYear();
            }
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => App.init());
    } else {
        App.init();
    }

    // Expose public API
    window.CorporateWebsite = {
        Utils,
        FormValidator,
        Navigation,
        Forms,
        Animations,
        Modal,
        ServicesSlider
    };

})(window, document);
