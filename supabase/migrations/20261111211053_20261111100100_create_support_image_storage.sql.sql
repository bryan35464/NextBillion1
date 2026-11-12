-- Private storage bucket for support chat images, with per-customer folder access.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'support-images',
  'support-images',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "support_images_customer_upload_own" ON storage.objects;
CREATE POLICY "support_images_customer_upload_own" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'support-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.support_conversations c
      WHERE c.customer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "support_images_customer_read_own" ON storage.objects;
CREATE POLICY "support_images_customer_read_own" ON storage.objects FOR SELECT
  TO authenticated USING (
    bucket_id = 'support-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "support_images_admin_upload" ON storage.objects;
CREATE POLICY "support_images_admin_upload" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'support-images' AND public.is_platform_admin()
  );

DROP POLICY IF EXISTS "support_images_admin_read" ON storage.objects;
CREATE POLICY "support_images_admin_read" ON storage.objects FOR SELECT
  TO authenticated USING (
    bucket_id = 'support-images' AND public.is_platform_admin()
  );
