// Serverless Function: Automated Backup System for Here Handyman CRM (Zero-Dependency Node 18)
import crypto from 'node:crypto';

function timingSafeEqualStr(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export async function handler(event, context) {
  const cronSecret = process.env.CRON_BACKUP_SECRET;

  // Fail closed: never run with a missing/placeholder secret.
  if (!cronSecret) {
    console.error('[BACKUP] CRON_BACKUP_SECRET is not configured.');
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Backup endpoint is not configured.' }),
    };
  }

  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const providedSecret =
    event.headers['x-backup-secret'] ||
    event.headers['X-Backup-Secret'] ||
    (authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '');

  if (!providedSecret || !timingSafeEqualStr(providedSecret, cronSecret)) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized backup request.' }),
    };
  }

  const supabaseUrl = process.env.SUPABASE_URL || 'https://vvwnmiffuaxiazlskeya.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

  try {
    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    };

    const reviewsRes = await fetch(`${supabaseUrl}/rest/v1/customer_reviews?select=*`, { headers });
    const reviewsData = reviewsRes.ok ? await reviewsRes.json() : [];

    const backupSnapshot = {
      timestamp: new Date().toISOString(),
      recordCounts: {
        reviews: Array.isArray(reviewsData) ? reviewsData.length : 0,
      },
      data: reviewsData
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache'
      },
      body: JSON.stringify({
        success: true,
        message: 'CRM Database Backup snapshot created successfully.',
        snapshot: backupSnapshot
      })
    };
  } catch (err) {
    console.error('CRM Data Backup Error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to create database backup snapshot.', details: err.message }),
    };
  }
};
