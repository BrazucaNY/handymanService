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

# Regular expressions
JOB_KEYWORDS = re.compile(r'\b(tv|mount|mounting|door|doors|wall|walls|paint|painting|drywall|assembly|ikea|shelf|shelves|faucet|toilet|sink|light|fan|gutter|lock|patch|repair|clean|leak|shower|cabinet|washer|dryer|refrigerator|dishwasher|frame|curtain|mirror|griddle|pergola|deck)\b', re.I)
PRICE_REGEX = re.compile(r'\$\d+(?:\.\d{2})?|\b\d+\s*(?:dollars|bucks)\b', re.I)
STREET_ADDR_REGEX = re.compile(r'\b\d{1,5}\s+[A-Z0-9\s.,#]{3,30}\s+(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Ln|Lane|Way|Blvd|Boulevard|Ct|Court|Pl|Place|Pkwy|Parkway|Ter|Terrace)\b', re.I)
WESTCHESTER_TOWNS = ['White Plains', 'Scarsdale', 'Yonkers', 'Harrison', 'Rye', 'Mamaroneck', 'Eastchester', 'New Rochelle', 'Tarrytown', 'Hartsdale', 'Bronxville', 'Dobbs Ferry', 'Greenburgh', 'Ardsley', 'Elmsford', 'Irvington', 'Larchmont', 'Pelham', 'Ossining', 'Sleepy Hollow', 'Valhalla', 'Mount Vernon', 'Bedford', 'Chappaqua', 'Armonk', 'Greenwich']

cursor.execute("SELECT id, phone, name, first_seen_utc, last_seen_utc, message_count, call_count, voicemail_count FROM customers WHERE message_count > 0 OR voicemail_count > 0 OR call_count > 0;")
customers_raw = cursor.fetchall()

trial_batch = []

def clean_takeout_text(text):
    if not text:
        return ""
    # Remove metadata lines like "May 22, 2025, 8:38:00 PM", "Eastern Time :", "Labels: Text", "User Deleted: False"
    text = re.sub(r'^[A-Za-z]{3,9}\s+\d{1,2},\s*\d{4}.*?\n', '', text, flags=re.M)
    text = re.sub(r'Eastern Time\s*:\s*', '', text)
    text = re.sub(r'Labels\s*:.*$', '', text, flags=re.M)
    text = re.sub(r'User Deleted\s*:.*$', '', text, flags=re.M)
    text = re.sub(r'^\s*Me\s*:\s*', '', text, flags=re.M)
    text = re.sub(r'^\s*:\s*', '', text, flags=re.M)
    return text.strip()

for cust in customers_raw:
    cust_id, phone, default_name, first_seen, last_seen, msg_cnt, call_cnt, vm_cnt = cust

    # Clean phone format: +19145550199 -> (914) 555-0199
    digits = re.sub(r'\D', '', phone)
    if len(digits) == 11 and digits.startswith('1'):
        digits = digits[1:]
    if len(digits) == 10:
        formatted_phone = f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    else:
        formatted_phone = phone

    # Fetch messages
    cursor.execute("SELECT event_datetime_local, direction, message_text FROM messages WHERE customer_id = ? ORDER BY event_datetime_local ASC;", (cust_id,))
    messages = cursor.fetchall()

    # Fetch voicemails
    cursor.execute("SELECT event_datetime_local, voicemail_text FROM voicemails WHERE customer_id = ? ORDER BY event_datetime_local ASC;", (cust_id,))
    voicemails = cursor.fetchall()

    raw_texts = [m[2] for m in messages if m[2]] + [v[1] for v in voicemails if v[1]]
    cleaned_texts = [clean_takeout_text(t) for t in raw_texts if clean_takeout_text(t)]
    full_cleaned_text = "\n".join(cleaned_texts)

    # Filter out automated 2FA, spam, trucking
    if any(ignore in full_cleaned_text.lower() for ignore in ['careem', 'zenly', 'samsung account', 'wechat', 'trucking', 'cpm', 'verification code', 'your code is', 'bank of america']):
        continue

    # Must contain relevant handyman conversation
    if not JOB_KEYWORDS.search(full_cleaned_text):
        continue

    # Extract customer name
    extracted_name = None
    name_match = re.search(r"\b(?:my name is|this is|i'm|im|call me|name:?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b", full_cleaned_text, re.I)
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

    # Extract town
    matched_town = "Westchester"
    for town in WESTCHESTER_TOWNS:
        if town.lower() in full_cleaned_text.lower():
            matched_town = town
            break

    # Extract street address
    addr_match = STREET_ADDR_REGEX.search(full_cleaned_text)
    street_addr = addr_match.group(0).strip() if addr_match else ""

    # Extract price
    prices = PRICE_REGEX.findall(full_cleaned_text)
    quoted_price = ", ".join(list(set(prices))) if prices else ""

    # Extract service type
    jobs_found = list(set([j.lower() for j in JOB_KEYWORDS.findall(full_cleaned_text)]))
    service_label = ", ".join(jobs_found[:2]).title() + " Repair"
    if "tv" in jobs_found or "mount" in jobs_found:
        service_label = "TV Mounting & Hardware"
    elif "door" in jobs_found:
        service_label = "Door Hardware & Installation"
    elif "assembly" in jobs_found or "ikea" in jobs_found:
        service_label = "Furniture Assembly"
    elif "drywall" in jobs_found or "paint" in jobs_found:
        service_label = "Drywall Patching & Painting"
    elif "leak" in jobs_found or "faucet" in jobs_found or "toilet" in jobs_found:
        service_label = "Plumbing Fixture Repair"

    if quoted_price:
        service_label += f" ({quoted_price})"

    # Interaction date
    date_str = "2026-09-01"
    if last_seen:
        date_str = last_seen.split("T")[0]

    record = {
        "name": extracted_name,
        "phone": formatted_phone,
        "email": "",
        "address": street_addr,
        "apt": "",
        "town": matched_town,
        "lead": "Google Voice",
        "service": service_label,
        "status": "Completed",
        "date": date_str,
        "hasGbpReview": False,
        "notes": f"Imported from Google Voice. Interactions: {len(messages)} texts, {call_cnt} calls, {vm_cnt} voicemails. Text Snippet: {cleaned_texts[0][:120] if cleaned_texts else 'N/A'}"
    }

    trial_batch.append(record)

    if len(trial_batch) >= 15:
        break

conn.close()

output_path = r"c:\Users\davi6\.gemini\antigravity\scratch\here-handyman\scripts\trial_customer_batch.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(trial_batch, f, indent=2)

print(f"✅ Extracted {len(trial_batch)} cleaned trial customer records into {output_path}")
print("\n=== CLEANED TRIAL BATCH RECORDS (FIRST 5) ===")
print(json.dumps(trial_batch[:5], indent=2))
