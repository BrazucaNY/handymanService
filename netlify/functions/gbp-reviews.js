// Netlify Serverless Function: Google Business Profile (GBP) Live Reviews & AI Review Responder
import crypto from 'node:crypto';

const client_email = process.env.GOOGLE_SA_EMAIL || 'search-console-reader@handymanserviceadmin.iam.gserviceaccount.com';
const private_key = (process.env.GOOGLE_SA_PRIVATE_KEY || '').replace(/\\n/g, '\n');

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
    const accessToken = await getAccessToken();

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
          clientEmail: client_email,
          accounts: accountsData.accounts || [],
          message: 'Successfully authenticated with Google Business Profile API!'
        })
      };
    }

    if (event.httpMethod === 'POST') {
      // 2. Post AI Reply to a specific Google Review
      const body = JSON.parse(event.body || '{}');
      const { reviewName, replyComment } = body;

      if (!reviewName || !replyComment) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'reviewName and replyComment are required' })
        };
      }

      // Send reply back to Google My Business API: PUT https://mybusiness.googleapis.com/v4/{reviewName}/reply
      const replyRes = await fetch(`https://mybusiness.googleapis.com/v4/${reviewName}/reply`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment: replyComment })
      });

      const replyData = await replyRes.json();

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
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
}
