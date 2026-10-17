const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Locate Service Account Key safely from user profile or environment
const keyFilePaths = [
  process.env.GOOGLE_APPLICATION_CREDENTIALS,
  path.join(process.env.USERPROFILE || 'C:\\Users\\davi6', 'Downloads', 'handymanserviceadmin-468bb267d1cf.json'),
  path.join(process.env.USERPROFILE || 'C:\\Users\\davi6', 'Downloads', 'handymanserviceadmin-dd9fd02358e3.json')
].filter(Boolean);

let keyData = null;
for (const p of keyFilePaths) {
  if (fs.existsSync(p)) {
    try {
      const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
      if (data.client_email && data.private_key) {
        keyData = data;
        break;
      }
    } catch (e) {}
  }
}

if (!keyData) {
  console.error("❌ Service account JSON key not found.");
  process.exit(1);
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: keyData.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters',
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
  const token = await getAccessToken();
  if (!token) {
    console.error("❌ Failed to obtain access token.");
    return;
  }
  console.log("✅ Authenticated as Site Owner with Google Search Console API\n");

  const siteUrl = "sc-domain:herehandyman.com";
  const encodedSite = encodeURIComponent(siteUrl);

  // 1. Get existing sitemaps
  console.log("----------------------------------------------------");
  console.log("📑 CHECKING SITEMAPS IN SEARCH CONSOLE...");
  console.log("----------------------------------------------------");
  const sitemapsRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const sitemapsData = await sitemapsRes.json();
  console.log("Current Sitemaps:", JSON.stringify(sitemapsData, null, 2));

  // 2. Submit sitemap
  console.log("\n----------------------------------------------------");
  console.log("🚀 SUBMITTING SITEMAP TO SEARCH CONSOLE...");
  console.log("----------------------------------------------------");
  const sitemapToSubmit = "https://www.herehandyman.com/sitemap.xml";
  const submitRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps/${encodeURIComponent(sitemapToSubmit)}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`Submit sitemap HTTP status: ${submitRes.status} (${submitRes.statusText})`);

  // 3. Inspect Key URLs
  console.log("\n----------------------------------------------------");
  console.log("🔍 INSPECTING INDEX STATUS OF KEY URLS...");
  console.log("----------------------------------------------------");

  const urlsToInspect = [
    "https://www.herehandyman.com/",
    "https://www.herehandyman.com/service-areas",
    "https://www.herehandyman.com/blog/",
    "https://www.herehandyman.com/deck-repair-scarsdale",
    "https://www.herehandyman.com/armonk-handyman",
    "https://www.herehandyman.com/pressure-washing"
  ];

  for (const url of urlsToInspect) {
    const inspectRes = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inspectionUrl: url,
        siteUrl: siteUrl
      })
    });

    const inspectData = await inspectRes.json();
    if (inspectData.inspectionResult) {
      const idx = inspectData.inspectionResult.indexStatusResult;
      console.log(`\nURL: ${url}`);
      console.log(`  Verdit: ${idx.verdict}`);
      console.log(`  Coverage State: ${idx.coverageState}`);
      console.log(`  Indexing State: ${idx.indexingState}`);
      console.log(`  Last Crawl Time: ${idx.lastCrawlTime || 'N/A'}`);
      console.log(`  Page Fetch State: ${idx.pageFetchState || 'N/A'}`);
      console.log(`  Robots.txt State: ${idx.robotsTxtState || 'N/A'}`);
      console.log(`  User Canonical: ${idx.userCanonical || 'N/A'}`);
      console.log(`  Google Canonical: ${idx.googleCanonical || 'N/A'}`);
    } else {
      console.log(`\nURL: ${url} -> Error:`, JSON.stringify(inspectData));
    }
  }
}

main().catch(console.error);
