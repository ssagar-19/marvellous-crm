CREATE TYPE public.app_role AS ENUM ('admin', 'management', 'workshop_staff');

CREATE TABLE public.staff_profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.staff_profiles TO authenticated;
GRANT ALL ON public.staff_profiles TO service_role;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER staff_profiles_set_updated_at
BEFORE UPDATE ON public.staff_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;

REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_staff(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(UUID) TO authenticated, service_role;

CREATE POLICY "user_roles read own" ON public.user_roles
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "user_roles admin read all" ON public.user_roles
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "staff_profiles read own" ON public.staff_profiles
FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "staff_profiles admin read all" ON public.staff_profiles
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "staff_profiles update own" ON public.staff_profiles
FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TABLE public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  role public.app_role NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  used_by UUID,
  used_at TIMESTAMPTZ
);

GRANT SELECT ON public.invite_codes TO authenticated;
GRANT ALL ON public.invite_codes TO service_role;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invite_codes admin read" ON public.invite_codes
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_activity TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_photos TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.job_reference_seq TO authenticated;

CREATE POLICY "clients staff read" ON public.clients
FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "clients staff insert" ON public.clients
FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "clients staff update" ON public.clients
FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "clients admin delete" ON public.clients
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "jobs staff read" ON public.jobs
FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "jobs staff insert" ON public.jobs
FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "jobs staff update" ON public.jobs
FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "jobs admin delete" ON public.jobs
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "job_activity staff read" ON public.job_activity
FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "job_activity staff insert" ON public.job_activity
FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "job_photos staff read" ON public.job_photos
FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "job_photos staff insert" ON public.job_photos
FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "job_photos staff delete" ON public.job_photos
FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

INSERT INTO public.invite_codes (code, role, expires_at)
VALUES ('MJ-ADMIN-SETUP', 'admin', now() + interval '30 days');