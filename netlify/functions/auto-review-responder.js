// Netlify Serverless Function: Automated 12-Hour Google Review Monitor & Local SEO Auto-Responder
import crypto from 'node:crypto';

const saProject = process.env.FIREBASE_PROJECT_ID || ('handyman' + 'service' + 'admin');
const client_email = process.env.GOOGLE_SA_EMAIL || (`herehandyman-booking@${saProject}.iam.gserviceaccount.com`);
const private_key = (process.env.GOOGLE_SA_PRIVATE_KEY || '').replace(/\\n/g, '\n');

const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;
const refresh_token = process.env.GOOGLE_OAUTH_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN;

async function getAccessToken() {
  if (client_id && client_secret && refresh_token) {
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

    if (tokenRes.ok) {
      const tokenData = await tokenRes.json();
      return { token: tokenData.access_token, authType: 'User OAuth (davi65@gmail.com)' };
    }
  }

  // Service Account Fallback
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: client_email,
    scope: 'https://www.googleapis.com/auth/business.manage',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64ClaimSet = Buffer.from(JSON.stringify(claimSet)).toString('base64url');
  const unsignedJwt = `${b64Header}.${b64ClaimSet}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedJwt);
  const signature = signer.sign(private_key, 'base64url');
  const jwt = `${unsignedJwt}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error('Google OAuth token error: ' + errText);
  }

  const tokenData = await tokenRes.json();
  return { token: tokenData.access_token, authType: `Service Account (${client_email})` };
}

// Generate personalized, Local-SEO 5-Star Reply
function generateSeoReply(reviewerName, commentText, starRating) {
  const name = reviewerName || 'valued customer';
  const westchesterCities = ['White Plains', 'Scarsdale', 'Yonkers', 'Harrison', 'Rye', 'Mamaroneck', 'Tarrytown', 'Ardsley', 'Dobbs Ferry', 'Eastchester'];
  
  // Pick town deterministically based on reviewer name
  const idx = name.length % westchesterCities.length;
  const town = westchesterCities[idx];

  if (starRating === 'FIVE' || starRating === 5 || !starRating) {
    if (commentText && commentText.length > 5) {
      return `${name}, thank you so much for the 5-star review! It was a real pleasure helping out with your project in ${town}. At Here Handyman, we take pride in delivering prompt, clean, top-quality home repairs across Westchester County. Looking forward to helping you again anytime! David, Here Handyman`;
    }
    return `${name}, thank you for choosing Here Handyman! Providing reliable 5-star home maintenance and repairs in ${town} and Westchester County is what we love to do. Give us a call anytime for your next project! David, Here Handyman`;
  }

  if (starRating === 'FOUR' || starRating === 4) {
    return `Thank you for the feedback and 4-star rating, ${name}! We're glad we could assist with your home repair in ${town}. We always strive for 100% satisfaction — feel free to call or text us anytime at (516) 350-0801 for your next project! David, Here Handyman`;
  }

  return `I'm truly sorry to hear your experience didn't meet the high standards we hold ourselves to, ${name}. I'd love the opportunity to make this right. Please reach out to me directly at (516) 350-0801 so we can talk through what happened. David, Here Handyman`;
}

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { token: accessToken, authType } = await getAccessToken();

    // 1. Fetch Accounts
    const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const accountsData = await accountsRes.json();

    if (!accountsData.accounts || accountsData.accounts.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          authType,
          processed: 0,
          message: 'No Google Business Profile accounts found or quota pending.'
        })
      };
    }

    let totalReplied = 0;
    const results = [];

    // Loop through accounts
    for (const account of accountsData.accounts) {
      // Fetch Locations
      const locRes = await fetch(`https://mybusinessinformation.googleapis.com/v1/${account.name}/locations`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const locData = await locRes.json();
      const locations = locData.locations || [];

      for (const loc of locations) {
        // Fetch Reviews for location
        const reviewsRes = await fetch(`https://mybusiness.googleapis.com/v4/${loc.name}/reviews`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (!reviewsRes.ok) continue;
        const reviewsData = await reviewsRes.json();
        const reviews = reviewsData.reviews || [];

        for (const rev of reviews) {
          // Check if review ALREADY has a reply
          if (!rev.reviewReply) {
            const reviewerName = rev.reviewer ? rev.reviewer.displayName : 'valued customer';
            const commentText = rev.comment || '';
            const starRating = rev.starRating || 5;

            const seoReplyText = generateSeoReply(reviewerName, commentText, starRating);

            // Post reply to Google Business Profile API
            const replyRes = await fetch(`https://mybusiness.googleapis.com/v4/${rev.name}/reply`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ comment: seoReplyText })
            });

            if (replyRes.ok) {
              totalReplied++;
              results.push({
                reviewId: rev.reviewId,
                reviewerName,
                starRating,
                postedReply: seoReplyText
              });
            }
          }
        }
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        authType,
        totalReplied,
        replies: results,
        message: `Auto-review monitor cycle completed. Published ${totalReplied} replies.`
      })
    };

  } catch (err) {
    console.error('Auto Review Responder Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
}
