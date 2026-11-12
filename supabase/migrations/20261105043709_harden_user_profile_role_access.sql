/*
# Harden role-based access on user profiles

1. Summary
- Stops regular users from promoting themselves to admin or changing their own
  verification status, trading flag, or account limits.
- Restricts admin-only reads and updates of user profiles to real admins.

2. New function
- `is_platform_admin()` returns true when the signed-in user has the admin or
  super_admin role in `user_profiles`. Execute is granted to signed-in users only.

3. Security changes on `user_profiles`
- Admin read and update policies now require `is_platform_admin()` instead of
  allowing any signed-in user.
- Self-insert of a profile must use the default role `user`.
- A trigger rejects non-admin changes to role, verification_status,
  trading_enabled, account limits, or user_id.

4. Notes
- Idempotent: safe to re-run.
- No data is removed or altered.
*/

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_platform_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated;

DROP POLICY IF EXISTS "admin_read_all_profiles" ON user_profiles;
CREATE POLICY "admin_read_all_profiles" ON user_profiles FOR SELECT
TO authenticated USING (public.is_platform_admin());

DROP POLICY IF EXISTS "admin_update_profiles" ON user_profiles;
CREATE POLICY "admin_update_profiles" ON user_profiles FOR UPDATE
TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS "user_insert_own_profile" ON user_profiles;
CREATE POLICY "user_insert_own_profile" ON user_profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id AND role = 'user');

CREATE OR REPLACE FUNCTION public.guard_profile_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() AND (
    NEW.user_id IS DISTINCT FROM OLD.user_id OR
    NEW.role IS DISTINCT FROM OLD.role OR
    NEW.verification_status IS DISTINCT FROM OLD.verification_status OR
    NEW.trading_enabled IS DISTINCT FROM OLD.trading_enabled OR
    NEW.account_limit_deposit IS DISTINCT FROM OLD.account_limit_deposit OR
    NEW.account_limit_withdrawal IS DISTINCT FROM OLD.account_limit_withdrawal
  ) THEN
    RAISE EXCEPTION 'You are not allowed to change this profile field';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_user_profile_privileged_columns ON user_profiles;
CREATE TRIGGER guard_user_profile_privileged_columns
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION public.guard_profile_privileged_columns();
