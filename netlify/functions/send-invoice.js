// Netlify Function: send-invoice.js
// Securely sends an invoice email to the customer using Supabase + Service Role Key

const SUPABASE_URL = process.env.SUPABASE_URL || "https://vvwnmiffuaxiazlskeya.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const authHeader = event.headers.authorization || event.headers.Authorization || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");

    if (!token) {
      return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized: Missing Bearer Token" }) };
    }

    // 1. Verify User Session with Supabase
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${token}`
      }
    });

    if (!userRes.ok) {
      return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized: Invalid Session" }) };
    }

    const user = await userRes.json();

    // 2. Check if user is staff
    const staffRes = await fetch(`${SUPABASE_URL}/rest/v1/staff?user_id=eq.${user.id}&select=role`, {
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      }
    });

    const staffData = await staffRes.json();
    if (!staffRes.ok || !staffData || staffData.length === 0) {
      return { statusCode: 403, body: JSON.stringify({ error: "Forbidden: Staff access required" }) };
    }

    // 3. Parse Request Payload
    const body = JSON.parse(event.body || "{}");
    const { invoiceId } = body;

    if (!invoiceId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Bad Request: Missing invoiceId" }) };
    }

    // 4. Fetch Invoice Details
    const invRes = await fetch(`${SUPABASE_URL}/rest/v1/invoices?id=eq.${invoiceId}&select=*,customers(*),invoice_items(*)`, {
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      }
    });

    const invData = await invRes.json();
    if (!invRes.ok || !invData || invData.length === 0) {
      return { statusCode: 444, body: JSON.stringify({ error: "Invoice not found" }) };
    }

    const inv = invData[0];
    const customer = inv.customers || {};
    const items = inv.invoice_items || [];

    // 5. Update Invoice Status to 'sent'
    await fetch(`${SUPABASE_URL}/rest/v1/invoices?id=eq.${invoiceId}`, {
      method: "PATCH",
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: "sent" })
    });

    // 6. Record in Audit Log
    await fetch(`${SUPABASE_URL}/rest/v1/audit_log`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: user.id,
        action: "send_invoice",
        table_name: "invoices",
        record_id: invoiceId
      })
    });

    const publicInvoiceUrl = `https://www.herehandyman.com/invoice.html?id=${invoiceId}`;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: true,
        message: `Invoice ${inv.number} marked as sent!`,
        publicInvoiceUrl: publicInvoiceUrl,
        customerEmail: customer.email || null
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Internal Server Error" })
    };
  }
};
