import os
import sys
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
import glob
import re
from xml.etree import ElementTree as ET

site_dir = r"c:\Users\davi6\.gemini\antigravity\scratch\here-handyman"
sitemap_path = os.path.join(site_dir, "sitemap.xml")

# Parse sitemap.xml
sitemap_urls = set()
if os.path.exists(sitemap_path):
    tree = ET.parse(sitemap_path)
    root = tree.getroot()
    namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    for loc in root.findall('.//ns:loc', namespace):
        if loc.text:
            sitemap_urls.add(loc.text.strip())

excluded_files = {"dashboard.html", "login.html", "404.html", "timer.html", "schedule.html", "merge-photos.html"}

html_files = glob.glob(os.path.join(site_dir, "**", "*.html"), recursive=True)

audit_results = {
    "total_pages": len(html_files),
    "public_pages": 0,
    "excluded_pages": 0,
    "missing_canonical": [],
    "mismatched_canonical": [],
    "missing_title": [],
    "missing_description": [],
    "missing_h1": [],
    "multiple_h1": [],
    "missing_schema": [],
    "schema_rating_mismatch": [],
    "missing_sitemap": [],
    "noindex_public_pages": [],
}

for filepath in html_files:
    rel = os.path.relpath(filepath, site_dir).replace("\\", "/")
    if any(rel.startswith(p) for p in [".netlify", "node_modules", "scratch", "tmp"]):
        continue

    is_excluded = rel in excluded_files

    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    # Determine expected clean URL
    if rel == "index.html":
        expected_url = "https://www.herehandyman.com/"
    elif rel.endswith("/index.html"):
        expected_url = f"https://www.herehandyman.com/{rel[:-10]}"
    else:
        expected_url = f"https://www.herehandyman.com/{rel[:-5]}"

    if is_excluded:
        audit_results["excluded_pages"] += 1
        # Verify noindex or exclusion
        if expected_url in sitemap_urls:
            audit_results["missing_sitemap"].append((rel, f"Excluded file {rel} should NOT be in sitemap"))
        continue

    audit_results["public_pages"] += 1

    # 1. Sitemap Check
    if expected_url not in sitemap_urls:
        audit_results["missing_sitemap"].append((rel, expected_url))

    # 2. Canonical Tag
    canonical_match = re.search(r'<link\s+(?:[^>]*?\s+)?rel=["\']canonical["\']\s+(?:[^>]*?\s+)?href=["\']([^"\']+)["\']', content, re.IGNORECASE)
    if not canonical_match:
        canonical_match = re.search(r'<link\s+(?:[^>]*?\s+)?href=["\']([^"\']+)["\']\s+(?:[^>]*?\s+)?rel=["\']canonical["\']', content, re.IGNORECASE)

    if not canonical_match:
        audit_results["missing_canonical"].append(rel)
    else:
        canonical_url = canonical_match.group(1).strip()
        if canonical_url != expected_url:
            audit_results["mismatched_canonical"].append((rel, canonical_url, expected_url))

    # 3. Meta Robots Check
    robots_match = re.search(r'<meta\s+(?:[^>]*?\s+)?name=["\']robots["\']\s+(?:[^>]*?\s+)?content=["\']([^"\']+)["\']', content, re.IGNORECASE) or \
                   re.search(r'<meta\s+(?:[^>]*?\s+)?content=["\']([^"\']+)["\']\s+(?:[^>]*?\s+)?name=["\']robots["\']', content, re.IGNORECASE)
    if robots_match and "noindex" in robots_match.group(1).lower():
        audit_results["noindex_public_pages"].append(rel)

    # 4. Title Tag
    title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE | re.DOTALL)
    if not title_match or not title_match.group(1).strip():
        audit_results["missing_title"].append(rel)

    # 5. Meta Description
    desc_match = re.search(r'<meta\s+(?:[^>]*?\s+)?name=["\']description["\']\s+(?:[^>]*?\s+)?content=["\']([^"\']+)["\']', content, re.IGNORECASE) or \
                 re.search(r'<meta\s+(?:[^>]*?\s+)?content=["\']([^"\']+)["\']\s+(?:[^>]*?\s+)?name=["\']description["\']', content, re.IGNORECASE)
    if not desc_match or not desc_match.group(1).strip():
        audit_results["missing_description"].append(rel)

    # 6. H1 Tag
    h1_matches = re.findall(r'<h1[^>]*>(.*?)</h1>', content, re.IGNORECASE | re.DOTALL)
    if len(h1_matches) == 0:
        audit_results["missing_h1"].append(rel)
    elif len(h1_matches) > 1:
        audit_results["multiple_h1"].append((rel, len(h1_matches)))

    # 7. JSON-LD Schema
    if '<script type="application/ld+json">' not in content:
        audit_results["missing_schema"].append(rel)
    else:
        # Check review rating if aggregateRating present
        rating_match = re.search(r'"ratingValue"\s*:\s*"(5\.0|5)"', content)
        review_count_match = re.search(r'"reviewCount"\s*:\s*"(26|28)"', content)
        if "aggregateRating" in content:
            if not rating_match:
                audit_results["schema_rating_mismatch"].append((rel, "Rating value not 5.0"))
            if not review_count_match:
                audit_results["schema_rating_mismatch"].append((rel, "Review count mismatch"))

print("====================================================")
print("🔍 GOOGLE SEARCH CONSOLE INDEXING & TECHNICAL SEO AUDIT")
print("====================================================")
print(f"Total HTML files audited: {audit_results['total_pages']}")
print(f"Public Indexable Pages: {audit_results['public_pages']}")
print(f"Excluded Private Pages: {audit_results['excluded_pages']}")
print(f"URLs in Sitemap: {len(sitemap_urls)}")
print("----------------------------------------------------")
print(f"❌ Missing Canonical Tags: {len(audit_results['missing_canonical'])}")
for p in audit_results['missing_canonical']:
    print(f"   - {p}")

print(f"❌ Mismatched Canonical URLs: {len(audit_results['mismatched_canonical'])}")
for p, got, exp in audit_results['mismatched_canonical']:
    print(f"   - {p}: Got '{got}' vs Expected '{exp}'")

print(f"❌ Public Pages with Noindex: {len(audit_results['noindex_public_pages'])}")
for p in audit_results['noindex_public_pages']:
    print(f"   - {p}")

print(f"❌ Missing Sitemap Entry: {len(audit_results['missing_sitemap'])}")
for p in audit_results['missing_sitemap']:
    print(f"   - {p}")

print(f"❌ Missing Title Tag: {len(audit_results['missing_title'])}")
for p in audit_results['missing_title']:
    print(f"   - {p}")

print(f"❌ Missing Meta Description: {len(audit_results['missing_description'])}")
for p in audit_results['missing_description']:
    print(f"   - {p}")

print(f"⚠️ Missing H1 Tag: {len(audit_results['missing_h1'])}")
for p in audit_results['missing_h1']:
    print(f"   - {p}")

print(f"⚠️ Multiple H1 Tags: {len(audit_results['multiple_h1'])}")
for p, count in audit_results['multiple_h1']:
    print(f"   - {p} ({count} H1s)")

print(f"❌ Missing Schema Markup: {len(audit_results['missing_schema'])}")
for p in audit_results['missing_schema']:
    print(f"   - {p}")

print(f"⚠️ Schema Rating / Count Mismatches: {len(audit_results['schema_rating_mismatch'])}")
for p, reason in audit_results['schema_rating_mismatch']:
    print(f"   - {p}: {reason}")
print("====================================================")
