import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('gallery.html', 'r', encoding='utf-8') as f:
    c = f.read()

items = re.findall(r'\{\s*id:"([^"]+)",[^\}]*\}', c)

for item in items:
    if 'smoke' in item or 'toilet' in item:
        print('--- ITEM ---')
        print(item)
