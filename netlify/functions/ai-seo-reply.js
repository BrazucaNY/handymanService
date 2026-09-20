// Netlify Serverless Function: SEO Review Reply Generator for Here Handyman
// NOTE: This is a deterministic template generator, not an LLM. It must not be marketed as "AI".
// SECURITY: owner-only. Requires a valid Supabase Auth session (Authorization: Bearer <access_token>).

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vvwnmiffuaxiazlskeya.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_-kxhroGZF03Y-RkyJ_bVTQ_5MQZRCZc';

const ALLOWED_ORIGINS = ['https://www.herehandyman.com', 'https://herehandyman.com'];

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

export async function handler(event, context) {
  const headers = corsHeaders(event);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const auth = await requireUser(event, headers);
  if (auth.error) return auth.error;

  try {
    const body = JSON.parse(event.body || '{}');
    const { reviewerName, reviewText, town, service } = body;

    const name = reviewerName || 'valued customer';
    const location = town || 'Westchester County, NY';
    const jobService = service || 'home maintenance';

    // Core Westchester SEO Cities for local Google Maps ranking signals
    const westchesterCities = ['White Plains', 'Scarsdale', 'Yonkers', 'Harrison', 'Rye', 'Mamaroneck', 'Tarrytown', 'Dobbs Ferry', 'Eastchester'];
    const selectedCity = westchesterCities.find(c => location.toLowerCase().includes(c.toLowerCase())) || 'Westchester County';

    // Local SEO optimized 5-star reply templates
    const templates = [
      `Thank you so much for the 5-star review, ${name}! We're thrilled we could help with your ${jobService} project in ${selectedCity}. At Here Handyman, we take pride in delivering prompt, professional, and reliable home repair services throughout Westchester County. We look forward to helping you again soon!`,
      `Hi ${name}, thank you for taking the time to share your experience with Here Handyman! It was a pleasure handling your ${jobService} in ${selectedCity}. Providing top-quality craftsmanship and clear communication is our top priority for every Westchester homeowner. Thanks again!`,
      `Thank you ${name}! We appreciate your business and kind words about our ${jobService} work in ${selectedCity}. Serving our local Westchester County community with reliable 5-star home maintenance is what we love to do. Give us a call anytime for your next project!`,
      `We're so happy to hear you're pleased with your ${jobService} in ${selectedCity}, ${name}! Thank you for choosing Here Handyman for your home repair needs in Westchester County. We're always here whenever you need expert local handyman service!`
    ];

    // Select template deterministically based on name + review length
    const idx = (name.length + (reviewText ? reviewText.length : 0)) % templates.length;
    const generatedReply = templates[idx];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        reviewerName: name,
        location: selectedCity,
        service: jobService,
        seoReply: generatedReply
      })
    };
  } catch (err) {
    console.error('SEO Reply Generation Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Failed to generate reply.' })
    };
  }
}
