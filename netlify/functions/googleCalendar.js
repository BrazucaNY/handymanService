// Netlify Serverless Helper: Google Calendar API Integration (Zero-dependency Node.js ESM)
import crypto from 'node:crypto';

const GOOGLE_SA_EMAIL = process.env.GOOGLE_SA_EMAIL;
const GOOGLE_SA_PRIVATE_KEY = (process.env.GOOGLE_SA_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'davi65@gmail.com';

/**
 * Generates an OAuth2 access token for Google API using a Service Account JWT signature.
 */
async function getAccessToken() {
  if (!GOOGLE_SA_EMAIL || !GOOGLE_SA_PRIVATE_KEY) {
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
    console.error('Google OAuth token error:', errorText);
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

    const eventPayload = {
      summary: `🔨 [${bookingId}] ${serviceName} - ${customerName}`,
      location: `${customerAddress}, ZIP ${zip}`,
      description: `APPOINTMENT CONFIRMED FROM WEBSITE\n\nBooking ID: ${bookingId}\nCustomer: ${customerName}\nPhone: ${customerPhone}\nEmail: ${customerEmail || 'Not provided'}\nAddress: ${customerAddress}, ZIP ${zip}\nService: ${serviceName}\nNotes: ${notes || 'None'}`,
      start: { dateTime: startIso, timeZone: 'America/New_York' },
      end: { dateTime: endIso, timeZone: 'America/New_York' },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 120 },
          { method: 'popup', minutes: 30 }
        ]
      }
    };

    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_ID)}/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    });

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
