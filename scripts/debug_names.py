import sqlite3
import re

db_path = r"C:\Users\davi6\Downloads\takeout-20260921T002237Z-1-001\Takeout\Voice\HereHandymanVoiceDatabase\here_handyman_voice.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("SELECT phone, name FROM customers WHERE phone LIKE '%2016810630%' OR phone LIKE '%2025008937%';")
rows = cur.fetchall()

for phone, raw_name in rows:
    print(f"RAW PHONE: {phone} | RAW NAME: {repr(raw_name)}")
    
    clean = re.sub(r'[\r\n\t]+', ' ', raw_name or '').strip()
    clean = re.sub(r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z0-9,]*\b', '', clean, flags=re.I)
    clean = re.sub(r'\b(?:From|To|Me To|Voicemail|Missed Call|Text|Inbox)\b', '', clean, flags=re.I)
    clean = re.sub(r'\s+', ' ', clean).strip()
    
    print(f"  CLEANED: {repr(clean)}")
