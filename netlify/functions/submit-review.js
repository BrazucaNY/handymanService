// Netlify Serverless Function: /.netlify/functions/submit-review
// Public customer contact & review intake. Rate-limited, origin-restricted, honest about failures.

import { DB_CONFIG } from './dbConfig.js';

const ALLOWED_ORIGINS = ['https://www.herehandyman.com', 'https://herehandyman.com'];

// Best-effort in-memory rate limit (per warm instance). Complements Supabase-side limits.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const hits = new Map();

function corsHeaders(event) {
  const origin = (event.headers && (event.headers.origin || event.headers.Origin)) || '';
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
    'Content-Type': 'application/json'
  };
  if (ALLOWED_ORIGINS.includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function clientIp(event) {
  const h = event.headers || {};
  return (h['x-nf-client-connection-ip'] || (h['x-forwarded-for'] || '').split(',')[0] || 'unknown').trim();
}

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX;
}

export const handler = async (event) => {
  const headers = corsHeaders(event);

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  if (isRateLimited(clientIp(event))) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Too many submissions. Please try again later.' }) };
  }

  try {
    const data = JSON.parse(event.body || '{}');

    const { name, phone, email, town, address, service, rating, reviewText, submittedAt } = data;

    // Honeypot: real users never fill this hidden field.
    if (data.website) {
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, dbSaved: true }) };
    }

    if (!name || !phone) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields (name, phone)' }) };
    }

    const cleanName = String(name).trim().slice(0, 100);
    const cleanPhone = String(phone).trim().slice(0, 30);
    const cleanEmail = email ? String(email).trim().slice(0, 200) : null;

    const phoneDigits = cleanPhone.replace(/\D/g, '');
    if (!cleanName || phoneDigits.length < 7 || phoneDigits.length > 15) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Please provide a valid name and phone number.' }) };
    }
    if (cleanEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Please provide a valid email address.' }) };
    }

    const parsedRating = parseInt(rating, 10);
    const payload = {
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      town: town ? String(town).trim().slice(0, 100) : 'Westchester',
      address: address ? String(address).trim().slice(0, 300) : null,
      service: service ? String(service).trim().slice(0, 150) : 'General Repairs',
      rating: Number.isFinite(parsedRating) && parsedRating >= 1 && parsedRating <= 5 ? parsedRating : 5,
      review_text: reviewText ? String(reviewText).slice(0, 5000) : 'Direct contact submitted',
      submitted_at: submittedAt || new Date().toISOString()
    };

    // Store in Supabase REST API
    const supabaseEndpoint = `${DB_CONFIG.SUPABASE_URL}/rest/v1/customer_reviews`;
    let dbSuccess = false;

    try {
      const dbRes = await fetch(supabaseEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': DB_CONFIG.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${DB_CONFIG.SUPABASE_SERVICE_ROLE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      });

      if (dbRes.ok) {
        dbSuccess = true;
        console.log(`[CONTACT INTAKE] Saved submission from ${payload.town} (${payload.service})`);
      } else {
        const errTxt = await dbRes.text();
        console.error(`[SUPABASE ERROR] Status ${dbRes.status}: ${errTxt}`);
      }
    } catch (dbErr) {
      console.error('[SUPABASE FETCH ERROR]', dbErr);
    }

    // Be honest: never report success when the record was not persisted.
    if (!dbSuccess) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          success: false,
          dbSaved: false,
          error: 'We could not save your submission. Please call (516) 350-0801.'
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        dbSaved: true,
        message: 'Contact and review received and processed successfully by server.'
      })
    };

  } catch (error) {
    console.error('[SERVERLESS INTAKE ERROR]', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};
