import os

if os.path.exists('.env'):
    with open('.env', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, val = line.split('=', 1)
                status = "configured" if val.strip() else "empty"
                print(f"{key}: {status}")
else:
    print(".env file does not exist")
