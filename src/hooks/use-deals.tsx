import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type StageId =
  | "lead"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

export type Note = {
  id: string;
  author: string;
  createdAt: string;
  body: string;
};

export type Deal = {
  id: string;
  company: string;
  contact: string;
  value: number;
  closeDate: string;
  owner: string;
  stage: StageId;
  lossReason?: string;
  notes?: Note[];
  updatedAt: string;
};

export type Activity = {
  id: string;
  dealId: string;
  company: string;
  author: string;
  createdAt: string;
  kind: "note" | "update" | "stage" | "created";
  summary: string;
};

export const STAGE_META: { id: StageId; label: string; accent: string }[] = [
  { id: "lead", label: "Lead", accent: "bg-slate-500" },
  { id: "qualified", label: "Qualified", accent: "bg-blue-500" },
  { id: "proposal", label: "Proposal", accent: "bg-indigo-500" },
  { id: "negotiation", label: "Negotiation", accent: "bg-amber-500" },
  { id: "closed_won", label: "Closed Won", accent: "bg-emerald-500" },
  { id: "closed_lost", label: "Closed Lost", accent: "bg-rose-500" },
];

export const STAGE_LABEL: Record<StageId, string> = Object.fromEntries(
  STAGE_META.map((s) => [s.id, s.label]),
) as Record<StageId, string>;

export const OWNERS = ["Alex Morgan", "Priya Shah", "Diego Ruiz", "Sam Chen"];

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

type Ctx = {
  deals: Deal[];
  activity: Activity[];
  loading: boolean;
  updateDeal: (id: string, patch: Partial<Deal>, meta?: { author?: string }) => void;
  addNote: (id: string, note: Note) => void;
};

const DealsContext = createContext<Ctx | null>(null);

type DealRow = {
  id: string;
  company_name: string;
  contact_name: string | null;
  value: number | string;
  stage_id: string;
  expected_close_date: string | null;
  owner: string;
  loss_reason: string | null;
  updated_at: string;
};
type NoteRow = {
  id: string;
  deal_id: string;
  author_name: string;
  body: string;
  created_at: string;
};

function mapDealRow(row: DealRow, notes: Note[] = []): Deal {
  return {
    id: row.id,
    company: row.company_name,
    contact: row.contact_name ?? "",
    value: Number(row.value) || 0,
    closeDate: row.expected_close_date ?? "",
    owner: row.owner,
    stage: row.stage_id as StageId,
    lossReason: row.loss_reason ?? undefined,
    updatedAt: row.updated_at,
    notes,
  };
}

type DealUpdate = Database["public"]["Tables"]["deals"]["Update"];

function patchToDbUpdate(patch: Partial<Deal>): DealUpdate {
  const u: DealUpdate = {};
  if (patch.company !== undefined) u.company_name = patch.company;
  if (patch.contact !== undefined) u.contact_name = patch.contact;
  if (patch.value !== undefined) u.value = patch.value;
  if (patch.closeDate !== undefined) u.expected_close_date = patch.closeDate || null;
  if (patch.owner !== undefined) u.owner = patch.owner;
  if (patch.stage !== undefined) u.stage_id = patch.stage;
  if (patch.lossReason !== undefined) u.loss_reason = patch.lossReason ?? null;
  return u;
}

export function DealsProvider({ children }: { children: ReactNode }) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [dealsRes, notesRes] = await Promise.all([
      supabase.from("deals").select("*").order("updated_at", { ascending: false }),
      supabase.from("deal_notes").select("*").order("created_at", { ascending: false }),
    ]);
    if (dealsRes.error) {
      // Unauthenticated / no access — quietly show an empty board.
      setDeals([]);
      setLoading(false);
      return;
    }
    const notesByDeal = new Map<string, Note[]>();
    for (const n of (notesRes.data ?? []) as NoteRow[]) {
      const list = notesByDeal.get(n.deal_id) ?? [];
      list.push({ id: n.id, author: n.author_name, body: n.body, createdAt: n.created_at });
      notesByDeal.set(n.deal_id, list);
    }
    setDeals(((dealsRes.data ?? []) as DealRow[]).map((r) => mapDealRow(r, notesByDeal.get(r.id) ?? [])));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") void load();
    });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  const updateDeal = useCallback(
    (id: string, patch: Partial<Deal>, meta?: { author?: string }) => {
      setDeals((prev) => {
        const next = prev.map((d) =>
          d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d,
        );
        const before = prev.find((d) => d.id === id);
        const after = next.find((d) => d.id === id);
        if (before && after) {
          const entries: Activity[] = [];
          const author = meta?.author ?? after.owner;
          if (patch.stage && patch.stage !== before.stage) {
            const suffix =
              patch.stage === "closed_lost" && after.lossReason ? ` — ${after.lossReason}` : "";
            entries.push({
              id: uid("a"),
              dealId: id,
              company: after.company,
              author,
              createdAt: new Date().toISOString(),
              kind: "stage",
              summary: `Moved to ${STAGE_LABEL[patch.stage]}${suffix}`,
            });
          }
          const fieldChanges: string[] = [];
          if (patch.value !== undefined && patch.value !== before.value) fieldChanges.push("value");
          if (patch.closeDate && patch.closeDate !== before.closeDate) fieldChanges.push("close date");
          if (patch.owner && patch.owner !== before.owner) fieldChanges.push("owner");
          if (patch.contact && patch.contact !== before.contact) fieldChanges.push("contact");
          if (patch.company && patch.company !== before.company) fieldChanges.push("company");
          if (fieldChanges.length) {
            entries.push({
              id: uid("a"),
              dealId: id,
              company: after.company,
              author,
              createdAt: new Date().toISOString(),
              kind: "update",
              summary: `Updated ${fieldChanges.join(", ")}`,
            });
          }
          if (entries.length) setActivity((prevA) => [...entries, ...prevA]);
        }
        return next;
      });
      void (async () => {
        const update = patchToDbUpdate(patch);
        if (Object.keys(update).length === 0) return;
        const { error } = await supabase.from("deals").update(update).eq("id", id);
        if (error) {
          toast.error("Failed to save deal", { description: error.message });
          void load();
        }
      })();
    },
    [load],
  );

  const addNote = useCallback(
    (id: string, note: Note) => {
      setDeals((prev) =>
        prev.map((d) =>
          d.id === id
            ? { ...d, notes: [note, ...(d.notes ?? [])], updatedAt: note.createdAt }
            : d,
        ),
      );
      setActivity((prev) => {
        const deal = deals.find((d) => d.id === id);
        return [
          {
            id: uid("a"),
            dealId: id,
            company: deal?.company ?? "",
            author: note.author,
            createdAt: note.createdAt,
            kind: "note",
            summary: note.body,
          },
          ...prev,
        ];
      });
      void (async () => {
        const { data: userRes } = await supabase.auth.getUser();
        const { error } = await supabase.from("deal_notes").insert({
          deal_id: id,
          author_name: note.author,
          body: note.body,
          author_user_id: userRes.user?.id ?? null,
        });
        if (error) {
          toast.error("Failed to save note", { description: error.message });
          void load();
        }
      })();
    },
    [deals, load],
  );

  const value = useMemo(
    () => ({ deals, activity, loading, updateDeal, addNote }),
    [deals, activity, loading, updateDeal, addNote],
  );
  return <DealsContext.Provider value={value}>{children}</DealsContext.Provider>;
}

export function useDeals() {
  const ctx = useContext(DealsContext);
  if (!ctx) throw new Error("useDeals must be used within DealsProvider");
  return ctx;
}

export const DEFAULT_STAGE_PROBABILITIES: Record<StageId, number> = {
  lead: 10,
  qualified: 30,
  proposal: 50,
  negotiation: 70,
  closed_won: 100,
  closed_lost: 0,
};

export function loadStageProbabilities(): Record<StageId, number> {
  if (typeof window === "undefined") return DEFAULT_STAGE_PROBABILITIES;
  try {
    const raw = window.localStorage.getItem("fmf.stage-probabilities");
    if (!raw) return DEFAULT_STAGE_PROBABILITIES;
    const parsed = JSON.parse(raw) as Partial<Record<StageId, number>>;
    return { ...DEFAULT_STAGE_PROBABILITIES, ...parsed };
  } catch {
    return DEFAULT_STAGE_PROBABILITIES;
  }
}