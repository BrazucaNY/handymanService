import dotenv from 'dotenv';
dotenv.config();

const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;
const refresh_token = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

async function testGbpApi() {
  console.log("Testing Google OAuth token refresh...");
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
  if (!tokenRes.ok) {
    console.error("Token error:", tokenData);
    return;
  }

  const accessToken = tokenData.access_token;
  console.log("✅ OAuth Access Token obtained successfully!");

  // Step 1: List My Business Accounts
  console.log("\nCalling My Business Account Management API (v1/accounts)...");
  const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  const accountsData = await accountsRes.json();
  console.log("Accounts API status:", accountsRes.status);
  console.log("Accounts API response:", JSON.stringify(accountsData, null, 2));

  if (accountsData.accounts && accountsData.accounts.length > 0) {
    const accountName = accountsData.accounts[0].name;
    console.log(`\nFound Account: ${accountName}`);

    // Step 2: List Locations
    console.log("Calling My Business Business Information API for locations...");
    const locRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,storefrontAddress`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const locData = await locRes.json();
    console.log("Locations API status:", locRes.status);
    console.log("Locations response:", JSON.stringify(locData, null, 2));
  }
}

testGbpApi().catch(console.error);
