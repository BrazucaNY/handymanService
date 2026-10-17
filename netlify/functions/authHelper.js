// Zero-dependency Supabase JWT Session Verifier for Netlify Functions
import { DB_CONFIG } from './dbConfig.js';

export async function verifyStaffSession(event) {
  let token = '';
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.replace(/^Bearer\s+/i, '').trim();
  } else {
    const cookieHeader = event.headers.cookie || event.headers.Cookie || '';
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const jwtCookie = cookies.find(c => c.startsWith('hh_jwt='));
    if (jwtCookie) {
      token = jwtCookie.split('=')[1] || '';
    }
  }

  if (!token) {
    return false;
  }

  const supabaseUrl = DB_CONFIG.SUPABASE_URL || 'https://vvwnmiffuaxiazlskeya.supabase.co';
  const supabaseKey = DB_CONFIG.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_-kxhroGZF03Y-RkyJ_bVTQ_5MQZRCZc';

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) return false;
    const user = await res.json();
    return !!(user && user.id);
  } catch (err) {
    console.error('[AUTH ERROR] Token verification failed:', err);
    return false;
  }
}
