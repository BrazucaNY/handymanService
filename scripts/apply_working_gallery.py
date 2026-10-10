import re

# Read David's working code block for section and script
gallery_section_html = '''    <!-- Gallery Section -->
    <section id="portfolio">
      <div class="section-tag">Recent Work</div>
      <h2 class="section-title">See The Difference</h2>
      <p class="section-sub">Check us on Instagram: <a href="https://www.instagram.com/herehandyman/" target="_blank" rel="noopener" class="gallery-insta-link"><svg viewBox="0 0 24 24" fill="currentColor" style="display: inline-block; vertical-align: middle; width: 16px; height: 16px; margin-right: 4px; margin-top: -2px;"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>@herehandyman</a></p>
      
      <!-- Gallery Filter Tabs -->
      <div class="gallery-filters">
        <button class="filter-btn active" data-filter="all">All</button>
        <button class="filter-btn" data-filter="repairs">Repairs</button>
        <button class="filter-btn" data-filter="carpentry">Carpentry</button>
        <button class="filter-btn" data-filter="painting">Painting</button>
        <button class="filter-btn" data-filter="electrical">Electrical</button>
        <button class="filter-btn" data-filter="plumbing">Plumbing</button>
      </div>

      <div class="gallery-grid">
        <div class="gallery-item carpentry tall" data-index="1">
          <div class="gallery-badge">Carpentry</div>
          <img src="assets/images/carpentry/1.webp" alt="Custom Built-in Bookshelves in a study" width="600" height="900" loading="lazy">
          <div class="gallery-label">Custom Built-in Bookshelves</div>
        </div>
        <div class="gallery-item painting" data-index="1">
          <div class="gallery-badge">Painting</div>
          <img src="assets/images/painting/1.webp" alt="Professional interior painting services in Westchester NY – Here Handyman" width="400" height="267" loading="lazy">
          <div class="gallery-label">Interior Painting – Westchester NY</div>
        </div>
        <div class="gallery-item plumbing" data-index="1">
          <div class="gallery-badge">Plumbing</div>
          <img src="assets/images/plumbing/1.webp" alt="Expert plumbing repairs &amp; installation in Westchester NY – Here Handyman" width="400" height="267" loading="lazy">
          <div class="gallery-label">Plumbing Services – Westchester NY</div>
        </div>
        <div class="gallery-item electrical" data-index="1">
          <div class="gallery-badge">Electrical</div>
          <img src="assets/images/electrical/1.webp" alt="Elegant copper pendant lighting fixture in kitchen" width="400" height="267" loading="lazy">
          <div class="gallery-label">Pendant Light Installation</div>
        </div>
        <div class="gallery-item repairs" data-index="1">
          <div class="gallery-badge">Repairs</div>
          <img src="assets/images/repairs/1.webp" alt="Fully repaired wall ready for painting" width="400" height="267" loading="lazy">
          <div class="gallery-label">Seamless Drywall Patching</div>
        </div>
      </div>
    </section>

    <!-- Lightbox Modal for Gallery Expansion -->
    <div id="lightbox-modal" class="lightbox" role="dialog" aria-modal="true" aria-label="Image gallery zoom">
      <span class="lightbox-close" aria-label="Close lightbox">&times;</span>
      <button class="lightbox-prev" aria-label="Previous image">&#10094;</button>
      <button class="lightbox-next" aria-label="Next image">&#10095;</button>
      <div class="lightbox-content">
        <img id="lightbox-img" src="" alt="">
        <div id="lightbox-caption"></div>
      </div>
    </div>'''

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace <section id="portfolio"> ... </section> or <div id="portfolio"...>
start_portfolio = content.find('<!-- Gallery Section -->')
if start_portfolio == -1:
    start_portfolio = content.find('<section id="portfolio">')

end_portfolio = content.find('<!-- FAQ Section -->', start_portfolio)
if end_portfolio == -1:
    end_portfolio = content.find('<section id="before-after"', start_portfolio)

print(f"Replacing portfolio section from position {start_portfolio} to {end_portfolio}")

if start_portfolio != -1 and end_portfolio != -1:
    content = content[:start_portfolio] + gallery_section_html + '\n\n    ' + content[end_portfolio:]
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Portfolio section replaced successfully!")

