import json
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('gsc_report_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print('=== GSC 28-DAY PERFORMANCE ===')
s28 = data.get('summary_28d', {})
print(f"Total Clicks: {s28.get('clicks')}")
print(f"Total Impressions: {s28.get('impressions')}")
print(f"Average CTR: {s28.get('avg_ctr', 0)*100:.2f}%")
print(f"Average Position: {s28.get('avg_pos', 0):.1f}")

print('\n=== GSC 90-DAY PERFORMANCE ===')
s90 = data.get('summary_90d', {})
print(f"Total Clicks: {s90.get('clicks')}")
print(f"Total Impressions: {s90.get('impressions')}")

print('\n=== TOP 25 SEARCH QUERIES (RANKING & IMPRESSIONS) ===')
queries = sorted(data.get('queries', []), key=lambda q: (q.get('clicks', 0), q.get('impressions', 0)), reverse=True)
for q in queries[:25]:
    k = q.get('keys', [''])[0]
    clicks = q.get('clicks', 0)
    imp = q.get('impressions', 0)
    pos = q.get('position', 0)
    ctr = q.get('ctr', 0) * 100
    print(f"- \"{k}\" | Clicks: {clicks} | Imp: {imp} | Pos: {pos:.1f} | CTR: {ctr:.1f}%")

print('\n=== TOP 15 RANKING PAGES ===')
pages = sorted(data.get('pages', []), key=lambda p: (p.get('clicks', 0), p.get('impressions', 0)), reverse=True)
for p in pages[:15]:
    k = p.get('keys', [''])[0]
    clicks = p.get('clicks', 0)
    imp = p.get('impressions', 0)
    pos = p.get('position', 0)
    ctr = p.get('ctr', 0) * 100
    print(f"- {k} | Clicks: {clicks} | Imp: {imp} | Pos: {pos:.1f} | CTR: {ctr:.1f}%")

print('\n=== DEVICE DISTRIBUTION ===')
for d in data.get('devices', []):
    k = d.get('keys', [''])[0]
    print(f"- {k}: Clicks: {d.get('clicks')} | Imp: {d.get('impressions')}")
