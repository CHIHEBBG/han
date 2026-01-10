async function loadProducts() {
    try {
        const products = window.productsData || [];
        // if (!products.length) console.warn('No products found or products.js not loaded');


        const container = document.getElementById('productGrid');
        if (!container) return;

        container.innerHTML = '';
        const currentLang = localStorage.getItem('site-lang') || 'en';

        products.forEach(prod => {
            const card = document.createElement('div');
            card.className = 'product-card animate';
            card.setAttribute('data-category', prod.category);

            // Fallback content if translation missing
            const title = prod.title[currentLang] || prod.title['en'];
            const desc = prod.description[currentLang] || prod.description['en'];
            const btnText = (prod.price_label && prod.price_label[currentLang]) ? prod.price_label[currentLang] : 'Inquire for Price';

            // Map category to a nice label (simple mapping for now, can be expanded)
            const catMap = {
                laptops: { en: 'Workstation', ar: 'محطة عمل', fr: 'Station de travail' },
                medical: { en: 'Medical', ar: 'طبي', fr: 'Médical' },
                components: { en: 'Component', ar: 'مكون', fr: 'Composant' }
            };
            const catLabel = (catMap[prod.category] && catMap[prod.category][currentLang]) ? catMap[prod.category][currentLang] : prod.category;

            card.innerHTML = `
                <div class="product-image">
                    <i class="${Security.escapeHTML(prod.icon)}"></i>
                </div>
                <div class="product-info">
                    <span class="product-category">${Security.escapeHTML(catLabel)}</span>
                    <h3>${Security.escapeHTML(title)}</h3>
                    <p>${Security.escapeHTML(desc)}</p>
                    <button class="buy-btn">${Security.escapeHTML(btnText)}</button>
                </div>
            `;
            container.appendChild(card);
        });

        // Re-run filter logic if it exists
        const activeFilter = document.querySelector('.filter-btn.active');
        if (activeFilter) {
            activeFilter.click();
        }

    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Hook into the existing language change event
// We need to modify global-script.js to expose an event or we can just poll/listen
// For now, let's just make sure it loads on start.
document.addEventListener('DOMContentLoaded', loadProducts);

// Expose a global refresh function for language switcher to call
window.refreshProducts = loadProducts;
