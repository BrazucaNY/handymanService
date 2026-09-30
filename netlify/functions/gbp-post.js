// Netlify Serverless Function: Google Business Profile (GBP) Local Post Publisher
import crypto from 'node:crypto';

const saProject = process.env.FIREBASE_PROJECT_ID || ('handyman' + 'service' + 'admin');
const client_email = process.env.GOOGLE_SA_EMAIL || (`herehandyman-booking@${saProject}.iam.gserviceaccount.com`);
const private_key = (process.env.GOOGLE_SA_PRIVATE_KEY || '').replace(/\\n/g, '\n');

// User OAuth 2.0 (Check all environment variable aliases)
const env_client_id = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID || process.env.GMB_CLIENT_ID;
const env_client_secret = process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET || process.env.GMB_CLIENT_SECRET;
const env_refresh_token = process.env.GOOGLE_OAUTH_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN || process.env.REFRESH_TOKEN || process.env.GMB_REFRESH_TOKEN || process.env.GBP_REFRESH_TOKEN;

async function getAccessToken(requestRefreshToken, requestClientId, requestClientSecret) {
  const client_id = requestClientId || env_client_id;
  const client_secret = requestClientSecret || env_client_secret;
  const refresh_token = requestRefreshToken || env_refresh_token;

  // Option A: Primary Owner User OAuth 2.0 Refresh Token
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
      return tokenData.access_token;
    }
    const errData = await tokenRes.text();
    console.warn('OAuth refresh token request failed:', errData);
  }

  // Option B: Service Account JWT Fallback (if private_key configured)
  if (private_key && client_email) {
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

    if (tokenRes.ok) {
      const tokenData = await tokenRes.json();
      return tokenData.access_token;
    }
  }

  throw new Error("Missing or invalid Google OAuth credentials in environment.");
}

export async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { title, summary, town, imageUrl, ctaUrl, refreshToken, clientId, clientSecret } = body;

    const accessToken = await getAccessToken(refreshToken, clientId, clientSecret);

    // 1. Dynamic Account Discovery
    let rawAccount = "107235988987982670835";
    const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (accountsRes.ok) {
      const accountsData = await accountsRes.json();
      if (accountsData.accounts && accountsData.accounts.length > 0) {
        rawAccount = accountsData.accounts[0].name;
      }
    }

    const cleanAccountId = String(rawAccount).replace(/^accounts\//, '');

    // 2. Dynamic Location Discovery
    let rawLocation = "1964673381603454408";
    const locRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${cleanAccountId}/locations?readMask=name,title,storefrontAddress`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (locRes.ok) {
      const locData = await locRes.json();
      if (locData.locations && locData.locations.length > 0) {
        rawLocation = locData.locations[0].name;
      }
    }

    const cleanLocationId = String(rawLocation).replace(/^locations\//, '');

    // Clean final URL format: https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/localPosts
    const postApiUrl = `https://mybusiness.googleapis.com/v4/accounts/${cleanAccountId}/locations/${cleanLocationId}/localPosts`;

    const postSummary = summary || `Before & After: ${title || 'Handyman Service'} in ${town || 'Westchester'}, NY

Professional handyman repair and installation by Here Handyman.

Need small home repairs, mounting, or installations in Westchester County?

📍 ${town || 'White Plains'}, NY
🔨 Here Handyman
📞 Call/Text: (516) 350-0801
🌐 https://www.herehandyman.com/book`;

    const postPayload = {
      languageCode: "en-US",
      summary: postSummary,
      topicType: "STANDARD",
      callToAction: {
        actionType: "BOOK",
        url: ctaUrl || "https://www.herehandyman.com/book"
      }
    };

    if (imageUrl && imageUrl.startsWith('http')) {
      postPayload.media = [
        {
          mediaFormat: "PHOTO",
          sourceUrl: imageUrl
        }
      ];
    }

    console.log(`Publishing local post to GBP URL: ${postApiUrl}`);
    const gbpRes = await fetch(postApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postPayload)
    });

    const gbpData = await gbpRes.json();

    if (!gbpRes.ok) {
      console.error("GBP Post Creation Error:", gbpData);
      return {
        statusCode: gbpRes.status || 500,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: gbpData.error?.message || 'GBP API Error', details: gbpData })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: "Successfully published post to Google Business Profile!",
        postId: gbpData.name,
        searchUrl: gbpData.searchUrl,
        post: gbpData
      })
    };
  } catch (err) {
    console.error("GBP Post function exception:", err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message || 'Internal Server Error' })
    };
  }
}
