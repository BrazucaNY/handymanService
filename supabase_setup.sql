-- PostgreSQL Migration Script for Supabase
-- Enables btree_gist extension to enforce mathematical exclusion constraints on date ranges (prevents double-bookings)

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Create Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  booking_range TSTZRANGE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  service_id TEXT NOT NULL,
  zip TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_email TEXT,
  notes TEXT,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Exclusion constraint: No two confirmed bookings can have overlapping time ranges (including 30m travel buffer)
  EXCLUDE USING gist (booking_range WITH &&) WHERE (status = 'confirmed')
);

-- Index for fast date lookups
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON public.bookings(start_time);
