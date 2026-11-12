-- Support chat: conversations, messages, and admin availability for signed-in customers.

CREATE TABLE IF NOT EXISTS public.support_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name text NOT NULL CHECK (char_length(btrim(customer_name)) BETWEEN 2 AND 100),
  customer_phone text NOT NULL CHECK (customer_phone ~ '^\+?[0-9]{7,15}$'),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  customer_unread_count integer NOT NULL DEFAULT 0 CHECK (customer_unread_count >= 0),
  admin_unread_count integer NOT NULL DEFAULT 0 CHECK (admin_unread_count >= 0),
  last_message_preview text NOT NULL DEFAULT '',
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.support_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role text NOT NULL CHECK (sender_role IN ('customer', 'admin')),
  body text CHECK (body IS NULL OR char_length(body) BETWEEN 1 AND 2000),
  image_path text CHECK (image_path IS NULL OR char_length(image_path) <= 300),
  image_mime text CHECK (image_mime IS NULL OR image_mime IN ('image/jpeg', 'image/png', 'image/webp')),
  image_size integer CHECK (image_size IS NULL OR (image_size > 0 AND image_size <= 5242880)),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (body IS NOT NULL OR image_path IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.support_availability (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  admin_last_seen_at timestamptz NOT NULL DEFAULT '-infinity'::timestamptz
);

INSERT INTO public.support_availability (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_support_conversations_last_message ON public.support_conversations (last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_messages_conversation_created ON public.support_messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_support_messages_sender_created ON public.support_messages (sender_id, created_at DESC);

ALTER TABLE public.support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_availability ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.support_conversations, public.support_messages, public.support_availability FROM PUBLIC, anon;
GRANT SELECT, INSERT ON public.support_conversations TO authenticated;
GRANT UPDATE (status, updated_at) ON public.support_conversations TO authenticated;
GRANT SELECT, INSERT ON public.support_messages TO authenticated;
GRANT SELECT ON public.support_availability TO authenticated;

DROP POLICY IF EXISTS "customer_read_own_conversation" ON public.support_conversations;
CREATE POLICY "customer_read_own_conversation" ON public.support_conversations FOR SELECT
  TO authenticated USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "admin_read_all_conversations" ON public.support_conversations;
CREATE POLICY "admin_read_all_conversations" ON public.support_conversations FOR SELECT
  TO authenticated USING (public.is_platform_admin());

DROP POLICY IF EXISTS "customer_create_own_conversation" ON public.support_conversations;
CREATE POLICY "customer_create_own_conversation" ON public.support_conversations FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = customer_id
    AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    AND NOT public.is_platform_admin()
  );

DROP POLICY IF EXISTS "admin_update_conversations" ON public.support_conversations;
CREATE POLICY "admin_update_conversations" ON public.support_conversations FOR UPDATE
  TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS "customer_read_own_messages" ON public.support_messages;
CREATE POLICY "customer_read_own_messages" ON public.support_messages FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.support_conversations c
      WHERE c.id = support_messages.conversation_id AND c.customer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "admin_read_all_messages" ON public.support_messages;
CREATE POLICY "admin_read_all_messages" ON public.support_messages FOR SELECT
  TO authenticated USING (public.is_platform_admin());

DROP POLICY IF EXISTS "customer_send_own_message" ON public.support_messages;
CREATE POLICY "customer_send_own_message" ON public.support_messages FOR INSERT
  TO authenticated WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.support_conversations c
      WHERE c.id = support_messages.conversation_id AND c.customer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "admin_send_message" ON public.support_messages;
CREATE POLICY "admin_send_message" ON public.support_messages FOR INSERT
  TO authenticated WITH CHECK (sender_id = auth.uid() AND public.is_platform_admin());

DROP POLICY IF EXISTS "authenticated_read_availability" ON public.support_availability;
CREATE POLICY "authenticated_read_availability" ON public.support_availability FOR SELECT
  TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.support_prepare_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  ELSIF v_conv.customer_id = auth.uid() THEN
    NEW.sender_role := 'customer';
  ELSE
    RAISE EXCEPTION 'You cannot message in this conversation';
  END IF;

  NEW.sender_id := auth.uid();

  IF NEW.image_path IS NOT NULL AND NOT starts_with(NEW.image_path, v_conv.customer_id::text || '/') THEN
    RAISE EXCEPTION 'Invalid image reference';
  END IF;

  SELECT count(*) INTO v_recent
  FROM public.support_messages
  WHERE sender_id = NEW.sender_id AND created_at > now() - interval '1 minute';
  IF v_recent >= 20 THEN
    RAISE EXCEPTION 'You are sending messages too quickly. Please wait a moment.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS support_messages_prepare ON public.support_messages;
CREATE TRIGGER support_messages_prepare
  BEFORE INSERT ON public.support_messages
  FOR EACH ROW EXECUTE FUNCTION public.support_prepare_message();

CREATE OR REPLACE FUNCTION public.support_after_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.support_conversations
  SET
    last_message_at = NEW.created_at,
    last_message_preview = left(COALESCE(NEW.body, '[Image]'), 120),
    updated_at = now(),
    status = CASE WHEN NEW.sender_role = 'customer' THEN 'open' ELSE status END,
    admin_unread_count = CASE WHEN NEW.sender_role = 'customer' THEN admin_unread_count + 1 ELSE admin_unread_count END,
    customer_unread_count = CASE WHEN NEW.sender_role = 'admin' THEN customer_unread_count + 1 ELSE customer_unread_count END
  WHERE id = NEW.conversation_id;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS support_messages_after_insert ON public.support_messages;
CREATE TRIGGER support_messages_after_insert
  AFTER INSERT ON public.support_messages
  FOR EACH ROW EXECUTE FUNCTION public.support_after_message();

CREATE OR REPLACE FUNCTION public.support_mark_read(p_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conv public.support_conversations%ROWTYPE;
  v_now timestamptz := now();
BEGIN
  SELECT * INTO v_conv FROM public.support_conversations WHERE id = p_conversation_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conversation not found';
  END IF;

  IF public.is_platform_admin() THEN
    UPDATE public.support_messages SET read_at = v_now
    WHERE conversation_id = p_conversation_id AND sender_role = 'customer' AND read_at IS NULL;
    UPDATE public.support_conversations SET admin_unread_count = 0
    WHERE id = p_conversation_id;
  ELSIF v_conv.customer_id = auth.uid() THEN
    UPDATE public.support_messages SET read_at = v_now
    WHERE conversation_id = p_conversation_id AND sender_role = 'admin' AND read_at IS NULL;
    UPDATE public.support_conversations SET customer_unread_count = 0
    WHERE id = p_conversation_id;
  ELSE
    RAISE EXCEPTION 'You cannot access this conversation';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.support_admin_heartbeat()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  UPDATE public.support_availability SET admin_last_seen_at = now() WHERE id = 1;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.support_mark_read(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.support_mark_read(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.support_admin_heartbeat() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.support_admin_heartbeat() TO authenticated;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['support_conversations', 'support_messages', 'support_availability'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END;
$$;
