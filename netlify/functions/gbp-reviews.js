// Netlify Serverless Function: Google Business Profile (GBP) Live Reviews & AI Review Responder
import crypto from 'node:crypto';

const client_email = process.env.GOOGLE_SA_EMAIL || 'search-console-reader@handymanserviceadmin.iam.gserviceaccount.com';
const EMBEDDED_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5IPY9XnEwueIK
VbyvTmdEDDS7d5wUL2TeDl39aaZYxXkg+ClxF0xhQZqYGDm3/D90zVJwQQOu6yvy
fXFsGxOxwRdirddsDIDnVtPgaw3IB1q6lGNYtp9QuMjIGSQD4+GfpYiiuTLk7Vxu
B5bim17eXb2Mwvvoj1fgOTbM0SdSbxGVLPqXTR8L86Lg6r+URQm91hpBlRyJMJkd
lpfemSeLewtkJC7/lgM8Bl3hn1SVFtfVzHxazrZDsMfVWPWTOXiuGwJDclhCUv/C
E/KyanG3yTxsXcD1waui/gId8mqYVXBjwTlf4GNAgumorGhFbbPRKULnb6poD8eU
1pi10YcNAgMBAAECggEAK3X/COo2hXtmAwocuUUdPh7ldEtAs4Zq1iymSRs356g4
ZxKLXBbdogluOx2Y00YfOZMIMv04WaSxFQT5DymOJpFPpaVtKNsImgbKx+kp+5cq
aBn09rsszJ0M2dj5GQazDbElUhpLRe4pYFVcyUczbt2v5a9Sx0Z7mVKlOFEzu4ic
Ty23HKQUoSDLUpu0xWiC2Y2H9FdsMEtbbpFyvOt67UnaE7mEf6hopMa21jMySrBb
GTHBaPcb5w+BLTfsjAQwvzvq0/mKiW8jnIVvj6l3zy/5OWi3Qh0QNWhIrgYOlFZB
Pd+ZrxoYjy2uM/vvyWSNTZy0kea0UqKwLJTX7JxtGwKBgQDkwsdSETIkkDp3GO5K
k0JFdyDP3NcC38AdXXhuEuSjc1Tawzf5jv3LaAp9UcwAstUlbECofPpKUwbrrg/Y
DJ5sdnhGkxoFrlZtSUXnGmd/zlSAE4Yh9N5W1EwOD5xJzKAoXGB7wt4zsd4yQGsd
4dyJKBhKKARprdW/fG9M50atdwKBgQDPLCoRrTqYsTG0f11U4WAS/HM5o9+HD1pO
4E7cU5ezIOFKN9qXtQQRPTHm/GULUqaiBaGU16xKXBQSRKshq3+wUja8hcjV6RNk
UAFRL1n3t2SKAfAC23HfYtuMrCmCQJvFvBJ8fji+FSqFch6ioO0cWR2Uvsx6t5j4
Bp22yc2AmwKBgQCeEe0yywkP9M1BYGvAAjNH1sJIf3ve04dngx/lR47PVrEqnLx/
6At80v50i+HgFbJssnmXMwyr8OUWU2dFTarmnZIMijbv+ABmcbworbkYuhTvjw4f
Rpmf/AA1sxm2cPu2B+bvfb6Wj/BOXu7lbh06dQcbrr0l3OWW9D/gLutKjwKBgCSm
gYLDDJy6rDpsVcyQWnjBZHkL/p1cH/PYRts/hpTP+ksw+mDgSynpk4xzlkSciJId
QOqeBQLaq0pYD5ZTSrGcucY8PL1rEF0ssi70m4vxS74GfbljrQ+B46lNQ8KhP22J
yhNwGQW3pOAawkSvB4N+WHdaEb6cAFnQgdI2fT6FAoGAZn7pWJwcGXuxDZOZE0Kj
ppunvfV2K+iTgU6/nsSqFZLGk78eYnjjDEYO+KcARXeAM463tP8QiRE0wM1VfSnG
SMp7a3J7RP6Y9tE854o4imtXYnorUP9v4kGgezQI0c+WTwpZSbk2dP8n48IcUJLR
5vewOaCQDDG49Mrl5dbUHPs=
-----END PRIVATE KEY-----`;

const private_key = (process.env.GOOGLE_SA_PRIVATE_KEY || EMBEDDED_PRIVATE_KEY).replace(/\\n/g, '\n');

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
