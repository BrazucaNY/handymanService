import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    idx_lines = f.readlines()

with open('gallery.html', 'r', encoding='utf-8') as f:
    gal_lines = f.readlines()

print('=== 1. GARAGE SEARCH ===')
for i, l in enumerate(idx_lines, 1):
    if 'garage_painting_siding_repair' in l or ('garage' in l.lower() and 'mamaroneck' in l.lower()):
        print(f'index.html:L{i} -> {l.strip()[:120]}')

print('\n=== 2. GUTTER SEARCH ===')
for i, l in enumerate(idx_lines, 1):
    if 'gutter_cleaning_leaf_filter' in l or ('gutter' in l.lower() and ('hartsdale' in l.lower() or 'armonk' in l.lower())):
        print(f'index.html:L{i} -> {l.strip()[:120]}')

print('\n=== 3. ROKU SEARCH ===')
for i, l in enumerate(idx_lines, 1):
    if 'roku_tv_wall_mount' in l or ('roku' in l.lower() and ('dobbs' in l.lower() or 'harrison' in l.lower())):
        print(f'index.html:L{i} -> {l.strip()[:120]}')

print('\n=== 4. CLOSET 10607 SEARCH ===')
for i, l in enumerate(idx_lines, 1):
    if 'closet_door_repair_10607' in l or ('closet' in l.lower() and ('10607' in l.lower() or 'greenburgh' in l.lower() or 'white plains' in l.lower())):
        print(f'index.html:L{i} -> {l.strip()[:120]}')

print('\n=== 5. TOILET / BIDET SEARCH ===')
for i, l in enumerate(idx_lines, 1):
    if 'bathroom_remodel_scarsdale' in l or 'toilet_seat_bidet' in l or ('toilet' in l.lower() and ('yonkers' in l.lower() or 'scarsdale' in l.lower())):
        print(f'index.html:L{i} -> {l.strip()[:120]}')

for i, l in enumerate(gal_lines, 1):
    if 'bidet-toilet-yonkers' in l or 'toilet-yonkers' in l or 'bathroom_remodel_scarsdale' in l:
        print(f'gallery.html:L{i} -> {l.strip()[:120]}')
