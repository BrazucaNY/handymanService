import json

with open('scripts/trial_customer_batch.json', encoding='utf-8') as f:
    data = json.load(f)

for i, c in enumerate(data, 1):
    print(f"{i:2d}. Name: {c['name']:25s} | Phone: {c['phone']:15s} | Town: {c['town']:15s} | State: {c['state']}")
