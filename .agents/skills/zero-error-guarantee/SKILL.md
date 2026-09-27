---
name: zero-error-guarantee
description: Enforces zero console errors, zero broken downloads, and strict verification protocols across all page edits, forms, canvas rendering, and Netlify deployments.
---

# Zero Error Guarantee Skill

## Principles
1. **Never Assume — Test & Verify**: Run tests locally using Node.js or browser environment simulation before making git commits.
2. **Double-Check Dependencies**: Verify local assets exist (e.g. `/js/piexif.js`) and CSP rules in `netlify.toml` permit them.
3. **No Uncaught Exceptions**: All interactive buttons (downloads, forms, modals, tabs) must fail gracefully with user feedback instead of throwing uncaught exceptions.
4. **Synchronized State**: Keep `index.html`, `book.html`, `dashboard.html`, and `reviews.html` 100% in sync for reviews, ratings (5.0 ★), and pricing compliance.
