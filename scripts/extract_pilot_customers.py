import sqlite3
import re
import json

db_path = r"C:\Users\davi6\Downloads\takeout-20260921T002237Z-1-001\Takeout\Voice\HereHandymanVoiceDatabase\here_handyman_voice.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Regular expressions for detecting relevant handyman keywords, addresses, and prices
JOB_KEYWORDS = re.compile(r'\b(tv|mount|door|wall|paint|drywall|assembly|ikea|shelf|shelves|faucet|toilet|sink|light|fan|gutter|lock|patch|repair|clean|leak|shower|cabinet)\b', re.I)
PRICE_REGEX = re.compile(r'\$\d+(?:\.\d{2})?|\b\d+\s*(?:dollars|bucks)\b', re.I)
ADDRESS_REGEX = re.compile(r'\b\d+\s+[A-Z0-9\s.,#]+(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Ln|Lane|Way|Blvd|Boulevard|Ct|Court|Pl|Place|White Plains|Scarsdale|Yonkers|Harrison|Rye|Mamaroneck|Eastchester|Tarrytown|Bronxville|Dobbs Ferry|Hartsdale|Chappaqua|Armonk|Bedford|Greenwich|Pelham|New Rochelle)\b', re.I)
NAME_REGEX = re.compile(r"\b(?:my name is|this is|i'm|im)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b", re.I)

cursor.execute("SELECT id, phone, name, message_count, call_count, voicemail_count FROM customers WHERE message_count > 0 OR voicemail_count > 0 OR call_count > 0;")
all_customers = cursor.fetchall()

print(f"Total customers in database: {len(all_customers)}")

extracted_customers = []

for cust in all_customers:
    cust_id, phone, default_name, msg_cnt, call_cnt, vm_cnt = cust

    # Fetch all messages for this customer
    cursor.execute("SELECT event_datetime_local, direction, message_text FROM messages WHERE customer_id = ? ORDER BY event_datetime_local ASC;", (cust_id,))
    messages = cursor.fetchall()

    # Fetch all voicemails for this customer
    cursor.execute("SELECT event_datetime_local, voicemail_text FROM voicemails WHERE customer_id = ? ORDER BY event_datetime_local ASC;", (cust_id,))
    voicemails = cursor.fetchall()

    # Filter out automated 2FA and spam
    all_text = " ".join([m[2] for m in messages if m[2]] + [v[1] for v in voicemails if v[1]])
    
    if any(ignore in all_text.lower() for ignore in ['careem', 'zenly', 'samsung account', 'wechat', 'trucking', 'cpm', 'verification code', 'your code is']):
        continue

    # Check if there is handyman work discussed
    if not JOB_KEYWORDS.search(all_text):
        continue

    # Extract customer name
    extracted_name = None
    name_match = NAME_REGEX.search(all_text)
    if name_match:
        extracted_name = name_match.group(1).title()
    elif default_name and not any(default_name.startswith(x) for x in ['Voicemail', 'Missed call', 'Jul', 'Jun', 'May', 'Jan', 'Feb', 'Mar', 'Apr', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']):
        extracted_name = default_name

    # Extract address
    addr_match = ADDRESS_REGEX.search(all_text)
    extracted_addr = addr_match.group(0).strip() if addr_match else None

    # Extract price
    prices = PRICE_REGEX.findall(all_text)
    extracted_price = ", ".join(list(set(prices))) if prices else None

    # Extract job type summary
    job_types = list(set(JOB_KEYWORDS.findall(all_text)))
    job_summary = ", ".join(job_types).title() if job_types else "General Handyman Repair"

    # Sample snippet
    clean_messages = []
    for m in messages:
        dt, dirn, txt = m
        if txt:
            # Clean up metadata lines in takeout
            txt_clean = re.sub(r'^[A-Za-z]{3}\s+\d+.*?\n:\n', '', txt, flags=re.S).strip()
            txt_clean = re.sub(r'\nLabels:.*$', '', txt_clean, flags=re.S).strip()
            clean_messages.append(f"[{dirn.upper()}] {txt_clean}")

    extracted_customers.append({
        "customer_id": cust_id,
        "phone": phone,
        "name": extracted_name or "Client (" + phone[-4:] + ")",
        "address": extracted_addr or "Westchester County, NY",
        "job_type": job_summary,
        "quoted_price": extracted_price or "N/A",
        "message_count": len(messages),
        "call_count": call_cnt,
        "voicemail_count": vm_cnt,
        "history_snippet": clean_messages[:5]
    })

    if len(extracted_customers) >= 20:
        break

conn.close()

print(f"\nExtracted {len(extracted_customers)} high-quality handyman customer records for initial trial batch:")
print(json.dumps(extracted_customers, indent=2))
