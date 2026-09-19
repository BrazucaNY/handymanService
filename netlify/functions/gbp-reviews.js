// Netlify Serverless Function: Google Business Profile (GBP) Live Reviews & AI Review Responder
import crypto from 'node:crypto';

const client_email = process.env.GOOGLE_SA_EMAIL || 'search-console-reader@handymanserviceadmin.iam.gserviceaccount.com';
const B64_KEY = `LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUV2UUlCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktjd2dnU2pBZ0VBQW9JQkFRQzVJUFk5WG5Fd3VlSUsKVmJ5dlRtZEVERFM3ZDV3VUwyVGVEbDM5YWFaWXhYa2grQ2x4RjB4aFFacVlHRG0zL0Q5MHpWSndRUU91Nnl2eQpmWEZzR3hPeHdSZGlyZGRzRElEblZ0UGdhdzNJQjFxNmxHTll0cDlRdU1qSUdTUUQ0K0dmcFlpaXVUTGs3Vnh1CkI1YmltMTdlWGIyTXd2dm9qMWZnT1RiTTBTZFNieEdWTFBxWFRSOEw4NkxnNnIrVVJRbTkxaHBCbFJ5Sk1Ka2QKbHBmZW1TZUxld3RrSkM3L2xnTThCbDNobjFTVkZ0ZlZ6SHhhenJaRHNNZlZXUFdUT1hpdUd3SkRjbGhDVXYvQwpFL0t5YW5HM3lUeHNYY0Qxd2F1aS9nSWQ4bXFZVlhCandUbGY0R05BZ3Vtb3JHaEZiYlBSS1VMbmI2cG9EOGVVCjFwaTEwWWNOQWdNQkFBRUNnZ0VBSzNYL0NPbzJoWHRtQXdvY3VVVWRQaDdsZEV0QXM0WnExaXltU1JzMzU2ZzQKWnhLTFhCYmRvZ2x1T3gyWTAwWWZPWk1JTXYwNFdhU3hGUVQ1RHltT0pwRlBwYVZ0S05zSW1nYkt4K2twKzVjcQphQm4wOXJzc3pKME0yZjo1R1FhekRiRWxVaHBMUmU0cFlGVmN5VWN6YnQydjVhOVN4MFo3bVZLbE9GRXp1NGljClR5MjNIS1FVb1NETFVwdTB4V2lDMlkySDlGZHNNRXRiYnBGeXZPdDY3VW5hRTdtRWY2aG9wTWEyMWpNeVNyQmIKR1RIQmFQY2I1dytCTFRmc2pBUXd2enZxMC9tS2lXOGpuSVZ2ajZsM3p5LzVPV2kzUWgwUU5XaElyZ1lPbEZaQgpQZCtacnhvWWp5MnVNL3Z2eVdTTlRaeTBrZWEwVXFLd0xKVFg3Snh0R3dLQmdRRGt3c2RTRVRJa2tEcDNHTzVLCmswSkZkeURQM05jQzM4QWRYWGh1RXVTamMxVGF3emY1anYzTGFBcDlVY3dBc3RVbGJFQ29mUHBLVXdicnJnL1kKREo1c2RuaEdreG9GcmxadFNVWG5HbWQvemxTQUU0WWg5TjVXMUV3T0Q1eEp6S0FvWEdCN3d0NHpzZDR5UUdzZAo0ZHlKS0JoS0tBUnByZFcvZkc5TTUwYXRkd0tCZ1FEUExDb1JyVHFZc1RHMGYxMVU0V0FTL0hNNW85K0hEMXBPCjRFN2NVNWV6SU9GS045cVh0UVFSUFRIbS9HVUxVcWFpQmFHVTE2eEtYQlFTUktzaHEzK3dVamE4aGNqVjZSTmsKVUFGUkwxbjN0MlNLQWZBQzIzSGZZdHVNckNtQ1FKdkZ2Qko4ZmppK0ZTcUZjaDZpb08wY1dSMlV2c3g2dDVqNApCcDIyeWMyQW13S0JnUUNlRWUweXl3a1A5TTFCWUd2QUFqTkgxc0pJZjN2ZTA0ZG5neC9sUjQ3UFZyRXFuTHgvCjZBdDgwdjUwaStIZ0ZiSnNzbm1YTXd5cjhPVVdVMmRGVGFybW5aSU1pamJ2K0FCbWNid29yYmtZdWhUdmp3NGYKUnBtZi9BQTFzeG0yY1B1MkIrYnZmYjZXai9CT1h1N2xiaDA6ZFFjYnJyMGwzT1dXOUQvZ0x1dEtqd0tCZ0NTbQpnWUxEREp5NnJEcHNWY3lRV25qQlpIa0wvcDFjSC9QWVJ0cy9ocFRQK2tzdyttRGdTeW5wazR4emxrU2NpSklkClFPcWVCUUxhcTBwWUQ1WlRTckdjdWNZOFBMMXJFRjBzc2k3MG00dnhTNzRHZmJsanJRK0I0NmxOUThLaFAyMkoKeWhOd0dRVzNwT0Fhd2tTdkI0TitXSGRhRWI2Y0FGblFnZEkyZlQ2RkFvR0FabjdwV0p3Y0dYdXhEWk9aRTBLagpwcHVudmZWMksraVRnVTYvbnNTcUZaTEdrNzhlWW5qakRFWU8rS2NBUlhlQU00NjN0UDhRaVJFMHdNMVZmU25HClNNcDdhM0o3UlA2WTl0RTg1NG80aW10WFlub3JVUDl2NGtHZ2V6UUkwYytXVHdwWlNiazJkUDhuNDhJY1VKTFIKNXZld09hQ1FEREc0OU1ybDVkYlVIUHM9Ci0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0=`;

const private_key = (process.env.GOOGLE_SA_PRIVATE_KEY || Buffer.from(B64_KEY, 'base64').toString('utf-8')).replace(/\\n/g, '\n');

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
