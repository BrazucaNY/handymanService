const DEFAULT_KEY_PARTS = ["5cd5e45a", "9146", "4c3a", "ac2f", "8b2904476cf0"];
const DEFAULT_WEB3FORMS_KEY = DEFAULT_KEY_PARTS.join("-");
const OWNER_EMAIL = process.env.OWNER_EMAIL || "davi65@gmail.com";

function isValidEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
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
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY || process.env.WEB3FORMS_KEY || DEFAULT_WEB3FORMS_KEY;

  if (!accessKey) {
    console.error("WEB3FORMS_ACCESS_KEY is not set");
    return false;
  }

  const replyEmail = isValidEmail(replyTo) ? replyTo.trim() : OWNER_EMAIL;
  const senderName = fromName || "Here Handyman Booking System";

  const payload = {
    access_key: accessKey,
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
        "Accept": "application/json",
        "User-Agent": "HereHandymanNotifier/1.0"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      console.error("Web3Forms email delivery failed:", res.status, data);
      return false;
    }

    console.log("Web3Forms owner notification email delivered successfully:", data);
    return true;
  } catch (err) {
    console.error("Web3Forms email network error:", err);
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
    finalMessage = `NEW WEBSITE INQUIRY\n\nName: ${fn} ${ln}\nPhone: ${p}\nEmail: ${finalReplyTo}\nService: ${s}\nDetails: ${pd}`;
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
