import glob
import re
import html
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

files = sorted([f for f in glob.glob('**/*.html', recursive=True) if not any(x in f for x in ['dashboard.html', 'timer.html', '404.html', 'node_modules', '.netlify'])])

print("=== TITLES > 60 CHARS ===")
t_count = 0
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        c = fp.read()
    m = re.search(r'<title>(.*?)</title>', c, re.I | re.S)
    if m:
        t = html.unescape(m.group(1).strip())
        if len(t) > 60:
            t_count += 1
            print(f"{f} ({len(t)} chars): {t}")
print(f"Total titles > 60: {t_count}")

print("\n=== DESCRIPTIONS >= 155 CHARS ===")
d_count = 0
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        c = fp.read()
    m = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', c, re.I | re.S)
    if m:
        d = html.unescape(m.group(1).strip())
        if len(d) >= 155:
            d_count += 1
            print(f"{f} ({len(d)} chars): {d}")
print(f"Total descriptions >= 155: {d_count}")
