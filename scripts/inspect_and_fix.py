import glob
import re

def check_photos():
    files = ['index.html', 'gallery.html', 'book.html']
    photo_keywords = [
        'garage', 'gutter', 'roku', 'closet', 'toilet',
        'kitchen_flush_mount_light', 'kitchen_floating_shelves',
        'dog_crate', 'bathroom_mirror', 'bidet'
    ]
    for filename in files:
        print(f"=== {filename} ===")
        with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
        for idx, line in enumerate(lines, 1):
            for kw in photo_keywords:
                if kw in line.lower():
                    safe = line.strip()[:150].encode('ascii', 'replace').decode('ascii')
                    print(f"L{idx}: [{kw}] {safe}")

if __name__ == '__main__':
    check_photos()
