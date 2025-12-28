document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // 1. HERO SLIDER LOGIC (The "Max" Look)
    // ==========================================
    const heroLayers = [document.getElementById('hero-layer-1'), document.getElementById('hero-layer-2')];
    const heroImages = [
        'assets/images/hero-kitchen.webp', 
        'assets/images/hero-remodel.webp',
        'assets/images/hero-handyman.webp'
    ];
    let currentIdx = 0;
    let currentLayerIdx = 0;

    function swapHeroImage() {
        if (!heroLayers[0]) return; // Guard clause if layers don't exist
        
        const nextIdx = (currentIdx + 1) % heroImages.length;
        const nextLayerIdx = (currentLayerIdx + 1) % 2;
        
        // Prepare next layer
        heroLayers[nextLayerIdx].style.backgroundImage = `url('${heroImages[nextIdx]}')`;
        heroLayers[nextLayerIdx].classList.add('active');
        
        // Remove current layer
        heroLayers[currentLayerIdx].classList.remove('active');
        
        currentIdx = nextIdx;
        currentLayerIdx = nextLayerIdx;
    }
    // Change image every 5 seconds
    setInterval(swapHeroImage, 5000);


    // ==========================================
    // 2. CATEGORY GALLERY SYSTEM
    // ==========================================
    const categories = {
        "Kitchens": [
            { src: 'assets/images/k1.webp', title: 'Modern Kitchen' },
            { src: 'assets/images/k2.webp', title: 'Cabinet Refinishing' }
        ],
        "Bathrooms": [
            { src: 'assets/images/b1.webp', title: 'Tile Shower' },
            { src: 'assets/images/b2.webp', title: 'Vanity Install' }
        ],
        "Flooring": [
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
            card.addEventListener('click', () => showCategoryImages(catName));
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
        backBtn.addEventListener('click', () => {
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

    // Event Listeners
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }

    // Close menu when clicking on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', handleClickOutside);

    // Close menu on window resize if it's larger than mobile
    function handleResize() {
        if (window.innerWidth > 992 && mobileMenu.classList.contains('active')) {
            toggleMenu();
        }
    }

    window.addEventListener('resize', handleResize);


    // ==========================================
    // 4. NAVIGATION & UI (Your Original Logic)
    // ==========================================
    const header = document.querySelector('header');

    // Sticky Header Scroll Effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
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
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Honeypot check
            if (contactForm.querySelector('[name="company"]').value !== "") return;

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
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(error => {
                    console.error('ServiceWorker registration failed: ', error);
                });
        });
    }
});
