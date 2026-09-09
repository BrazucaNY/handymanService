// Netlify Serverless Function: POST /.netlify/functions/book
// Locks a booking slot atomically in PostgreSQL and triggers notification email

import crypto from 'node:crypto';

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const body = JSON.parse(event.body);
    const { zip, serviceId, start, durationMinutes = 60, name, phone, address, email, notes } = body;

    if (!zip || !serviceId || !start || !name || !phone) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing required fields (zip, serviceId, start, name, phone)" })
      };
    }

    const startMs = new Date(start).getTime();
    const durationMs = (durationMinutes || 60) * 60 * 1000;
    const bufferMs = 30 * 60 * 1000; // 30 min travel buffer
    const endMs = startMs + durationMs + bufferMs;

    const startTimeIso = new Date(startMs).toISOString();
    const endTimeIso = new Date(endMs).toISOString();
    const bookingRangeStr = `[${startTimeIso},${endTimeIso})`;

    // Generate unique ID: HH-XXXXXX using crypto
    const bookingId = "HH-" + crypto.randomUUID().slice(0, 8).toUpperCase();

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          id: bookingId,
          booking_range: bookingRangeStr,
          start_time: startTimeIso,
          end_time: endTimeIso,
          service_id: serviceId,
          zip,
          customer_name: name,
          customer_phone: phone,
          customer_address: address || "",
          customer_email: email || "",
          notes: notes || "",
          status: "confirmed"
        })
      });

      if (response.status === 409 || response.status === 400) {
        // Exclusion constraint violation or conflict
        return {
          statusCode: 409,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "This time slot was just booked by another customer. Please select a different time." })
        };
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Supabase insert error:", errorText);
        if (errorText.includes("exclusion") || errorText.includes("overlap") || errorText.includes("duplicate")) {
          return {
            statusCode: 409,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "This time slot is no longer available." })
          };
        }
      }
    }

    // Trigger notification email post-save (Web3Forms side-effect)
    if (process.env.WEB3FORMS_ACCESS_KEY) {
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: process.env.WEB3FORMS_ACCESS_KEY,
          subject: `⚡ NEW APPOINTMENT BOOKED #${bookingId}`,
          from_name: "Here Handyman Direct Booking",
          message: `NEW APPOINTMENT CONFIRMED!\n\nBooking ID: ${bookingId}\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\nZIP: ${zip}\nService: ${serviceId}\nStart Time: ${startTimeIso}\nNotes: ${notes || 'None'}`
        })
      }).catch(err => console.error("Web3Forms email background error:", err));
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        id: bookingId,
        start: startTimeIso,
        message: "Appointment confirmed!"
      })
    };

  } catch (err) {
    console.error("Booking handler error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal server error" })
    };
  }
}
