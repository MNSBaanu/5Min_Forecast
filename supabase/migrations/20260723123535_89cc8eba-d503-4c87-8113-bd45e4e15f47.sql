
-- Shared updated_at trigger fn
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- pipeline_stages
CREATE TABLE public.pipeline_stages (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  sort_order INT NOT NULL,
  default_probability INT NOT NULL CHECK (default_probability BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pipeline_stages TO authenticated;
GRANT ALL ON public.pipeline_stages TO service_role;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stages readable by authenticated" ON public.pipeline_stages FOR SELECT TO authenticated USING (true);
CREATE TRIGGER trg_pipeline_stages_updated_at BEFORE UPDATE ON public.pipeline_stages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.pipeline_stages (id, label, sort_order, default_probability) VALUES
  ('lead',        'Lead',        1, 10),
  ('qualified',   'Qualified',   2, 30),
  ('proposal',    'Proposal',    3, 50),
  ('negotiation', 'Negotiation', 4, 70),
  ('closed_won',  'Closed Won',  5, 100),
  ('closed_lost', 'Closed Lost', 6, 0);

-- companies
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team can read companies" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team can insert companies" ON public.companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team can update companies" ON public.companies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Team can delete companies" ON public.companies FOR DELETE TO authenticated USING (true);
CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- contacts
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts TO authenticated;
GRANT ALL ON public.contacts TO service_role;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team can read contacts" ON public.contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team can insert contacts" ON public.contacts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team can update contacts" ON public.contacts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Team can delete contacts" ON public.contacts FOR DELETE TO authenticated USING (true);
CREATE TRIGGER trg_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- deals
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  value NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (value >= 0),
  stage_id TEXT NOT NULL REFERENCES public.pipeline_stages(id),
  expected_close_date DATE,
  owner TEXT NOT NULL,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  loss_reason TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_deals_stage ON public.deals(stage_id);
CREATE INDEX idx_deals_close_date ON public.deals(expected_close_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deals TO authenticated;
GRANT ALL ON public.deals TO service_role;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team can read deals" ON public.deals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team can insert deals" ON public.deals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team can update deals" ON public.deals FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Team can delete deals" ON public.deals FOR DELETE TO authenticated USING (true);
CREATE TRIGGER trg_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- deal_notes
CREATE TABLE public.deal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  author_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_deal_notes_deal ON public.deal_notes(deal_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deal_notes TO authenticated;
GRANT ALL ON public.deal_notes TO service_role;
ALTER TABLE public.deal_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team can read deal_notes" ON public.deal_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team can insert deal_notes" ON public.deal_notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team can update deal_notes" ON public.deal_notes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Team can delete deal_notes" ON public.deal_notes FOR DELETE TO authenticated USING (true);
