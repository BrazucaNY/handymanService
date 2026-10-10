import re
import os

def update_notify_function():
    notify_path = 'netlify/functions/notify.js'
    code = '''const WEB3FORMS_ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY || process.env.WEB3FORMS_KEY || "";
const OWNER_EMAIL = process.env.OWNER_EMAIL || "davi65@gmail.com";

function isValidEmail(value) {
  return typeof value === "string" && /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value.trim());
}

export function formatEastern(iso) {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return String(iso || "Unknown");
  return date.toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

export async function sendOwnerEmail({ subject, fromName, replyTo, message }) {
  if (!WEB3FORMS_ACCESS_KEY) {
    console.error("WEB3FORMS_ACCESS_KEY is not set");
    return false;
  }

  const replyEmail = isValidEmail(replyTo) ? replyTo.trim() : OWNER_EMAIL;
  const senderName = fromName || "Here Handyman Booking";

  const payload = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: subject || "New Inquiry - Here Handyman",
    from_name: senderName,
    name: senderName,
    email: replyEmail,
    replyto: replyEmail,
    message: message || "No message body provided."
  };

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      console.error("Web3Forms email failed:", res.status, data);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Web3Forms email error:", err);
    return false;
  }
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    body = {};
  }

  const { subject, from_name, fromName, replyto, replyTo, email, message, name, phone, first_name, last_name, project_details, service } = body;

  const finalSubject = subject || "New Inquiry - Here Handyman";
  const finalFromName = fromName || from_name || name || "Here Handyman Website";
  const finalReplyTo = replyTo || replyto || email || OWNER_EMAIL;

  let finalMessage = message;
  if (!finalMessage) {
    const fn = first_name || name || "";
    const ln = last_name || "";
    const p = phone || "";
    const s = service || "";
    const pd = project_details || "";
    finalMessage = `NEW WEBSITE INQUIRY\\n\\nName: ${fn} ${ln}\\nPhone: ${p}\\nEmail: ${finalReplyTo}\\nService: ${s}\\nDetails: ${pd}`;
  }

  const success = await sendOwnerEmail({
    subject: finalSubject,
    fromName: finalFromName,
    replyTo: finalReplyTo,
    message: finalMessage
  });

  return {
    statusCode: success ? 200 : 500,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ success, message: success ? "Form submitted successfully" : "Email delivery failed" })
  };
}
'''
    with open(notify_path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("Updated netlify/functions/notify.js with POST endpoint handler.")

def update_index_html():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove hidden input for access_key
    content = re.sub(r'<input\s+type="hidden"\s+name="access_key"\s+value="[^"]*">\s*', '', content)

    # 2. Remove textData.append('access_key', ...)
    content = re.sub(r'textData\.append\(\s*[\'\"]access_key[\'\"]\s*,\s*[\'\"][^\'\"]*[\'\"]\s*\);\s*', '', content)

    # 3. Update fetch call to point to /.netlify/functions/notify
    content = content.replace(
        'fetch("https://api.web3forms.com/submit", {',
        'fetch("/.netlify/functions/notify", {'
    )

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Removed hardcoded access_key from index.html.")

def update_booking_js():
    with open('js/booking.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace fetch to web3forms with /.netlify/functions/notify
    content = content.replace(
        'await fetch("https://api.web3forms.com/submit", {',
        'await fetch("/.netlify/functions/notify", {'
    )
    content = re.sub(r'access_key:\s*\"[^\"]*\",\s*', '', content)

    with open('js/booking.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Removed hardcoded access_key from js/booking.js.")

if __name__ == '__main__':
    update_notify_function()
    update_index_html()
    update_booking_js()
