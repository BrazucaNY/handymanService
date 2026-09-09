// Server-Side Database Configuration (Netlify Functions Serverless Container)
// 100% Free - No Netlify UI environment variable configuration or paid upgrade required!

export const DB_CONFIG = {
  // Replace these strings with your free Supabase project values when created:
  SUPABASE_URL: process.env.SUPABASE_URL || "YOUR_SUPABASE_URL_HERE",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE"
};
