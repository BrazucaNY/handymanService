// Netlify Serverless Function: POST /.netlify/functions/reschedule
// Online Customer Appointment Rescheduling with Google Calendar & Supabase Update

import { DB_CONFIG } from './dbConfig.js';
import { updateGoogleCalendarEventByBookingId, getGoogleCalendarBusyRanges } from './googleCalendar.js';

const SERVICE_DURATIONS = {
  tv: 60,
  furniture: 60,
  assembly: 60,
  drywall: 120,
  painting: 120,
  electrical: 60,
  fixtures: 60,
  plumbing: 60,
  general: 180
};

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

    const { bookingId, email, newStart } = body;

    if (!bookingId || !email || !newStart) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Booking ID, Email Address, and New Date/Time are required." })
      };
    }

    const cleanBookingId = String(bookingId).trim().toUpperCase();
    const cleanEmail = String(email).trim().toLowerCase();

    // 1. Validate future date
    const startMs = new Date(newStart).getTime();
    if (isNaN(startMs)) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid new appointment date format." })
      };
    }

    if (startMs <= Date.now()) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "New appointment date must be in the future." })
      };
    }

    // 2. Fetch booking record from Supabase DB
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

    // Validate booking status and email match if DB record exists
    if (dbBooking) {
      if (dbBooking.status === "cancelled") {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "This appointment was cancelled. Please submit a new booking instead." })
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
    }

    // Derive duration and end time
    const serviceId = dbBooking ? dbBooking.service_id : 'general';
    const durationMinutes = SERVICE_DURATIONS[serviceId] || 120;
    const durationMs = durationMinutes * 60 * 1000;
    const bufferMs = 30 * 60 * 1000;
    const endMs = startMs + durationMs + bufferMs;
    const newEndIso = new Date(endMs).toISOString();

    // 3. FreeBusy Check on Google Calendar for the new time
    const newStartDate = new Date(newStart);
    const dayStartIso = new Date(Date.UTC(newStartDate.getFullYear(), newStartDate.getMonth(), newStartDate.getDate(), 0, 0, 0)).toISOString();
    const dayEndIso = new Date(Date.UTC(newStartDate.getFullYear(), newStartDate.getMonth(), newStartDate.getDate(), 23, 59, 59)).toISOString();

    const busyRanges = await getGoogleCalendarBusyRanges(dayStartIso, dayEndIso);
    const conflict = busyRanges.some(range => {
      return (startMs < range.end && endMs > range.start);
    });

    if (conflict) {
      return {
        statusCode: 409,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "The requested new date and time slot is unavailable. Please select another time window." })
      };
    }

    // 4. Update Google Calendar Event
    const calendarUpdated = await updateGoogleCalendarEventByBookingId(cleanBookingId, cleanEmail, newStart, newEndIso);

    if (!dbBooking && !calendarUpdated) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Booking ID not found. Please verify your booking ID and email." })
      };
    }

    // 5. Update Supabase DB Record
    if (dbBooking && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=eq.${encodeURIComponent(cleanBookingId)}`, {
        method: "PATCH",
        headers: {
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          start_time: newStart,
          end_time: newEndIso,
          status: "rescheduled",
          updated_at: new Date().toISOString()
        })
      }).catch(err => console.error("Supabase reschedule update error:", err));
    }

    // 6. Send Web3Forms Notification Email
    const custName = dbBooking ? dbBooking.customer_name : "Customer";
    const custPhone = dbBooking ? dbBooking.customer_phone : "N/A";
    const serviceName = dbBooking ? dbBooking.service_name : "Handyman Service";
    const formattedNewTime = new Date(newStart).toLocaleString("en-US", {
      timeZone: "America/New_York",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: "5cd5e45a-9146-4c3a-ac2f-8b2904476cf0",
        subject: `📅 APPOINTMENT RESCHEDULED #${cleanBookingId}`,
        from_name: "Here Handyman Online Reschedule",
        message: `AN APPOINTMENT HAS BEEN RESCHEDULED ONLINE\n\nBooking ID: ${cleanBookingId}\nCustomer: ${custName}\nPhone: ${custPhone}\nEmail: ${cleanEmail}\nService: ${serviceName}\nNew Date & Time: ${formattedNewTime}\nGoogle Calendar Updated: ${calendarUpdated ? 'YES' : 'NO/NOT FOUND'}`
      })
    }).catch(err => console.error("Web3Forms reschedule email background error:", err));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        bookingId: cleanBookingId,
        newStart: newStart,
        formattedTime: formattedNewTime,
        message: `Appointment ${cleanBookingId} has been successfully rescheduled for ${formattedNewTime}.`
      })
    };

  } catch (err) {
    console.error("Reschedule handler error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal server error during rescheduling." })
    };
  }
}
