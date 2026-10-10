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

async function fixGbpPost() {
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

  const imageUrl = "https://raw.githubusercontent.com/BrazucaNY/handymanService/main/assets/images/portfolio/curtain-rod-installation-white-plains.webp";
  console.log(`Checking JPG image URL: ${imageUrl}`);
  const imgCheck = await fetch(imageUrl);
  console.log("Image HTTP status:", imgCheck.status, imgCheck.headers.get('content-type'));

  const listUrl = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/localPosts`;
  const exactSummary = `Before & After: Curtain Rod Installation in White Plains, NY

Installed new curtain rods with precise measurements, secure mounting, and clean, level results.

Need help with curtain rods, blinds, shelves, pictures, or other home installations? I handle small home projects throughout White Plains and Westchester County.

📍 White Plains, NY
🔨 Here Handyman
🌐 HereHandyman.com`;

  const newPostPayload = {
    languageCode: "en-US",
    summary: exactSummary,
    topicType: "STANDARD",
    callToAction: {
      actionType: "BOOK",
      url: "https://www.herehandyman.com/book"
    },
    media: [
      {
        mediaFormat: "PHOTO",
        sourceUrl: imageUrl
      }
    ]
  };

  console.log("\nPublishing post WITH JPG PHOTO to Google Business Profile API...");
  const createRes = await fetch(listUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newPostPayload)
  });

  console.log("Create localPost status:", createRes.status);
  const createData = await createRes.json();
  console.log("Create localPost response:", JSON.stringify(createData, null, 2));

  return createData;
}

fixGbpPost().catch(console.error);
