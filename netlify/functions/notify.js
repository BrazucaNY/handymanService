const WEB3FORMS_ACCESS_KEY =
  process.env.WEB3FORMS_ACCESS_KEY ||
  process.env.WEB3FORMS_KEY ||
  "";

export const OWNER_EMAIL =
  process.env.OWNER_EMAIL || "davi65@gmail.com";

function isValidEmail(value) {
  return (
    typeof value === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value.trim()
    )
  );
}

export function formatEastern(iso) {
  const date = new Date(iso);

  if (isNaN(date.getTime())) {
    return String(iso || "Unknown");
  }

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

export async function sendOwnerEmail({
  subject,
  fromName,
  replyTo,
  message
}) {
  console.log("=== STARTING WEB3FORMS EMAIL ===");

  console.log("Subject:", subject);
  console.log("Owner email:", OWNER_EMAIL);
  console.log(
    "Web3Forms key configured:",
    !!WEB3FORMS_ACCESS_KEY
  );

  if (!WEB3FORMS_ACCESS_KEY) {
    console.error(
      "ERROR: WEB3FORMS_ACCESS_KEY is missing"
    );
    return false;
  }

  const replyEmail = isValidEmail(replyTo)
    ? replyTo.trim()
    : OWNER_EMAIL;

  const senderName =
    fromName || "Here Handyman Direct Booking";

  const payload = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject,
    from_name: senderName,
    name: senderName,
    email: OWNER_EMAIL,
    replyto: replyEmail,
    message
  };

  console.log(
    "Sending booking email through Web3Forms..."
  );

  try {
    const res = await fetch(
      "https://api.web3forms.com/submit",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const responseText = await res.text();

    console.log(
      "Web3Forms HTTP status:",
      res.status
    );

    console.log(
      "Web3Forms raw response:",
      responseText
    );

    let data = {};

    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error(
        "Web3Forms returned non-JSON response"
      );
    }

    if (!res.ok) {
      console.error(
        "Web3Forms HTTP error:",
        res.status,
        responseText
      );

      return false;
    }

    if (data.success === false) {
      console.error(
        "Web3Forms rejected the email:",
        data
      );

      return false;
    }

    console.log(
      "Web3Forms email sent successfully"
    );

    return true;

  } catch (error) {
    console.error(
      "Web3Forms request error:",
      error
    );

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
