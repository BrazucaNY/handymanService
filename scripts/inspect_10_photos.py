import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    idx = f.read()

with open('gallery.html', 'r', encoding='utf-8') as f:
    gal = f.read()

photos = [
    ('garage paint', 'garage_painting_siding_repair'),
    ('gutter guards', 'gutter_cleaning_leaf_filter_installation'),
    ('Roku TV', 'roku_tv_wall_mount_installation'),
    ('closet 10607', 'closet_door_repair_10607'),
    ('toilet', 'bathroom_remodel_scarsdale'),
    ('kitchen light', 'kitchen_flush_mount_light_eastchester'),
    ('floating shelves', 'kitchen_floating_shelves_subway_tile'),
    ('dog crate', 'dog_crate_furniture_assembly'),
    ('bathroom mirror', 'bathroom_mirror_mounting'),
]

for label, pkey in photos:
    print(f'=== PHOTO SET: {label} ({pkey}) ===')
    idx_matches = [l.strip() for l in idx.splitlines() if pkey in l]
    print('  index.html lines:')
    for m in idx_matches[:5]:
        print('    ', m[:120])
        
    gal_matches = [l.strip() for l in gal.splitlines() if pkey in l]
    print('  gallery.html lines:')
    for m in gal_matches[:5]:
        print('    ', m[:120])
