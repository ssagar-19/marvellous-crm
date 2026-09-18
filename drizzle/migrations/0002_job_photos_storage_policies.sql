CREATE POLICY "job photos staff read" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'job-photos' AND public.is_staff(auth.uid()));

CREATE POLICY "job photos staff insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'job-photos' AND public.is_staff(auth.uid()));

CREATE POLICY "job photos staff update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'job-photos' AND public.is_staff(auth.uid()))
WITH CHECK (bucket_id = 'job-photos' AND public.is_staff(auth.uid()));

CREATE POLICY "job photos admin delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'job-photos' AND public.has_role(auth.uid(), 'admin'));