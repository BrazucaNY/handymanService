// Serverless Function: Automated Backup System for Here Handyman CRM
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // Require valid bearer auth header or secret cron key
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const cronSecret = process.env.CRON_BACKUP_SECRET || 'hh_crm_secret_backup_key';
  
  if (!authHeader.includes(cronSecret) && !authHeader.includes('Bearer')) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized backup request.' }),
    };
  }

  const supabaseUrl = process.env.SUPABASE_URL || 'https://vvwnmiffuaxiazlskeya.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Database configuration missing.' }),
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: contacts, error: cErr } = await supabase.from('customers').select('*');
    const { data: reviews, error: rErr } = await supabase.from('reviews').select('*');

    if (cErr || rErr) {
      throw cErr || rErr;
    }

    const backupSnapshot = {
      timestamp: new Date().toISOString(),
      recordCounts: {
        customers: contacts ? contacts.length : 0,
        reviews: reviews ? reviews.length : 0,
      },
      customers: contacts || [],
      reviews: reviews || []
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
      body: JSON.stringify({ error: 'Failed to create database backup snapshot.', details: err.message }),
    };
  }
};
