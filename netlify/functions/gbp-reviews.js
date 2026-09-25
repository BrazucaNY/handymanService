// Netlify Serverless Function: Google Business Profile (GBP) Live Reviews & AI Review Responder
import crypto from 'node:crypto';

const saProject = process.env.FIREBASE_PROJECT_ID || ('handyman' + 'service' + 'admin');
const client_email = process.env.GOOGLE_SA_EMAIL || (`herehandyman-booking@${saProject}.iam.gserviceaccount.com`);
const private_key = (process.env.GOOGLE_SA_PRIVATE_KEY || '').replace(/\\n/g, '\n');

// User OAuth 2.0 (Direct access for primary owner davi65@gmail.com)
const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;
const refresh_token = process.env.GOOGLE_OAUTH_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN;

async function getAccessToken() {
  // Option A: Primary Owner User OAuth 2.0 Refresh Token (Preferred for davi65@gmail.com)
  if (client_id && client_secret && refresh_token) {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id,
        client_secret,
        refresh_token,
        grant_type: 'refresh_token'
      })
    });

    if (tokenRes.ok) {
      const tokenData = await tokenRes.json();
      return { token: tokenData.access_token, authType: 'User OAuth (davi65@gmail.com)' };
    }
    console.warn('OAuth refresh token failed, falling back to Service Account JWT...');
  }

  // Option B: Service Account JWT Fallback
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
  return { token: tokenData.access_token, authType: `Service Account (${client_email})` };
}

// Generate high-converting Local SEO reply according to Here Handyman guidelines
function generateSeoReply(reviewerName, comment, town, service) {
  const name = reviewerName || 'valued customer';
  const location = town || 'Westchester County, NY';
  const jobService = service || 'home repair';

  const westchesterCities = ['White Plains', 'Scarsdale', 'Yonkers', 'Harrison', 'Rye', 'Mamaroneck', 'Tarrytown', 'Dobbs Ferry', 'Eastchester', 'New Rochelle'];
  const selectedCity = westchesterCities.find(c => location.toLowerCase().includes(c.toLowerCase())) || 'Westchester County';

  if (comment && comment.length > 5) {
    return `${name}, thank you so much for the 5-star review! It was a real pleasure helping with your ${jobService} in ${selectedCity}. At Here Handyman, we take pride in delivering prompt, clean, and top-quality home repairs across Westchester County. Looking forward to helping you again anytime! David, Here Handyman`;
  }

  return `${name}, thank you for choosing Here Handyman! Providing reliable, professional 5-star home maintenance and ${jobService} in ${selectedCity} is what we love to do. Give us a call anytime for your next project! David, Here Handyman`;
}

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { token: accessToken, authType } = await getAccessToken();

    if (event.httpMethod === 'GET') {
      // 1. Fetch Accounts from Google Business Profile API
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
          authType,
          accounts: accountsData.accounts || [],
          message: `Successfully authenticated using ${authType}!`
        })
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { reviewName, replyComment, reviewerName, comment, town, service } = body;

      const finalReply = replyComment || generateSeoReply(reviewerName, comment, town, service);

      if (!reviewName) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'reviewName is required to post a reply' })
        };
      }

      // Send reply to Google My Business API: PUT https://mybusiness.googleapis.com/v4/{reviewName}/reply
      const replyRes = await fetch(`https://mybusiness.googleapis.com/v4/${reviewName}/reply`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment: finalReply })
      });

      const replyData = await replyRes.json();

      return {
        statusCode: replyRes.status,
        headers,
        body: JSON.stringify({
          success: replyRes.ok,
          reply: replyData,
          postedComment: finalReply,
          message: replyRes.ok ? 'Successfully posted Local SEO reply to Google!' : 'Failed to post reply to Google.'
        })
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  } catch (err) {
    console.error('GBP API Handler Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
}

