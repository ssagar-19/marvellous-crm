CREATE TABLE public.job_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 1,
  item_type text NOT NULL,
  service text NOT NULL,
  metal text,
  stone text,
  item_description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX job_items_job_id_idx ON public.job_items(job_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_items TO authenticated;
GRANT ALL ON public.job_items TO service_role;

ALTER TABLE public.job_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_items staff read" ON public.job_items
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE POLICY "job_items staff insert" ON public.job_items
  FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "job_items staff update" ON public.job_items
  FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "job_items staff delete" ON public.job_items
  FOR DELETE TO authenticated USING (private.is_staff(auth.uid()));

INSERT INTO public.job_items (job_id, position, item_type, service, metal, stone, item_description, created_at)
SELECT j.id, 1, j.item_type, j.service, j.metal, j.stone, COALESCE(j.item_description, ''), j.created_at
FROM public.jobs j;