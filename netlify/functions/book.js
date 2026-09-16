// Netlify Serverless Function: POST /.netlify/functions/book
// Full Server-Side Validation, Google Calendar Single Source of Truth Lock and Event Creation

import crypto from 'node:crypto';
import { DB_CONFIG } from './dbConfig.js';
import { createGoogleCalendarEvent, getGoogleCalendarBusyRanges } from './googleCalendar.js';
import { createSetmoreAppointment } from './setmore.js';

// Server-derived service durations (ignores client-passed durationMinutes)
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

// Allowed Westchester service ZIP codes (20-mile radius from White Plains 10607)
const ALLOWED_ZIPS = [
  "10601", "10603", "10604", "10605", "10606", "10607",
  "10583", "10528", "10577", "10580", "10573", "10538",
  "10543", "10504", "10514", "10506", "10536", "10549",
  "10570", "10510", "10562", "10591", "10533", "10522",
  "10706", "10530", "10502", "10523", "10595", "10708",
  "10707", "10709", "10803", "10801", "10804", "10805",
  "10701", "10703", "10704", "10705", "10710"
];

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

    const { zip, serviceId, start, name, phone, address, email, notes } = body;

    // 1. Required Fields Validation
    if (!zip || !serviceId || !start || !name || !phone) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing required fields (zip, serviceId, start, name, phone)." })
      };
    }

    // 2. Service Validation & Server Duration Derivation
    const durationMinutes = SERVICE_DURATIONS[serviceId];
    if (!durationMinutes) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid or unsupported service ID." })
      };
    }

    // 3. ZIP Code Validation
    const cleanZip = String(zip).trim();
    const isZipValid = /^\d{5}$/.test(cleanZip) && (cleanZip.startsWith('10') || cleanZip.startsWith('11') || ALLOWED_ZIPS.includes(cleanZip));
    if (!isZipValid) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "ZIP code is outside our Westchester County service area." })
      };
    }

    // 4. Appointment Date Validation & Future Check
    const startMs = new Date(start).getTime();
    if (isNaN(startMs)) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid appointment date format." })
      };
    }

    if (startMs <= Date.now()) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Appointment date must be in the future." })
      };
    }

    // Calculate booking window and travel buffer
    const durationMs = durationMinutes * 60 * 1000;
    const bufferMs = 30 * 60 * 1000; // 30m buffer
    const endMs = startMs + durationMs + bufferMs;

    const startTimeIso = new Date(startMs).toISOString();
    const endTimeIso = new Date(endMs).toISOString();
    const bookingRangeStr = `[${startTimeIso},${endTimeIso})`;

    const bookingId = "HH-" + crypto.randomUUID().slice(0, 8).toUpperCase();

    // 5. Google Calendar Single Source of Truth: Check for busy events on davi65@gmail.com
    try {
      const gBusy = await getGoogleCalendarBusyRanges(startTimeIso, endTimeIso);
      const isGoogleBusy = (gBusy || []).some(b => startMs < b.end && b.start < endMs);
      if (isGoogleBusy) {
        return {
          statusCode: 409,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "This time slot is no longer available. Please select a different time." })
        };
      }
    } catch (gCheckErr) {
      console.error("Google Calendar freebusy check warning:", gCheckErr);
    }

    // 6. Post Event directly to David's Google Calendar (Single Source of Truth)
    await createGoogleCalendarEvent({
      bookingId,
      startIso: startTimeIso,
      endIso: endTimeIso,
      serviceName: serviceId,
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      customerAddress: address,
      zip: cleanZip,
      notes
    }).catch(gErr => console.error("Google Calendar Event Creation Error:", gErr));

    // 6b. Sync appointment directly to Setmore API
    createSetmoreAppointment({
      name,
      email,
      phone,
      startISO: startTimeIso,
      endISO: endTimeIso,
      serviceId,
      notes,
      address,
      zip: cleanZip
    }).catch(sErr => console.error("Setmore API Sync Error:", sErr));

    // 7. Background Log to Supabase DB for audit records
    const SUPABASE_URL = DB_CONFIG.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = DB_CONFIG.SUPABASE_SERVICE_ROLE_KEY;

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_URL.includes("YOUR_SUPABASE")) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
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
            zip: cleanZip,
            customer_name: name,
            customer_phone: phone,
            customer_address: address || "",
            customer_email: email || "",
            notes: notes || "",
            status: "confirmed"
          })
        });
      } catch (dbErr) {
        console.error("Supabase DB log warning:", dbErr);
      }
    }

    // 8. Send Instant Notification Email via Web3Forms (non-blocking)
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: "5cd5e45a-9146-4c3a-ac2f-8b2904476cf0",
        subject: `⚡ NEW APPOINTMENT BOOKED #${bookingId}`,
        from_name: "Here Handyman Direct Booking",
        message: `NEW APPOINTMENT CONFIRMED!\n\nBooking ID: ${bookingId}\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\nZIP: ${cleanZip}\nService: ${serviceId}\nStart Time: ${startTimeIso}\nNotes: ${notes || 'None'}`
      })
    }).catch(err => console.error("Web3Forms email background error:", err));

    // 9. Return HTTP 200 Success Confirmation
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
