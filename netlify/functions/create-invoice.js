// Netlify Function: create-invoice.js
// Securely creates a new Skynova-style invoice with line items in Supabase

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
    const { customer_id, due_date, items, tax } = body;

    if (!customer_id || !items || !Array.isArray(items) || items.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: "Bad Request: customer_id and items are required" }) };
    }

    // Calculate totals
    let subtotal = 0;
    const cleanItems = items.map(item => {
      const qty = parseFloat(item.qty) || 1;
      const unit_price = parseFloat(item.unit_price) || 0;
      subtotal += qty * unit_price;
      return {
        description: item.description || "Service",
        qty,
        unit_price
      };
    });

    const taxAmount = parseFloat(tax) || 0;
    const total = subtotal + taxAmount;

    // Generate Invoice Number (HH-2026-XXXX)
    const year = new Date().getFullYear();
    const countRes = await fetch(`${SUPABASE_URL}/rest/v1/invoices?select=id`, {
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Prefer": "count=exact"
      }
    });
    const rangeHeader = countRes.headers.get("content-range") || "0-0/0";
    const totalCount = parseInt(rangeHeader.split("/")[1] || "0", 10) + 1;
    const invNumber = `HH-${year}-${String(totalCount).padStart(4, "0")}`;

    // 4. Create Invoice Record
    const createInvRes = await fetch(`${SUPABASE_URL}/rest/v1/invoices`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        customer_id,
        number: invNumber,
        status: "draft",
        subtotal: subtotal.toFixed(2),
        tax: taxAmount.toFixed(2),
        total: total.toFixed(2),
        due_date: due_date || new Date().toISOString().split("T")[0]
      })
    });

    const newInvoice = await createInvRes.json();
    if (!createInvRes.ok || !newInvoice || newInvoice.length === 0) {
      return { statusCode: 500, body: JSON.stringify({ error: "Failed to create invoice record" }) };
    }

    const invoiceId = newInvoice[0].id;

    // 5. Insert Line Items
    const itemsToInsert = cleanItems.map(item => ({
      invoice_id: invoiceId,
      ...item
    }));

    await fetch(`${SUPABASE_URL}/rest/v1/invoice_items`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(itemsToInsert)
    });

    // 6. Record Audit Log
    await fetch(`${SUPABASE_URL}/rest/v1/audit_log`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: user.id,
        action: "create_invoice",
        table_name: "invoices",
        record_id: invoiceId
      })
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: true,
        invoice: newInvoice[0]
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Internal Server Error" })
    };
  }
};
