import sqlite3
import re
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

db_path = r"C:\Users\davi6\Downloads\takeout-20260921T002237Z-1-001\Takeout\Voice\HereHandymanVoiceDatabase\here_handyman_voice.db"

if not os.path.exists(db_path):
    print("Database file not found:", db_path)
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

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

cursor.execute("SELECT id, phone, name, first_seen_utc, last_seen_utc, message_count, call_count, voicemail_count FROM customers WHERE message_count > 0 OR voicemail_count > 0 OR call_count > 0;")
customers_raw = cursor.fetchall()

trial_batch = []

def clean_takeout_text(text):
    if not text:
        return ""
    text = re.sub(r'^[A-Za-z]{3,9}\s+\d{1,2},\s*\d{4}.*?\n', '', text, flags=re.M)
    text = re.sub(r'Eastern Time\s*:\s*', '', text)
    text = re.sub(r'Labels\s*:.*$', '', text, flags=re.M)
    text = re.sub(r'User Deleted\s*:.*$', '', text, flags=re.M)
    text = re.sub(r'^\s*Me\s*:\s*', '', text, flags=re.M)
    text = re.sub(r'^\s*:\s*', '', text, flags=re.M)
    return text.strip()

for cust in customers_raw:
    cust_id, phone, default_name, first_seen, last_seen, msg_cnt, call_cnt, vm_cnt = cust

    digits = re.sub(r'\D', '', phone)
    if len(digits) == 11 and digits.startswith('1'):
        digits = digits[1:]
    if len(digits) == 10:
        formatted_phone = f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
        area_code = digits[:3]
    else:
        formatted_phone = phone
        area_code = ""

    cursor.execute("SELECT event_datetime_local, direction, message_text FROM messages WHERE customer_id = ? ORDER BY event_datetime_utc ASC;", (cust_id,))
    messages = cursor.fetchall()

    cursor.execute("SELECT event_datetime_local, voicemail_text FROM voicemails WHERE customer_id = ? ORDER BY event_datetime_utc ASC;", (cust_id,))
    voicemails = cursor.fetchall()

    cursor.execute("SELECT event_datetime_local, call_type, duration, transcript FROM calls WHERE customer_id = ? ORDER BY event_datetime_utc ASC;", (cust_id,))
    calls = cursor.fetchall()

    full_text = " ".join([m[2] for m in messages if m[2]] + [v[1] for v in voicemails if v[1]] + [c[3] for c in calls if c[3]])

    if any(ignore in full_text.lower() for ignore in ['careem', 'zenly', 'samsung account', 'wechat', 'trucking', 'cpm', 'verification code', 'your code is', 'bank of america']):
        continue

    has_job = bool(JOB_KEYWORDS.search(full_text))
    if not has_job:
        continue

    extracted_name = None
    name_match = re.search(r"\b(?:my name is|this is|i'm|im|call me|name:?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b", full_text, re.I)
    if name_match:
        cand = name_match.group(1).title()
        if cand.lower() not in ['david', 'me', 'to', 'here', 'handyman']:
            extracted_name = cand

    if not extracted_name and default_name and not any(default_name.startswith(x) for x in ['Voicemail', 'Missed call', 'Me to', 'Jul', 'Jun', 'May', 'Jan', 'Feb', 'Mar', 'Apr', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']):
        clean_def = re.sub(r'\s+(From|To|Jul|Jun|May|Jan|Feb|Mar|Apr|Aug|Sep|Oct|Nov|Dec).*$', '', default_name, flags=re.I).strip()
        if clean_def and clean_def.lower() not in ['me to', 'missed call', 'voicemail']:
            extracted_name = clean_def.title()

    if not extracted_name:
        extracted_name = f"Client ({formatted_phone[-4:]})"

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

    date_str = (last_seen or first_seen or '').split('T')[0] or '2026-09-01'

    # Build history list
    history = []
    for m in messages:
        history.append({
            'type': 'sms',
            'date': m[0] or '',
            'direction': m[1] or 'RECEIVED',
            'content': m[2] or ''
        })
    for v in voicemails:
        history.append({
            'type': 'voicemail',
            'date': v[0] or '',
            'content': v[1] or ''
        })
    for c in calls:
        history.append({
            'type': 'call',
            'date': c[0] or '',
            'call_type': c[1] or 'Call',
            'duration': c[2] or '',
            'transcript': c[3] or ''
        })
    history.sort(key=lambda x: x.get('date', ''))

    rec = {
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

    trial_batch.append(rec)
    if len(trial_batch) >= 15:
        break

output_trial = r"c:\Users\davi6\.gemini\antigravity\scratch\here-handyman\scripts\trial_customer_batch.json"
with open(output_trial, 'w', encoding='utf-8') as f:
    json.dump(trial_batch, f, indent=2, ensure_ascii=False)

print(f"Generated trial batch of {len(trial_batch)} records with history data.")
