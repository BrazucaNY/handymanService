// Netlify Serverless Function: GET /.netlify/functions/availability
// Queries Supabase DB for confirmed bookings on a date and returns open time slots

import { DB_CONFIG } from './dbConfig.js';
import { getGoogleCalendarBusyRanges } from './googleCalendar.js';

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const { date, serviceId } = event.queryStringParameters || {};

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing or invalid 'date' parameter (expected YYYY-MM-DD)" })
    };
  }

  const SUPABASE_URL = DB_CONFIG.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = DB_CONFIG.SUPABASE_SERVICE_ROLE_KEY;

  let bookedRanges = [];
  const dayStart = `${date}T00:00:00-04:00`;
  const dayEnd = `${date}T23:59:59-04:00`;

  // 1. Query Google Calendar API for real-time busy ranges (Single Source of Truth)
  try {
    const googleBusy = await getGoogleCalendarBusyRanges(dayStart, dayEnd);
    if (googleBusy && googleBusy.length > 0) {
      bookedRanges.push(...googleBusy);
    }
  } catch (gErr) {
    console.error("Google Calendar API check warning:", gErr);
  }

  // 2. If Supabase credentials are valid, query database bookings
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_URL.includes("YOUR_SUPABASE")) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/bookings?start_time=gte.${encodeURIComponent(dayStart)}&start_time=lte.${encodeURIComponent(dayEnd)}&status=eq.confirmed&select=start_time,end_time`;

      const response = await fetch(url, {
        headers: {
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        }
      });

      if (response.ok) {
        const rows = await response.json();
        const supabaseRanges = rows.map(r => ({
          start: new Date(r.start_time).getTime(),
          end: new Date(r.end_time).getTime()
        }));
        bookedRanges.push(...supabaseRanges);
      }
    } catch (err) {
      console.error("Database query error:", err);
    }
  }

  // Calculate open slots using range overlap logic
  const durationMinutes = serviceId === "drywall" || serviceId === "painting" ? 120 : (serviceId === "general" ? 180 : 60);
  
  const slots = [];
  const bufferMs = 30 * 60 * 1000; // 30m buffer
  const durationMs = durationMinutes * 60 * 1000;
  const stepMs = 60 * 60 * 1000;

  const workStartMs = new Date(`${date}T07:00:00-04:00`).getTime();
  const workEndMs = new Date(`${date}T20:00:00-04:00`).getTime();
  const nowMs = Date.now();

  for (let currentStart = workStartMs; currentStart + durationMs <= workEndMs; currentStart += stepMs) {
    const candidateTotalEnd = currentStart + durationMs + bufferMs;

    // Exclude past slots or slots less than 1 hour away for same-day bookings
    if (currentStart <= nowMs + 1 * 3600 * 1000) continue;

    const isBlocked = bookedRanges.some(b => currentStart < b.end && b.start < candidateTotalEnd);

    if (!isBlocked) {
      const dateObj = new Date(currentStart);
      const timeLabel = new Intl.DateTimeFormat('en-US', {
        timeZone: "America/New_York",
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(dateObj);

      slots.push({
        iso: dateObj.toISOString(),
        timestamp: currentStart,
        label: timeLabel
      });
    }
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate"
    },
    body: JSON.stringify({ date, serviceId, slots })
  };
}
