import sqlite3
import re
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

db_path = r"C:\Users\davi6\Downloads\takeout-20260921T002237Z-1-001\Takeout\Voice\HereHandymanVoiceDatabase\here_handyman_voice.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

JOB_KEYWORDS = re.compile(r'\b(tv|mount|mounting|door|doors|wall|walls|paint|painting|drywall|assembly|ikea|shelf|shelves|faucet|toilet|sink|light|fan|gutter|lock|patch|repair|clean|leak|shower|cabinet|washer|dryer|refrigerator|dishwasher|frame|curtain|mirror|griddle|pergola|deck)\b', re.I)
PRICE_REGEX = re.compile(r'\$\d+(?:\.\d{2})?|\b\d+\s*(?:dollars|bucks)\b', re.I)
WESTCHESTER_TOWNS = ['White Plains', 'Scarsdale', 'Yonkers', 'Harrison', 'Rye', 'Mamaroneck', 'Eastchester', 'New Rochelle', 'Tarrytown', 'Hartsdale', 'Bronxville', 'Dobbs Ferry', 'Greenburgh', 'Ardsley', 'Elmsford', 'Irvington', 'Larchmont', 'Pelham', 'Ossining', 'Sleepy Hollow', 'Valhalla', 'Mount Vernon', 'Bedford', 'Chappaqua', 'Armonk', 'Greenwich']

cursor.execute("SELECT id, phone, name, first_seen_utc, last_seen_utc, message_count, call_count, voicemail_count FROM customers;")
all_customers = cursor.fetchall()

valid_customers = []

for cust in all_customers:
    cust_id, phone, default_name, first_seen, last_seen, msg_cnt, call_cnt, vm_cnt = cust

    digits = re.sub(r'\D', '', phone)
    if len(digits) == 11 and digits.startswith('1'):
        digits = digits[1:]
    if len(digits) == 10:
        formatted_phone = f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    else:
        formatted_phone = phone

    cursor.execute("SELECT message_text FROM messages WHERE customer_id = ?;", (cust_id,))
    messages = cursor.fetchall()

    cursor.execute("SELECT voicemail_text FROM voicemails WHERE customer_id = ?;", (cust_id,))
    voicemails = cursor.fetchall()

    full_text = " ".join([m[0] for m in messages if m[0]] + [v[0] for v in voicemails if v[0]])

    # Exclude automated codes / spam
    if any(ignore in full_text.lower() for ignore in ['careem', 'zenly', 'samsung account', 'wechat', 'trucking', 'cpm', 'verification code', 'your code is', 'bank of america']):
        continue

    # Require job keywords or direct interaction
    has_handyman_job = bool(JOB_KEYWORDS.search(full_text))
    
    if not has_handyman_job and msg_cnt == 0 and vm_cnt == 0:
        continue

    # Name extraction
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
    for town in WESTCHESTER_TOWNS:
        if town.lower() in full_text.lower():
            matched_town = town
            break

    prices = PRICE_REGEX.findall(full_text)
    quoted_price = ", ".join(list(set(prices))) if prices else ""

    jobs_found = list(set([j.lower() for j in JOB_KEYWORDS.findall(full_text)]))
    service_label = ", ".join(jobs_found[:2]).title() + " Repair" if jobs_found else "Handyman Service"
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

    date_str = "2026-09-01"
    if last_seen:
        date_str = last_seen.split("T")[0]

    valid_customers.append({
        "id": cust_id,
        "name": extracted_name,
        "phone": formatted_phone,
        "email": "",
        "address": "",
        "apt": "",
        "town": matched_town,
        "lead": "Google Voice",
        "service": service_label,
        "status": "Completed",
        "date": date_str,
        "hasGbpReview": False,
        "message_count": msg_cnt,
        "call_count": call_cnt,
        "voicemail_count": vm_cnt
    })

conn.close()

output_all = r"c:\Users\davi6\.gemini\antigravity\scratch\here-handyman\scripts\all_voice_customers.json"
with open(output_all, "w", encoding="utf-8") as f:
    json.dump(valid_customers, f, indent=2)

print(f"📊 SUMMARY OF GOOGLE VOICE ANALYSIS:")
print(f"• Total Raw Records in Takeout DB: {len(all_customers)}")
print(f"• Authentic Handyman Customer Records Extracted: {len(valid_customers)}")
print(f"• Full Dataset Saved to: {output_all}")
