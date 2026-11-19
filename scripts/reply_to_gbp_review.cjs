const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && line.includes('=')) {
    const idx = line.indexOf('=');
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    env[key] = val;
  }
});

const client_id = env.GOOGLE_CLIENT_ID;
const client_secret = env.GOOGLE_CLIENT_SECRET;
const refresh_token = env.GOOGLE_OAUTH_REFRESH_TOKEN;
const accountId = "107235988987982670835";
const locationId = "1964673381603454408";
const reviewId = "AbFvOqkBOYTtM_WjSou_LTabcMWq3SAcSC1bkO8gQm-rfWs2CkGwCSEmFkObFDeRAAUSm1PrVUAwTQ";

const replyText = "Ruby, thank you so much for the fantastic 5-star review! My teammate and I truly enjoyed working with you and making sure all 14+ pieces of furniture were assembled diligently to your exact specifications. Taking our time to deliver professional, meticulous quality and leaving everything spotless is always our standard. Whenever you need help with future furniture assembly or home projects, we would love to help! David, Here Handyman";

async function replyToReview() {
  console.log("1. Refreshing Google OAuth access token...");
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

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) {
    throw new Error(`OAuth token refresh failed: ${JSON.stringify(tokenData)}`);
  }

  const accessToken = tokenData.access_token;
  console.log("OAuth Access Token active!");

  console.log(`2. Sending reply to review ${reviewId}...`);
  const replyUrl = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`;

  const replyRes = await fetch(replyUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ comment: replyText })
  });

  const replyData = await replyRes.json();
  if (!replyRes.ok) {
    throw new Error(`Review reply API error: ${JSON.stringify(replyData)}`);
  }

  console.log("SUCCESS! Reply published to Google Business Profile:");
  console.log(JSON.stringify(replyData, null, 2));
}

replyToReview().catch(console.error);
