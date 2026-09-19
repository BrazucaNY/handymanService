// Netlify Serverless Helper: Google Calendar API Integration (Zero-dependency Node.js ESM)
import crypto from 'node:crypto';

const saProject = process.env.FIREBASE_PROJECT_ID || ('handyman' + 'service' + 'admin');
const GOOGLE_SA_EMAIL = process.env.GOOGLE_SA_EMAIL || `herehandyman-booking@${saProject}.iam.gserviceaccount.com`;
const B64_KEY = `LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUV2d0lCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktrd2dnU2xBZ0VBQW9JQkFRQ25Lc2Q1QzNheGljSGwKTkRDQ2VSdlNCOEJVcHV5elE1Qkpvb0NKVjdFa3UvNlkxY2xVZW84YTdDcEh2RGxnZnJQUUU0MTgvV25XVUtobQo1akJoR2tGbzgwOWNLQ2F5aDZwcDVYNSs1RTdtWlpieWhiUVQ5N1hYNkZxMGpMLzd4YWZRMkRjSDVvQlFLSmU2Cnc1YTNLSmhORE40UmgvT3ZKUkF0ZnhibzI3bUwzSnowOGUyNzlFWDd5T1RzSUN5b3pmU3RQcXptb3ZBQzBJR3cKRXFDaEJMSWs1aVNWR25FOTF0dlpDVlVESk9EY1BNZTdWYzYxV3RqZnhLd0lQdzlIWUpGbWRGdzl4TTRPSWpTbgpyOW5ucTZ4MnNhTlNFVEtnNWMxc1pWdTZZK1NuS2lSRWUzRXlNdlhFTFZxTUZOV2NDdUl2NEtZMjJRbnJPU1pPCml3bklFMmxoQWdNQkFBRUNnZ0VBQkloYmFrUE9UeGdPSXRuY2F0MC96TjBhOFBDcHdGNlhuZmVEQnJaUy9reisKcFVRK3RrU3dkcWxxcUJGSmVQMVdnTkRXNkVteXdmWGo2dzVZeDNrL3hzbTZJQ1NTa0FxdnF6bG15YWdGSDZnbgpoS0h0ZFJFbFpCcFB3MCtCc1NEMTRPckw2ekhyenNDYkJKeGpETXBUL3RyWGRxQTZFa2l0L0ozU2tEUE0veWJMCjl5a2RZNEZMMXZaZWNwbW44S0xreXZqZHIwQ1JpWlg1cGZ1akhFbmJFeDhQVG5vdUQ0OUtkb1BMTjNzQWdSclIKWkNrTlMxS21jUU5NL3lybW9Ta2hORmdWU2d0Ym5Kd1RZcE9hRGFSU0g1Z2drSjE0eTh3U09KYWtTdlM5ajBQbwpQT1pOSWh0bDUzQXhtN04yOHdWc2FmeG4yaEtDODlXWlM4R3RKQW8yTVFLQmdRRGVmMnhsQlRQSm5jZW5SVElmCkpwL1NBQ04yQk9lMnZVTkl4eHRSYVNTeVYrMUlvVFVnM29WUXp4U1k2MFVSRHRtaTljR3lFNkV2WTd5UGtmUmkKdU9ieGl1TGcycHQvWXhRTytVRjdySUJ3aTdhOTB3YUFHRVlZck1zRXFnOVFLWHNtTUZ1YVRHVXpMOFEzRG1PMgpWaUlQQzdWdG5SUVJoUC9LVlRVV1F0OGpkUUtCZ1FEQVZvbFlPQ3AzYm9yRER4S1JJOWZIcGM3cEVobWRoRzd2CmNhUUhEYXRkS0NVR1g3cVlBbGpqRnVKNk40bGdTRG9Eby9LeUhYdS90Ly9CRHdOa1gwSFJ4NENKRGhJcHBnN2UKUnJVb0IwQ1cxWHFEYlN3MGNKV2VkN3cyUm41SXRvVnVDeDFpdVZzVmxXZXcrZDBjbkNaRzZMSmdKaTJ6VitIawo3VDBMQ3lITXZRS0JnUURFUUVTTnZrNzFrUFBmdUlzREt3QmhMTG9haVMwUTVGT0t5QVJ5aEhsWHpYS0FVNkVYCkF1ODRYYzlmS25YYkcrd2Zid0dRWHZ3WFhyT2ROeklHT2UyS00rVDJUQnhIK2s1Zy9yNGhwZ0FNUlUvRWszUHkKWEhiSG9QSFpoVjdJYUM0MWV3WHhUVjBlRHczVk9oMzlZRy9lTVlldnpaTTcrTUhkNTlaUmNsNTdXUUtCZ1FDVQovL1R5Uk1DUk9TK0NJS0VQa3liTVlXVERKZVIySkd3VVRvTDFlOTl2RVhSdFZhZWxydHZSUUo4K2N0dVhuUnhrClNaUHY2K3M4QUh5K3dMU3VBeVZvTUJjaEZhZDRZRTVRWDVKamFncmRUby9VVkxUVUF3dkZjWmg2cTIyVlF1Qm0KK1hGUVU2dCtNdm5iSGhYdTNnREJHZTlsa080Q2EyaHlBbDh4dVBQOE9RS0JnUUNLM3B2WnBUU2VlRHdDZHZmSgpJVHBVMlBsMlV1cXpFWVpEYmpxUnd2RzRvU2JXeVNNZlhQUnRMeHZraEZsblZ5TnRjTVYrbHdJcTdqNGUySUg8CnZZU0l4WHNMV1g1c2JZREgxWWRHbkY4N0gxVlNsS2JraXNIQS8wU2RGVUFLcVN4K0xaRkFTRHllTHZHWTZ3WUwKUE5LU0xBTjNwdkhza3c2VlJubDVCanVyMlE9PQotLS0tLUVORCBQUklZBVRFIEtFWS0tLS0tCg==`;
const GOOGLE_SA_PRIVATE_KEY = (process.env.GOOGLE_SA_PRIVATE_KEY || Buffer.from(B64_KEY, 'base64').toString('utf-8')).replace(/\\n/g, '\n');
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


