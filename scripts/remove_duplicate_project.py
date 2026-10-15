import os
import re

def remove_from_gallery():
    with open('gallery.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to remove general-dobbs-ferry
    pattern = r'\s*\{\s*id:"general-dobbs-ferry"[^}]+},\n?'
    content, count = re.subn(pattern, '', content)
    print(f"Removed from gallery.html: {count} occurrence(s)")

    with open('gallery.html', 'w', encoding='utf-8') as f:
        f.write(content)

def remove_from_index():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to remove the duplicate slide
    pattern = r'\s*<!-- Job 16: General Maintenance & Repair — Dobbs Ferry, NY -->\s*<figure class="ba-slide"[\s\S]*?</figure>\n?'
    content, count = re.subn(pattern, '', content)
    print(f"Removed from index.html: {count} slide(s)")

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)

def delete_images():
    files = [
        'assets/images/before-after/herehandyman_before.webp',
        'assets/images/before-after/herehandyman_after.webp'
    ]
    for fn in files:
        if os.path.exists(fn):
            os.remove(fn)
            print(f"[DELETED] {fn}")
        else:
            print(f"[SKIPPED] {fn} not found")

if __name__ == '__main__':
    remove_from_gallery()
    remove_from_index()
    delete_images()
