import sqlite3

db_path = r"C:\Users\davi6\Downloads\takeout-20260921T002237Z-1-001\Takeout\Voice\HereHandymanVoiceDatabase\here_handyman_voice.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

for target in ['%2016810630%', '%2025008937%']:
    cur.execute("SELECT id, name, phone FROM customers WHERE phone LIKE ?;", (target,))
    cust = cur.fetchone()
    print(f"--- CUST: {cust} ---")
    if cust:
        cid = cust[0]
        cur.execute("SELECT message_text FROM messages WHERE customer_id = ?;", (cid,))
        msgs = cur.fetchall()
        print("MESSAGES:", msgs)
        cur.execute("SELECT voicemail_text FROM voicemails WHERE customer_id = ?;", (cid,))
        vms = cur.fetchall()
        print("VOICEMAILS:", vms)
