import json

new_customer = {
  "id": "cust-harvey-kaminski",
  "name": "Harvey Kaminski",
  "phone": "(914) 589-1751",
  "email": "",
  "address": "6 Hobby Lane",
  "apt": "",
  "town": "Bedford",
  "state": "NY",
  "lead": "Direct Call",
  "service": "Ring Camera Troubleshooting & Repair (Front Doorbell + Backyard)",
  "status": "Active",
  "date": "2026-09-28",
  "hasGbpReview": False,
  "notes": "Ring cameras: Front doorbell camera foggy lens + Backyard camera offline. Address: 6 Hobby Lane, Bedford, NY 10506. Scheduled visit for Friday.",
  "quoted_prices": [],
  "counts": {
    "sms": 3,
    "calls": 1,
    "voicemails": 0
  },
  "history": [
    {
      "type": "sms",
      "date": "2026-09-28T13:47:00-04:00",
      "direction": "incoming",
      "content": "David, this is Harvey Kaminski. We just spoke on the phone about two issues I am having with the ring cameras at my house in Westchester. The front camera attached to the doorbell is foggy and difficult to make out the picture. There is also another camera in the backyard which is off-line. My address is 6 Hobby Lane Bedford, NY 10506. It would be best if you could arrange a visit anytime this Friday. Please let me know what other information you require. Thank you. Harvey Kaminski C- 914-589-1751"
    },
    {
      "type": "sms",
      "date": "2026-09-28T13:47:30-04:00",
      "direction": "outgoing",
      "content": "Me :\nHello Harvey, thank you for sending over the address and details. Could you please send over a photo of the front doorbell camera lens, as well as a screenshot of what the foggy view looks like in your Ring app? If possible, a photo of the backyard camera so I can identify the exact models and prepare the proper tools before Friday. David Rodrigues | Here Handyman Phone: (516) 350-0801 Website: herehandyman.com"
    },
    {
      "type": "sms",
      "date": "2026-09-28T13:54:00-04:00",
      "direction": "incoming",
      "content": "Thanks, David. I will send it to you later."
    }
  ]
}

# 1. Update all_voice_customers_with_history.json
with open(r'scripts/all_voice_customers_with_history.json', encoding='utf-8') as f:
    full_data = json.load(f)

# Check if phone already exists
full_data = [c for c in full_data if c.get('phone') != "(914) 589-1751"]
full_data.insert(0, new_customer)

with open(r'scripts/all_voice_customers_with_history.json', 'w', encoding='utf-8') as f:
    json.dump(full_data, f, indent=2, ensure_ascii=False)

print(f"Added Harvey Kaminski to all_voice_customers_with_history.json (Total: {len(full_data)})")

# 2. Update all_voice_customers.json
light_cust = dict(new_customer)
del light_cust['history']

with open(r'scripts/all_voice_customers.json', encoding='utf-8') as f:
    light_data = json.load(f)

light_data = [c for c in light_data if c.get('phone') != "(914) 589-1751"]
light_data.insert(0, light_cust)

with open(r'scripts/all_voice_customers.json', 'w', encoding='utf-8') as f:
    json.dump(light_data, f, indent=2, ensure_ascii=False)

print(f"Added Harvey Kaminski to all_voice_customers.json (Total: {len(light_data)})")

# 3. Update trial_customer_batch.json
with open(r'scripts/trial_customer_batch.json', encoding='utf-8') as f:
    trial_data = json.load(f)

trial_data = [c for c in trial_data if c.get('phone') != "(914) 589-1751"]
trial_data.insert(0, new_customer)

with open(r'scripts/trial_customer_batch.json', 'w', encoding='utf-8') as f:
    json.dump(trial_data, f, indent=2, ensure_ascii=False)

print(f"Added Harvey Kaminski to trial_customer_batch.json")
