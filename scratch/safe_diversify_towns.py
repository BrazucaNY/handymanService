import re
from html.parser import HTMLParser

target_file = r"c:\Users\davi6\.gemini\antigravity\scratch\here-handyman\index.html"

with open(target_file, "r", encoding="utf-8") as f:
    content = f.read()

# 18 Towns within 20 miles of 10607 (White Plains / Greenburgh, NY)
TOWNS_20MI = [
    "Scarsdale, NY",
    "White Plains, NY",
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

# Clean double dashes in content first
content = content.replace("— —", "—")

# Find start and end of ba-slides block
start_marker = '<div class="ba-slides"'
end_marker = '<!-- Controls -->'

start_pos = content.find(start_marker)
end_pos = content.find(end_marker, start_pos)

if start_pos == -1 or end_pos == -1:
    print(f"Error: Could not locate markers (start: {start_pos}, end: {end_pos})")
    exit(1)

slides_block = content[start_pos:end_pos]

# Split by <figure class="ba-slide"
parts = re.split(r'(<figure\s+class="ba-slide")', slides_block)

new_slides_block = parts[0]
town_idx = 0

for i in range(1, len(parts), 2):
    delim = parts[i]
    fig_body = parts[i+1]
    
    current_town = TOWNS_20MI[town_idx % len(TOWNS_20MI)]
    town_idx += 1
    
    # Update <figcaption>
    def replace_caption(match):
        prefix = match.group(1)
        return f"{prefix}— {current_town}</figcaption>"
    
    fig_body = re.sub(r'(<figcaption[^>]*>.*?)(?:—|&mdash;).*?</figcaption>', replace_caption, fig_body, flags=re.DOTALL)
    
    # Update alt="..."
    town_alt = current_town.replace(',', '')
    def replace_alt(match):
        prefix = match.group(1).rstrip('- ').rstrip('— ')
        return f'{prefix} — {town_alt}"'
    
    fig_body = re.sub(r'(alt="[^"]*?)\s*(?:—|&mdash;)\s*[^"]*"', replace_alt, fig_body)
    
    new_slides_block += delim + fig_body

new_content = content[:start_pos] + new_slides_block + content[end_pos:]

with open(target_file, "w", encoding="utf-8") as f:
    f.write(new_content)

print(f"SUCCESS: Updated {town_idx} figure slides cleanly across 18 towns!")

class MParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.errors = []
    def handle_starttag(self, tag, attrs):
        if tag not in ['img', 'input', 'br', 'hr', 'meta', 'link', 'source']:
            self.stack.append((tag, self.getpos()))
    def handle_endtag(self, tag):
        if tag in ['img', 'input', 'br', 'hr', 'meta', 'link', 'source']:
            return
        if not self.stack:
            self.errors.append(f'Unexpected end tag </{tag}> at line {self.getpos()[0]}')
            return
        last_tag, pos = self.stack.pop()
        if last_tag != tag:
            self.errors.append(f'Mismatch: expected </{last_tag}> from line {pos[0]}, found </{tag}> at line {self.getpos()[0]}')

parser = MParser()
parser.feed(new_content)
print('HTML Validation Errors:', len(parser.errors))
