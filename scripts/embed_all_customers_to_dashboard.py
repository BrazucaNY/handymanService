import json
import re

with open('scripts/all_voice_customers_with_history.json', encoding='utf-8') as f:
    full_dataset = json.load(f)

print(f"Loaded {len(full_dataset)} full customer records with history.")

with open('dashboard.html', encoding='utf-8') as f:
    html_content = f.read()

# Generate JavaScript string for full dataset
js_dataset_str = json.dumps(full_dataset, indent=2, ensure_ascii=False)

# Write to scripts/all_voice_customers_with_history.json if needed, and embed variable into dashboard.html
with open('dashboard.html', 'w', encoding='utf-8') as f:
    # Update defaultContacts to full dataset or attach window.FULL_VOICE_DATA
    pass
