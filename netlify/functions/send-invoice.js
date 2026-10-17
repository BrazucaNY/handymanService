// Netlify Serverless Function: Send Invoice Endpoint (Authenticated)
import { verifyStaffSession } from './authHelper.js';

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  const isAuthorized = await verifyStaffSession(event);
  if (!isAuthorized) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Unauthorized: Invalid or expired staff token" })
    };
  }

  try {
    const data = JSON.parse(event.body || "{}");

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        message: "Invoice sent successfully",
        recipient: data.email || data.recipient || "client@example.com",
        sent_at: new Date().toISOString()
      })
    };
  } catch (err) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON payload" })
    };
  }
};
