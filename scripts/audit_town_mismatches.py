import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    idx_content = f.read()

with open('gallery.html', 'r', encoding='utf-8') as f:
    gal_content = f.read()

# Extract ba-slides from index.html
slides = re.findall(r'<figure class="ba-slide".*?</figcaption>\s*</figure>', idx_content, re.DOTALL)
print(f'Total carousel slides in index.html: {len(slides)}')

mismatches = []
for s in slides:
    imgs = re.findall(r'src="(/assets/images/[^"]+)"', s)
    caption_match = re.search(r'<figcaption[^>]*>(.*?)</figcaption>', s, re.DOTALL)
    caption = caption_match.group(1) if caption_match else ''
    
    # Extract town from caption e.g. '— Harrison, NY'
    town_in_caption = ''
    t_match = re.search(r'—\s*([A-Za-z\s\-]+),\s*NY', caption)
    if t_match:
        town_in_caption = t_match.group(1).strip()
        
    for img in imgs:
        filename = img.split('/')[-1]
        town_in_file = ''
        for t in ['scarsdale', 'white_plains', 'harrison', 'yonkers', 'rye', 'hastings', 'armonk', 'larchmont', 'mamaroneck', 'bronxville', 'chappaqua', 'bedford', 'tarrytown', 'hartsdale', 'elmsford', 'greenburgh']:
            if t in filename:
                town_in_file = t.replace('_', ' ').title()
                break
        if town_in_file and town_in_caption:
            t_file_clean = town_in_file.lower().replace(' ', '')
            t_cap_clean = town_in_caption.lower().replace(' ', '')
            if t_file_clean not in t_cap_clean and t_cap_clean not in t_file_clean:
                mismatches.append(('index_carousel', filename, town_in_file, caption, town_in_caption))

print(f'\n=== CAROUSEL TOWN VS FILENAME MISMATCHES ({len(mismatches)}) ===')
for m in mismatches:
    print(f"File: {m[1]} (File town: {m[2]}) vs Caption: '{m[3]}' (Caption town: {m[4]})")

# Also check PROJECTS array in gallery.html vs filenames
proj_matches = re.findall(r'\{\s*id:"([^"]+)",\s*title:"([^"]+)",\s*town:"([^"]+)",\s*place:"([^"]+)",[^}]*before:([^\n,]+),[^}]*after:([^\n,]+)[^}]*\}', gal_content)
print(f'\nTotal PROJECTS in gallery.html: {len(proj_matches)}')

gal_mismatches = []
for p in proj_matches:
    p_id, p_title, p_town, p_place, p_before, p_after = p
    for img_str in [p_before, p_after]:
        img_clean = img_str.replace('IMG+"/', '').replace('"', '').strip()
        filename = img_clean.split('/')[-1]
        town_in_file = ''
        for t in ['scarsdale', 'white_plains', 'harrison', 'yonkers', 'rye', 'hastings', 'armonk', 'larchmont', 'mamaroneck', 'bronxville', 'chappaqua', 'bedford', 'tarrytown', 'hartsdale', 'elmsford', 'greenburgh']:
            if t in filename:
                town_in_file = t.replace('_', ' ').title()
                break
        if town_in_file and p_town:
            t_file_clean = town_in_file.lower().replace(' ', '')
            t_town_clean = p_town.lower().replace(' ', '')
            if t_file_clean not in t_town_clean and t_town_clean not in t_file_clean:
                gal_mismatches.append((p_id, p_title, p_town, filename, town_in_file))

print(f'\n=== GALLERY TOWN VS FILENAME MISMATCHES ({len(gal_mismatches)}) ===')
for g in gal_mismatches:
    print(f"Gallery ID: {g[0]} | Title: {g[1]} | Town prop: '{g[2]}' vs File: {g[3]} (File town: '{g[4]}')")
