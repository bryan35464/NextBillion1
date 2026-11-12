/*
# Create auto profile creation trigger and admin role check function

1. Changes
- `handle_new_user()` SECURITY DEFINER function: automatically creates a `user_profiles` row when a new auth user signs up. Runs as a trigger on `auth.users` INSERT.
- `is_admin()` SECURITY DEFINER function: returns true if the current user's profile has role 'super_admin' or 'admin'. Used for admin authorization checks.
- Trigger `on_auth_user_created` fires after a new auth.users row is inserted.

2. Security
- `handle_new_user` is SECURITY DEFINER so it can insert into user_profiles even though the anon role can't.
- `is_admin` is SECURITY DEFINER and granted to authenticated role.
- These functions run with elevated privileges but only perform safe, scoped operations.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'user')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'admin')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;