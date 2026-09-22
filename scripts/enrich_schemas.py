import os
import sys
import glob

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

site_dir = r"c:\Users\davi6\.gemini\antigravity\scratch\here-handyman"
html_files = glob.glob(os.path.join(site_dir, "**", "*.html"), recursive=True)

old_provider = '"provider":{"@type":"LocalBusiness","name":"Here Handyman","telephone":"+1-516-350-0801"}'

new_provider = '"provider":{"@type":"HomeAndConstructionBusiness","@id":"https://www.herehandyman.com/#business","name":"Here Handyman","telephone":"+1-516-350-0801","url":"https://www.herehandyman.com","image":"https://www.herehandyman.com/assets/images/og-image.webp","priceRange":"$$","address":{"@type":"PostalAddress","addressLocality":"White Plains","addressRegion":"NY","postalCode":"10607","addressCountry":"US"}}'

updated_count = 0
for f in html_files:
    rel = os.path.relpath(f, site_dir)
    with open(f, "r", encoding="utf-8", errors="ignore") as file:
        content = file.read()
    
    if old_provider in content:
        content = content.replace(old_provider, new_provider)
        with open(f, "w", encoding="utf-8") as file:
            file.write(content)
        updated_count += 1
        print(f"  ✓ Updated provider schema: {rel}")

print(f"\n🎉 Successfully enriched provider schema in {updated_count} files!")
