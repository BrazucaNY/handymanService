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

const clientId = env.GOOGLE_CLIENT_ID;
const redirectUri = 'https://developers.google.com/oauthplayground'; // or urn:ietf:wg:oauth:2.0:oob

if (!clientId) {
  console.error("Missing GOOGLE_CLIENT_ID in .env");
  process.exit(1);
}

const scope = encodeURIComponent('https://www.googleapis.com/auth/business.manage');
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent('https://developers.google.com/oauthplayground')}&scope=${scope}&access_type=offline&prompt=consent`;

console.log("\n=======================================================");
console.log("🔑 GOOGLE BUSINESS PROFILE API OAUTH RE-AUTHORIZATION");
console.log("=======================================================");
console.log("\nYour current refresh token returned 'invalid_grant' (expired or revoked).");
console.log("\nFollow these 3 quick steps to re-authorize the Google Business Profile API:\n");
console.log("1. Open this URL in your browser:\n");
console.log(authUrl);
console.log("\n2. Sign in with the Google Account that manages 'Here Handyman'.");
console.log("3. Copy the authorization code (or token) provided by Google, and run:");
console.log("   node scripts/exchange_code_for_token.cjs <YOUR_AUTH_CODE>\n");
