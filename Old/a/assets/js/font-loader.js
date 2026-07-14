// Font loading optimization
(function() {
    // Add loading class to HTML
    document.documentElement.classList.add('fonts-loading');

    // Function to load fonts
    function loadFonts() {
        // Check if fonts are already loaded
        if (sessionStorage.fontsLoaded) {
            document.documentElement.classList.remove('fonts-loading');
            document.documentElement.classList.add('fonts-loaded');
            return;
        }

        // Load fonts using FontFace API if supported
        if ('fonts' in document) {
            Promise.all([
                // Load primary font (Oswald)
                document.fonts.load('1em Oswald'),
                // Load secondary font (Montserrat)
                document.fonts.load('1em Montserrat')
            ]).then(function() {
                document.documentElement.classList.remove('fonts-loading');
                document.documentElement.classList.add('fonts-loaded');
                sessionStorage.fontsLoaded = true;
            }).catch(function() {
                // If font loading fails, still remove loading class
                document.documentElement.classList.remove('fonts-loading');
                document.documentElement.classList.add('fonts-failed');
            });
        } else {
            // Fallback for browsers that don't support FontFace API
            document.documentElement.classList.remove('fonts-loading');
            document.documentElement.classList.add('fonts-loaded');
        }
    }

    // Load fonts after a short delay to prevent blocking rendering
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(loadFonts, 100);
        });
    } else {
        setTimeout(loadFonts, 100);
    }
})();
