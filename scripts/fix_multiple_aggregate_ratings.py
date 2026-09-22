import os
import sys
import glob
import json
from bs4 import BeautifulSoup

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

site_dir = r"c:\Users\davi6\.gemini\antigravity\scratch\here-handyman"
html_files = glob.glob(os.path.join(site_dir, "**", "*.html"), recursive=True)

fixed_count = 0

for f in html_files:
    rel = os.path.relpath(f, site_dir)
    if any(rel.startswith(p) for p in [".netlify", "node_modules"]):
        continue
    
    with open(f, "r", encoding="utf-8", errors="ignore") as file:
        content = file.read()
    
    soup = BeautifulSoup(content, "html.parser")
    schemas = soup.find_all("script", type="application/ld+json")
    
    file_modified = False
    for s in schemas:
        if not s.string: continue
        try:
            data = json.loads(s.string.strip())
            
            # Helper to remove nested aggregateRating inside provider
            def clean_provider(obj):
                modified = False
                if isinstance(obj, dict):
                    if "provider" in obj and isinstance(obj["provider"], dict):
                        if "aggregateRating" in obj["provider"]:
                            del obj["provider"]["aggregateRating"]
                            modified = True
                    for k, v in obj.items():
                        if clean_provider(v): modified = True
                elif isinstance(obj, list):
                    for item in obj:
                        if clean_provider(item): modified = True
                return modified

            if clean_provider(data):
                s.string = json.dumps(data, ensure_ascii=False)
                file_modified = True
        except Exception as e:
            pass
            
    if file_modified:
        with open(f, "w", encoding="utf-8") as file:
            file.write(str(soup))
        fixed_count += 1
        print(f"  ✓ Fixed provider aggregateRating in: {rel}")

print(f"\n🎉 Cleaned multiple aggregateRating schema errors in {fixed_count} files!")
