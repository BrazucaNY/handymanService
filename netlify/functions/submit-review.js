// Netlify Serverless Function: /.netlify/functions/submit-review
// Customer Contact & Review Intake Engine with Full CORS & Supabase Integration

import { DB_CONFIG } from './dbConfig.js';

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS OPTIONS preflight request from browser
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, message: 'CORS Preflight Allowed' })
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');

    const {
      name,
      phone,
      email,
      town,
      address,
      service,
      rating,
      reviewText,
      submittedAt
    } = data;

    if (!name || !phone) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields (name, phone)' })
      };
    }

    const payload = {
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim() : null,
      town: town ? String(town).trim() : 'Westchester',
      address: address ? String(address).trim() : null,
      service: service ? String(service).trim() : 'General Repairs',
      rating: parseInt(rating) || 5,
      review_text: reviewText || 'Direct contact submitted',
      submitted_at: submittedAt || new Date().toISOString()
    };

    console.log(`[CONTACT INTAKE] ${payload.name} (${payload.phone}) in ${payload.town}: ${payload.service}`);

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
        console.log(`[SUPABASE SUCCESS] Saved contact ID to Supabase DB: ${dbRes.status}`);
      } else {
        const errTxt = await dbRes.text();
        console.warn(`[SUPABASE NOTE] Status ${dbRes.status}: ${errTxt}`);
      }
    } catch (dbErr) {
      console.error('[SUPABASE FETCH ERROR]', dbErr);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Contact and review received and processed successfully by server.',
        dbSaved: dbSuccess,
        contact: payload
      })
    };

  } catch (error) {
    console.error('[SERVERLESS INTAKE ERROR]', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
    };
  }
};
