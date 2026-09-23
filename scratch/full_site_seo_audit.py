import os
import sys
import re
import xml.etree.ElementTree as ET

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

sitemap_path = r"c:\Users\davi6\.gemini\antigravity\scratch\here-handyman\sitemap.xml"
base_dir = r"c:\Users\davi6\.gemini\antigravity\scratch\here-handyman"

print("=================================================================")
print("COMPREHENSIVE GSC & SITE HEALTH AUDIT")
print("=================================================================\n")

# 1. Parse sitemap.xml
tree = ET.parse(sitemap_path)
root = tree.getroot()
ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

sitemap_urls = []
for url_tag in root.findall('sm:url', ns):
    loc = url_tag.find('sm:loc', ns)
    if loc is not None:
        sitemap_urls.append(loc.text)

print(f"Found {len(sitemap_urls)} URLs in sitemap.xml\n")

# 2. Audit local HTML files for canonicals and meta tags
html_files = []
for dirpath, dirs, filenames in os.walk(base_dir):
    dirs[:] = [d for d in dirs if d not in ['.git', '.system_generated', 'node_modules', 'scratch', 'brain']]
    for f in filenames:
        if f.endswith('.html'):
            html_files.append(os.path.join(dirpath, f))

print(f"Auditing {len(html_files)} HTML files in codebase...")

missing_title = []
missing_desc = []
missing_canonical = []

for filepath in html_files:
    rel_path = os.path.relpath(filepath, base_dir).replace('\\', '/')
    
    # Exclude private app pages
    if rel_path in ['dashboard.html', 'invoice.html', 'login.html']:
        continue

    with open(filepath, 'r', encoding='utf-8', errors='ignore') as file:
        content = file.read()

    # Title check
    if not re.search(r'<title>.*?</title>', content, re.IGNORECASE | re.DOTALL):
        missing_title.append(rel_path)

    # Description check (order-agnostic)
    if not (re.search(r'name=["\']description["\']', content, re.IGNORECASE) or re.search(r'content=["\'][^"\']+["\']\s+name=["\']description["\']', content, re.IGNORECASE)):
        missing_desc.append(rel_path)

    # Canonical check (order-agnostic)
    if not (re.search(r'rel=["\']canonical["\']', content, re.IGNORECASE)):
        missing_canonical.append(rel_path)

print(f"\nResults:")
print(f"  Total Public HTML Files: {len(html_files) - 3}")
print(f"  Missing Title:           {len(missing_title)}")
print(f"  Missing Description:     {len(missing_desc)}")
print(f"  Missing Canonical:       {len(missing_canonical)}")

if missing_title:
    print("  Title Issues:", missing_title)
if missing_desc:
    print("  Description Issues:", missing_desc)
if missing_canonical:
    print("  Canonical Issues:", missing_canonical)

print("\n================================================ Audit Complete!")
