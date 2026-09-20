-- ============================================================================
-- Here Handyman - CRM & Booking Data Hardening
-- ============================================================================
-- READ FIRST - ORDER MATTERS:
--
--   1) Set SUPABASE_SERVICE_ROLE_KEY in Netlify environment variables and redeploy.
--      (Supabase Dashboard -> Project Settings -> API -> service_role secret.)
--      The server functions in netlify/functions/* use this key to reach the DB.
--
--   2) THEN run this SQL in the Supabase SQL editor.
--
-- Why: this migration enables Row Level Security and removes ALL access for the
-- public (anon/publishable) key. All app access goes through Netlify functions
-- using service_role, which bypasses RLS. If you run this before setting the
-- service-role key, server-side database reads/writes will stop (booking falls
-- back to Google Calendar only, and CRM submissions will fail).
--
-- Background: the public publishable key was previously able to SELECT the
-- bookings table (customer names, phones, addresses, emails) from any browser.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Customer reviews / CRM intake table
-- ----------------------------------------------------------------------------
create table if not exists public.customer_reviews (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  phone        text not null,
  email        text,
  town         text,
  address      text,
  service      text,
  rating       int default 5,
  review_text  text,
  submitted_at timestamptz default now(),
  created_at   timestamptz default now()
);

create index if not exists customer_reviews_submitted_at_idx
  on public.customer_reviews (submitted_at desc);

-- ----------------------------------------------------------------------------
-- 2. Lock down both tables: public key gets no direct access.
-- ----------------------------------------------------------------------------
alter table public.customer_reviews enable row level security;
alter table public.bookings         enable row level security;

revoke all on public.customer_reviews from anon, authenticated;
revoke all on public.bookings         from anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3. Remove any legacy policies that would re-open public access.
-- ----------------------------------------------------------------------------
do $$
declare pol record;
begin
  for pol in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('customer_reviews', 'bookings')
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

-- No RLS policies are created on purpose: only the service_role key
-- (used exclusively by the serverless functions) can read or write these tables.
