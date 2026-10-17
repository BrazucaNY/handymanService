// Netlify Serverless Function: POST /.netlify/functions/auth-login
// Server-Side Authentication with Supabase and httpOnly Cookie Dispatch

import { DB_CONFIG } from './dbConfig.js';

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const { email, password, remember } = JSON.parse(event.body || "{}");
    if (!email || !password) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Email and password are required." })
      };
    }

    const supabaseUrl = DB_CONFIG.SUPABASE_URL || "https://vvwnmiffuaxiazlskeya.supabase.co";
    const supabaseKey = DB_CONFIG.SUPABASE_SERVICE_ROLE_KEY || "sb_publishable_-kxhroGZF03Y-RkyJ_bVTQ_5MQZRCZc";

    const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "apikey": supabaseKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok || !data.access_token) {
      return {
        statusCode: res.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      };
    }

    const maxAge = remember ? 2592000 : 86400; // 30 days or 1 day
    const authCookie = `hh_auth=1; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAge}`;
    const jwtCookie = `hh_jwt=${data.access_token}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAge}`;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      multiValueHeaders: {
        "Set-Cookie": [authCookie, jwtCookie]
      },
      body: JSON.stringify({
        ok: true,
        user: { email: (data.user && data.user.email) || email },
        access_token: data.access_token,
        expires_at: Date.now() + ((data.expires_in || 3600) * 1000)
      })
    };
  } catch (err) {
    console.error("[AUTH LOGIN ERROR]", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Authentication service error." })
    };
  }
}
