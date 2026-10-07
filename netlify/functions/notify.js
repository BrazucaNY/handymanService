const WEB3FORMS_ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY || process.env.WEB3FORMS_KEY || "5cd5e45a-9146-4c3a-ac2f-8b2904476cf0";

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
  if (!WEB3FORMS_ACCESS_KEY) {
    console.error("WEB3FORMS_ACCESS_KEY is not set");
    return false;
  }

  const replyEmail = isValidEmail(replyTo) ? replyTo.trim() : OWNER_EMAIL;
  const senderName = fromName || "Here Handyman Booking";

  const payload = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject,
    from_name: senderName,
    name: senderName,
    email: OWNER_EMAIL,
    replyto: replyEmail,
    message
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

export async function handler() {
  return {
    statusCode: 404,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: "Not a public endpoint" })
  };
}
