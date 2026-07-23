import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type Company = {
  id: string;
  name: string;
  industry: string;
  website: string;
};

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyId: string | null;
  company: string; // resolved company name for display
};

type Ctx = {
  contacts: Contact[];
  companies: Company[];
  loading: boolean;
  addContact: (input: { name: string; email: string; phone: string; companyName: string }) => Promise<Contact | null>;
  addCompany: (input: { name: string; industry: string; website: string }) => Promise<Company | null>;
};

const ContactsContext = createContext<Ctx | null>(null);

type CompanyRow = { id: string; name: string; industry: string | null; website: string | null };
type ContactRow = { id: string; name: string; email: string | null; phone: string | null; company_id: string | null };

function mapCompany(r: CompanyRow): Company {
  return { id: r.id, name: r.name, industry: r.industry ?? "", website: r.website ?? "" };
}

export function ContactsProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [companiesRes, contactsRes] = await Promise.all([
      supabase.from("companies").select("*").order("name"),
      supabase.from("contacts").select("*").order("name"),
    ]);
    if (companiesRes.error || contactsRes.error) {
      setCompanies([]);
      setContacts([]);
      setLoading(false);
      return;
    }
    const cos = (companiesRes.data ?? []).map(mapCompany);
    const byId = new Map(cos.map((c) => [c.id, c.name]));
    setCompanies(cos);
    setContacts(
      ((contactsRes.data ?? []) as ContactRow[]).map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email ?? "",
        phone: r.phone ?? "",
        companyId: r.company_id,
        company: r.company_id ? byId.get(r.company_id) ?? "" : "",
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") void load();
    });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  const addCompany = useCallback<Ctx["addCompany"]>(async ({ name, industry, website }) => {
    const { data, error } = await supabase
      .from("companies")
      .insert({ name, industry: industry || null, website: website || null })
      .select("*")
      .single();
    if (error || !data) {
      toast.error("Failed to add company", { description: error?.message });
      return null;
    }
    const co = mapCompany(data as CompanyRow);
    setCompanies((prev) => [...prev, co].sort((a, b) => a.name.localeCompare(b.name)));
    return co;
  }, []);

  const addContact = useCallback<Ctx["addContact"]>(async ({ name, email, phone, companyName }) => {
    const co = companies.find((c) => c.name === companyName);
    const { data, error } = await supabase
      .from("contacts")
      .insert({
        name,
        email: email || null,
        phone: phone || null,
        company_id: co?.id ?? null,
      })
      .select("*")
      .single();
    if (error || !data) {
      toast.error("Failed to add contact", { description: error?.message });
      return null;
    }
    const row = data as ContactRow;
    const c: Contact = {
      id: row.id,
      name: row.name,
      email: row.email ?? "",
      phone: row.phone ?? "",
      companyId: row.company_id,
      company: co?.name ?? "",
    };
    setContacts((prev) => [...prev, c].sort((a, b) => a.name.localeCompare(b.name)));
    return c;
  }, [companies]);

  const value = useMemo(
    () => ({ contacts, companies, loading, addContact, addCompany }),
    [contacts, companies, loading, addContact, addCompany],
  );
  return <ContactsContext.Provider value={value}>{children}</ContactsContext.Provider>;
}

export function useContacts() {
  const ctx = useContext(ContactsContext);
  if (!ctx) throw new Error("useContacts must be used within ContactsProvider");
  return ctx;
}