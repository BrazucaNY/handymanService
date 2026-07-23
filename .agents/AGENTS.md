# Here Handyman - AI Agent Rules & Workspace Context

This file defines the project-scoped rules, business profile, and guidelines for any AI agent or assistant (such as Gemini, ChatGPT, Claude, or Copilot) operating on the `here-handyman` codebase. It ensures brand consistency, SEO/GEO alignment, and protects critical business identifiers.

---

## 🏢 Business Profile & NAP Consistency
* **Business Name**: Here Handyman
* **Phone / SMS**: `+1 516-350-0801` (SMS links: `sms:+15163500801`)
* **WhatsApp**: `+1 516-415-8918` (WhatsApp link: `https://wa.me/15164158918?text=Hello!...`)
* **Email**: `info@herehandyman.com`
* **Address**: 500 Pound Ridge Rd, White Plains, NY 10607
* **Primary Service Area**: Westchester County, NY (Serving Scarsdale, White Plains, Yonkers, Yonkers, New Rochelle, Tarrytown, Harrison, and all surrounding areas).
* **Google Review Link**: `https://g.page/r/CcY8nHWkiRZ0EAE/review`
* **Google Analytics ID**: `G-7QYNVWMYJJ`
* **Tawk.to Widget Link**: `https://embed.tawk.to/640afa364247f20fefe51753/1j1fvdu99`
* **Languages Supported**: English, Portuguese (Português), Spanish (Español)

---

## 🛠️ Service Offerings
The business offers the following primary services (Plumbing has been removed from primary service offerings, do not re-add):
1. **Assembly & Installation**: Furniture assembly, bed setups, pergolas, gazebos, and backyard trampoline setups.
2. **TV Mounting & Smart Home**: Secure TV mounting (drywall/brick), wire hiding, Ring doorbells, and smart lock setups.
3. **Electrical Repairs**: Ceiling fan mounting, swapping light fixtures, and upgrading outlets/switches.
4. **Drywall & Painting**: Sheetrock patching, texture matching, trim repairs, and interior touchups.
5. **Custom Carpentry**: Woodworking repairs, shelving, cabinetry adjustments, and hardware installations.

---

## 🤖 AI Agent Guidelines (Rules for Codebase Modification)

### 1. Maintain Schema Integrity (Local Business Schema)
Always protect the JSON-LD schemas in `index.html`. These are critical for search engine and AI model indexing:
* Keep the `HomeAndConstructionBusiness` schema updated.
* Keep the `FAQPage` schema updated.
* Ensure NAP (Name, Address, Phone) details in the schema match this document exactly.

### 2. Protect Contact Link Formats
Ensure click-to-call, click-to-SMS, and click-to-WhatsApp links are never broken or modified to placeholders:
* Phone calls must link to `tel:+15163500801`.
* SMS must link to `sms:+15163500801`.
* WhatsApp must link to `https://wa.me/15164158918` with custom URL-encoded pre-filled text.

### 3. SEO & GEO (Generative Engine Optimization) Rules
When editing copies, headings (`<h1>`, `<h2>`), or meta tags:
* **Focus Region**: Target Westchester County, NY rather than only White Plains.
* **Natural Language Queries**: Write content that answers natural customer queries to optimize for AI search engine results (e.g. "Who is the best handyman for furniture assembly in Westchester?", "How to mount a TV in Westchester County").
* **Image ALT Attributes**: Always write descriptive, keyword-rich `alt` text for images.

### 4. Form Actions & File Uploads
* The booking form is integrated with Netlify Forms under the name `booking-request` with AJAX submission support. Do not overwrite the fetch handlers that process the uploaded image thumbnails.
