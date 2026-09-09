// Example Database Configuration File
// Copy to netlify/functions/dbConfig.js and add your real Supabase credentials

export const DB_CONFIG = {
  SUPABASE_URL: process.env.SUPABASE_URL || "YOUR_SUPABASE_URL_HERE",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE"
};
