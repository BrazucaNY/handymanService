// Netlify Serverless Helper: Google Calendar API Integration (Zero-dependency Node.js ESM)
import crypto from 'node:crypto';

const GOOGLE_SA_EMAIL = process.env.GOOGLE_SA_EMAIL || 'herehandyman-booking@handymanserviceadmin.iam.gserviceaccount.com';
const EMBEDDED_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCnKsd5C3axicHl\nNDCCeRvSB8BUpuyzQ5BJooCJV7Eku/6Y1clUeo8a7CpHvDlgfrPQE418/WnWUKhm\n5jBhGkFo809cKCayh6pp5X5+5E7mZZbyhbQT97XX6Fq0jL/7xafQ2DcH5oBQKJe6\nw5a3KJhNDN4Rh/OvJRAtfxbo27mL3Jz08e279EX7yOTsICyozfStPqzmovAC0IGw\nEqChBLIk5iSVGnE91tvZCVUDJODcPMe7Vc61WtjfxKwIPw9HYJFmdFw9xM4OIjSn\nr9nnq6x2saNSETKg5c1sZVu6Y+SnKiREe3EyMvXELVqMFNWcCuIv4KY22QnrOSZO\niwnIE2lhAgMBAAECggEABIhbakPOTxgOItncat0/zN0a8PCpwF6XnfeDBrZS/kz+\npUQ+tkSwdqlqqBFJeP1WgNDW6EmywfXj6w5Yx3k/xsm6ICSSkAqvqzlmyagFH6gn\nhKHtdRElZBpPw0+BsSD14OrL6zHrzsCbBJxjDMpT/trXdqA6Ekit/J3SkDPM/ybL\n9ykdY4FL1vZecpmn8KLkyvjdr0CRiZX5pfujHEnbEx8PTnouD49KdoPLN3sAgRrR\nZCkNS1KmcQNM/yrmoSkhNFgVSgtbnJwTYpOaDaRSH5ggkJ14y8wSOJakSvS9j0Po\nPOZNIhtl53Axm7N28wVsafxn2hKC89WZS8GtJAo2MQKBgQDef2xlBTPJncenRTIf\nJp/SACN2BOe2vUNIxxtRaSSyV+1IoTUg3oVQzxSY60URDtmi9cGyE6EvY7yPkfRi\nuObxiuLg2pt/YxQO+UF7rIBwi7a90waAGEYYrMsEqg9QKXsmMFuaTGUzL8Q3DmO2\nViIPC7VtnRQRhP/KVTUWQt8jdQKBgQDAVolYOCp3borDDxKRI9fHpc7pEhmdhG7v\ncaQHDatdKCUGX7qYAljjFuJ6N4lgSDoDo/KyHXu/t//BDwNkX0HRx4CJDhIppg7e\nRrUoB0CW1XqDbSw0cJWed7w2Rn5ItoVuCx1iuVsVlWew+d0cnCZG6LJgJi2zV+Hk\n7T0LCyHMvQKBgQDEQESNvk71kPPfuIsDKwBhLLoaiS0Q5FOKyARyhHlXzXKAU6EX\nAu84Xc9fKnXbG+wfbwGQXvwXXrOdNzIGOe2KM+T2TBxH+k5g/r4hpgAMRU/Ek3Py\nXHbHoPHZhV7IaC41ewXxTV0eDw3VOh39YG/eMYevzZM7+MHd59ZRcl57WQKBgQCU\n//TyRMCROS+CIKEPkybMYWTDJeR2JGwUToL1e99vEXRtVaelrtvRQJ8+ctuXnRxk\nSZPv6+s8AHy+wLSuAyVoMBchFad4YE5QX5JjagrdTo/UVLTUAwvFcZh6q22VQuBm\n+XFQU6t+MvnbHhXu3gDBGe9lkO4Ca2hyAl8xuPP8OQKBgQCK3pvZpTSeeDwCdvfJ\nITpU2Pl2UuqzEYZDbjqRwvG4oSbWySMdhPRtLxvkhFlnVyNtcMV+lwIq7j4e2IH8\nvYSIxXsLWX5sbYDH1YdGnF87H1VSlKbkisHA/0SdFUAKqSx+LZFASDyeLvGY6wYL\nPNKSLAN3pvHskw6VRnl5Bjur2Q==\n-----END PRIVATE KEY-----\n`;
const GOOGLE_SA_PRIVATE_KEY = (process.env.GOOGLE_SA_PRIVATE_KEY || EMBEDDED_PRIVATE_KEY).replace(/\\n/g, '\n');
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
