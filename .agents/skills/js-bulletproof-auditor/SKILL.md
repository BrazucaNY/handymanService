---
name: js-bulletproof-auditor
description: Automated pre-flight code auditor for JavaScript, DOM event listeners, CSP header policies, and browser canvas/EXIF exports. Use before staging or committing any frontend code changes.
---

# JS Bulletproof Auditor Skill

This skill enforces strict pre-flight quality checks on all JavaScript, HTML, CSS, and Netlify/Cloud configuration changes for Here Handyman.

## Core Rules & Checklists

### 1. Pre-Flight Runtime Verification
- **Never claim a fix is complete without empirical execution**: Before committing, run a Node or browser execution test on all modified JS functions (e.g., EXIF dump/insert, image canvas export, form validation).
- **Global Scope Window Bindings**: Always verify that third-party or internal JS libraries explicitly export symbols onto `window` (e.g. `if (typeof window !== 'undefined') { window.piexif = that; }`) to ensure bundlers and module loaders don't hide global scope.

### 2. Defensive Event Handlers & Fail-Safe Fallbacks
- **Download & File Operations**: Every download click event handler MUST use a `try...catch` block around metadata manipulation, falling back gracefully to standard canvas JPEG download (`canvas.toDataURL("image/jpeg")`) if EXIF injection or external scripts fail.
- **DOM Element Assertion**: Always assert element existence before adding event listeners (`var el = document.getElementById(...); if (el) { el.addEventListener(...); }`).

### 3. Netlify & Content-Security-Policy (CSP) Verification
- **Header Auditing**: Whenever adding or modifying external script tags (e.g., CDN links like `cdn.jsdelivr.net`), check `netlify.toml` security headers under `[[headers]]` to ensure `script-src` and `img-src` explicitly allow the domain and data types (`data:`, `blob:`).

### 4. Tab & UI State Synchronization
- **ID Namespace Safety**: Use clear element IDs and avoid namespace collisions across tabs.
- **Tab Switch Re-render**: Trigger canvas/chart redraw functions (e.g., `window.baDraw()`) on tab activation.
