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

async function uploadPhotoToGbp() {
  console.log("Refreshing access token...");
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
  const accessToken = tokenData.access_token;
  console.log("✅ OAuth Access Token obtained.");

  const accountId = "107235988987982670835";
  const locationId = "1964673381603454408";

  const imageUrl = "https://raw.githubusercontent.com/BrazucaNY/handymanService/main/assets/images/portfolio/curtain-rod-installation-white-plains.jpg";

  const mediaUrl = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/media`;

  const payload = {
    mediaFormat: "PHOTO",
    locationAssociation: {
      category: "ADDITIONAL"
    },
    sourceUrl: imageUrl
  };

  console.log("\nUploading photo directly to Google Business Profile Photos section...");
  const res = await fetch(mediaUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  console.log("Upload photo status:", res.status);
  const data = await res.json();
  console.log("Upload photo response:", JSON.stringify(data, null, 2));

  return data;
}

uploadPhotoToGbp().catch(console.error);
