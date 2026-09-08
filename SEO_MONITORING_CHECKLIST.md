# Google Search Console (GSC) Monitoring & Audit Checklist

This document tracks the indexing, performance, and maintenance schedule for Here Handyman's **64 Service × City Landing Page Matrix** deployed on September 8, 2026.

---

## Key Milestone Dates

| Milestone | Target Date | Status | Key Action Required |
| :--- | :--- | :--- | :--- |
| **Launch & Sitemap Submission** | **Sept 8, 2026** | ✅ Complete | Submit `sitemap.xml` (120 URLs) in Google Search Console. |
| **30-Day Indexing Check** | **Oct 8, 2026** | ⏳ Pending | Audit GSC > *Pages* for "Crawled – currently not indexed" spikes. |
| **90-Day Performance Audit** | **Dec 8, 2026** | ⏳ Pending | Evaluate impressions per URL. Prune/301 redirect zero-impression pages. |

---

## 📋 30-Day Indexing Audit Protocol (Target: October 8, 2026)

### Step 1: Check GSC Page Indexing Status
1. Log into [Google Search Console](https://search.google.com/search-console).
2. Click **Indexing** → **Pages**.
3. Review the status of your 64 matrix URLs (`/tv-mounting-white-plains`, `/plumbing-repairs-rye`, etc.).

### Step 2: Diagnostic & Mitigation Rules

- **If "Crawled – currently not indexed" is under 5%**: No action needed! Google is indexing the pages as expected.
- **If "Crawled – currently not indexed" spikes above 10%**:
  The shared boilerplate content (what's included, pricing overview, CTA) is too heavy relative to the unique city intro.
  **Action**: Trim 150 words of shared boilerplate from affected city pages and add 1 additional city-specific neighborhood detail or local FAQ.

---

## 📊 90-Day Impression & Pruning Protocol (Target: December 8, 2026)

### Step 1: Pull Matrix Performance Data
1. In Search Console, go to **Performance** → **Search Results**.
2. Set date range to **Last 3 months**.
3. Filter by **Page** and search for Matrix URLs (`-white-plains`, `-yonkers`, `-scarsdale`, `-new-rochelle`, `-mount-vernon`, `-mamaroneck`, `-rye`, `-eastchester`).

### Step 2: Prune & 301 Redirect Zero-Impression Combos

For any Service × City URL that receives **0 impressions** after 90 days:
1. **Redirect**: Add a 301 redirect in `_redirects` mapping the zero-impression URL to its parent service page:
   ```text
   /plumbing-repairs-eastchester  /plumbing-repairs  301
   ```
2. **Sitemap**: Remove the zero-impression URL from `sitemap.xml`.
3. **Internal Links**: Remove the link from the parent service page grid.
