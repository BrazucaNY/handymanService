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
  const [yr, mo, dy] = date.split('-').map(Number);
  // 00:00 EDT (UTC-4) = 04:00 UTC
  const dayStart = new Date(Date.UTC(yr, mo - 1, dy, 4, 0, 0)).toISOString();
  // 23:59:59 EDT (UTC-4) = 03:59:59 UTC next day
  const dayEnd = new Date(Date.UTC(yr, mo - 1, dy + 1, 3, 59, 59)).toISOString();

  // 1. Query Google Calendar API for real-time busy ranges (Single Source of Truth)
  try {
    const googleBusy = await getGoogleCalendarBusyRanges(dayStart, dayEnd);
    if (googleBusy && googleBusy.length > 0) {
      bookedRanges.push(...googleBusy);
    }
  } catch (gErr) {
    console.error("Google Calendar API check warning:", gErr);
  }

  // 2. If Supabase credentials are valid, query database bookings (excluding test bookings by David)
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_URL.includes("YOUR_SUPABASE")) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/bookings?start_time=gte.${encodeURIComponent(dayStart)}&start_time=lte.${encodeURIComponent(dayEnd)}&status=eq.confirmed&customer_name=neq.David&select=start_time,end_time,customer_name`;

      const response = await fetch(url, {
        headers: {
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        }
      });

      if (response.ok) {
        const rows = await response.json();
        const supabaseRanges = (rows || [])
          .filter(r => {
            const name = (r.customer_name || '').toLowerCase();
            return !name.includes('david') && !name.includes('test');
          })
          .map(r => ({
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

  // 7:00 AM EDT = 11:00 UTC, 8:00 PM EDT = 00:00 UTC next day (24:00 UTC)
  const workStartMs = Date.UTC(yr, mo - 1, dy, 11, 0, 0);
  const workEndMs = Date.UTC(yr, mo - 1, dy, 24, 0, 0);
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
