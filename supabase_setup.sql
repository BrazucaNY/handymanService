-- ==========================================================
-- PostgreSQL Migration & Schema Setup for Supabase
-- Here Handyman CRM + Closed Invoicing System (Skynova style)
-- ==========================================================

-- Enable btree_gist extension for booking constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ----------------------------------------------------------
-- 1. PUBLIC BOOKINGS TABLE (Existing System)
-- ----------------------------------------------------------
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

  EXCLUDE USING gist (booking_range WITH &&) WHERE (status = 'confirmed')
);

CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON public.bookings(start_time);

-- ----------------------------------------------------------
-- 2. STAFF TABLE (Closed Allow-List)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner','staff')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 3. CUSTOMERS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  apt TEXT,
  town TEXT,
  lead_source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid()
);

-- ----------------------------------------------------------
-- 4. JOBS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','scheduled','done','paid')),
  scheduled_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 5. INVOICES TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','void')),
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 6. INVOICE LINE ITEMS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  qty NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0
);

-- ----------------------------------------------------------
-- 7. AUDIT LOG TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID DEFAULT auth.uid(),
  action TEXT,
  table_name TEXT,
  record_id TEXT,
  at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 8. AUTOMATIC INVOICE NUMBER SEQUENCE (HH-YYYY-0001)
-- ----------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

CREATE OR REPLACE FUNCTION next_invoice_number() RETURNS TEXT LANGUAGE sql AS $$
  SELECT 'HH-' || to_char(now(),'YYYY') || '-' || lpad(nextval('invoice_number_seq')::text, 4, '0');
$$;

-- ----------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.staff WHERE user_id = auth.uid());
$$;

-- Staff Read Policy
DROP POLICY IF EXISTS staff_read ON public.staff;
CREATE POLICY staff_read ON public.staff FOR SELECT USING (public.is_staff());

-- Staff Owner Write Policy
DROP POLICY IF EXISTS staff_owner_write ON public.staff;
CREATE POLICY staff_owner_write ON public.staff FOR ALL
  USING (EXISTS (SELECT 1 FROM public.staff WHERE user_id = auth.uid() AND role = 'owner'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.staff WHERE user_id = auth.uid() AND role = 'owner'));

-- Generic Staff Policies for Business Tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['customers','jobs','invoices','invoice_items'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', tbl || '_staff_all', tbl);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());', tbl || '_staff_all', tbl);
  END LOOP;
END $$;

-- Audit Log Policies
DROP POLICY IF EXISTS audit_insert ON public.audit_log;
CREATE POLICY audit_insert ON public.audit_log FOR INSERT WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS audit_read ON public.audit_log;
CREATE POLICY audit_read ON public.audit_log FOR SELECT USING (public.is_staff());

-- Allow public read access to sent/paid invoices via public link (incognito customer viewing)
DROP POLICY IF EXISTS customer_public_invoice_view ON public.invoices;
CREATE POLICY customer_public_invoice_view ON public.invoices FOR SELECT
  USING (status IN ('sent', 'paid'));

DROP POLICY IF EXISTS customer_public_invoice_items_view ON public.invoice_items;
CREATE POLICY customer_public_invoice_items_view ON public.invoice_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND i.status IN ('sent', 'paid')
  ));

DROP POLICY IF EXISTS customer_public_customers_view ON public.customers;
CREATE POLICY customer_public_customers_view ON public.customers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.invoices i WHERE i.customer_id = id AND i.status IN ('sent', 'paid')
  ));

-- ----------------------------------------------------------
-- 10. PROJECT PHOTOS TABLE (FIELD UPLOADS & GEOTAGGER)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT DEFAULT 'before_after' CHECK (category IN ('before','after','before_after','showcase')),
  town TEXT NOT NULL DEFAULT 'White Plains',
  latitude NUMERIC(10,6),
  longitude NUMERIC(10,6),
  photo_url TEXT NOT NULL,
  geotagged BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.project_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS project_photos_staff ON public.project_photos;
CREATE POLICY project_photos_staff ON public.project_photos FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS project_photos_public_read ON public.project_photos;
CREATE POLICY project_photos_public_read ON public.project_photos FOR SELECT USING (true);

-- ----------------------------------------------------------
-- NOTE FOR INITIAL ADMIN SETUP:
-- Run this in Supabase SQL editor after creating your user in Auth -> Users:
-- INSERT INTO public.staff (user_id, role) VALUES ('<PASTE-YOUR-USER-UUID>', 'owner');
-- ----------------------------------------------------------

