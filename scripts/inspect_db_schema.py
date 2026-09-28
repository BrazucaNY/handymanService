import sqlite3

db_path = r"C:\Users\davi6\Downloads\takeout-20260921T002237Z-1-001\Takeout\Voice\HereHandymanVoiceDatabase\here_handyman_voice.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [t[0] for t in cur.fetchall()]
print("Tables:", tables)

for table in tables:
    cur.execute(f"PRAGMA table_info({table});")
    cols = cur.fetchall()
    print(f"\n--- Table: {table} ---")
    for c in cols:
        print(c)
