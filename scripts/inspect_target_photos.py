import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    idx = f.read()

with open('gallery.html', 'r', encoding='utf-8') as f:
    gal = f.read()

terms = ['garage', 'gutter', 'roku', 'closet', 'toilet', 'bidet']

print('=== INDEX.HTML SEARCH ===')
for t in terms:
    matches = re.findall(rf'.{{0,50}}{t}.{{0,100}}', idx, re.IGNORECASE)
    print(f'\n--- {t} matches in index.html ({len(matches)}) ---')
    for m in matches[:6]:
        print('  ', m.strip())

print('\n=== GALLERY.HTML SEARCH ===')
for t in terms:
    matches = re.findall(rf'.{{0,50}}{t}.{{0,100}}', gal, re.IGNORECASE)
    print(f'\n--- {t} matches in gallery.html ({len(matches)}) ---')
    for m in matches[:6]:
        print('  ', m.strip())
