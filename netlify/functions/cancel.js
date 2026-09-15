// Netlify Serverless Function: POST /.netlify/functions/cancel
// Online Customer Appointment Cancellation with Google Calendar Deletion & Supabase Audit Update

import { DB_CONFIG } from './dbConfig.js';
import { deleteGoogleCalendarEventByBookingId } from './googleCalendar.js';

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (parseErr) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid JSON request body." })
      };
    }

    const { bookingId, email } = body;

    if (!bookingId || !email) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Booking ID and Email Address are required to cancel an appointment." })
      };
    }

    const cleanBookingId = String(bookingId).trim().toUpperCase();
    const cleanEmail = String(email).trim().toLowerCase();

    // 1. Check Supabase DB for matching booking
    const SUPABASE_URL = DB_CONFIG.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = DB_CONFIG.SUPABASE_SERVICE_ROLE_KEY;

    let dbBooking = null;

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_URL.includes("YOUR_SUPABASE")) {
      const getRes = await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=eq.${encodeURIComponent(cleanBookingId)}`, {
        headers: {
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        }
      });

      if (getRes.ok) {
        const rows = await getRes.json();
        if (rows && rows.length > 0) {
          dbBooking = rows[0];
        }
      }
    }

    // 2. Validate booking existence and email match if recorded in DB
    if (dbBooking) {
      if (dbBooking.status === "cancelled") {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "This appointment has already been cancelled." })
        };
      }

      const storedEmail = (dbBooking.customer_email || "").trim().toLowerCase();
      if (storedEmail && storedEmail !== cleanEmail) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "The email address provided does not match our records for this booking." })
        };
      }

      // Update status to cancelled in Supabase DB
      await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=eq.${encodeURIComponent(cleanBookingId)}`, {
        method: "PATCH",
        headers: {
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({ status: "cancelled" })
      }).catch(err => console.error("Supabase update error:", err));
    }

    // 3. Delete event from David's Google Calendar (Single Source of Truth)
    const calendarDeleted = await deleteGoogleCalendarEventByBookingId(cleanBookingId, cleanEmail);

    if (!dbBooking && !calendarDeleted) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Booking ID not found. Please verify your booking ID." })
      };
    }

    // 4. Send Instant Cancellation Alert Email via Web3Forms (non-blocking)
    const custName = dbBooking ? dbBooking.customer_name : "Customer";
    const custPhone = dbBooking ? dbBooking.customer_phone : "N/A";
    const startTime = dbBooking ? dbBooking.start_time : "N/A";

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: "5cd5e45a-9146-4c3a-ac2f-8b2904476cf0",
        subject: `❌ APPOINTMENT CANCELLED #${cleanBookingId}`,
        from_name: "Here Handyman Online Cancellation",
        message: `AN APPOINTMENT HAS BEEN CANCELLED ONLINE\n\nBooking ID: ${cleanBookingId}\nCustomer Name: ${custName}\nPhone: ${custPhone}\nEmail: ${cleanEmail}\nScheduled Start Time: ${startTime}\nGoogle Calendar Removed: ${calendarDeleted ? 'YES' : 'NO/NOT FOUND'}`
      })
    }).catch(err => console.error("Web3Forms cancellation email background error:", err));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        bookingId: cleanBookingId,
        message: `Appointment ${cleanBookingId} has been successfully cancelled.`
      })
    };

  } catch (err) {
    console.error("Cancellation handler error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal server error during cancellation." })
    };
  }
}
