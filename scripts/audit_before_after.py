import os
import re
import json

# 1. Parse gallery.html
with open('gallery.html', 'r', encoding='utf-8') as f:
    gallery_html = f.read()

# Extract PROJECTS array objects using a robust regex or line parsing
gallery_projects = []
for line in gallery_html.split('\n'):
    if '{ id:' in line and 'title:' in line:
        # extract fields
        m_id = re.search(r'id:\s*"([^"]+)"', line)
        m_title = re.search(r'title:\s*"([^"]+)"', line)
        m_town = re.search(r'town:\s*"([^"]+)"', line)
        m_place = re.search(r'place:\s*"([^"]+)"', line)
        m_tag = re.search(r'tag:\s*"([^"]+)"', line)
        m_before = re.search(r'before:\s*([^,]+),', line)
        m_after = re.search(r'after:\s*([^\s}]+)\s*\}', line)
        
        b_val = m_before.group(1).strip() if m_before else ''
        a_val = m_after.group(1).strip() if m_after else ''
        
        b_val = b_val.replace('IMG+"', '/assets/images/before-after').replace('IMG+\'', '/assets/images/before-after').replace('"', '').replace("'", "")
        a_val = a_val.replace('IMG+"', '/assets/images/before-after').replace('IMG+\'', '/assets/images/before-after').replace('"', '').replace("'", "")
        
        gallery_projects.append({
            'id': m_id.group(1) if m_id else '',
            'title': m_title.group(1) if m_title else '',
            'town': m_town.group(1) if m_town else '',
            'place': m_place.group(1) if m_place else '',
            'tag': m_tag.group(1) if m_tag else '',
            'before': b_val,
            'after': a_val
        })

print(f'Total projects in gallery.html: {len(gallery_projects)}')

# 2. Parse index.html carousel slides
with open('index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

# Extract each figure.ba-slide block
slide_blocks = re.findall(r'<figure class="ba-slide"[^>]*>(.*?)</figure>', index_html, re.DOTALL)
print(f'Total slides in index.html carousel: {len(slide_blocks)}')

index_slides = []
for i, block in enumerate(slide_blocks):
    imgs = re.findall(r'<img [^>]*src="([^"]+)"[^>]*alt="([^"]*)"', block)
    if not imgs:
        # try alt before src
        imgs = re.findall(r'<img [^>]*alt="([^"]*)"[^>]*src="([^"]+)"', block)
        imgs = [(src, alt) for alt, src in imgs]
    
    caption_m = re.search(r'<figcaption[^>]*>(.*?)</figcaption>', block, re.DOTALL)
    caption = re.sub(r'\s+', ' ', caption_m.group(1)).strip() if caption_m else ''
    
    b_img = imgs[0] if len(imgs) > 0 else ('', '')
    a_img = imgs[1] if len(imgs) > 1 else ('', '')
    
    index_slides.append({
        'index': i + 1,
        'caption': caption,
        'before_src': b_img[0],
        'before_alt': b_img[1],
        'after_src': a_img[0],
        'after_alt': a_img[1]
    })

# Check file existence and sizes for both
print('\n=== CHECKING GALLERY IMAGE INTEGRITY ===')
town_counts = {}
white_plains_in_gallery = []
for p in gallery_projects:
    t = p['town']
    town_counts[t] = town_counts.get(t, 0) + 1
    if 'white plains' in t.lower() or 'white plains' in p['place'].lower():
        white_plains_in_gallery.append(p)
    
    b_path = p['before'].lstrip('/')
    a_path = p['after'].lstrip('/')
    b_ok = os.path.exists(b_path) and os.path.getsize(b_path) > 0
    a_ok = os.path.exists(a_path) and os.path.getsize(a_path) > 0
    if not b_ok or not a_ok:
        print(f"BROKEN FILE in Gallery [{p['id']}]: before={b_path} (exists={os.path.exists(b_path)}), after={a_path} (exists={os.path.exists(a_path)})")

print('\nGallery Projects by Town:')
for t, c in sorted(town_counts.items(), key=lambda x: -x[1]):
    print(f"  {t}: {c}")

print(f'\nTotal White Plains projects in gallery: {len(white_plains_in_gallery)}')
for wp in white_plains_in_gallery:
    print(f"  - [{wp['id']}] {wp['title']} ({wp['tag']})")

print('\n=== CHECKING INDEX.HTML CAROUSEL SLIDES ===')
white_plains_in_index = []
broken_in_index = []
for s in index_slides:
    b_path = s['before_src'].lstrip('/')
    a_path = s['after_src'].lstrip('/')
    b_ok = os.path.exists(b_path) and os.path.getsize(b_path) > 0
    a_ok = os.path.exists(a_path) and os.path.getsize(a_path) > 0
    if not b_ok or not a_ok:
        broken_in_index.append((s['index'], s['caption'], b_path, a_path))
    if 'white plains' in s['caption'].lower():
        white_plains_in_index.append(s)

print(f'Broken images in index carousel: {len(broken_in_index)}')
for bi in broken_in_index:
    print('  BROKEN:', bi)

print(f'\nTotal White Plains slides in index.html carousel: {len(white_plains_in_index)}')
for wps in white_plains_in_index:
    print(f"  - Slide {wps['index']}: {wps['caption']}")

# Check all images in assets/images/before-after/
print('\n=== ASSETS/IMAGES/BEFORE-AFTER AUDIT ===')
ba_files = os.listdir('assets/images/before-after')
webp_files = [f for f in ba_files if f.endswith('.webp')]
non_webp = [f for f in ba_files if not f.endswith('.webp')]
zero_bytes = [f for f in ba_files if os.path.getsize(os.path.join('assets/images/before-after', f)) == 0]
wp_filenames = [f for f in ba_files if 'white_plains' in f.lower()]

print(f'Total files: {len(ba_files)}')
print(f'WebP files: {len(webp_files)}')
print(f'Non-WebP files: {len(non_webp)} ({non_webp})')
print(f'0-byte files: {len(zero_bytes)} ({zero_bytes})')
print(f'Files with white_plains in filename: {len(wp_filenames)}')
for wpf in wp_filenames:
    print(f'  - {wpf}')
