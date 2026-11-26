const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

async function getAccessToken(scope) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: keyData.client_email,
    scope: scope || 'https://www.googleapis.com/auth/webmasters',
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
  const token = await getAccessToken('https://www.googleapis.com/auth/webmasters');
  const siteUrl = "sc-domain:herehandyman.com";
  const encodedSite = encodeURIComponent(siteUrl);

  console.log("====================================================");
  console.log("📊 GOOGLE SEARCH CONSOLE FULL PERFORMANCE REPORT");
  console.log("====================================================\n");

  // 1. Sitemaps
  try {
    const sitemapsRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const sitemapsData = await sitemapsRes.json();
    console.log("=== SITEMAP STATUS ===");
    if (sitemapsData.sitemap) {
      for (const sm of sitemapsData.sitemap) {
        console.log(`Path: ${sm.path}`);
        console.log(`  Last Downloaded: ${sm.lastDownloaded || 'N/A'}`);
        console.log(`  Last Submitted: ${sm.lastSubmitted || 'N/A'}`);
        console.log(`  Warnings: ${sm.warnings || 0}, Errors: ${sm.errors || 0}`);
        if (sm.contents) {
          sm.contents.forEach(c => console.log(`  - Type: ${c.type}, Submitted: ${c.submitted}, Indexed: ${c.indexed}`));
        }
      }
    } else {
      console.log("No sitemaps found:", JSON.stringify(sitemapsData));
    }
  } catch (err) {
    console.error("Sitemap error:", err.message);
  }

  // Calculate dates (last 28 days up to today - 3 days for GSC latency)
  const d = new Date();
  d.setDate(d.getDate() - 2); // 2 days ago
  const endDate = d.toISOString().split('T')[0];
  const dStart = new Date();
  dStart.setDate(dStart.getDate() - 30);
  const startDate = dStart.toISOString().split('T')[0];

  console.log(`\nAnalyzing Date Range: ${startDate} to ${endDate}\n`);

  // 2. Total Aggregate
  try {
    const aggRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate: startDate,
        endDate: endDate
      })
    });
    const aggData = await aggRes.json();
    console.log("=== 28-DAY TOTAL OVERVIEW ===");
    if (aggData.rows && aggData.rows.length > 0) {
      const r = aggData.rows[0];
      console.log(`Total Clicks: ${r.clicks}`);
      console.log(`Total Impressions: ${r.impressions}`);
      console.log(`Average CTR: ${(r.ctr * 100).toFixed(2)}%`);
      console.log(`Average Position: ${r.position.toFixed(1)}`);
    } else {
      console.log("No aggregate data found:", JSON.stringify(aggData));
    }
  } catch (err) {
    console.error("Aggregate error:", err.message);
  }

  // 3. Daily Trend (last 10 days)
  try {
    const dailyRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate: startDate,
        endDate: endDate,
        dimensions: ['date']
      })
    });
    const dailyData = await dailyRes.json();
    console.log("\n=== DAILY TREND (Recent Days) ===");
    if (dailyData.rows) {
      const recent = dailyData.rows.slice(-10);
      for (const row of recent) {
        console.log(`${row.keys[0]} | Clicks: ${row.clicks.toString().padStart(2)} | Impr: ${row.impressions.toString().padStart(4)} | CTR: ${(row.ctr * 100).toFixed(1).padStart(4)}% | Pos: ${row.position.toFixed(1).padStart(4)}`);
      }
    }
  } catch (err) {
    console.error("Daily trend error:", err.message);
  }

  // 4. Top Queries
  try {
    const queriesRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate: startDate,
        endDate: endDate,
        dimensions: ['query'],
        rowLimit: 20
      })
    });
    const queriesData = await queriesRes.json();
    console.log("\n=== TOP 20 SEARCH QUERIES ===");
    if (queriesData.rows) {
      for (const row of queriesData.rows) {
        console.log(`- "${row.keys[0]}": Clicks: ${row.clicks}, Impr: ${row.impressions}, CTR: ${(row.ctr * 100).toFixed(1)}%, Pos: ${row.position.toFixed(1)}`);
      }
    }
  } catch (err) {
    console.error("Queries error:", err.message);
  }

  // 5. Top Pages
  try {
    const pagesRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate: startDate,
        endDate: endDate,
        dimensions: ['page'],
        rowLimit: 20
      })
    });
    const pagesData = await pagesRes.json();
    console.log("\n=== TOP 20 PAGES BY IMPRESSIONS/CLICKS ===");
    if (pagesData.rows) {
      for (const row of pagesData.rows) {
        const cleanPath = row.keys[0].replace('https://www.herehandyman.com', '') || '/';
        console.log(`- ${cleanPath}: Clicks: ${row.clicks}, Impr: ${row.impressions}, CTR: ${(row.ctr * 100).toFixed(1)}%, Pos: ${row.position.toFixed(1)}`);
      }
    }
  } catch (err) {
    console.error("Pages error:", err.message);
  }

  // 6. Inspect key URLs live
  console.log("\n=== LIVE GOOGLE INDEX INSPECTION FOR KEY PAGES ===");
  const urlsToInspect = [
    "https://www.herehandyman.com/",
    "https://www.herehandyman.com/new-rochelle-handyman",
    "https://www.herehandyman.com/scarsdale-handyman",
    "https://www.herehandyman.com/gallery",
    "https://www.herehandyman.com/book"
  ];

  for (const url of urlsToInspect) {
    try {
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
        console.log(`  Verdict: ${idx.verdict}`);
        console.log(`  Coverage State: ${idx.coverageState}`);
        console.log(`  Indexing State: ${idx.indexingState}`);
        console.log(`  Last Crawl: ${idx.lastCrawlTime || 'N/A'}`);
        console.log(`  Page Fetch: ${idx.pageFetchState || 'N/A'}`);
        console.log(`  Robots.txt: ${idx.robotsTxtState || 'N/A'}`);
      } else {
        console.log(`\nURL: ${url} ->`, inspectData.error ? inspectData.error.message : JSON.stringify(inspectData));
      }
    } catch (err) {
      console.error(`Error inspecting ${url}:`, err.message);
    }
  }
}

main().catch(console.error);
