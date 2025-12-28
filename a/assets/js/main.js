document.addEventListener('DOMContentLoaded', function() {
    
    // Hero slider removed as per user request


    // ==========================================
    // 2. CATEGORY GALLERY SYSTEM
    // ==========================================
    const categories = {
        "Plumbing Repairs": [
            { src: 'assets/images/k1.webp', title: 'Modern Kitchen' },
            { src: 'assets/images/k2.webp', title: 'Cabinet Refinishing' }
        ],
        "Electrical & Fixture Work": [
            { src: 'assets/images/b1.webp', title: 'Tile Shower' },
            { src: 'assets/images/b2.webp', title: 'Vanity Install' }
        ],
        "Painting & Drywall": [
            { src: 'assets/images/f1.webp', title: 'Vinyl Plank' },
            { src: 'assets/images/f2.webp', title: 'Hardwood Repair' }
        ]
    };

    const categoryGrid = document.getElementById('gallery-category-selection');
    const imageDisplay = document.getElementById('category-image-display');
    const galleryGrid = imageDisplay?.querySelector('.gallery-grid');
    const backBtn = document.getElementById('back-to-categories');

    // Initialize Category Cards
    if (categoryGrid) {
        Object.keys(categories).forEach(catName => {
            const card = document.createElement('div');
            card.className = 'category-card animate-on-scroll';
            card.innerHTML = `
                <div class="category-card-inner">
                    <h3>${catName}</h3>
                    <span class="view-btn">View Projects</span>
                </div>
            `;
            addPassiveEventListener(card, 'click', () => showCategoryImages(catName));
            categoryGrid.appendChild(card);
        });
    }

    function showCategoryImages(category) {
        categoryGrid.style.display = 'none';
        imageDisplay.style.display = 'block';
        galleryGrid.innerHTML = ''; // Clear previous

        categories[category].forEach(imgObj => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `
                <img src="${imgObj.src}" alt="${imgObj.title}" loading="lazy">
                <div class="gallery-overlay"><h3>${imgObj.title}</h3></div>
            `;
            galleryGrid.appendChild(item);
        });
        window.scrollTo({ top: document.getElementById('gallery').offsetTop - 100, behavior: 'smooth' });
    }

    if (backBtn) {
        addPassiveEventListener(backBtn, 'click', () => {
            imageDisplay.style.display = 'none';
            categoryGrid.style.display = 'grid';
        });
    }


    // ==========================================
    // 3. NAVIGATION & UI (Your Original Logic)
    // ==========================================
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const closeBtn = document.getElementById('close-btn');
    const navLinks = document.querySelectorAll('.mobile-nav-links a');
    const body = document.body;

    // Toggle mobile menu
    function toggleMenu() {
        mobileMenu.classList.toggle('active');
        hamburgerBtn.setAttribute('aria-expanded', 
            hamburgerBtn.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
        );
        
        // Toggle body scroll
        body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    // Close menu when clicking outside
    function handleClickOutside(e) {
        if (mobileMenu.classList.contains('active') && 
            !mobileMenu.contains(e.target) && 
            !hamburgerBtn.contains(e.target)) {
            toggleMenu();
        }
    }

    // Helper function to add passive event listeners
    function addPassiveEventListener(element, eventName, handler, options) {
        if (element && handler) {
            const passiveOptions = {
                passive: eventName === 'touchstart' || eventName === 'touchmove' || eventName === 'touchend' || eventName === 'touchcancel',
                ...(typeof options === 'object' ? options : {})
            };
            element.addEventListener(eventName, handler, passiveOptions);
        }
    }

    // Event Listeners
    if (hamburgerBtn) {
        addPassiveEventListener(hamburgerBtn, 'click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }

    if (closeBtn) {
        addPassiveEventListener(closeBtn, 'click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }

    // Close menu when clicking on nav links
    navLinks.forEach(link => {
        addPassiveEventListener(link, 'click', () => {
            if (mobileMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // Close menu when clicking outside
    addPassiveEventListener(document, 'click', handleClickOutside);

    // Close menu on window resize if it's larger than mobile
    function handleResize() {
        if (window.innerWidth > 992 && mobileMenu.classList.contains('active')) {
            toggleMenu();
        }
    }

    addPassiveEventListener(window, 'resize', handleResize);


    // ==========================================
    // 4. NAVIGATION & UI (Your Original Logic)
    // ==========================================
    const header = document.querySelector('header');

    // Sticky Header Scroll Effect
    let lastScroll = 0;
    addPassiveEventListener(window, 'scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });

    // Intersection Observer for Animations (Better than Scroll Listener)
    const appearanceOptions = { threshold: 0.2 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, appearanceOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));


    // ==========================================
    // 4. FORM HANDLING (Your Enhanced Logic)
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        addPassiveEventListener(contactForm, 'submit', async function(e) {
            e.preventDefault();
            
            // Honeypot check
            if (this.company.value) {
                return; // Likely a bot
            }
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            try {
                // Simulate sending
                await new Promise(res => setTimeout(res, 1500));
                alert('Success! We will contact you shortly.');
                contactForm.reset();
            } catch (err) {
                alert('Error sending message.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Send Message';
            }
        });
    }

    // ==========================================
    // SERVICE WORKER REGISTRATION
    // ==========================================
    // Register Service Worker
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
        window.addEventListener('load', () => {
            // Use relative path for service worker
            const swUrl = './sw.js';
            
            // Only register if we're on HTTPS or localhost (for development)
            if (window.location.hostname === 'localhost' || window.location.protocol === 'https:') {
                navigator.serviceWorker.register(swUrl)
                    .then(registration => {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    })
                    .catch(err => {
                        console.warn('ServiceWorker registration failed: ', err);
                    });
            }
        });
    }
});
