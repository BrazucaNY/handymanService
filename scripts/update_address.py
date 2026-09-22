import os
import sys
import glob

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

site_dir = r"c:\Users\davi6\.gemini\antigravity\scratch\here-handyman"
html_files = glob.glob(os.path.join(site_dir, "**", "*.html"), recursive=True)

old_addr1 = '"address":{"@type":"PostalAddress","addressLocality":"White Plains","addressRegion":"NY","postalCode":"10607","addressCountry":"US"}'
new_addr1 = '"address":{"@type":"PostalAddress","streetAddress":"500 Pondside Dr","addressLocality":"White Plains","addressRegion":"NY","postalCode":"10607","addressCountry":"US"}'

old_meta = '<meta name="business:contact_data:street_address" content="White Plains, NY 10607">'
new_meta = '<meta name="business:contact_data:street_address" content="500 Pondside Dr, White Plains, NY 10607">'

updated_files = 0
for f in html_files:
    rel = os.path.relpath(f, site_dir)
    with open(f, "r", encoding="utf-8", errors="ignore") as file:
        content = file.read()
    
    modified = False
    if old_addr1 in content:
        content = content.replace(old_addr1, new_addr1)
        modified = True
    if old_meta in content:
        content = content.replace(old_meta, new_meta)
        modified = True
        
    if modified:
        with open(f, "w", encoding="utf-8") as file:
            file.write(content)
        updated_files += 1
        print(f"  ✓ Updated streetAddress in: {rel}")

print(f"\n🎉 Successfully updated street address to '500 Pondside Dr, White Plains, NY 10607' in {updated_files} HTML files!")
