
-- Tighten RLS policies for contacts, companies, profiles, user_roles
-- and lock down SECURITY DEFINER function execution.

-- COMPANIES: scope to creator or manager
DROP POLICY IF EXISTS "Team can read companies" ON public.companies;
DROP POLICY IF EXISTS "Team can insert companies" ON public.companies;
DROP POLICY IF EXISTS "Team can update companies" ON public.companies;
DROP POLICY IF EXISTS "Team can delete companies" ON public.companies;

CREATE POLICY "Read own or manager - companies" ON public.companies
  FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'sales_manager'));

CREATE POLICY "Insert own - companies" ON public.companies
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() OR public.has_role(auth.uid(), 'sales_manager'));

CREATE POLICY "Update own or manager - companies" ON public.companies
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'sales_manager'))
  WITH CHECK (created_by = auth.uid() OR public.has_role(auth.uid(), 'sales_manager'));

CREATE POLICY "Delete own or manager - companies" ON public.companies
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'sales_manager'));

-- CONTACTS: scope to creator or manager
DROP POLICY IF EXISTS "Team can read contacts" ON public.contacts;
DROP POLICY IF EXISTS "Team can insert contacts" ON public.contacts;
DROP POLICY IF EXISTS "Team can update contacts" ON public.contacts;
DROP POLICY IF EXISTS "Team can delete contacts" ON public.contacts;

CREATE POLICY "Read own or manager - contacts" ON public.contacts
  FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'sales_manager'));

CREATE POLICY "Insert own - contacts" ON public.contacts
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() OR public.has_role(auth.uid(), 'sales_manager'));

CREATE POLICY "Update own or manager - contacts" ON public.contacts
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'sales_manager'))
  WITH CHECK (created_by = auth.uid() OR public.has_role(auth.uid(), 'sales_manager'));

CREATE POLICY "Delete own or manager - contacts" ON public.contacts
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'sales_manager'));

-- PROFILES: restrict SELECT to self or manager
DROP POLICY IF EXISTS "Team members can view profiles" ON public.profiles;
CREATE POLICY "View own profile or manager" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'sales_manager'));

-- USER_ROLES: restrict SELECT to self or manager
DROP POLICY IF EXISTS "Team members can view roles" ON public.user_roles;
CREATE POLICY "View own role or manager" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'sales_manager'));

-- Lock down SECURITY DEFINER functions: revoke public/anon EXECUTE.
-- has_role is used by RLS policies so authenticated must retain EXECUTE.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- handle_new_user and set_updated_at are trigger-only; revoke all direct execution.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Backfill created_by on any existing rows to owning deal creator where possible (safety net)
UPDATE public.companies SET created_by = auth.uid() WHERE FALSE; -- no-op guard
