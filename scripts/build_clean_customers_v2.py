import sqlite3
import re
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

db_path = r"C:\Users\davi6\Downloads\takeout-20260921T002237Z-1-001\Takeout\Voice\HereHandymanVoiceDatabase\here_handyman_voice.db"

conn = sqlite3.connect(db_path)
cur = conn.cursor()

JOB_KEYWORDS = re.compile(r'\b(tv|mount|mounting|door|doors|wall|walls|paint|painting|drywall|assembly|ikea|shelf|shelves|faucet|toilet|sink|light|fan|gutter|lock|patch|repair|clean|leak|shower|cabinet|washer|dryer|refrigerator|dishwasher|frame|curtain|mirror|griddle|pergola|deck)\b', re.I)
PRICE_REGEX = re.compile(r'\$\d+(?:\.\d{2})?|\b\d+\s*(?:dollars|bucks)\b', re.I)
STREET_ADDR_REGEX = re.compile(r'\b\d{1,5}\s+[A-Z0-9\s.,#]{3,30}\s+(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Ln|Lane|Way|Blvd|Boulevard|Ct|Court|Pl|Place|Pkwy|Parkway|Ter|Terrace)\b', re.I)
WESTCHESTER_TOWNS = ['White Plains', 'Scarsdale', 'Yonkers', 'Harrison', 'Rye', 'Mamaroneck', 'Eastchester', 'New Rochelle', 'Tarrytown', 'Hartsdale', 'Bronxville', 'Dobbs Ferry', 'Greenburgh', 'Ardsley', 'Elmsford', 'Irvington', 'Larchmont', 'Pelham', 'Ossining', 'Sleepy Hollow', 'Valhalla', 'Mount Vernon', 'Bedford', 'Chappaqua', 'Armonk', 'Greenwich']

AREA_CODE_STATE = {
    '914': 'NY', '516': 'NY', '631': 'NY', '212': 'NY', '718': 'NY', '917': 'NY', '347': 'NY', '845': 'NY',
    '312': 'IL', '773': 'IL', '630': 'IL', '847': 'IL', '331': 'IL', '708': 'IL', '224': 'IL', '815': 'IL',
    '203': 'CT', '475': 'CT', '860': 'CT', '959': 'CT',
    '201': 'NJ', '551': 'NJ', '973': 'NJ', '862': 'NJ', '908': 'NJ', '732': 'NJ',
    '215': 'PA', '267': 'PA', '484': 'PA', '610': 'PA'
}

cur.execute("SELECT id, phone, name, first_seen_utc, last_seen_utc, message_count, call_count, voicemail_count FROM customers;")
all_customers = cur.fetchall()

def clean_phone_number(raw_phone):
    if not raw_phone:
        return ""
    digits = re.sub(r'\D', '', raw_phone)
    if len(digits) == 11 and digits.startswith('1'):
        digits = digits[1:]
    if len(digits) == 10:
        return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    return ""

FORBIDDEN_NAME_WORDS = {'david', 'me', 'to', 'here', 'handyman', 'from', 'a', 'the', 'call', 'text', 'placed', 'received', 'indeed', 'yelp', 'nextdoor', 'google', 'craigslist', 'tasker', 'taskrabbit', 'thumbtack', 'angie', 'inbox', 'labels', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'}

def extract_clean_name(default_name, full_text, phone_formatted):
    incoming_lines = []
    for line in full_text.split('\n'):
        if not line.strip().startswith('Me :') and not line.strip().startswith('Me to'):
            incoming_lines.append(line)
    incoming_text = " ".join(incoming_lines)

    name_match = re.search(r"\b(?:my name is|this is|i'm|im|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b", incoming_text, re.I)
    if name_match:
        words = name_match.group(1).split()
        clean_words = [w.title() for w in words if w.lower() not in FORBIDDEN_NAME_WORDS]
        if clean_words:
            cand = " ".join(clean_words)
            if cand.lower() not in FORBIDDEN_NAME_WORDS and len(cand) >= 2:
                return cand

    if default_name:
        clean = re.sub(r'[\r\n\t]+', ' ', default_name).strip()
        clean = re.sub(r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z0-9,\.\s:\-]*\b', '', clean, flags=re.I)
        clean = re.sub(r'\b\d{1,4}(?::\d{2})?\s*(?:am|pm)?\b', '', clean, flags=re.I)
        clean = re.sub(r'\b(?:From|To|Me To|Voicemail|Missed Call|Placed Call|Received Call|Text|Inbox|Call|Placed|Received|Missed|Indeed|Yelp|Nextdoor)\b', '', clean, flags=re.I)
        clean = re.sub(r'[^a-zA-Z\s\.\'-]', '', clean).strip()
        clean = re.sub(r'\s+', ' ', clean).strip()
        
        if clean and len(clean) >= 2:
            lower = clean.lower()
            if lower not in FORBIDDEN_NAME_WORDS and lower not in ['client', 'unknown', 'david handyman', 'here', 'direct', 'directly', 'me to', 'null', 'none']:
                if not lower.startswith('david') and not lower.endswith('david'):
                    return clean.title()

    suffix = phone_formatted[-4:] if phone_formatted and len(phone_formatted) >= 4 else "Contact"
    return f"Client ({suffix})"

cleaned_customers = []

for cust in all_customers:
    cust_id, phone, default_name, first_seen, last_seen, msg_cnt, call_cnt, vm_cnt = cust

    formatted_phone = clean_phone_number(phone)
    if not formatted_phone:
        continue

    area_code = formatted_phone[1:4]

    cur.execute("SELECT event_datetime_local, direction, message_text FROM messages WHERE customer_id = ? ORDER BY event_datetime_utc ASC;", (cust_id,))
    messages_raw = cur.fetchall()

    cur.execute("SELECT event_datetime_local, call_type, duration, transcript FROM calls WHERE customer_id = ? ORDER BY event_datetime_utc ASC;", (cust_id,))
    calls_raw = cur.fetchall()

    cur.execute("SELECT event_datetime_local, voicemail_text FROM voicemails WHERE customer_id = ? ORDER BY event_datetime_utc ASC;", (cust_id,))
    voicemails_raw = cur.fetchall()

    full_text = " ".join([m[2] for m in messages_raw if m[2]] + [v[1] for v in voicemails_raw if v[1]] + [c[3] for c in calls_raw if c[3]])

    if any(ignore in full_text.lower() for ignore in ['careem', 'zenly', 'samsung account', 'wechat', 'trucking', 'cpm', 'verification code', 'your code is', 'bank of america']):
        continue

    has_handyman_job = bool(JOB_KEYWORDS.search(full_text))
    if not has_handyman_job and msg_cnt == 0 and vm_cnt == 0 and call_cnt == 0:
        continue

    extracted_name = extract_clean_name(default_name, full_text, formatted_phone)

    matched_town = "Westchester"
    matched_state = AREA_CODE_STATE.get(area_code, "NY")

    state_match = re.search(r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(IL|NY|CT|NJ|PA)\b', full_text)
    if state_match:
        matched_town = state_match.group(1).title()
        matched_state = state_match.group(2).upper()
    else:
        for town in WESTCHESTER_TOWNS:
            if town.lower() in full_text.lower():
                matched_town = town
                matched_state = "CT" if town.lower() == "greenwich" else "NY"
                break

    addr_match = STREET_ADDR_REGEX.search(full_text)
    street_addr = addr_match.group(0).strip() if addr_match else ""

    prices = PRICE_REGEX.findall(full_text)
    quoted_price = ", ".join(list(set(prices))) if prices else ""

    jobs_found = list(set([j.lower() for j in JOB_KEYWORDS.findall(full_text)]))
    service_label = ", ".join(jobs_found[:2]).title() + " Repair" if jobs_found else "Handyman Service"
    if "tv" in jobs_found or "mount" in jobs_found:
        service_label = "TV Mounting & Hardware"
    elif "door" in jobs_found:
        service_label = "Door Hardware & Installation"

    history = []
    for m in messages_raw:
        history.append({
            'type': 'sms',
            'date': m[0] or '',
            'direction': m[1] or 'RECEIVED',
            'content': m[2] or ''
        })
    for v in voicemails_raw:
        history.append({
            'type': 'voicemail',
            'date': v[0] or '',
            'content': v[1] or ''
        })
    for c in calls_raw:
        history.append({
            'type': 'call',
            'date': c[0] or '',
            'call_type': c[1] or 'Call',
            'duration': c[2] or '',
            'transcript': c[3] or ''
        })
    history.sort(key=lambda x: x.get('date', ''))

    date_str = (last_seen or first_seen or '').split('T')[0] or '2026-09-01'

    cust_obj = {
        "id": cust_id,
        "name": extracted_name,
        "phone": formatted_phone,
        "email": "",
        "address": street_addr,
        "apt": "",
        "town": matched_town,
        "state": matched_state,
        "lead": "Google Voice",
        "service": service_label + (f" ({quoted_price})" if quoted_price else ""),
        "status": "Completed",
        "date": date_str,
        "hasGbpReview": False,
        "notes": f"Imported from Google Voice Takeout. {msg_cnt} SMS, {call_cnt} calls, {vm_cnt} voicemails." + (f" Quoted: {quoted_price}" if quoted_price else ""),
        "quoted_prices": prices,
        "counts": {"sms": msg_cnt, "calls": call_cnt, "voicemails": vm_cnt},
        "history": history
    }

    cleaned_customers.append(cust_obj)

print(f"Extracted {len(cleaned_customers)} 100% clean customer records.")

with open(r'scripts/all_voice_customers_with_history.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned_customers, f, indent=2, ensure_ascii=False)

lightweight = []
for c in cleaned_customers:
    item = dict(c)
    del item['history']
    lightweight.append(item)

with open(r'scripts/all_voice_customers.json', 'w', encoding='utf-8') as f:
    json.dump(lightweight, f, indent=2, ensure_ascii=False)

trial_batch = cleaned_customers[:15]
with open(r'scripts/trial_customer_batch.json', 'w', encoding='utf-8') as f:
    json.dump(trial_batch, f, indent=2, ensure_ascii=False)

print("Saved all datasets cleanly.")
