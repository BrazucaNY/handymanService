import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

root = '.'
licensed_hits = []
llc_hits = []
phone_hits = []
review_count_schema_hits = []
review_copy_hits = []

for dirpath, dirnames, filenames in os.walk(root):
    if '.git' in dirpath or 'node_modules' in dirpath or '.gemini' in dirpath:
        continue
    for f in filenames:
        if f.endswith(('.html', '.js', '.json', '.txt', '.md', '.py', '.cjs', '.mjs')):
            path = os.path.join(dirpath, f).replace('\\', '/')
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
                    content = fp.read()
                    
                    # 1. Licensed check (case-insensitive)
                    matches = list(re.finditer(r'\blicensed\b', content, re.IGNORECASE))
                    if matches:
                        for m in matches:
                            start = max(0, m.start() - 35)
                            end = min(len(content), m.end() + 35)
                            snippet = content[start:end].replace('\n', ' ')
                            line_num = content[:m.start()].count('\n') + 1
                            licensed_hits.append((path, line_num, snippet))
                            
                    # 2. Here Handyman LLC check
                    if 'Here Handyman LLC' in content:
                        for m in re.finditer(r'Here Handyman LLC', content):
                            line_num = content[:m.start()].count('\n') + 1
                            llc_hits.append((path, line_num))
                            
                    # 3. 530-0801 phone check
                    if '530-0801' in content:
                        for m in re.finditer(r'530-0801', content):
                            line_num = content[:m.start()].count('\n') + 1
                            phone_hits.append((path, line_num))
                            
                    # 4. Review count checks in JSON-LD schema vs HTML copy
                    for m in re.finditer(r'"reviewCount"\s*:\s*"(\d+)"', content):
                        line_num = content[:m.start()].count('\n') + 1
                        review_count_schema_hits.append((path, line_num, f'reviewCount: "{m.group(1)}"', m.group(1)))
                    for m in re.finditer(r'"reviewCount"\s*:\s*(\d+)', content):
                        line_num = content[:m.start()].count('\n') + 1
                        review_count_schema_hits.append((path, line_num, f'reviewCount: {m.group(1)}', m.group(1)))
                    for m in re.finditer(r'(\d+)\+?\s*Verified\s*Google\s*Reviews?', content, re.IGNORECASE):
                        line_num = content[:m.start()].count('\n') + 1
                        review_copy_hits.append((path, line_num, m.group(0), m.group(1)))
            except Exception as e:
                pass

print('=== 1. PROHIBITED "LICENSED" HITS ===')
if not licensed_hits:
    print("None found!")
else:
    for h in licensed_hits:
        print(f"  - {h[0]}:L{h[1]} -> '{h[2]}'")

print('\n=== 2. LEGAL NAME "Here Handyman LLC" HITS ===')
if not llc_hits:
    print("None found!")
else:
    for h in llc_hits:
        print(f"  - {h[0]}:L{h[1]}")

print('\n=== 3. WRONG PHONE NUMBER "(516) 530-0801" HITS ===')
if not phone_hits:
    print("None found!")
else:
    for h in phone_hits:
        print(f"  - {h[0]}:L{h[1]}")

print('\n=== 4. REVIEW COUNT SCHEMA HITS ===')
for h in review_count_schema_hits:
    print(f"  - {h[0]}:L{h[1]} -> {h[2]}")

print('\n=== 5. REVIEW COUNT COPY HITS ===')
for h in review_copy_hits:
    print(f"  - {h[0]}:L{h[1]} -> {h[2]}")
