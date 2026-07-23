
-- 1. app_role enum
CREATE TYPE public.app_role AS ENUM ('sales_rep', 'sales_manager');

-- 2. profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. user_roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view roles"
  ON public.user_roles FOR SELECT TO authenticated USING (true);

-- 4. has_role helper (SECURITY DEFINER to avoid recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 5. Auto-create profile + default sales_rep role for new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'sales_rep')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill for existing auth users
INSERT INTO public.profiles (id, full_name, email)
SELECT u.id,
       COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
       u.email
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'sales_rep'::public.app_role
FROM auth.users u
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Update deals RLS
DROP POLICY IF EXISTS "Team can read deals" ON public.deals;
DROP POLICY IF EXISTS "Team can insert deals" ON public.deals;
DROP POLICY IF EXISTS "Team can update deals" ON public.deals;
DROP POLICY IF EXISTS "Team can delete deals" ON public.deals;

CREATE POLICY "Reps see own, managers see all — deals"
  ON public.deals FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid() OR public.has_role(auth.uid(), 'sales_manager'));

CREATE POLICY "Reps insert own, managers insert any — deals"
  ON public.deals FOR INSERT TO authenticated
  WITH CHECK (owner_user_id = auth.uid() OR public.has_role(auth.uid(), 'sales_manager'));

CREATE POLICY "Reps update own, managers update any — deals"
  ON public.deals FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid() OR public.has_role(auth.uid(), 'sales_manager'))
  WITH CHECK (owner_user_id = auth.uid() OR public.has_role(auth.uid(), 'sales_manager'));

CREATE POLICY "Reps delete own, managers delete any — deals"
  ON public.deals FOR DELETE TO authenticated
  USING (owner_user_id = auth.uid() OR public.has_role(auth.uid(), 'sales_manager'));

-- 7. Update deal_notes RLS (based on parent deal ownership)
DROP POLICY IF EXISTS "Team can read deal_notes" ON public.deal_notes;
DROP POLICY IF EXISTS "Team can insert deal_notes" ON public.deal_notes;
DROP POLICY IF EXISTS "Team can update deal_notes" ON public.deal_notes;
DROP POLICY IF EXISTS "Team can delete deal_notes" ON public.deal_notes;

CREATE POLICY "Read notes on accessible deals"
  ON public.deal_notes FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.deals d
      WHERE d.id = deal_notes.deal_id
        AND (d.owner_user_id = auth.uid() OR public.has_role(auth.uid(), 'sales_manager'))
    )
  );

CREATE POLICY "Insert notes on accessible deals"
  ON public.deal_notes FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.deals d
      WHERE d.id = deal_notes.deal_id
        AND (d.owner_user_id = auth.uid() OR public.has_role(auth.uid(), 'sales_manager'))
    )
  );

CREATE POLICY "Update own notes or manager"
  ON public.deal_notes FOR UPDATE TO authenticated
  USING (author_user_id = auth.uid() OR public.has_role(auth.uid(), 'sales_manager'))
  WITH CHECK (author_user_id = auth.uid() OR public.has_role(auth.uid(), 'sales_manager'));

CREATE POLICY "Delete own notes or manager"
  ON public.deal_notes FOR DELETE TO authenticated
  USING (author_user_id = auth.uid() OR public.has_role(auth.uid(), 'sales_manager'));

-- 8. pipeline_stages: managers can update probabilities
CREATE POLICY "Managers update pipeline stages"
  ON public.pipeline_stages FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'sales_manager'))
  WITH CHECK (public.has_role(auth.uid(), 'sales_manager'));
