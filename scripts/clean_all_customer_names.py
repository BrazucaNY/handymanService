import json
import re

with open(r'scripts/all_voice_customers_with_history.json', encoding='utf-8') as f:
    customers = json.load(f)

MONTHS = r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b'

def sanitize_name(raw_name, phone, history, notes):
    if not raw_name:
        raw_name = ""

    # Replace newlines and tabs
    name = re.sub(r'[\r\n\t]+', ' ', raw_name).strip()

    # Remove month / date trailing artifacts from Takeout
    name = re.sub(MONTHS, '', name, flags=re.I).strip()

    # Remove Takeout artifacts like "From", "To", "Me To", "Voicemail", "Missed Call"
    name = re.sub(r'\b(?:From|To|Me To|Voicemail|Missed Call|Text|Inbox)\b', '', name, flags=re.I).strip()
    name = re.sub(r'\s+', ' ', name).strip()

    # Check if name is owner or generic
    lower_name = name.lower()
    is_owner_or_generic = False

    if not name or lower_name in ['david', 'me', 'here handyman', 'handyman', 'client', 'unknown', 'david handyman', 'here', 'direct', 'directly']:
        is_owner_or_generic = True
    elif lower_name.startswith('david ') or lower_name.endswith(' david'):
        # Check if it's David + Client or just David
        clean_cand = re.sub(r'\bdavid\b', '', name, flags=re.I).strip()
        if not clean_cand or clean_cand.lower() in ['client', 'handyman', 'from', 'to']:
            is_owner_or_generic = True
        else:
            name = clean_cand

    if is_owner_or_generic:
        # Search history and notes for real name
        full_text = notes + " " + " ".join([h.get('content', '') + " " + h.get('transcript', '') for h in history])
        
        name_match = re.search(r"\b(?:my name is|this is|i'm|im|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b", full_text, re.I)
        if name_match:
            cand = name_match.group(1).title()
            if cand.lower() not in ['david', 'me', 'to', 'here', 'handyman', 'the', 'a']:
                name = cand
                is_owner_or_generic = False

    if is_owner_or_generic or len(name) < 2:
        digits = re.sub(r'\D', '', phone)
        suffix = digits[-4:] if len(digits) >= 4 else "Client"
        name = f"Client ({suffix})"

    return name.title()

cleaned_count = 0
for c in customers:
    old_name = c['name']
    new_name = sanitize_name(old_name, c['phone'], c.get('history', []), c.get('notes', ''))
    if old_name != new_name:
        cleaned_count += 1
        c['name'] = new_name

print(f"Sanitized {cleaned_count} customer names.")

# Write back cleaned full history JSON
with open(r'scripts/all_voice_customers_with_history.json', 'w', encoding='utf-8') as f:
    json.dump(customers, f, indent=2, ensure_ascii=False)

# Also write clean 15-contact trial batch
trial_batch = customers[:15]
with open(r'scripts/trial_customer_batch.json', 'w', encoding='utf-8') as f:
    json.dump(trial_batch, f, indent=2, ensure_ascii=False)

print("Updated scripts/all_voice_customers_with_history.json and scripts/trial_customer_batch.json")
