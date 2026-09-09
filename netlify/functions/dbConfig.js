// Server-Side Database Configuration (Netlify Functions Serverless Container)
// 100% Free - Server-side database access for Here Handyman slot engine

export const DB_CONFIG = {
  SUPABASE_URL: process.env.SUPABASE_URL || "https://vvwnmiffuaxiazlskeya.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_publishable_-kxhroGZF03Y-RkyJ_bVTQ_5MQZRCZc"
};
