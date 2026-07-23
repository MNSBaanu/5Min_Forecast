import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Building2, CalendarDays, User, Send } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrentUser } from "@/hooks/use-current-user";
import { cn } from "@/lib/utils";

type StageId =
  | "lead"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

type Note = {
  id: string;
  author: string;
  createdAt: string; // ISO
  body: string;
};

type Deal = {
  id: string;
  company: string;
  contact: string;
  value: number;
  closeDate: string; // ISO
  owner: string;
  stage: StageId;
  lossReason?: string;
  notes?: Note[];
};

const STAGES: { id: StageId; label: string; accent: string }[] = [
  { id: "lead", label: "Lead", accent: "bg-slate-500" },
  { id: "qualified", label: "Qualified", accent: "bg-blue-500" },
  { id: "proposal", label: "Proposal", accent: "bg-indigo-500" },
  { id: "negotiation", label: "Negotiation", accent: "bg-amber-500" },
  { id: "closed_won", label: "Closed Won", accent: "bg-emerald-500" },
  { id: "closed_lost", label: "Closed Lost", accent: "bg-rose-500" },
];

const INITIAL_DEALS: Deal[] = [
  { id: "d1", company: "Acme Corp", contact: "Jane Cooper", value: 12000, closeDate: "2026-08-15", owner: "Alex Morgan", stage: "lead" },
  { id: "d2", company: "Globex", contact: "Wade Warren", value: 45000, closeDate: "2026-08-22", owner: "Priya Shah", stage: "lead" },
  { id: "d3", company: "Initech", contact: "Esther Howard", value: 8000, closeDate: "2026-08-05", owner: "Alex Morgan", stage: "qualified" },
  { id: "d4", company: "Umbrella", contact: "Cameron W.", value: 32000, closeDate: "2026-09-01", owner: "Diego Ruiz", stage: "qualified" },
  { id: "d5", company: "Stark Industries", contact: "Robert D.", value: 92000, closeDate: "2026-08-30", owner: "Priya Shah", stage: "proposal" },
  { id: "d6", company: "Wayne Enterprises", contact: "Bruce W.", value: 128000, closeDate: "2026-09-10", owner: "Alex Morgan", stage: "negotiation" },
  { id: "d7", company: "Hooli", contact: "Gavin B.", value: 54000, closeDate: "2026-07-30", owner: "Diego Ruiz", stage: "closed_won" },
  { id: "d8", company: "Pied Piper", contact: "Richard H.", value: 15000, closeDate: "2026-07-18", owner: "Priya Shah", stage: "closed_lost", lossReason: "Chose competitor" },
];

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

const OWNERS = ["Alex Morgan", "Priya Shah", "Diego Ruiz", "Sam Chen"];

export function PipelineBoard() {
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingLoss, setPendingLoss] = useState<{ dealId: string } | null>(null);
  const [lossReason, setLossReason] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const dealsByStage = useMemo(() => {
    const map: Record<StageId, Deal[]> = {
      lead: [], qualified: [], proposal: [], negotiation: [], closed_won: [], closed_lost: [],
    };
    for (const d of deals) map[d.stage].push(d);
    return map;
  }, [deals]);

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) ?? null : null;
  const selectedDeal = selectedId ? deals.find((d) => d.id === selectedId) ?? null : null;

  function updateDeal(id: string, patch: Partial<Deal>) {
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  function addNote(id: string, note: Note) {
    setDeals((prev) =>
      prev.map((d) => (d.id === id ? { ...d, notes: [note, ...(d.notes ?? [])] } : d)),
    );
  }

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {STAGES.map((stage) => (
          <div key={stage.id} className="min-h-[420px] rounded-lg border bg-card/40 p-3" />
        ))}
      </div>
    );
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const dealId = String(active.id);
    const targetStage = String(over.id) as StageId;
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === targetStage) return;

    if (targetStage === "closed_lost") {
      setLossReason("");
      setPendingLoss({ dealId });
      return;
    }
    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage: targetStage, lossReason: undefined } : d)));
  }

  function confirmLoss() {
    if (!pendingLoss) return;
    const reason = lossReason.trim();
    if (!reason) return;
    setDeals((prev) =>
      prev.map((d) => (d.id === pendingLoss.dealId ? { ...d, stage: "closed_lost", lossReason: reason } : d)),
    );
    setPendingLoss(null);
    setLossReason("");
  }

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {STAGES.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              deals={dealsByStage[stage.id]}
            />
          ))}
        </div>
        <DragOverlay>
          {activeDeal ? <DealCard deal={activeDeal} dragging /> : null}
        </DragOverlay>
      </DndContext>

      <Dialog
        open={pendingLoss !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingLoss(null);
            setLossReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Why was this deal lost?</DialogTitle>
            <DialogDescription>
              Add a short reason before moving the deal to Closed Lost. This helps the team learn from lost deals.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="loss-reason">Loss reason</Label>
            <Textarea
              id="loss-reason"
              value={lossReason}
              onChange={(e) => setLossReason(e.target.value)}
              placeholder="e.g. Chose a competitor, budget cut, timing"
              rows={3}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPendingLoss(null);
                setLossReason("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={confirmLoss} disabled={lossReason.trim().length === 0}>
              Mark as lost
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DealPanel
        deal={selectedDeal}
        open={selectedDeal !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        onUpdate={updateDeal}
        onAddNote={addNote}
      />
    </>
  );

  function renderColumns() {
    return null;
  }
}

function StageColumn({
  stage,
  deals,
}: {
  stage: { id: StageId; label: string; accent: string };
  deals: Deal[];
}) {
  const { isOver, setNodeRef } = useDroppable({ id: stage.id });
  const total = deals.reduce((sum, d) => sum + d.value, 0);
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[420px] flex-col gap-3 rounded-lg border bg-card/40 p-3 transition-colors",
        isOver && "border-primary bg-primary/5",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", stage.accent)} />
          <h3 className="text-sm font-semibold text-foreground">{stage.label}</h3>
          <Badge variant="secondary" className="h-5 px-1.5 text-xs">
            {deals.length}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">{currency.format(total)}</span>
      </div>
      <div className="flex flex-col gap-2">
        {deals.map((deal) => (
          <DraggableDeal key={deal.id} deal={deal} />
        ))}
        {deals.length === 0 && (
          <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
            Drop deals here
          </div>
        )}
      </div>
    </div>
  );
}

function DraggableDeal({ deal }: { deal: Deal }) {
  return <DraggableDealInner deal={deal} />;
}

function DealCard({ deal, dragging = false }: { deal: Deal; dragging?: boolean }) {
  return (
    <div
      className={cn(
        "cursor-grab select-none rounded-md border bg-card p-3 shadow-sm transition-shadow hover:shadow",
        dragging && "cursor-grabbing shadow-lg ring-1 ring-primary",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
          {deal.company}
        </div>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {currency.format(deal.value)}
        </span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{deal.contact}</div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3 w-3" />
          {dateFmt.format(new Date(deal.closeDate))}
        </span>
        <span className="inline-flex items-center gap-1">
          <User className="h-3 w-3" />
          {deal.owner}
        </span>
      </div>
      {deal.lossReason && (
        <div className="mt-2 rounded bg-rose-500/10 px-2 py-1 text-[11px] text-rose-700 dark:text-rose-300">
          Lost: {deal.lossReason}
        </div>
      )}
    </div>
  );
}