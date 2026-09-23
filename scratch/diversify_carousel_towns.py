import re
import os

target_file = r"c:\Users\davi6\.gemini\antigravity\scratch\here-handyman\index.html"

with open(target_file, "r", encoding="utf-8") as f:
    content = f.read()

# 20-mile radius towns from 10607 (White Plains/Greenburgh, NY)
# Ordered to alternate High-Income and Medium-Income communities across Westchester & Fairfield
TOWNS_20MI = [
    "White Plains, NY",
    "Scarsdale, NY",
    "Greenwich, CT",
    "Rye, NY",
    "Armonk, NY",
    "Bronxville, NY",
    "Chappaqua, NY",
    "Bedford, NY",
    "Harrison, NY",
    "Purchase, NY",
    "Larchmont, NY",
    "Mamaroneck, NY",
    "Hartsdale, NY",
    "Dobbs Ferry, NY",
    "Tarrytown, NY",
    "Pleasantville, NY",
    "New Rochelle, NY",
    "Yonkers, NY"
]

start_marker = '<div class="ba-slides" style="display:flex;transition:transform 0.5s ease-in-out">'
end_marker = '<!-- Controls -->'

start_pos = content.find(start_marker)
end_pos = content.find(end_marker, start_pos)

if start_pos == -1 or end_pos == -1:
    print(f"Error: Could not locate carousel markers in index.html (start: {start_pos}, end: {end_pos})")
    exit(1)

carousel_html = content[start_pos:end_pos]
figures = carousel_html.split('<figure class="ba-slide"')

new_figures = [figures[0]]
town_idx = 0

for fig in figures[1:]:
    current_town = TOWNS_20MI[town_idx % len(TOWNS_20MI)]
    town_idx += 1
    
    # 1. Replace town in figcaption
    # e.g., <figcaption ...>Some Service Name — Town, ST</figcaption>
    fig = re.sub(r'—\s*[^<]+</figcaption>', f'— {current_town}</figcaption>', fig)
    
    # 2. Replace town in alt text attributes
    town_alt = current_town.replace(',', '')
    fig = re.sub(r'—\s*[^"]+"', f'— {town_alt}"', fig)
    
    new_figures.append(fig)

new_carousel_html = '<figure class="ba-slide"'.join(new_figures)
new_content = content[:start_pos] + new_carousel_html + content[end_pos:]

with open(target_file, "w", encoding="utf-8") as f:
    f.write(new_content)

print(f"SUCCESS: Diversified {len(figures)-1} slides across 18 high-to-medium income towns within 20 miles of 10607!")
