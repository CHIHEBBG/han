let translations = window.translationsData || {};

if (!window.translationsData) {
    console.warn('translations.js not loaded. Language switching will not work.');
}

function setLanguage(lang) {
    // Update HTML attributes
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

    // Update Language Buttons visibility/active state
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        const text = btn.innerText.toLowerCase();
        if (lang === 'ar' && text.includes('العربية')) btn.classList.add('active');
        if (lang === 'en' && text === 'en') btn.classList.add('active');
        if (lang === 'fr' && text === 'fr') btn.classList.add('active');
    });

    // Translate Elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            // Check if it's an input/textarea for placeholder support
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translations[lang][key];
            } else {
                // Sanitize HTML to prevent injection while allowing formatting
                el.innerHTML = (window.Security && Security.sanitizeHTML) ? Security.sanitizeHTML(translations[lang][key]) : translations[lang][key];
            }
        }
    });

    // Store preference
    localStorage.setItem('site-lang', lang);

    // Re-trigger animations if on pages with .animate
    document.querySelectorAll('.animate').forEach(el => {
        el.style.animation = 'none';
        el.offsetHeight; /* trigger reflow */
        el.style.animation = null;
    });

    // Refresh dynamic content (Products)
    if (window.refreshProducts) window.refreshProducts();
}

// DOMContentLoaded is already handled above for language, we can append UI logic or distinct listener
document.addEventListener('DOMContentLoaded', () => {
    // Preloader Logic
    const preloader = document.createElement('div');
    preloader.id = 'pagePreloader';
    preloader.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: #0f172a; z-index: 9999; display: flex; 
        justify-content: center; align-items: center; transition: opacity 0.5s;
    `;
    preloader.innerHTML = '<div style="width: 40px; height: 40px; border: 3px solid #3b82f6; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite;"></div><style>@keyframes spin{to{transform: rotate(360deg)}}</style>';

    // Only show if not already present
    if (!document.getElementById('pagePreloader')) {
        document.body.prepend(preloader);
    }

    // 1. Language Init (calls setLanguage which clears preloader)
    const savedLang = localStorage.getItem('site-lang') || 'ar';
    setLanguage(savedLang);

    // Force remove preloader backup
    setTimeout(() => {
        const p = document.getElementById('pagePreloader');
        if (p) { p.style.opacity = '0'; setTimeout(() => p.remove(), 500); }
    }, 800);

    // 2. Mobile Menu Logic
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navOverlay = document.getElementById('navOverlay');

    if (menuToggle && navMenu && navOverlay) {
        const toggleNav = (forceClose = false) => {
            const isActive = forceClose ? false : !navMenu.classList.contains('active');
            menuToggle.classList.toggle('active', isActive);
            navMenu.classList.toggle('active', isActive);
            navOverlay.classList.toggle('active', isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';
        };

        menuToggle.addEventListener('click', () => toggleNav());
        navOverlay.addEventListener('click', () => toggleNav(true));
        // Close menu when clicking a link
        document.querySelectorAll('#navMenu a').forEach(a => {
            a.addEventListener('click', () => toggleNav(true));
        });
    }

    // 3. Sticky Header Logic
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // 4. Scroll Animation Observer
    // Select all elements with .animate class
    const animatedElements = document.querySelectorAll('.animate');
    if (animatedElements.length > 0) {
        const observerOptions = {
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optional: Stop observing once visible to save resources
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => observer.observe(el));
    }

    // 5. Back to Top Button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'backToTop';
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; 
        background: #3b82f6; color: white; border: none; 
        width: 45px; height: 45px; border-radius: 50%; 
        cursor: pointer; opacity: 0; pointer-events: none; 
        transition: opacity 0.3s, transform 0.3s; z-index: 1000;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; 
        justify-content: center; align-items: center; font-size: 1.2rem;
    `;
    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.pointerEvents = 'all';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.pointerEvents = 'none';
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
