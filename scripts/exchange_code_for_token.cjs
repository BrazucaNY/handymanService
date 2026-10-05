const fs = require('fs');

const authCode = process.argv[2];

if (!authCode) {
  console.error("Error: Please provide the authorization code as an argument.");
  console.error("Usage: node scripts/exchange_code_for_token.cjs <AUTHORIZATION_CODE>");
  process.exit(1);
}

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
const redirect_uri = 'https://developers.google.com/oauthplayground';

async function exchangeToken() {
  console.log("Exchanging auth code for new refresh token...");
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id,
      client_secret,
      code: authCode,
      grant_type: 'authorization_code',
      redirect_uri
    })
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Token exchange failed:", data);
    return;
  }

  console.log("✅ Success! Obtained new OAuth credentials.");
  if (data.refresh_token) {
    console.log("New Refresh Token obtained!");
    let newEnvContent = envContent;
    if (newEnvContent.includes('GOOGLE_OAUTH_REFRESH_TOKEN=')) {
      newEnvContent = newEnvContent.replace(/GOOGLE_OAUTH_REFRESH_TOKEN=.*/, `GOOGLE_OAUTH_REFRESH_TOKEN=${data.refresh_token}`);
    } else {
      newEnvContent += `\nGOOGLE_OAUTH_REFRESH_TOKEN=${data.refresh_token}`;
    }
    fs.writeFileSync('.env', newEnvContent, 'utf-8');
    console.log("Updated .env file with fresh GOOGLE_OAUTH_REFRESH_TOKEN.");
  } else {
    console.log("Warning: No refresh token returned in response. Did you use prompt=consent?");
  }
}

exchangeToken().catch(console.error);
