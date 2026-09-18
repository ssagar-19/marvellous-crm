CREATE TYPE public.job_status AS ENUM (
  'NEW','AWAITING_WORKSHOP','RECEIVED','INSPECTION','AWAITING_APPROVAL','IN_PROGRESS',
  'AWAITING_QC','READY_FOR_COLLECTION','COLLECTED','COMPLETED','WAITING_FOR_PARTS',
  'CUSTOMER_DECLINED','CANCELLED','RETURNED_TO_WORKSHOP','ON_HOLD'
);

CREATE TYPE public.job_location AS ENUM (
  'FRONT_DESK','WORKSHOP','BENCH_1','BENCH_2','BENCH_3','QC'
);

CREATE TYPE public.job_priority AS ENUM ('LOW','NORMAL','HIGH','URGENT');

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_digits TEXT GENERATED ALWAYS AS (regexp_replace(coalesce(phone,''), '[^0-9]', '', 'g')) STORED,
  email TEXT,
  postcode TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE INDEX clients_phone_digits_idx ON public.clients (phone_digits);
CREATE INDEX clients_full_name_idx ON public.clients (lower(full_name));

CREATE SEQUENCE public.job_reference_seq START WITH 25100 INCREMENT BY 1;

CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_reference TEXT NOT NULL UNIQUE DEFAULT ('MJ-' || lpad(nextval('public.job_reference_seq')::text, 5, '0')),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_description TEXT NOT NULL,
  metal TEXT,
  stone TEXT,
  service TEXT NOT NULL,
  quoted_price NUMERIC(10,2),
  deposit_amount NUMERIC(10,2),
  promised_completion_date DATE,
  priority public.job_priority NOT NULL DEFAULT 'NORMAL',
  customer_notes TEXT,
  status public.job_status NOT NULL DEFAULT 'AWAITING_WORKSHOP',
  location public.job_location NOT NULL DEFAULT 'FRONT_DESK',
  accepted_by TEXT,
  is_draft BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

GRANT ALL ON public.jobs TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.job_reference_seq TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE INDEX jobs_status_idx ON public.jobs (status);
CREATE INDEX jobs_client_idx ON public.jobs (client_id);
CREATE INDEX jobs_reference_idx ON public.jobs (lower(job_reference));

CREATE TABLE public.job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.job_photos TO service_role;
ALTER TABLE public.job_photos ENABLE ROW LEVEL SECURITY;
CREATE INDEX job_photos_job_idx ON public.job_photos (job_id);

CREATE TABLE public.job_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  staff_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.job_activity TO service_role;
ALTER TABLE public.job_activity ENABLE ROW LEVEL SECURITY;
CREATE INDEX job_activity_job_idx ON public.job_activity (job_id, created_at DESC);

CREATE TRIGGER clients_set_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER jobs_set_updated_at BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();