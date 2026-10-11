import glob
import re
import xml.etree.ElementTree as ET
from collections import Counter
import sys
from bs4 import BeautifulSoup

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

# 1. Check sitemap
tree = ET.parse('sitemap.xml')
root = tree.getroot()
ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
sitemap_urls = set()
for url in root.findall('sm:url', ns):
    loc = url.find('sm:loc', ns).text.strip()
    sitemap_urls.add(loc)

print(f"=== SITEMAP AUDIT ===")
print(f"Total URLs in sitemap: {len(sitemap_urls)}")

# 2. Check all HTML pages
html_files = sorted([f.replace('\\', '/') for f in glob.glob('**/*.html', recursive=True) if not any(x in f for x in ['node_modules', '.netlify', 'scratch'])])

public_pages = []
private_pages = []

titles = {}
descriptions = {}
h1s = {}
canonicals = {}

missing_title = []
missing_desc = []
missing_h1 = []
missing_canonical = []
sitemap_noindex = []

for fn in html_files:
    with open(fn, 'r', encoding='utf-8') as fp:
        soup = BeautifulSoup(fp.read(), 'html.parser')
    
    # Check noindex
    robots = soup.find('meta', attrs={'name': lambda v: v and v.lower() == 'robots'})
    is_noindex = bool(robots and 'noindex' in robots.get('content', '').lower())
    
    # Title
    t_tag = soup.find('title')
    t = t_tag.get_text().strip() if t_tag else None
    
    # Description
    d_tag = soup.find('meta', attrs={'name': lambda v: v and v.lower() == 'description'})
    d = d_tag.get('content', '').strip() if d_tag else None
    
    # H1
    h1_tag = soup.find('h1')
    h1 = h1_tag.get_text().strip() if h1_tag else None
    
    # Canonical
    can_tag = soup.find('link', attrs={'rel': lambda v: v and 'canonical' in [x.lower() for x in (v if isinstance(v, list) else [v])]})
    can = can_tag.get('href', '').strip() if can_tag else None
    
    if is_noindex or any(x in fn for x in ['dashboard', 'timer', 'login', 'crm', 'schedule', 'merge-photos', '404']):
        private_pages.append((fn, is_noindex, can))
    else:
        public_pages.append(fn)
        if not t: missing_title.append(fn)
        else: titles[fn] = t
        
        if not d: missing_desc.append(fn)
        else: descriptions[fn] = d
        
        if not h1: missing_h1.append(fn)
        else: h1s[fn] = h1
        
        if not can: missing_canonical.append(fn)
        else: canonicals[fn] = can
        
        # Check sitemap vs noindex
        slug = '' if fn == 'index.html' else fn.replace('.html', '').replace('/index', '')
        expected_url = f"https://www.herehandyman.com/{slug}".rstrip('/')
        if expected_url in sitemap_urls and is_noindex:
            sitemap_noindex.append((fn, expected_url))

print(f"\n=== PAGE COUNTS & COMPLETENESS ===")
print(f"Public indexable pages analyzed: {len(public_pages)}")
print(f"Private / Internal utility pages: {len(private_pages)}")
print(f"Missing Titles: {len(missing_title)} {missing_title}")
print(f"Missing Descriptions: {len(missing_desc)} {missing_desc}")
print(f"Missing H1s: {len(missing_h1)} {missing_h1}")
print(f"Missing Canonicals: {len(missing_canonical)} {missing_canonical}")
print(f"Sitemap URLs with noindex: {len(sitemap_noindex)} {sitemap_noindex}")

# Duplicate Titles
title_counts = Counter(titles.values())
dup_titles = {k: v for k, v in title_counts.items() if v > 1}
print(f"\n=== DUPLICATE CHECKS ===")
print(f"Duplicate titles: {len(dup_titles)}")
if dup_titles:
    for t, cnt in dup_titles.items():
        pages = [p for p, val in titles.items() if val == t]
        print(f"  - '{t}' ({cnt} times): {pages}")

# Duplicate Descriptions
desc_counts = Counter(descriptions.values())
dup_descs = {k: v for k, v in desc_counts.items() if v > 1}
print(f"Duplicate descriptions: {len(dup_descs)}")
if dup_descs:
    for d, cnt in dup_descs.items():
        pages = [p for p, val in descriptions.items() if val == d]
        print(f"  - '{d[:60]}...' ({cnt} times): {pages}")

# Duplicate H1s
h1_counts = Counter(h1s.values())
dup_h1s = {k: v for k, v in h1_counts.items() if v > 1}
print(f"Duplicate H1s: {len(dup_h1s)}")
if dup_h1s:
    for h, cnt in dup_h1s.items():
        pages = [p for p, val in h1s.items() if val == h]
        print(f"  - '{h}' ({cnt} times): {pages}")

# Canonical collisions
can_counts = Counter(canonicals.values())
dup_cans = {k: v for k, v in can_counts.items() if v > 1}
print(f"\n=== CANONICAL INTEGRITY ===")
print(f"Canonical collisions (different files pointing to same canonical): {len(dup_cans)}")
if dup_cans:
    for c, cnt in dup_cans.items():
        pages = [p for p, val in canonicals.items() if val == c]
        print(f"  - '{c}' ({cnt} times): {pages}")

# Check 404.html
with open('404.html', 'r', encoding='utf-8') as fp:
    c404 = fp.read()
has_404_noindex = '<meta name="robots" content="noindex' in c404
has_404_canonical = 'rel="canonical"' in c404 or 'rel=\'canonical\'' in c404
print(f"\n=== 404 BEHAVIOR ===")
print(f"404.html has noindex meta: {has_404_noindex}")
print(f"404.html has /404 canonical: {has_404_canonical}")

# Check Redirects
with open('_redirects', 'r', encoding='utf-8') as fp:
    reds = fp.read()

has_apex_red = 'https://herehandyman.com/*' in reds and 'https://www.herehandyman.com/:splat' in reds
has_privacy_red = '/privacy' in reds and '/privacy-policy' in reds
has_book_appt_red = '/book-appointment' in reds and '/book' in reds

print(f"\n=== REDIRECTS CHECK ===")
print(f"Apex -> www in _redirects: {has_apex_red}")
print(f"/privacy -> /privacy-policy in _redirects: {has_privacy_red}")
print(f"/book-appointment -> /book in _redirects: {has_book_appt_red}")
