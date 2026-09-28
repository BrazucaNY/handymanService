import json

with open('scripts/trial_customer_batch.json', encoding='utf-8') as f:
    trial_data = json.load(f)

json_str = json.dumps(trial_data, indent=6, ensure_ascii=False)

with open('dashboard.html', encoding='utf-8') as f:
    content = f.read()

start_marker = "var trialVoiceBatch = ["
end_marker = "];\n\n    document.getElementById('importVoiceBatchBtn')"

s_idx = content.find(start_marker)
e_idx = content.find(end_marker, s_idx)

if s_idx != -1 and e_idx != -1:
    new_content = content[:s_idx] + "var trialVoiceBatch = " + json_str + content[e_idx + 2:]
    with open('dashboard.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully embedded clean trialVoiceBatch into dashboard.html!")
else:
    print("Could not locate trialVoiceBatch markers in dashboard.html:", s_idx, e_idx)
