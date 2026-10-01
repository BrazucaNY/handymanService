import os
import sys
import glob
from datetime import datetime

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

site_dir = r"c:\Users\davi6\.gemini\antigravity\scratch\here-handyman"
sitemap_path = os.path.join(site_dir, "sitemap.xml")

html_files = glob.glob(os.path.join(site_dir, "**", "*.html"), recursive=True)

pages = []
for f in html_files:
    rel = os.path.relpath(f, site_dir).replace("\\", "/")
    
    # Exclude internal, admin, and non-indexable utility pages
    if any(rel == p or rel.startswith(p) for p in [".netlify", "node_modules", "dashboard.html", "login.html", "404.html", "timer.html", "schedule.html", "merge-photos.html"]):
        continue
    
    # Get actual file last modification date
    mtime = os.path.getmtime(f)
    lastmod = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')
    
    if rel == "index.html":
        url = "https://www.herehandyman.com/"
        priority = "1.0"
        changefreq = "daily"
    elif rel in ["services.html", "book.html", "reviews.html", "about.html", "offer.html"]:
        url = f"https://www.herehandyman.com/{rel[:-5]}"
        priority = "0.95"
        changefreq = "daily"
    elif rel == "blog/index.html":
        url = "https://www.herehandyman.com/blog/"
        priority = "0.90"
        changefreq = "weekly"
    elif rel.startswith("blog/"):
        url = f"https://www.herehandyman.com/{rel[:-5]}"
        priority = "0.80"
        changefreq = "monthly"
    else:
        url = f"https://www.herehandyman.com/{rel[:-5]}"
        priority = "0.85"
        changefreq = "weekly"
        
    pages.append((url, lastmod, changefreq, priority))

# Sort: homepage first, then high priority, then URL
pages.sort(key=lambda x: (0 if x[0] == "https://www.herehandyman.com/" else 1, float(x[3]) * -1, x[0]))

xml_lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
]

for url, lastmod, changefreq, prio in pages:
    xml_lines.append("  <url>")
    xml_lines.append(f"    <loc>{url}</loc>")
    xml_lines.append(f"    <lastmod>{lastmod}</lastmod>")
    xml_lines.append(f"    <changefreq>{changefreq}</changefreq>")
    xml_lines.append(f"    <priority>{prio}</priority>")
    xml_lines.append("  </url>")

xml_lines.append("</urlset>")

with open(sitemap_path, "w", encoding="utf-8") as f:
    f.write("\n".join(xml_lines) + "\n")

print(f"✅ Successfully regenerated sitemap.xml with {len(pages)} URLs and real per-page lastmod dates!")
