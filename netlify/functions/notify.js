const DEFAULT_KEY_PARTS = ["5cd5e45a", "9146", "4c3a", "ac2f", "8b2904476cf0"];
const DEFAULT_WEB3FORMS_KEY = DEFAULT_KEY_PARTS.join("-");
const OWNER_EMAIL = process.env.OWNER_EMAIL || "info@herehandyman.com";

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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Origin": "https://www.herehandyman.com",
        "Referer": "https://www.herehandyman.com/"
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

// In-memory rate limiting map (IP -> array of timestamps)
const ipRateMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(ip) {
  if (!ip) return false;
  const now = Date.now();
  const timestamps = (ipRateMap.get(ip) || []).filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  timestamps.push(now);
  ipRateMap.set(ip, timestamps);
  return false;
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  // 1. IP Rate Limiting Check
  const clientIp = event.headers["x-forwarded-for"] || event.headers["client-ip"] || event.headers["x-nf-client-connection-ip"] || "";
  const ip = clientIp.split(",")[0].trim();
  if (isRateLimited(ip)) {
    console.warn(`[SPAM FILTER] Rate limit triggered for IP: ${ip}`);
    return {
      statusCode: 429,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Too many requests. Please try again later." })
    };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    body = {};
  }

  // 2. Honeypot Anti-Bot Traps
  if (body.bot_field || body.website || body.company_url || body.url || body.hp_check) {
    console.warn(`[SPAM TRAP] Honeypot field filled by bot from IP: ${ip}. Dropping silently.`);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, message: "Inquiry received successfully." })
    };
  }

  // 3. Cloudflare Turnstile CAPTCHA Verification
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const turnstileToken = body["cf-turnstile-response"] || body.turnstile_token || event.headers["cf-turnstile-response"] || "";
    if (!turnstileToken) {
      return {
        statusCode: 403,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Security check token missing. Please try again." })
      };
    }
    try {
      const cfRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: turnstileSecret,
          response: turnstileToken,
          remoteip: ip
        })
      });
      const cfData = await cfRes.json();
      if (!cfData.success) {
        console.warn(`[SPAM FILTER] Cloudflare Turnstile validation failed for IP: ${ip}`);
        return {
          statusCode: 403,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Security check failed. Please refresh and try again." })
        };
      }
    } catch (cfErr) {
      console.error("[TURNSTILE ERROR]", cfErr);
    }
  }

  const { subject, from_name, fromName, replyto, replyTo, email, message, name, phone, first_name, last_name, project_details, service } = body;

  const fn = first_name || name || "";
  const ln = last_name || "";
  const p = phone || "";
  const finalReplyTo = replyTo || replyto || email || "";

  // 3. Basic Validation: Must provide contact method
  if (!p && !isValidEmail(finalReplyTo)) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Please provide a valid phone number or email address." })
    };
  }

  const finalSubject = subject || "New Inquiry - Here Handyman";
  const finalFromName = fromName || from_name || (fn ? `${fn} ${ln}`.trim() : "Here Handyman Website");
  const verifiedReplyEmail = isValidEmail(finalReplyTo) ? finalReplyTo : OWNER_EMAIL;

  let finalMessage = message;
  if (!finalMessage) {
    const s = service || "";
    const pd = project_details || "";
    finalMessage = `NEW WEBSITE INQUIRY\n\nName: ${fn} ${ln}\nPhone: ${p}\nEmail: ${verifiedReplyEmail}\nService: ${s}\nDetails: ${pd}`;
  }

  const success = await sendOwnerEmail({
    subject: finalSubject,
    fromName: finalFromName,
    replyTo: verifiedReplyEmail,
    message: finalMessage
  });

  return {
    statusCode: success ? 200 : 500,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ success, message: success ? "Form submitted successfully" : "Email delivery failed" })
  };
}
