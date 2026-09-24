# Here Handyman — Workspace Rules & Standards

## 1. Business Accuracy & Credential Enforcements
- **Google Business Rating**: MUST ALWAYS be displayed as `5.0 / 5.0` or `5.0 ★` across all pages, badges, and schema.org JSON-LD data. NEVER use placeholder numbers like 4.8 or 4.9.
- **Licensing & Certifications**: Do NOT use the word "licensed" unless explicitly instructed by David. Use "vetted", "top-rated", "professional", or "insured" as appropriate.
- **Reviews & Testimonials**: Only use verified Google Reviews from actual customer feedback on David's Google Business Profile.
- **Synchronized GBP Reviews Across Pages**: Whenever customer reviews from Google Business Profile (GBP) are added, removed, or updated on `index.html`, the exact same updates MUST be applied to `book.html` simultaneously to keep all review carousels in 100% sync.
- **Zero Hardcoded Secrets**: NEVER embed API tokens or secrets in code files.

## 2. Mandatory Image & Photo Upload Analysis (POST vs DO NOT POST)
- Whenever David uploads photo(s) of a job site, tools, before/after work, or products, the agent **MUST** immediately analyze the image(s) against website portfolio and local SEO quality standards.
- The agent **MUST** evaluate:
  1. **Visual Quality & Lighting**: Is it clean, sharp, well-lit, and professionally framed?
  2. **Handyman Service Craftsmanship**: Does it demonstrate high craftsmanship, expert staging, clean organization, or clear before/after transformation?
  3. **Clutter / Background Safety**: Are there messy backgrounds, personal items, packaging trash, or unappealing clutter that would degrade the site's professional look?
- The agent **MUST** make an explicit **POST / DO NOT POST** decision recommendation:
  - If **POST**: Specify exact placement (e.g. `offer.html`, `gallery.html`, `index.html` before-after carousel, or GBP post), suggest clean WebP filename (service + town), alt text, and caption.
  - If **DO NOT POST**: Clearly explain why (e.g. cluttered background, prep work vs finished installation) and give actionable advice on how to take a better photo (e.g. "Take a photo of the installed smoke detectors mounted cleanly on the ceiling!").
