import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

# 1. Fix offer.html schema
with open('offer.html', 'r', encoding='utf-8') as f:
    offer_c = f.read()

offer_c = offer_c.replace(
    '{"@type":"ListItem","position":2,"name":"Weekly Special Offer"}',
    '{"@type":"ListItem","position":2,"name":"TV Mounting Packages"}'
)
offer_c = offer_c.replace(
    '{"@type": "ListItem", "position": 2, "name": "Weekly Special Offer"}',
    '{"@type": "ListItem", "position": 2, "name": "TV Mounting Packages"}'
)

orig_faq = '"name": "When does this TV mounting special offer end?"'
if orig_faq in offer_c:
    new_faq = '"name": "How do I book a TV mounting package with Here Handyman?"'
    offer_c = offer_c.replace(orig_faq, new_faq)
    offer_c = offer_c.replace(
        '"text": "This weekly special offer is valid until Sunday at 11:59 PM. Lock in your discounted pricing by booking online or calling (516) 350-0801 before Sunday midnight."',
        '"text": "You can lock in your TV mounting package online at www.herehandyman.com/book or by calling or texting (516) 350-0801 for fast same-day or next-day scheduling across Westchester County."'
    )
    print('[FIXED] offer.html FAQ schema updated')

with open('offer.html', 'w', encoding='utf-8') as f:
    f.write(offer_c)

# 2. Fix index.html town mismatches
with open('index.html', 'r', encoding='utf-8') as f:
    idx_c = f.read()

idx_repls = [
    ('Garage Exterior Siding &amp; Paint Restoration — Mamaroneck, NY', 'Garage Exterior Siding &amp; Paint Restoration — Scarsdale, NY'),
    ('Gutter Cleaning &amp; Mesh Leaf Guard Installation — Hartsdale, NY', 'Gutter Cleaning &amp; Mesh Leaf Guard Installation — Armonk, NY'),
    ('Roku Smart TV Wall Mounting — Dobbs Ferry, NY', 'Roku Smart TV Wall Mounting — Harrison, NY'),
    ('Bathroom Fixture &amp; Toilet Replacement — Yonkers, NY', 'Bathroom Fixture &amp; Toilet Replacement — Scarsdale, NY')
]

for orig, repl in idx_repls:
    if orig in idx_c:
        idx_c = idx_c.replace(orig, repl)
        print(f'[FIXED index.html] {orig} -> {repl}')
    else:
        print(f'[NOT FOUND in index.html] {orig}')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(idx_c)

# 3. Fix gallery.html toilet & bidet entries
with open('gallery.html', 'r', encoding='utf-8') as f:
    gal_c = f.read()

# Fix bidet-toilet-yonkers place prop
orig_bidet = '{ id:"bidet-toilet-yonkers", title:"Modern Bidet Toilet & Bathroom Fixture Replacement", town:"Scarsdale", place:"Yonkers, NY"'
new_bidet = '{ id:"bidet-toilet-yonkers", title:"Modern Bidet Toilet & Bathroom Fixture Replacement", town:"Scarsdale", place:"Scarsdale, NY (10583)"'
if orig_bidet in gal_c:
    gal_c = gal_c.replace(orig_bidet, new_bidet)
    print('[FIXED gallery.html] bidet-toilet-yonkers place prop updated to Scarsdale, NY (10583)')

# Fix toilet-yonkers before and after image swap
orig_toilet_yonkers = '{ id:"toilet-yonkers", title:"Bathroom Fixture & Toilet Replacement", town:"Yonkers", place:"Yonkers, NY", desc:"Complete bathroom vanity faucet upgrade, copper line testing, and new low-flow toilet replacement.", tag:"Plumbing", serviceUrl:"/plumbing-repairs", before:IMG+"/toiler_herehandyman_after.webp", after:IMG+"/toiler_herehandyman_before.webp" }'
new_toilet_yonkers = '{ id:"toilet-yonkers", title:"Bathroom Fixture & Toilet Replacement", town:"Yonkers", place:"Yonkers, NY", desc:"Complete bathroom vanity faucet upgrade, copper line testing, and new low-flow toilet replacement.", tag:"Plumbing", serviceUrl:"/plumbing-repairs", before:IMG+"/toiler_herehandyman_before.webp", after:IMG+"/toiler_herehandyman_after.webp" }'
if orig_toilet_yonkers in gal_c:
    gal_c = gal_c.replace(orig_toilet_yonkers, new_toilet_yonkers)
    print('[FIXED gallery.html] toilet-yonkers before/after images swapped to correct order')

with open('gallery.html', 'w', encoding='utf-8') as f:
    f.write(gal_c)

# 4. Fix services.html and all HTML postalCode schema from 10607 to 10601
import os

pages_fixed = 0
for root, dirs, files in os.walk('.'):
    if '.git' in root or 'node_modules' in root or '.gemini' in root: continue
    for file in files:
        if file.endswith('.html'):
            p = os.path.join(root, file)
            with open(p, 'r', encoding='utf-8', errors='ignore') as f:
                c = f.read()
            if '"postalCode": "10607"' in c or '"postalCode":"10607"' in c:
                c = c.replace('"postalCode": "10607"', '"postalCode": "10601"').replace('"postalCode":"10607"', '"postalCode":"10601"')
                with open(p, 'w', encoding='utf-8') as f:
                    f.write(c)
                pages_fixed += 1
                print(f'[FIXED schema postalCode] {p} -> 10601')

print(f'Total pages schema postalCode updated: {pages_fixed}')
