import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Building2, CalendarDays, MessageSquare, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  loadStageProbabilities,
  useDeals,
  STAGE_META,
  STAGE_LABEL,
  OWNERS,
  type StageId,
  type Deal,
} from "@/hooks/use-deals";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Five Minute Forecast" },
      { name: "description", content: "Monthly forecast, win rates, and pipeline health for the sales team at a glance." },
      { property: "og:title", content: "Analytics — Five Minute Forecast" },
      { property: "og:description", content: "Monthly forecast, win rates, and pipeline health for the sales team at a glance." },
    ],
  }),
  component: AnalyticsPage,
});

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const monthFmt = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const monthKeyFmt = new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit" });

const OPEN_STAGES: StageId[] = ["lead", "qualified", "proposal", "negotiation"];
const STALE_DAYS = 14;

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function relative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) {
    const hours = Math.max(1, Math.floor(diff / 3_600_000));
    return `${hours}h ago`;
  }
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function AnalyticsPage() {
  const { deals, activity } = useDeals();
  const [probabilities, setProbabilities] = useState(() => loadStageProbabilities());
  useEffect(() => {
    const onStorage = () => setProbabilities(loadStageProbabilities());
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onStorage);
    };
  }, []);

  // Filters
  const currentMonth = useMemo(() => monthKey(new Date().toISOString()), []);
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>(currentMonth);

  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    for (const d of deals) set.add(monthKey(d.closeDate));
    set.add(currentMonth);
    return Array.from(set).sort();
  }, [deals, currentMonth]);

  const filtered = useMemo(() => {
    return deals.filter((d) => {
      if (ownerFilter !== "all" && d.owner !== ownerFilter) return false;
      if (stageFilter !== "all" && d.stage !== stageFilter) return false;
      if (monthFilter !== "all" && monthKey(d.closeDate) !== monthFilter) return false;
      return true;
    });
  }, [deals, ownerFilter, stageFilter, monthFilter]);

  const openDeals = useMemo(() => filtered.filter((d) => OPEN_STAGES.includes(d.stage)), [filtered]);

  const openPipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0);
  const weightedForecast = filtered.reduce((sum, d) => {
    const p = probabilities[d.stage] ?? 0;
    return sum + (d.value * p) / 100;
  }, 0);
  const wonValue = filtered.filter((d) => d.stage === "closed_won").reduce((s, d) => s + d.value, 0);

  const staleDeals = useMemo(() => {
    const cutoff = Date.now() - STALE_DAYS * 86_400_000;
    return filtered
      .filter((d) => OPEN_STAGES.includes(d.stage) && new Date(d.updatedAt).getTime() < cutoff)
      .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
  }, [filtered]);

  const filteredIds = useMemo(() => new Set(filtered.map((d) => d.id)), [filtered]);
  const recentActivity = useMemo(
    () => activity.filter((a) => filteredIds.has(a.dealId)).slice(0, 12),
    [activity, filteredIds],
  );

  const filtersActive = ownerFilter !== "all" || stageFilter !== "all" || monthFilter !== currentMonth;
  const monthLabel =
    monthFilter === "all"
      ? "all months"
      : monthFmt.format(new Date(`${monthFilter}-01T00:00:00Z`));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Forecast the month in under five minutes. Filter by rep, stage, and close month to
          zoom in on the pipeline.
        </p>
      </div>

      <section aria-labelledby="filters">
        <h2 id="filters" className="sr-only">Filters</h2>
        <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
          <FilterSelect
            label="Sales rep"
            value={ownerFilter}
            onChange={setOwnerFilter}
            options={[{ value: "all", label: "All reps" }, ...OWNERS.map((o) => ({ value: o, label: o }))]}
          />
          <FilterSelect
            label="Stage"
            value={stageFilter}
            onChange={setStageFilter}
            options={[
              { value: "all", label: "All stages" },
              ...STAGE_META.map((s) => ({ value: s.id, label: s.label })),
            ]}
          />
          <FilterSelect
            label="Close month"
            value={monthFilter}
            onChange={setMonthFilter}
            options={[
              { value: "all", label: "All months" },
              ...monthOptions.map((m) => ({
                value: m,
                label: monthKeyFmt.format(new Date(`${m}-01T00:00:00Z`)),
              })),
            ]}
          />
          {filtersActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setOwnerFilter("all");
                setStageFilter("all");
                setMonthFilter(currentMonth);
              }}
            >
              Reset
            </Button>
          )}
          <div className="ml-auto text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> deals for {monthLabel}
          </div>
        </div>
      </section>

      <section aria-labelledby="kpis">
        <h2 id="kpis" className="sr-only">Key metrics</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            icon={<Wallet className="h-4 w-4" />}
            label="Open pipeline"
            value={currency.format(openPipelineValue)}
            hint={`${openDeals.length} open deals closing ${monthLabel}`}
          />
          <MetricCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Weighted forecast"
            value={currency.format(Math.round(weightedForecast))}
            hint="Value × stage probability"
            accent
          />
          <MetricCard
            icon={<Building2 className="h-4 w-4" />}
            label="Closed won"
            value={currency.format(wonValue)}
            hint="Booked in the filtered range"
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <StaleDealsCard deals={staleDeals} />
        <ActivityFeedCard activity={recentActivity} />
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="grid gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <Card className={cn(accent && "border-primary/40 bg-primary/5")}>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-1.5 text-xs uppercase tracking-wide">
          {icon}
          {label}
        </CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums text-foreground">{value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-xs text-muted-foreground">{hint}</CardContent>
    </Card>
  );
}

function StaleDealsCard({ deals }: { deals: Deal[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Stale deals
        </CardTitle>
        <CardDescription>Open deals with no update in the last {STALE_DAYS} days.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {deals.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            Nothing stale — the team is on top of it.
          </p>
        ) : (
          <ul className="flex flex-col divide-y">
            {deals.map((d) => {
              const days = Math.max(1, Math.floor((Date.now() - new Date(d.updatedAt).getTime()) / 86_400_000));
              return (
                <li key={d.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">{d.company}</span>
                      <Badge variant="secondary" className="text-[10px]">{STAGE_LABEL[d.stage]}</Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{d.owner}</span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {dateFmt.format(new Date(d.closeDate))}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-nums text-foreground">
                      {currency.format(d.value)}
                    </div>
                    <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
                      {days}d idle
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityFeedCard({ activity }: { activity: ReturnType<typeof useDeals>["activity"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4 text-primary" />
          Recent activity
        </CardTitle>
        <CardDescription>Latest notes and deal updates from the team.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {activity.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            No activity in this view yet.
          </p>
        ) : (
          <ol className="flex flex-col gap-3">
            {activity.map((a) => (
              <li key={a.id} className="flex gap-3">
                <span
                  className={cn(
                    "mt-1 h-2 w-2 shrink-0 rounded-full",
                    a.kind === "note" && "bg-primary",
                    a.kind === "stage" && "bg-indigo-500",
                    a.kind === "update" && "bg-slate-400",
                    a.kind === "created" && "bg-emerald-500",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{a.author}</span>
                      {" · "}
                      <span>{a.company}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{relative(a.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-foreground">{a.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}