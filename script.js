document.addEventListener('DOMContentLoaded', function () {
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();

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
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
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
        if (window.innerWidth <= 1024) {
            mobileMenuBtn.style.display = 'flex';
        } else {
            mobileMenuBtn.style.display = 'none';
        }
    };

    // Initial check and add resize listener
    updateMobileMenuBtnVisibility();
    window.addEventListener('resize', updateMobileMenuBtnVisibility);

    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function () {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 50) {
            header.style.backgroundColor = 'rgba(10, 10, 18, 0.95)';
        } else {
            header.style.backgroundColor = 'rgba(10, 10, 18, 0.8)';
        }

        lastScrollTop = scrollTop;
    });

    // Testimonials slider
    const testimonialsTrack = document.getElementById('testimonialsTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    const slideCount = dots.length;

    function goToSlide(index) {
        if (testimonialsTrack) {
            testimonialsTrack.style.transform = `translateX(-${index * 100}%)`;

            // Update active dot
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });

            currentSlide = index;
        }
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', function () {
            currentSlide = (currentSlide - 1 + slideCount) % slideCount;
            goToSlide(currentSlide);
        });

        nextBtn.addEventListener('click', function () {
            currentSlide = (currentSlide + 1) % slideCount;
            goToSlide(currentSlide);
        });
    }

    // Click on dots to navigate
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function () {
            goToSlide(index);
        });
    });

    // Auto slide every 5 seconds
    setInterval(function () {
        if (document.hasFocus()) {
            currentSlide = (currentSlide + 1) % slideCount;
            goToSlide(currentSlide);
        }
    }, 5000);

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
});