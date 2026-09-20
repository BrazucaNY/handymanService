// Netlify Serverless Function: Google Business Profile (GBP) Live Reviews & Review Responder
// SECURITY: owner-only. Requires a valid Supabase Auth session (Authorization: Bearer <access_token>).
import crypto from 'node:crypto';

const client_email = process.env.GOOGLE_SA_EMAIL || '';
const private_key = (process.env.GOOGLE_SA_PRIVATE_KEY || '').replace(/\\n/g, '\n');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vvwnmiffuaxiazlskeya.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_-kxhroGZF03Y-RkyJ_bVTQ_5MQZRCZc';

const ALLOWED_ORIGINS = ['https://www.herehandyman.com', 'https://herehandyman.com'];

function corsHeaders(event) {
  const origin = (event.headers && (event.headers.origin || event.headers.Origin)) || '';
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin',
    'Content-Type': 'application/json'
  };
  if (ALLOWED_ORIGINS.includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: client_email,
    scope: 'https://www.googleapis.com/auth/business.manage',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64ClaimSet = Buffer.from(JSON.stringify(claimSet)).toString('base64url');
  const unsignedJwt = `${b64Header}.${b64ClaimSet}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedJwt);
  const signature = signer.sign(private_key, 'base64url');
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
    const errText = await tokenRes.text();
    throw new Error('Google OAuth token error: ' + errText);
  }

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

// Verify the caller holds a valid Supabase Auth session.
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

  const auth = await requireUser(event, headers);
  if (auth.error) return auth.error;

  try {
    const accessToken = await getAccessToken();

    if (event.httpMethod === 'GET') {
      // Fetch Accounts from Google Business Profile API
      const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      let accountsData = {};
      if (accountsRes.ok) {
        accountsData = await accountsRes.json();
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          authenticated: true,
          accounts: accountsData.accounts || [],
          message: 'Successfully authenticated with Google Business Profile API!'
        })
      };
    }

    if (event.httpMethod === 'POST') {
      // Post reply to a specific Google Review
      const body = JSON.parse(event.body || '{}');
      const { reviewName, replyComment } = body;

      // Only allow Google's own review resource path; prevents building arbitrary upstream URLs.
      if (!reviewName || !/^accounts\/[^/]+\/locations\/[^/]+\/reviews\/[^/]+$/.test(String(reviewName))) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'A valid reviewName (accounts/{a}/locations/{l}/reviews/{r}) is required.' })
        };
      }
      if (!replyComment || typeof replyComment !== 'string' || replyComment.length > 4000) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'replyComment is required and must be under 4000 characters.' })
        };
      }

      // NOTE: The legacy Google My Business v4 reviews endpoint below is deprecated by Google.
      // Posting replies requires the current Business Profile API. Until that is configured the
      // upstream call may fail; the error is surfaced to the caller instead of being hidden.
      const replyRes = await fetch(`https://mybusiness.googleapis.com/v4/${reviewName}/reply`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment: replyComment })
      });

      let replyData;
      try {
        replyData = await replyRes.json();
      } catch (e) {
        replyData = { error: 'Non-JSON response from Google API' };
      }

      return {
        statusCode: replyRes.status,
        headers,
        body: JSON.stringify({
          success: replyRes.ok,
          reply: replyData,
          message: replyRes.ok ? 'Successfully posted reply to Google!' : 'Failed to post reply to Google.'
        })
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  } catch (err) {
    console.error('GBP API Handler Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'GBP request failed.' })
    };
  }
}
