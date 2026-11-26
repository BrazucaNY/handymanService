const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const keyFilePath = path.join(process.env.USERPROFILE || 'C:\\Users\\davi6', 'Downloads', 'handymanserviceadmin-468bb267d1cf.json');
if (!fs.existsSync(keyFilePath)) {
  console.error("Service account JSON key not found.");
  process.exit(1);
}
const keyData = JSON.parse(fs.readFileSync(keyFilePath, 'utf-8'));

async function getAccessToken(scope) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: keyData.client_email,
    scope: scope,
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64ClaimSet = Buffer.from(JSON.stringify(claimSet)).toString('base64url');
  const unsignedJwt = `${b64Header}.${b64ClaimSet}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedJwt);
  const signature = signer.sign(keyData.private_key, 'base64url');
  const jwt = `${unsignedJwt}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  const tokenJson = await tokenRes.json();
  return tokenJson.access_token;
}

async function main() {
  console.log("====================================================");
  console.log("🚀 GOOGLE INDEXING API NOTIFICATION FOR NEW ROCHELLE");
  console.log("====================================================\n");

  const indexingToken = await getAccessToken('https://www.googleapis.com/auth/indexing');
  const webmastersToken = await getAccessToken('https://www.googleapis.com/auth/webmasters');

  if (!indexingToken || !webmastersToken) {
    console.error("❌ Failed to obtain access tokens from Google.");
    return;
  }

  // 1. Resubmit sitemap to Google Search Console
  const siteUrl = "sc-domain:herehandyman.com";
  const encodedSite = encodeURIComponent(siteUrl);
  const sitemapUrl = "https://www.herehandyman.com/sitemap.xml";

  console.log("1. Pinging Google Search Console with sitemap.xml...");
  const sitemapRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps/${encodeURIComponent(sitemapUrl)}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${webmastersToken}` }
  });
  console.log(`   Sitemap ping response: HTTP ${sitemapRes.status} (${sitemapRes.statusText})\n`);

  // 2. Publish URL_UPDATED notification for New Rochelle
  const targetUrls = [
    'https://www.herehandyman.com/new-rochelle-handyman',
    'https://www.herehandyman.com/tv-mounting-new-rochelle',
    'https://www.herehandyman.com/furniture-assembly-new-rochelle',
    'https://www.herehandyman.com/drywall-repair-new-rochelle'
  ];

  console.log("2. Sending URL_UPDATED notifications to Google Indexing API:");
  for (const url of targetUrls) {
    try {
      const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${indexingToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url,
          type: 'URL_UPDATED'
        })
      });
      const data = await res.json();
      if (res.status === 200) {
        console.log(`   ✅ [HTTP 200] ${url} -> URL_UPDATED accepted by Googlebot`);
      } else {
        console.log(`   ⚠️ [HTTP ${res.status}] ${url}:`, JSON.stringify(data));
      }
    } catch (err) {
      console.error(`   ❌ Failed to notify for ${url}:`, err.message);
    }
  }
}

main().catch(console.error);
