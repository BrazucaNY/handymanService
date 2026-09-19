// Netlify Serverless Function: POST /.netlify/functions/harvest-review
// Review Harvest Data Collection & Supabase Database Storage Engine

import { DB_CONFIG } from './dbConfig.js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
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

    if (!name || !phone || !rating || !reviewText) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required fields (name, phone, rating, reviewText)' })
      };
    }

    console.log(`[REVIEW HARVEST] New ${rating}-Star Review from ${name} (${phone}) in ${town || 'Westchester'}: "${reviewText}"`);

    // Store in Supabase REST API (leads / customer_reviews table)
    const supabaseEndpoint = `${DB_CONFIG.SUPABASE_URL}/rest/v1/customer_reviews`;
    
    try {
      const dbRes = await fetch(supabaseEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': DB_CONFIG.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${DB_CONFIG.SUPABASE_SERVICE_ROLE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          name,
          phone,
          email: email || null,
          town: town || null,
          address: address || null,
          service: service || null,
          rating: parseInt(rating),
          review_text: reviewText,
          submitted_at: submittedAt || new Date().toISOString()
        })
      });

      console.log(`[SUPABASE] Save status: ${dbRes.status}`);
    } catch (dbErr) {
      console.error('[SUPABASE ERROR]', dbErr);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Review harvested and saved successfully.',
        rating: parseInt(rating)
      })
    };

  } catch (error) {
    console.error('[HARVEST ERROR]', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};
