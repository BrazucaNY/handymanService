import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

town_zips = {
    'valhalla': '10595',
    'sleepy-hollow': '10591',
    'ossining': '10562',
    'pelham': '10803',
    'larchmont': '10538',
    'mount-vernon': '10550',
    'irvington': '10533',
    'elmsford': '10523',
    'eastchester': '10709',
    'bronxville': '10708',
    'briarcliff': '10510',
    'armonk': '10504',
    'chappaqua': '10514',
    'dobbs-ferry': '10522',
    'greenburgh': '10607',
    'harrison': '10528',
    'hartsdale': '10530',
    'hastings': '10706',
    'mamaroneck': '10543',
    'new-rochelle': '10801',
    'rye': '10580',
    'scarsdale': '10583',
    'tarrytown': '10591',
    'white-plains': '10601',
    'yonkers': '10701'
}

discrepancies = []

for root, dirs, files in os.walk('.'):
    if '.git' in root or 'node_modules' in root or '.gemini' in root: continue
    for f in files:
        if f.endswith('.html'):
            p = os.path.join(root, f).replace('\\', '/')
            with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
                c = fp.read()
                for town_slug, zip_code in town_zips.items():
                    if town_slug in p:
                        matches = re.findall(r'"postalCode"\s*:\s*"(\d+)"', c)
                        if matches:
                            current_zip = matches[0]
                            if current_zip != zip_code:
                                discrepancies.append((p, town_slug, current_zip, zip_code))

print(f'=== TOWN PAGE SCHEMA ZIP DISCREPANCIES ({len(discrepancies)}) ===')
for d in discrepancies:
    print(f'File: {d[0]} | Town: {d[1]} | Current schema ZIP: {d[2]} -> Expected ZIP: {d[3]}')
