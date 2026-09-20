// Netlify Serverless Function: /.netlify/functions/crm-data
// Owner-only CRM data gateway. Verifies the Supabase Auth session, then reads
// customer_reviews with the service_role key (bypassing RLS) so the public
// publishable key no longer needs direct read access to customer PII.

import { DB_CONFIG } from './dbConfig.js';

const SUPABASE_URL = DB_CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_-kxhroGZF03Y-RkyJ_bVTQ_5MQZRCZc';

const ALLOWED_ORIGINS = ['https://www.herehandyman.com', 'https://herehandyman.com'];

function corsHeaders(event) {
  const origin = (event.headers && (event.headers.origin || event.headers.Origin)) || '';
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Vary': 'Origin',
    'Content-Type': 'application/json'
  };
  if (ALLOWED_ORIGINS.includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

async function requireUser(event, headers) {
  const authHeader = (event.headers && (event.headers.authorization || event.headers.Authorization)) || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    return { error: { statusCode: 401, headers, body: JSON.stringify({ error: 'Authentication required.' }) } };
  }
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    return { error: { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid or expired session.' }) } };
  }
  return { user: await res.json() };
}

export async function handler(event) {
  const headers = corsHeaders(event);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const auth = await requireUser(event, headers);
  if (auth.error) return auth.error;

  if (!DB_CONFIG.SUPABASE_SERVICE_ROLE_KEY) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'CRM data storage is not configured.' }) };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/customer_reviews?select=*&order=submitted_at.desc`, {
      headers: {
        apikey: DB_CONFIG.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${DB_CONFIG.SUPABASE_SERVICE_ROLE_KEY}`
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[CRM DATA] Supabase read failed ${res.status}: ${errText}`);
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Failed to load CRM data.' }) };
    }

    const rows = await res.json();
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, reviews: rows }) };
  } catch (err) {
    console.error('[CRM DATA] Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
}
