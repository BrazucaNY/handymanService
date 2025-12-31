/**
 * Optimized Google Tag Manager Loading
 * Loads GTM after the page has loaded to prevent blocking the main thread
 */

// Configuration
const gtmId = 'G-7QYNVWMYJJ';

// Function to load GTM
function loadGTM() {
    // Create GTM script
    const gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = `https://www.googletagmanager.com/gtag/js?id=${gtmId}`;
    
    // Create dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];
    
    // Push the initial gtag() function
    window.gtag = function() {
        window.dataLayer.push(arguments);
    };
    
    // Configure with GTM ID
    gtag('js', new Date());
    gtag('config', gtmId, {
        'transport_type': 'beacon',
        'anonymize_ip': true
    });
    
    // Add script to document
    document.head.appendChild(gtmScript);
}

// Load GTM after a short delay to prevent blocking main thread
setTimeout(loadGTM, 1000);

// Also load on user interaction for better performance
const userInteractions = ['keydown', 'mousemove', 'wheel', 'touchstart'];

const loadOnInteraction = () => {
    loadGTM();
    userInteractions.forEach(event => {
        window.removeEventListener(event, loadOnInteraction, { once: true });
    });};

userInteractions.forEach(event => {
    window.addEventListener(event, loadOnInteraction, { once: true, passive: true });
});
