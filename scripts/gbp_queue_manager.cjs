const fs = require('fs');
const path = require('path');

// Parse .env manually
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && line.includes('=')) {
    const idx = line.indexOf('=');
    env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
});

const client_id = env.GOOGLE_CLIENT_ID;
const client_secret = env.GOOGLE_CLIENT_SECRET;
const refresh_token = env.GOOGLE_OAUTH_REFRESH_TOKEN;
const accountId = "107235988987982670835";
const locationId = "1964673381603454408";

async function getAccessToken() {
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
  if (!tokenData.access_token) {
    throw new Error("Failed to get Google OAuth token: " + JSON.stringify(tokenData));
  }
  return tokenData.access_token;
}

async function getLocalPosts(accessToken) {
  const url = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/localPosts?pageSize=50`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const data = await res.json();
  return data.localPosts || [];
}

async function main() {
  console.log("====================================================");
  console.log("📅 GOOGLE BUSINESS PROFILE (GBP) 2-POSTS-PER-WEEK QUEUE");
  console.log("====================================================\n");

  const token = await getAccessToken();
  const posts = await getLocalPosts(token);

  console.log(`Retrieved ${posts.length} total posts from Google Business Profile.\n`);

  const scheduled = posts.filter(p => p.state === 'SCHEDULED');
  // Sort scheduled ascending by scheduledTime
  scheduled.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));

  console.log("=== CURRENTLY SCHEDULED QUEUE ===");
  if (scheduled.length === 0) {
    console.log("No posts currently scheduled.");
  } else {
    scheduled.forEach((p, idx) => {
      const dt = new Date(p.scheduledTime);
      const dayName = dt.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'America/New_York' });
      const dateStr = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' });
      const timeStr = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' });
      const title = p.summary ? p.summary.split('\n')[0] : 'No title';
      console.log(`[Slot ${idx + 1}] ${dayName}, ${dateStr} at ${timeStr} EST`);
      console.log(`   Post: ${title}`);
      console.log(`   ID: ${p.name.split('/').pop()}\n`);
    });
  }

  // Find latest scheduled date (ignoring far future anomalies like 2027)
  let latestDate = new Date();
  for (const p of scheduled) {
    const d = new Date(p.scheduledTime);
    if (d.getFullYear() === 2026 && d > latestDate) {
      latestDate = d;
    }
  }

  console.log("=== UPCOMING 2-POSTS-PER-WEEK CALENDAR SLOTS ===");
  // Generate next 8 slots (Mondays and Thursdays at 9:00 AM EST)
  let current = new Date();
  current.setHours(9, 0, 0, 0); // 9:00 AM EST
  const slots = [];
  let dayOffset = 1;
  while (slots.length < 8) {
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + dayOffset);
    testDate.setHours(9, 0, 0, 0);
    const day = testDate.getDay(); // 1 = Mon, 4 = Thu
    if (day === 1 || day === 4) {
      slots.push(testDate);
    }
    dayOffset++;
  }

  slots.forEach((s, idx) => {
    const dayName = s.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    console.log(`- Week Slot ${idx + 1}: ${dayName}, ${dateStr} at 9:00 AM EST`);
  });
}

main().catch(console.error);
