-- Hide admin identity: admin messages are stored without the admin's user id.
ALTER TABLE public.support_messages ALTER COLUMN sender_id DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.support_prepare_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_conv public.support_conversations%ROWTYPE;
  v_recent integer;
BEGIN
  SELECT * INTO v_conv FROM public.support_conversations WHERE id = NEW.conversation_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conversation not found';
  END IF;

  IF public.is_platform_admin() THEN
    NEW.sender_role := 'admin';
    NEW.sender_id := NULL;
  ELSIF v_conv.customer_id = auth.uid() THEN
    NEW.sender_role := 'customer';
    NEW.sender_id := auth.uid();
  ELSE
    RAISE EXCEPTION 'You cannot message in this conversation';
  END IF;

  IF NEW.image_path IS NOT NULL AND NOT starts_with(NEW.image_path, v_conv.customer_id::text || '/') THEN
    RAISE EXCEPTION 'Invalid image reference';
  END IF;

  IF NEW.sender_role = 'customer' THEN
    SELECT count(*) INTO v_recent
    FROM public.support_messages
    WHERE sender_id = NEW.sender_id AND created_at > now() - interval '1 minute';
    IF v_recent >= 20 THEN
      RAISE EXCEPTION 'You are sending messages too quickly. Please wait a moment.';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP POLICY IF EXISTS admin_send_message ON public.support_messages;
CREATE POLICY admin_send_message ON public.support_messages
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin());

ALTER TABLE public.support_messages DROP CONSTRAINT IF EXISTS support_messages_image_size_check;
ALTER TABLE public.support_messages ADD CONSTRAINT support_messages_image_size_check
  CHECK (image_size IS NULL OR (image_size > 0 AND image_size <= 2097152));

-- Customer creation: email/password only, no anonymous sessions.
DROP POLICY IF EXISTS customer_create_own_conversation ON public.support_conversations;
CREATE POLICY customer_create_own_conversation ON public.support_conversations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = customer_id AND NOT public.is_platform_admin());

-- Indian mobile numbers only, stored as +91 followed by 10 digits.
ALTER TABLE public.support_conversations DROP CONSTRAINT IF EXISTS support_conversations_customer_phone_check;
ALTER TABLE public.support_conversations ADD CONSTRAINT support_conversations_customer_phone_check
  CHECK (customer_phone ~ '^\+91[6-9][0-9]{9}$');

-- Support image bucket: 2 MB and image types only.
UPDATE storage.buckets
SET file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'support-images';

-- Content tables: writes restricted to admins (previously any signed-in user).
DROP POLICY IF EXISTS admin_all_announcements ON public.announcements;
CREATE POLICY admin_select_announcements ON public.announcements FOR SELECT TO authenticated USING (public.is_platform_admin());
CREATE POLICY admin_insert_announcements ON public.announcements FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin());
CREATE POLICY admin_update_announcements ON public.announcements FOR UPDATE TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY admin_delete_announcements ON public.announcements FOR DELETE TO authenticated USING (public.is_platform_admin());

DROP POLICY IF EXISTS admin_all_blog_posts ON public.blog_posts;
CREATE POLICY admin_select_blog_posts ON public.blog_posts FOR SELECT TO authenticated USING (public.is_platform_admin());
CREATE POLICY admin_insert_blog_posts ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin());
CREATE POLICY admin_update_blog_posts ON public.blog_posts FOR UPDATE TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY admin_delete_blog_posts ON public.blog_posts FOR DELETE TO authenticated USING (public.is_platform_admin());

DROP POLICY IF EXISTS admin_all_faqs ON public.faqs;
CREATE POLICY admin_select_faqs ON public.faqs FOR SELECT TO authenticated USING (public.is_platform_admin());
CREATE POLICY admin_insert_faqs ON public.faqs FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin());
CREATE POLICY admin_update_faqs ON public.faqs FOR UPDATE TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY admin_delete_faqs ON public.faqs FOR DELETE TO authenticated USING (public.is_platform_admin());

DROP POLICY IF EXISTS admin_all_notifications ON public.notifications;
CREATE POLICY admin_select_notifications ON public.notifications FOR SELECT TO authenticated USING (public.is_platform_admin());
CREATE POLICY admin_insert_notifications ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin());
CREATE POLICY admin_update_notifications ON public.notifications FOR UPDATE TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY admin_delete_notifications ON public.notifications FOR DELETE TO authenticated USING (public.is_platform_admin());

DROP POLICY IF EXISTS admin_update_site_settings ON public.site_settings;
DROP POLICY IF EXISTS admin_insert_site_settings ON public.site_settings;
CREATE POLICY admin_insert_site_settings ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin());
CREATE POLICY admin_update_site_settings ON public.site_settings FOR UPDATE TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS admin_insert_assets ON public.assets;
DROP POLICY IF EXISTS admin_update_assets ON public.assets;
DROP POLICY IF EXISTS admin_delete_assets ON public.assets;
CREATE POLICY admin_insert_assets ON public.assets FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin());
CREATE POLICY admin_update_assets ON public.assets FOR UPDATE TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY admin_delete_assets ON public.assets FOR DELETE TO authenticated USING (public.is_platform_admin());

DROP POLICY IF EXISTS admin_read_audit_logs ON public.audit_logs;
DROP POLICY IF EXISTS admin_insert_audit_logs ON public.audit_logs;
CREATE POLICY admin_read_audit_logs ON public.audit_logs FOR SELECT TO authenticated USING (public.is_platform_admin());
CREATE POLICY admin_insert_audit_logs ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin());

-- Functions that should not be callable by anonymous visitors.
DO $$
BEGIN
  REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

DO $$
BEGIN
  REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
EXCEPTION WHEN undefined_function THEN NULL;
END $$;
