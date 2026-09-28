import sqlite3
import os

db_path = r"C:\Users\davi6\Downloads\takeout-20260921T002237Z-1-001\Takeout\Voice\HereHandymanVoiceDatabase\here_handyman_voice.db"

if not os.path.exists(db_path):
    print("DB file not found:", db_path)
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("=== TABLES IN DATABASE ===")
for t in tables:
    tname = t[0]
    cursor.execute(f"SELECT count(*) FROM {tname};")
    cnt = cursor.fetchone()[0]
    print(f"Table '{tname}': {cnt} rows")

print("\n=== SAMPLE CUSTOMERS (FIRST 10) ===")
cursor.execute("SELECT id, phone, name, message_count, call_count, voicemail_count, notes FROM customers LIMIT 10;")
for row in cursor.fetchall():
    print(row)

print("\n=== SAMPLE MESSAGES WITH POTENTIAL JOB/PRICE/ADDRESS DETAILS (FIRST 10) ===")
cursor.execute("SELECT id, customer_id, event_datetime_local, direction, message_text FROM messages WHERE length(message_text) > 10 LIMIT 10;")
for row in cursor.fetchall():
    print(row)

conn.close()
