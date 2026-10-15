import os
import re
import hashlib
from PIL import Image

def dhash(image, hash_size=8):
    # Grayscale and resize to (hash_size + 1, hash_size)
    image = image.convert('L').resize((hash_size + 1, hash_size), Image.Resampling.LANCZOS)
    pixels = list(image.getdata())
    # Compare adjacent pixels
    difference = []
    for row in range(hash_size):
        for col in range(hash_size):
            pixel_left = pixels[row * (hash_size + 1) + col]
            pixel_right = pixels[row * (hash_size + 1) + col + 1]
            difference.append(pixel_left > pixel_right)
    # Convert binary array to hex string
    decimal_value = 0
    hex_string = []
    for index, value in enumerate(difference):
        if value:
            decimal_value += 2 ** (index % 8)
        if (index % 8) == 7:
            hex_string.append(hex(decimal_value)[2:].rjust(2, '0'))
            decimal_value = 0
    return ''.join(hex_string)

def hamming_distance(s1, s2):
    return bin(int(s1, 16) ^ int(s2, 16)).count('1')

def audit_gallery():
    print("=== 1. AUDITING GALLERY.HTML ===")
    with open('gallery.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Match each project object
    project_matches = re.findall(r'\{\s*id:"([^"]+)"[\s\S]*?\}', content)
    print(f"Total projects in gallery.html: {len(project_matches)}")

    projects = []
    for p_id in project_matches:
        # find full block for p_id
        pattern = r'\{\s*id:"' + re.escape(p_id) + r'"[\s\S]*?\}'
        block = re.search(pattern, content)
        if block:
            b_text = block.group(0)
            title = re.search(r'title:"([^"]+)"', b_text)
            town = re.search(r'town:"([^"]+)"', b_text)
            b_img = re.search(r'before:(IMG\+)?["\']([^"\']+)["\']', b_text)
            a_img = re.search(r'after:(IMG\+)?["\']([^"\']+)["\']', b_text)
            projects.append({
                'id': p_id,
                'title': title.group(1) if title else '',
                'town': town.group(1) if town else '',
                'before': b_img.group(2) if b_img else '',
                'after': a_img.group(2) if a_img else ''
            })

    ids = set()
    dup_ids = []
    titles = set()
    dup_titles = []
    before_map = {}
    dup_befores = []
    after_map = {}
    dup_afters = []
    same_ba = []

    for p in projects:
        # ID check
        if p['id'] in ids:
            dup_ids.append(p['id'])
        ids.add(p['id'])

        # Title check
        if p['title'] in titles:
            dup_titles.append((p['id'], p['title']))
        titles.add(p['title'])

        # Before image check
        if p['before']:
            if p['before'] in before_map:
                dup_befores.append((p['id'], p['before'], before_map[p['before']]))
            before_map[p['before']] = p['id']

        # After image check
        if p['after']:
            if p['after'] in after_map:
                dup_afters.append((p['id'], p['after'], after_map[p['after']]))
            after_map[p['after']] = p['id']

        # Same before/after check
        if p['before'] and p['after'] and p['before'] == p['after']:
            same_ba.append(p['id'])

    print(f"Duplicate IDs: {dup_ids}")
    print(f"Duplicate Titles: {dup_titles}")
    print(f"Duplicate Before Images across different projects: {len(dup_befores)}")
    for d in dup_befores:
        print(f"  {d}")
    print(f"Duplicate After Images across different projects: {len(dup_afters)}")
    for d in dup_afters:
        print(f"  {d}")
    print(f"Projects with identical Before & After images: {same_ba}")

def audit_index_carousel():
    print("\n=== 2. AUDITING INDEX.HTML CAROUSEL ===")
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    slides = re.findall(r'<figure class="ba-slide"[\s\S]*?</figure>', content)
    print(f"Total slides in carousel: {len(slides)}")

    pairs = []
    dup_slides = []
    seen_pairs = {}

    for i, s in enumerate(slides):
        imgs = re.findall(r'src="([^"]+)"', s)
        fig = re.search(r'<figcaption[^>]*>([\s\S]*?)</figcaption>', s)
        fig_text = re.sub(r'\s+', ' ', fig.group(1)).strip() if fig else f"Slide {i+1}"
        
        b_img = imgs[0] if len(imgs) > 0 else ''
        a_img = imgs[1] if len(imgs) > 1 else ''
        
        pair_key = (b_img, a_img)
        if pair_key in seen_pairs:
            dup_slides.append({
                'current_slide': i + 1,
                'first_slide': seen_pairs[pair_key]['slide'],
                'caption': fig_text,
                'pair': pair_key
            })
        else:
            seen_pairs[pair_key] = {'slide': i + 1, 'caption': fig_text}

    print(f"Duplicate slides in index.html carousel: {len(dup_slides)}")
    for d in dup_slides:
        print(f"  Slide #{d['current_slide']} is a duplicate of Slide #{d['first_slide']}: {d['caption']}")
        print(f"    Images: {d['pair']}")

def audit_image_files_perceptual():
    print("\n=== 3. AUDITING IMAGE FILES IN ASSETS/IMAGES/BEFORE-AFTER ===")
    img_dir = 'assets/images/before-after'
    files = [f for f in os.listdir(img_dir) if f.endswith(('.webp', '.jpg', '.png'))]
    print(f"Total image files: {len(files)}")

    # Compute dhash for each
    hashes = {}
    corrupt = []
    for f in files:
        p = os.path.join(img_dir, f)
        try:
            im = Image.open(p)
            h = dhash(im)
            hashes[f] = h
        except Exception as e:
            corrupt.append((f, str(e)))

    print(f"Corrupt / Unreadable images: {len(corrupt)}")

    # Check for identical perceptual hashes (hamming distance <= 1)
    file_list = list(hashes.keys())
    near_dups = []
    for i in range(len(file_list)):
        for j in range(i + 1, len(file_list)):
            f1 = file_list[i]
            f2 = file_list[j]
            dist = hamming_distance(hashes[f1], hashes[f2])
            if dist == 0:
                near_dups.append((f1, f2, "EXACT_VISUAL_MATCH"))
            elif dist <= 2:
                # Ignore before vs after of same job (they shouldn't be identical, but let's see)
                near_dups.append((f1, f2, f"VERY_SIMILAR (dist={dist})"))

    print(f"Visually identical / near-duplicate image pairs: {len(near_dups)}")
    for nd in near_dups:
        print(f"  {nd[0]} <==> {nd[1]} [{nd[2]}]")

if __name__ == '__main__':
    audit_gallery()
    audit_index_carousel()
    audit_image_files_perceptual()
