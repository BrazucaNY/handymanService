// Server-Side Database Configuration (Netlify Functions)
// IMPORTANT: Server functions must use the Supabase service_role key.
// The public/publishable key must NEVER be used here: it is exposed to the browser
// and would make every table world-readable once Row Level Security is enabled.
// Set SUPABASE_SERVICE_ROLE_KEY in the Netlify environment variables.

export const DB_CONFIG = {
  SUPABASE_URL: process.env.SUPABASE_URL || "https://vvwnmiffuaxiazlskeya.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || ""
};

if (!DB_CONFIG.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "[dbConfig] SUPABASE_SERVICE_ROLE_KEY is not set. Server-side database access is disabled. " +
    "Configure it in Netlify environment variables to enable booking logs and CRM storage."
  );
}
