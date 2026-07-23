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
import { useDeals, STAGE_META, OWNERS, type Deal, type Note, type StageId } from "@/hooks/use-deals";
import { useContacts } from "@/hooks/use-contacts";
import { cn } from "@/lib/utils";

const STAGES = STAGE_META;

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

export function PipelineBoard() {
  const { deals, updateDeal, addNote } = useDeals();
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
    updateDeal(dealId, { stage: targetStage, lossReason: undefined });
  }

  function confirmLoss() {
    if (!pendingLoss) return;
    const reason = lossReason.trim();
    if (!reason) return;
    updateDeal(pendingLoss.dealId, { stage: "closed_lost", lossReason: reason });
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
              onOpen={setSelectedId}
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
}

function StageColumn({
  stage,
  deals,
  onOpen,
}: {
  stage: { id: StageId; label: string; accent: string };
  deals: Deal[];
  onOpen: (id: string) => void;
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
          <DraggableDeal key={deal.id} deal={deal} onOpen={onOpen} />
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

function DraggableDeal({ deal, onOpen }: { deal: Deal; onOpen: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: deal.id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onOpen(deal.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(deal.id);
        }
      }}
      className={cn("touch-none focus:outline-none", isDragging && "opacity-40")}
    >
      <DealCard deal={deal} />
    </div>
  );
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

function DealPanel({
  deal,
  open,
  onOpenChange,
  onUpdate,
  onAddNote,
}: {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, patch: Partial<Deal>) => void;
  onAddNote: (id: string, note: Note) => void;
}) {
  const { name } = useCurrentUser();
  const { contacts, companies } = useContacts();
  const [noteDraft, setNoteDraft] = useState("");

  useEffect(() => {
    setNoteDraft("");
  }, [deal?.id]);

  if (!deal) return null;

  const notes = deal.notes ?? [];

  function post() {
    if (!deal) return;
    const body = noteDraft.trim();
    if (!body) return;
    onAddNote(deal.id, {
      id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      author: name,
      createdAt: new Date().toISOString(),
      body,
    });
    setNoteDraft("");
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            {deal.company}
          </SheetTitle>
          <SheetDescription>Edit deal details and post updates to the timeline.</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="grid gap-5 px-6 py-5">
            <div className="grid gap-2">
              <Label htmlFor="deal-company">Company</Label>
              <Select
                value={deal.company || undefined}
                onValueChange={(v) => onUpdate(deal.id, { company: v })}
              >
                <SelectTrigger id="deal-company">
                  <SelectValue placeholder="Link a company" />
                </SelectTrigger>
                <SelectContent>
                  {deal.company && !companies.some((c) => c.name === deal.company) && (
                    <SelectItem value={deal.company}>{deal.company}</SelectItem>
                  )}
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deal-contact">Contact</Label>
              <Select
                value={deal.contact || undefined}
                onValueChange={(v) => {
                  const c = contacts.find((x) => x.name === v);
                  const patch: Partial<Deal> = { contact: v };
                  if (c && c.company) patch.company = c.company;
                  onUpdate(deal.id, patch);
                }}
              >
                <SelectTrigger id="deal-contact">
                  <SelectValue placeholder="Link a contact" />
                </SelectTrigger>
                <SelectContent>
                  {deal.contact && !contacts.some((c) => c.name === deal.contact) && (
                    <SelectItem value={deal.contact}>{deal.contact}</SelectItem>
                  )}
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                      {c.company ? ` · ${c.company}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="deal-value">Value (USD)</Label>
                <Input
                  id="deal-value"
                  type="number"
                  min={0}
                  value={deal.value}
                  onChange={(e) => onUpdate(deal.id, { value: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deal-date">Expected close</Label>
                <Input
                  id="deal-date"
                  type="date"
                  value={deal.closeDate}
                  onChange={(e) => onUpdate(deal.id, { closeDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Stage</Label>
                <Select
                  value={deal.stage}
                  onValueChange={(v) => onUpdate(deal.id, { stage: v as StageId })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Owner</Label>
                <Select value={deal.owner} onValueChange={(v) => onUpdate(deal.id, { owner: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OWNERS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {deal.stage === "closed_lost" && deal.lossReason && (
              <div className="rounded-md bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
                Loss reason: {deal.lossReason}
              </div>
            )}

            <div className="border-t pt-5">
              <h4 className="text-sm font-semibold text-foreground">Notes</h4>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Post quick updates. Newest first.
              </p>
              <div className="mt-3 grid gap-2">
                <Textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Add an update..."
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button size="sm" onClick={post} disabled={noteDraft.trim().length === 0}>
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    Post
                  </Button>
                </div>
              </div>

              <ol className="mt-4 flex flex-col gap-3">
                {notes.length === 0 && (
                  <li className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
                    No notes yet.
                  </li>
                )}
                {notes.map((n) => (
                  <li key={n.id} className="rounded-md border bg-card p-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{n.author}</span>
                      <span>{dateTimeFmt.format(new Date(n.createdAt))}</span>
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground">{n.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}