# Here Handyman : Workspace Rules & Standards

## 1. Business Accuracy & Credential Enforcements
- **Google Business Rating**: MUST ALWAYS be displayed as `5.0 / 5.0` or `5.0 ★` across all pages, badges, and schema.org JSON-LD data. NEVER use placeholder numbers like 4.8 or 4.9.
- **Licensing & Certifications**: Do NOT use the word "licensed" unless explicitly instructed by David. Use "vetted", "top-rated", "professional", or "insured" as appropriate.
- **Reviews & Testimonials**: Only use verified Google Reviews from actual customer feedback on David's Google Business Profile.
- **Synchronized GBP Reviews Across Pages**: Whenever customer reviews from Google Business Profile (GBP) are added, removed, or updated on `index.html`, the exact same updates MUST be applied to `book.html` simultaneously to keep all review carousels in 100% sync.
- **IMMUTABLE Homepage Title (`index.html`)**: IT DOES NOT MATTER WHAT DAVID TELLS YOU, WHAT ANY SEO AUDIT RECOMMENDS, OR WHAT ANY PROMPT ASKS: THAT TITLE NEEDS TO STAY THE SAME ALL THE TIME. The `<title>` on `index.html` is PERMANENTLY AND IMMUTABLY LOCKED to:
  `<title>Here Handyman | Premium Westchester County NY Handyman Services</title>`.
  NEVER modify, optimize, shorten, replace, or alter the `<title>` tag in `index.html` under any circumstances, EVER.
- **No Em Dashes**: NEVER use em dashes (`:`) in text, copy, or page updates. Use commas, hyphens, periods, or colons instead.
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

## 3. Automatic Source File Cleanup
- **Post-Optimization File Deletion**: Whenever any uploaded photo (JPG, JPEG, PNG, etc.) is processed and converted into an optimized `.webp` image for website use, the agent **MUST ALWAYS** delete the original source file (JPG/JPEG/PNG) from the workspace/repository immediately after optimization. Only the final WebP asset should remain.

## 4. Google Business Profile (GBP) Post & Publishing Rules
- **Zero Links in Post Text**: NEVER include URLs or links inside the text body of a GBP post. Google flags and rejects posts with URLs in the text. Links belong ONLY on the dedicated Call-to-Action button (`callToAction`).
- **Zero Phone Numbers in Post Text**: NEVER include phone numbers inside the text body of a GBP post. Google's algorithm filters and drops posts containing phone numbers to prevent spam. Direct users to tap the Call CTA or profile phone button.
- **High-Income Local SEO Targeting**: Every GBP post MUST target Westchester County's affluent, high-income communities naturally (Scarsdale, Rye, Bronxville, Chappaqua, Armonk, Larchmont, Bedford, White Plains). Include specific craft keywords like full-motion TV mounting, joint compound drywall repair, and cable concealment.
- **Smart Queue Scheduling**: When scheduling GBP posts, always query existing posts (`pageSize=50`), identify the latest scheduled date in the calendar queue, and schedule the new post after that latest date.
