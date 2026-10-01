const fs = require('fs');

// Parse .env manually
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

async function postToGbp() {
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
  const listUrl = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/localPosts`;

  const summaryText = `✨ Precision Ceiling Curtain Rod & Track Installation in White Plains, NY! 🪟

Mounted and aligned ceiling drapery tracks for a homeowner in White Plains today. Perfectly level, anchored securely into ceiling joists, and designed for smooth, effortless sliding over large windows!

Need curtain rods, blinds, shade tracks, or wall mounting done right in Westchester County?

📞 Call/Text: (516) 350-0801
💻 Book Online: https://www.herehandyman.com/book

#CurtainRodInstallation #WhitePlainsNY #WestchesterHandyman #WindowTreatments #HereHandyman #HomeImprovement`;

  const postPayload = {
    languageCode: "en-US",
    summary: summaryText,
    topicType: "STANDARD",
    callToAction: {
      actionType: "BOOK",
      url: "https://www.herehandyman.com/book"
    }
  };

  console.log("Creating local post via Google Business Profile API...");
  const createRes = await fetch(listUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postPayload)
  });

  console.log("Create localPost status:", createRes.status);
  const createData = await createRes.json();
  console.log("Create localPost response:", JSON.stringify(createData, null, 2));
  return createData;
}

postToGbp().catch(console.error);
