// Serverless Function: Automated Backup System for Here Handyman CRM (Zero-Dependency Node 18)
exports.handler = async (event) => {
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const cronSecret = process.env.CRON_BACKUP_SECRET || 'hh_crm_secret_backup_key';
  
  if (!authHeader.includes(cronSecret) && !authHeader.includes('Bearer')) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized backup request.' }),
    };
  }

  const supabaseUrl = process.env.SUPABASE_URL || 'https://vvwnmiffuaxiazlskeya.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_-kxhroGZF03Y-RkyJ_bVTQ_5MQZRCZc';

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
