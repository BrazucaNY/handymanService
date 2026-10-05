const fs = require('fs');
const bs4 = require('fs');

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

async function fetchLiveReviewsFromGbpApi() {
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
  console.log("✅ OAuth Access Token active!");

  console.log("\n2. Fetching live reviews directly from Google Business Profile API...");
  const reviewsRes = await fetch(`https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  const reviewsData = await reviewsRes.json();
  if (!reviewsRes.ok) {
    throw new Error(`Reviews API error: ${JSON.stringify(reviewsData)}`);
  }

  const reviews = reviewsData.reviews || [];
  console.log(`✅ Successfully fetched ${reviews.length} live GBP reviews from Google Business Profile API!`);
  console.log(`Average Rating: ${reviewsData.averageRating} / 5.0`);
  console.log(`Total Review Count: ${reviewsData.totalReviewCount}`);

  return reviews;
}

fetchLiveReviewsFromGbpApi().catch(console.error);
