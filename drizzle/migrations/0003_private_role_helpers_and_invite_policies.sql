-- Keep SECURITY DEFINER role helpers out of the exposed API schema.
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$function$;

-- Staff access is limited to explicit staff-level roles, not "any role row".
CREATE OR REPLACE FUNCTION private.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin'::public.app_role, 'management'::public.app_role, 'workshop_staff'::public.app_role)
  );
$function$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_staff(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_staff(uuid) TO authenticated, service_role;

-- Repoint every policy at the private helpers.
DROP POLICY IF EXISTS "clients staff read" ON public.clients;
DROP POLICY IF EXISTS "clients staff insert" ON public.clients;
DROP POLICY IF EXISTS "clients staff update" ON public.clients;
DROP POLICY IF EXISTS "clients admin delete" ON public.clients;

CREATE POLICY "clients staff read" ON public.clients FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));
CREATE POLICY "clients staff insert" ON public.clients FOR INSERT TO authenticated
  WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "clients staff update" ON public.clients FOR UPDATE TO authenticated
  USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "clients admin delete" ON public.clients FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "jobs staff read" ON public.jobs;
DROP POLICY IF EXISTS "jobs staff insert" ON public.jobs;
DROP POLICY IF EXISTS "jobs staff update" ON public.jobs;
DROP POLICY IF EXISTS "jobs admin delete" ON public.jobs;

CREATE POLICY "jobs staff read" ON public.jobs FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));
CREATE POLICY "jobs staff insert" ON public.jobs FOR INSERT TO authenticated
  WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "jobs staff update" ON public.jobs FOR UPDATE TO authenticated
  USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "jobs admin delete" ON public.jobs FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "job_activity staff read" ON public.job_activity;
DROP POLICY IF EXISTS "job_activity staff insert" ON public.job_activity;

CREATE POLICY "job_activity staff read" ON public.job_activity FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));
CREATE POLICY "job_activity staff insert" ON public.job_activity FOR INSERT TO authenticated
  WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "job_photos staff read" ON public.job_photos;
DROP POLICY IF EXISTS "job_photos staff insert" ON public.job_photos;
DROP POLICY IF EXISTS "job_photos staff delete" ON public.job_photos;

CREATE POLICY "job_photos staff read" ON public.job_photos FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));
CREATE POLICY "job_photos staff insert" ON public.job_photos FOR INSERT TO authenticated
  WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "job_photos staff delete" ON public.job_photos FOR DELETE TO authenticated
  USING (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "staff_profiles admin read all" ON public.staff_profiles;
CREATE POLICY "staff_profiles admin read all" ON public.staff_profiles FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "user_roles admin read all" ON public.user_roles;
CREATE POLICY "user_roles admin read all" ON public.user_roles FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- Invite codes: admin-only lifecycle through the API.
DROP POLICY IF EXISTS "invite_codes admin read" ON public.invite_codes;
CREATE POLICY "invite_codes admin read" ON public.invite_codes FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "invite_codes admin insert" ON public.invite_codes FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "invite_codes admin update" ON public.invite_codes FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "invite_codes admin delete" ON public.invite_codes FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

GRANT INSERT, UPDATE, DELETE ON public.invite_codes TO authenticated;

-- Storage policies for job photos.
DROP POLICY IF EXISTS "job photos staff read" ON storage.objects;
DROP POLICY IF EXISTS "job photos staff insert" ON storage.objects;
DROP POLICY IF EXISTS "job photos staff update" ON storage.objects;
DROP POLICY IF EXISTS "job photos admin delete" ON storage.objects;

CREATE POLICY "job photos staff read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'job-photos' AND private.is_staff(auth.uid()));
CREATE POLICY "job photos staff insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'job-photos' AND private.is_staff(auth.uid()));
CREATE POLICY "job photos staff update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'job-photos' AND private.is_staff(auth.uid()))
  WITH CHECK (bucket_id = 'job-photos' AND private.is_staff(auth.uid()));
CREATE POLICY "job photos admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'job-photos' AND private.has_role(auth.uid(), 'admin'::public.app_role));

-- The public copies are no longer referenced by any policy; stop exposing them.
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.is_staff(uuid);
