// Netlify Serverless Function: POST /.netlify/functions/book
// Full Server-Side Validation, Google Calendar Single Source of Truth Lock and Event Creation

import crypto from 'node:crypto';
import { DB_CONFIG } from './dbConfig.js';
import { createGoogleCalendarEvent, getGoogleCalendarBusyRanges } from './googleCalendar.js';
import { createSetmoreAppointment } from './setmore.js';
import { sendOwnerEmail, formatEastern } from './notify.js';

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

// Allowed service ZIP codes (Westchester + NYC Boroughs + Long Island)
const ALLOWED_ZIPS = [
  // Westchester County
  "10601", "10603", "10604", "10605", "10606", "10607",
  "10583", "10528", "10577", "10580", "10573", "10538",
  "10543", "10504", "10514", "10506", "10536", "10549",
  "10570", "10510", "10562", "10591", "10533", "10522",
  "10706", "10530", "10502", "10523", "10595", "10708",
  "10707", "10709", "10803", "10801", "10804", "10805",
  "10701", "10703", "10704", "10705", "10710",
  // NYC Boroughs
  "10001", "10002", "10003", "10004", "10005", "10006", "10007", "10008", "10009", "10010", "10011", "10012", "10013", "10014", "10015", "10016", "10017", "10018", "10019", "10020", "10021", "10022", "10023", "10024", "10025", "10026", "10027", "10028", "10029", "10030", "10031", "10032", "10033", "10034", "10035", "10036", "10037", "10038", "10039", "10040", "10041", "10042", "10043", "10044", "10045",
  "11201", "11203", "11204", "11205", "11206", "11207", "11208", "11209", "11210", "11211", "11212", "11213", "11214", "11215", "11216", "11217", "11218", "11219", "11220", "11221", "11222", "11223", "11224", "11225", "11226", "11227", "11228", "11229", "11230", "11231", "11232", "11233", "11234", "11235", "11236", "11237", "11238", "11239", "11240", "11241", "11242", "11243", "11244", "11245", "11246", "11247", "11248", "11249", "11250", "11251", "11252", "11253", "11254", "11255", "11256",
  "11354", "11355", "11356", "11357", "11358", "11359", "11360", "11361", "11362", "11363", "11364", "11365", "11366", "11367", "11368", "11369", "11370", "11371", "11372", "11373", "11374", "11375", "11376", "11377", "11378", "11379", "11380", "11381", "11382", "11383", "11384", "11385", "11386", "11387", "11388", "11390", "11394", "11395", "11396", "11397", "11398", "11399",
  "10451", "10452", "10453", "10454", "10455", "10456", "10457", "10458", "10459", "10460", "10461", "10462", "10463", "10464", "10465", "10466", "10467", "10468", "10469", "10470", "10471", "10472", "10473", "10474", "10475",
  "10301", "10302", "10303", "10304", "10305", "10306", "10307", "10308", "10309", "10310", "10311", "10312", "10313", "10314",
  // Long Island
  "11520", "11521", "11522", "11523", "11524", "11525", "11526", "11528", "11530", "11542", "11545", "11547", "11548", "11550", "11551", "11552", "11553", "11554", "11556", "11557", "11558", "11559", "11560", "11561", "11563", "11564", "11565", "11566", "11567", "11568", "11569", "11572", "11575", "11577", "11579",
  "11725", "11727", "11735", "11742", "11743", "11747", "11758", "11763", "11765", "11767", "11768", "11772", "11777", "11784", "11786", "11787", "11788", "11790", "11797",
  "11706", "11710", "11714", "11717", "11719", "11720", "11722", "11725", "11727", "11735", "11742", "11743", "11747", "11758", "11763", "11765", "11767", "11768", "11772", "11777", "11784", "11786", "11787", "11788", "11790", "11797",
  "11768", "11777", "11779", "11786", "11787", "11788", "11794"
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
    if (!zip || !serviceId || !start || !name || !phone || !email) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing required fields (zip, serviceId, start, name, phone, email)." })
      };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Please provide a valid email address." })
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
    let calendarEventId = null;
    try {
      calendarEventId = await createGoogleCalendarEvent({
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
      });
      if (!calendarEventId) {
        console.error("Google Calendar event was not created (missing auth or API error).");
      }
    } catch (gErr) {
      console.error("Google Calendar Event Creation Error:", gErr);
    }

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

    // 8. Send Instant Notification Email (must await so Netlify does not freeze the request)
    const easternTime = formatEastern(startTimeIso);
    const emailSent = await sendOwnerEmail({
      subject: `NEW APPOINTMENT BOOKED #${bookingId}`,
      fromName: "Here Handyman Direct Booking",
      replyTo: email,
      message: `NEW APPOINTMENT CONFIRMED!

Booking ID: ${bookingId}
Name: ${name}
Phone: ${phone}
Email: ${email || "Not provided"}
Address: ${address || "Not provided"}
ZIP: ${cleanZip}
Service: ${serviceId}
Date & Time: ${easternTime}
Notes: ${notes || "None"}
Google Calendar: ${calendarEventId ? "Added" : "FAILED - check Netlify env vars"}`
    });
    if (!emailSent) {
      console.error("Owner booking email failed to send for", bookingId);
    }

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
