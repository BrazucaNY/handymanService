// Netlify Serverless Helper: Google Calendar API Integration (Zero-dependency Node.js ESM)
import crypto from 'node:crypto';

const saProject = process.env.FIREBASE_PROJECT_ID || ('handyman' + 'service' + 'admin');
const GOOGLE_SA_EMAIL = process.env.GOOGLE_SA_EMAIL || process.env.GOOGLE_SA_SA_EMAIL || `herehandyman-booking@${saProject}.iam.gserviceaccount.com`;
const GOOGLE_SA_PRIVATE_KEY = (process.env.GOOGLE_SA_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || process.env.GOOGLE_CALENDAR_EMAIL || 'davi65@gmail.com';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_OAUTH_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN;

/**
 * Generates an OAuth2 access token.
 * Prefers David's user OAuth refresh token so events land on davi65@gmail.com.
 * Falls back to the service account JWT if user OAuth is not configured.
 */
async function getAccessToken() {
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REFRESH_TOKEN) {
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: GOOGLE_REFRESH_TOKEN,
          grant_type: 'refresh_token'
        })
      });

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        return tokenData.access_token;
      }

      console.warn('Google user OAuth refresh failed, falling back to service account:', await tokenRes.text());
    } catch (oauthErr) {
      console.warn('Google user OAuth error, falling back to service account:', oauthErr);
    }
  }

  if (!GOOGLE_SA_EMAIL || !GOOGLE_SA_PRIVATE_KEY) {
    console.error('Google Calendar auth missing: set GOOGLE_OAUTH_REFRESH_TOKEN or GOOGLE_SA_EMAIL + GOOGLE_SA_PRIVATE_KEY');
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: GOOGLE_SA_EMAIL,
    scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64ClaimSet = Buffer.from(JSON.stringify(claimSet)).toString('base64url');
  const unsignedJwt = `${b64Header}.${b64ClaimSet}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedJwt);
  const signature = signer.sign(GOOGLE_SA_PRIVATE_KEY, 'base64url');
  const jwt = `${unsignedJwt}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!tokenRes.ok) {
    const errorText = await tokenRes.text();
    console.error('Google service account token error:', errorText);
    return null;
  }

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

/**
 * Queries Google Calendar for busy time ranges on a specific date.
 * Returns array of { start: timestampMs, end: timestampMs }
 */
export async function getGoogleCalendarBusyRanges(dayStartIso, dayEndIso) {
  try {
    const token = await getAccessToken();
    if (!token || !GOOGLE_CALENDAR_ID) return [];

    const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timeMin: dayStartIso,
        timeMax: dayEndIso,
        timeZone: 'America/New_York',
        items: [{ id: GOOGLE_CALENDAR_ID }]
      })
    });

    if (!res.ok) {
      console.error('Google FreeBusy error:', await res.text());
      return [];
    }

    const data = await res.json();
    const calendarData = data.calendars && data.calendars[GOOGLE_CALENDAR_ID];
    const busyList = calendarData ? calendarData.busy || [] : [];

    return busyList.map(item => ({
      start: new Date(item.start).getTime(),
      end: new Date(item.end).getTime()
    }));
  } catch (err) {
    console.error('Error fetching Google Calendar busy ranges:', err);
    return [];
  }
}

/**
 * Inserts a new booking event directly into David's Google Calendar.
 */
export async function createGoogleCalendarEvent({
  bookingId,
  startIso,
  endIso,
  serviceName,
  customerName,
  customerPhone,
  customerEmail,
  customerAddress,
  zip,
  notes
}) {
  try {
    const token = await getAccessToken();
    if (!token || !GOOGLE_CALENDAR_ID) return null;

    const attendees = [];
    if (customerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(customerEmail).trim())) {
      attendees.push({ email: String(customerEmail).trim() });
    }

    const eventPayload = {
      summary: `[${bookingId}] ${serviceName} - ${customerName}`,
      location: `${customerAddress || ''}${zip ? `, ZIP ${zip}` : ''}`.trim(),
      description: `APPOINTMENT CONFIRMED FROM WEBSITE\n\nBooking ID: ${bookingId}\nCustomer: ${customerName}\nPhone: ${customerPhone}\nEmail: ${customerEmail || 'Not provided'}\nAddress: ${customerAddress}, ZIP ${zip}\nService: ${serviceName}\nNotes: ${notes || 'None'}`,
      start: { dateTime: startIso, timeZone: 'America/New_York' },
      end: { dateTime: endIso, timeZone: 'America/New_York' },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 1440 },
          { method: 'popup', minutes: 1440 },
          { method: 'popup', minutes: 120 },
          { method: 'popup', minutes: 30 }
        ]
      }
    };

    if (attendees.length) {
      eventPayload.attendees = attendees;
    }

    async function insertEvent(payload, sendUpdates) {
      const qs = sendUpdates ? '?sendUpdates=all' : '?sendUpdates=none';
      return fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_ID)}/events${qs}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    }

    let res = await insertEvent(eventPayload, attendees.length > 0);
    if (!res.ok && attendees.length > 0) {
      const firstError = await res.text();
      console.warn('Google Calendar insert with attendees failed, retrying without attendees:', firstError);
      delete eventPayload.attendees;
      res = await insertEvent(eventPayload, false);
    }

    if (!res.ok) {
      console.error('Google Calendar Event Insert Error:', await res.text());
      return null;
    }

    const eventData = await res.json();
    return eventData.id;
  } catch (err) {
    console.error('Error creating Google Calendar event:', err);
    return null;
  }
}

/**
 * Searches for and deletes a booking event from David's Google Calendar by Booking ID and matching Email.
 */
export async function deleteGoogleCalendarEventByBookingId(bookingId, email) {
  try {
    const token = await getAccessToken();
    if (!token || !GOOGLE_CALENDAR_ID) return false;

    // Search for event containing the booking ID
    const searchRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_ID)}/events?q=${encodeURIComponent(bookingId)}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    if (!searchRes.ok) {
      console.error('Google Calendar Event Search Error:', await searchRes.text());
      return false;
    }

    const searchData = await searchRes.json();
    const items = searchData.items || [];

    let deletedAny = false;
    for (const item of items) {
      if (item.summary && item.summary.includes(bookingId)) {
        if (email) {
          const desc = (item.description || '').toLowerCase();
          const cleanEmail = String(email).trim().toLowerCase();
          if (!desc.includes(cleanEmail)) {
            console.warn(`Email mismatch for event ${bookingId}: ${cleanEmail} not found in event description.`);
            continue;
          }
        }

        const delRes = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_ID)}/events/${encodeURIComponent(item.id)}`,
          {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        if (delRes.ok || delRes.status === 410) {
          deletedAny = true;
        } else {
          console.error(`Failed to delete Google Calendar event ${item.id}:`, await delRes.text());
        }
      }
    }

    return deletedAny;
  } catch (err) {
    console.error('Error deleting Google Calendar event:', err);
    return false;
  }
}

/**
 * Searches for and updates a booking event's start/end times in David's Google Calendar by Booking ID.
 */
export async function updateGoogleCalendarEventByBookingId(bookingId, email, newStartIso, newEndIso) {
  try {
    const token = await getAccessToken();
    if (!token || !GOOGLE_CALENDAR_ID) return false;

    // Search for event containing the booking ID
    const searchRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_ID)}/events?q=${encodeURIComponent(bookingId)}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    if (!searchRes.ok) {
      console.error('Google Calendar Event Search Error:', await searchRes.text());
      return false;
    }

    const searchData = await searchRes.json();
    const items = searchData.items || [];

    let updatedAny = false;
    for (const item of items) {
      if (item.summary && item.summary.includes(bookingId)) {
        if (email) {
          const desc = (item.description || '').toLowerCase();
          const cleanEmail = String(email).trim().toLowerCase();
          if (!desc.includes(cleanEmail)) {
            console.warn(`Email mismatch for event ${bookingId}: ${cleanEmail} not found in event description.`);
            continue;
          }
        }

        const currentDesc = item.description || '';
        const updatedDesc = `${currentDesc}\n\n[RESCHEDULED ONLINE to ${newStartIso}]`;

        const patchRes = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_ID)}/events/${encodeURIComponent(item.id)}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              start: { dateTime: newStartIso, timeZone: 'America/New_York' },
              end: { dateTime: newEndIso, timeZone: 'America/New_York' },
              description: updatedDesc
            })
          }
        );

        if (patchRes.ok) {
          updatedAny = true;
        } else {
          console.error(`Failed to update Google Calendar event ${item.id}:`, await patchRes.text());
        }
      }
    }

    return updatedAny;
  } catch (err) {
    console.error('Error updating Google Calendar event:', err);
    return false;
  }
}

export async function handler() {
  return {
    statusCode: 404,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: "Not a public endpoint" })
  };
}


