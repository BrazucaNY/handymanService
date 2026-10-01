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

async function uploadMedia() {
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

  const accountId = "107235988987982670835";
  const locationId = "1964673381603454408";
  
  // Media creation endpoint in v4
  const mediaUrl = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/media`;

  const photoPayload = {
    mediaFormat: "PHOTO",
    locationAssociation: {
      category: "ADDITIONAL"
    },
    sourceUrl: "https://www.herehandyman.com/assets/images/portfolio/curtain-rod-installation-white-plains.webp"
  };

  console.log("Uploading photo to GBP Media library...");
  const res = await fetch(mediaUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(photoPayload)
  });

  console.log("Upload media status:", res.status);
  const data = await res.json();
  console.log("Upload media response:", JSON.stringify(data, null, 2));
}

uploadMedia().catch(console.error);
