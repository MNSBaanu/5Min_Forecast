import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

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

// Anchor "now" to a fixed reference so seeded stale ages remain meaningful in demo.
const NOW = Date.now();
const daysAgo = (n: number) => new Date(NOW - n * 86_400_000).toISOString();

const INITIAL_DEALS: Deal[] = [
  { id: "d1", company: "Acme Corp", contact: "Jane Cooper", value: 12000, closeDate: "2026-08-15", owner: "Alex Morgan", stage: "lead", updatedAt: daysAgo(2) },
  { id: "d2", company: "Globex", contact: "Wade Warren", value: 45000, closeDate: "2026-08-22", owner: "Priya Shah", stage: "lead", updatedAt: daysAgo(21) },
  { id: "d3", company: "Initech", contact: "Esther Howard", value: 8000, closeDate: "2026-08-05", owner: "Alex Morgan", stage: "qualified", updatedAt: daysAgo(4) },
  { id: "d4", company: "Umbrella", contact: "Cameron W.", value: 32000, closeDate: "2026-09-01", owner: "Diego Ruiz", stage: "qualified", updatedAt: daysAgo(18) },
  { id: "d5", company: "Stark Industries", contact: "Robert D.", value: 92000, closeDate: "2026-08-30", owner: "Priya Shah", stage: "proposal", updatedAt: daysAgo(6) },
  { id: "d6", company: "Wayne Enterprises", contact: "Bruce W.", value: 128000, closeDate: "2026-09-10", owner: "Alex Morgan", stage: "negotiation", updatedAt: daysAgo(30) },
  { id: "d7", company: "Hooli", contact: "Gavin B.", value: 54000, closeDate: "2026-07-30", owner: "Diego Ruiz", stage: "closed_won", updatedAt: daysAgo(1) },
  { id: "d8", company: "Pied Piper", contact: "Richard H.", value: 15000, closeDate: "2026-07-18", owner: "Priya Shah", stage: "closed_lost", lossReason: "Chose competitor", updatedAt: daysAgo(9) },
];

const INITIAL_ACTIVITY: Activity[] = [
  { id: "a1", dealId: "d7", company: "Hooli", author: "Diego Ruiz", createdAt: daysAgo(1), kind: "stage", summary: "Moved to Closed Won" },
  { id: "a2", dealId: "d1", company: "Acme Corp", author: "Alex Morgan", createdAt: daysAgo(2), kind: "note", summary: "Sent revised proposal for legal review" },
  { id: "a3", dealId: "d3", company: "Initech", author: "Alex Morgan", createdAt: daysAgo(4), kind: "update", summary: "Updated value to $8,000" },
  { id: "a4", dealId: "d5", company: "Stark Industries", author: "Priya Shah", createdAt: daysAgo(6), kind: "note", summary: "Kickoff call scheduled for next week" },
  { id: "a5", dealId: "d8", company: "Pied Piper", author: "Priya Shah", createdAt: daysAgo(9), kind: "stage", summary: "Moved to Closed Lost — Chose competitor" },
];

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

type Ctx = {
  deals: Deal[];
  activity: Activity[];
  updateDeal: (id: string, patch: Partial<Deal>, meta?: { author?: string }) => void;
  addNote: (id: string, note: Note) => void;
};

const DealsContext = createContext<Ctx | null>(null);

export function DealsProvider({ children }: { children: ReactNode }) {
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [activity, setActivity] = useState<Activity[]>(INITIAL_ACTIVITY);

  const updateDeal = useCallback((id: string, patch: Partial<Deal>, meta?: { author?: string }) => {
    setDeals((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d));
      const before = prev.find((d) => d.id === id);
      const after = next.find((d) => d.id === id);
      if (before && after) {
        const entries: Activity[] = [];
        const author = meta?.author ?? after.owner;
        if (patch.stage && patch.stage !== before.stage) {
          const suffix = patch.stage === "closed_lost" && after.lossReason ? ` — ${after.lossReason}` : "";
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
  }, []);

  const addNote = useCallback((id: string, note: Note) => {
    setDeals((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, notes: [note, ...(d.notes ?? [])], updatedAt: note.createdAt }
          : d,
      ),
    );
    const deal = deals.find((d) => d.id === id);
    setActivity((prev) => [
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
    ]);
  }, [deals]);

  const value = useMemo(() => ({ deals, activity, updateDeal, addNote }), [deals, activity, updateDeal, addNote]);
  return <DealsContext.Provider value={value}>{children}</DealsContext.Provider>;
}

export function useDeals() {
  const ctx = useContext(DealsContext);
  if (!ctx) throw new Error("useDeals must be used within DealsProvider");
  return ctx;
}

export const DEFAULT_STAGE_PROBABILITIES: Record<StageId, number> = {
  lead: 10,
  qualified: 25,
  proposal: 50,
  negotiation: 75,
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