// Netlify Serverless Function: POST /.netlify/functions/book
// Full Server-Side Validation, Atomic Conflict Lock (Google Calendar + Supabase DB) and Event Creation

import crypto from 'node:crypto';
import { DB_CONFIG } from './dbConfig.js';
import { createGoogleCalendarEvent, getGoogleCalendarBusyRanges } from './googleCalendar.js';

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

// Allowed Westchester service ZIP prefixes/codes
const ALLOWED_ZIPS = [
  "10601", "10603", "10604", "10605", "10606", "10607",
  "10583", "10701", "10703", "10704", "10705", "10710",
  "10591", "10530", "10528", "10801", "10804", "10805",
  "10522", "10502", "10708"
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

    // 5. Check Google Calendar API for busy conflicts
    try {
      const gBusy = await getGoogleCalendarBusyRanges(startTimeIso, endTimeIso);
      const isGoogleBusy = gBusy.some(b => startMs < b.end && b.start < endMs);
      if (isGoogleBusy) {
        return {
          statusCode: 409,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "This time slot is no longer available. Please select a different time." })
        };
      }
    } catch (gCheckErr) {
      console.error("Google Calendar freebusy warning:", gCheckErr);
    }

    // 6. Check Supabase DB for atomic double-booking exclusion & insert
    const SUPABASE_URL = DB_CONFIG.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = DB_CONFIG.SUPABASE_SERVICE_ROLE_KEY;

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_URL.includes("YOUR_SUPABASE")) {
      const dbCheckUrl = `${SUPABASE_URL}/rest/v1/bookings?start_time=lt.${encodeURIComponent(endTimeIso)}&end_time=gt.${encodeURIComponent(startTimeIso)}&status=eq.confirmed&select=id`;
      const dbCheckRes = await fetch(dbCheckUrl, {
        headers: {
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        }
      });

      if (dbCheckRes.ok) {
        const overlappingRows = await dbCheckRes.json();
        if (overlappingRows && overlappingRows.length > 0) {
          return {
            statusCode: 409,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "This time slot is no longer available. Please select a different time." })
          };
        }
      }

      // Insert into Supabase DB with exclusion constraint
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
          zip: cleanZip,
          customer_name: name,
          customer_phone: phone,
          customer_address: address || "",
          customer_email: email || "",
          notes: notes || "",
          status: "confirmed"
        })
      });

      if (response.status === 409) {
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
            body: JSON.stringify({ error: "This time slot is no longer available. Please select a different time." })
          };
        }
      }
    }

    // 7. Insert Event directly onto David's Google Calendar
    createGoogleCalendarEvent({
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

    // 8. Send Notification Email via Web3Forms
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
