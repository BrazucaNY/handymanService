// Netlify Serverless Function Helper: Setmore API v1 Integration
// Handles OAuth access token caching, slot checking, customer creation, and appointment booking in Setmore.

import https from 'node:https';

const SETMORE_REFRESH_TOKEN = process.env.SETMORE_REFRESH_TOKEN || 'r1/b9ac1e2a5bq66TP8pWitf0crZXjF9TkqIMqrpFr28gixe';
const DAVID_STAFF_KEY = '6df5336e-23d0-4bfc-94a7-12dfbb70416e';

// Service ID to Setmore Service Key Mapping
const SETMORE_SERVICES = {
  drywall: '0d83598c-3ba8-4575-8c59-5e9731ad266b',
  painting: '0d83598c-3ba8-4575-8c59-5e9731ad266b',
  tv: '48dbf914-6bad-426a-baf6-0d8d2a5fb235',
  furniture: '48dbf914-6bad-426a-baf6-0d8d2a5fb235',
  assembly: '48dbf914-6bad-426a-baf6-0d8d2a5fb235',
  carpentry: '8d634355-c9e6-4f71-9255-d1a774fdff14',
  electrical: '8d634355-c9e6-4f71-9255-d1a774fdff14',
  fixtures: '8d634355-c9e6-4f71-9255-d1a774fdff14',
  plumbing: '8d634355-c9e6-4f71-9255-d1a774fdff14',
  general: '8d634355-c9e6-4f71-9255-d1a774fdff14'
};

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Get valid Setmore access token via refresh token exchange
 */
export async function getSetmoreAccessToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiresAt > now + 60000) {
    return cachedToken;
  }

  return new Promise((resolve, reject) => {
    const url = `https://developer.setmore.com/api/v1/o/oauth2/token?refreshToken=${encodeURIComponent(SETMORE_REFRESH_TOKEN)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.response && parsed.data && parsed.data.token) {
            cachedToken = parsed.data.token.access_token;
            // Expiry in ms
            tokenExpiresAt = Date.now() + ((parsed.data.token.expires_in || 7200) * 1000);
            resolve(cachedToken);
          } else {
            reject(new Error(`Failed to refresh Setmore token: ${data}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Call Setmore API helper
 */
async function callSetmoreApi(path, method = 'GET', postData = null) {
  const token = await getSetmoreAccessToken();
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'developer.setmore.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ raw: body, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

/**
 * Create or get customer in Setmore
 */
export async function createOrGetSetmoreCustomer({ name, email, phone }) {
  try {
    const nameParts = (name || 'Valued Customer').trim().split(' ');
    const firstName = nameParts[0] || 'Valued';
    const lastName = nameParts.slice(1).join(' ') || 'Customer';

    const res = await callSetmoreApi('/api/v1/bookingapi/customer/create', 'POST', {
      first_name: firstName,
      last_name: lastName,
      email_id: email || 'customer@herehandyman.com',
      cell_phone: (phone || '').replace(/\D/g, '')
    });

    if (res.response && res.data && res.data.customer && res.data.customer.key) {
      return res.data.customer.key;
    }
    return null;
  } catch (err) {
    console.error('Error creating Setmore customer:', err);
    return null;
  }
}

/**
 * Create an appointment in Setmore API
 */
export async function createSetmoreAppointment({ name, email, phone, startISO, endISO, serviceId, notes, address, zip }) {
  try {
    const customerKey = await createOrGetSetmoreCustomer({ name, email, phone });
    const serviceKey = SETMORE_SERVICES[serviceId] || SETMORE_SERVICES.general;

    const comment = `HereHandyman.com Booking | Address: ${address || 'N/A'}, ZIP: ${zip || 'N/A'} | Phone: ${phone || 'N/A'} | Notes: ${notes || 'None'}`;

    const apptData = {
      staff_key: DAVID_STAFF_KEY,
      service_key: serviceKey,
      customer_key: customerKey,
      start_time: startISO,
      end_time: endISO,
      comment: comment
    };

    const result = await callSetmoreApi('/api/v1/bookingapi/appointment/create', 'POST', apptData);
    console.log('Setmore appointment creation result:', JSON.stringify(result));
    return result;
  } catch (err) {
    console.error('Failed to create Setmore appointment:', err);
    return null;
  }
}

/**
 * Fetch available time slots from Setmore for a specific date (dd/MM/yyyy)
 */
export async function getSetmoreSlots(dateStrDDMMYYYY, serviceId = 'general') {
  try {
    const serviceKey = SETMORE_SERVICES[serviceId] || SETMORE_SERVICES.general;
    const res = await callSetmoreApi('/api/v1/bookingapi/slots', 'POST', {
      staff_key: DAVID_STAFF_KEY,
      service_key: serviceKey,
      selected_date: dateStrDDMMYYYY,
      off_hours: false
    });

    if (res.response && res.data && Array.isArray(res.data.slots)) {
      return res.data.slots;
    }
    return [];
  } catch (err) {
    console.error('Error fetching Setmore slots:', err);
    return [];
  }
}
