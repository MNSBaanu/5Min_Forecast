import { useMutation } from "@tanstack/react-query";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  generatePipelineSummary,
  type PipelineSummaryPayload,
  type DealSummaryInput,
} from "@/lib/ai-summary.functions";
import { STAGE_LABEL, type Deal } from "@/hooks/use-deals";

const OPEN_STAGES = new Set(["lead", "qualified", "proposal", "negotiation"]);
const STALE_DAYS = 14;

function buildPayload(
  deals: Deal[],
  totals: PipelineSummaryPayload["totals"],
  monthLabel: string,
): PipelineSummaryPayload {
  const now = Date.now();
  const dayMs = 86_400_000;
  const compact: DealSummaryInput[] = deals.map((d) => {
    const updatedAtMs = new Date(d.updatedAt).getTime();
    const closeMs = new Date(d.closeDate).getTime();
    const notes = [...d.notes]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .map((n) => ({
        author: n.author,
        body: n.body,
        daysAgo: Math.max(0, Math.floor((now - new Date(n.createdAt).getTime()) / dayMs)),
      }));
    return {
      id: d.id,
      company: d.company,
      contact: d.contact ?? null,
      owner: d.owner,
      stage: STAGE_LABEL[d.stage],
      value: d.value,
      closeDate: d.closeDate.slice(0, 10),
      updatedAt: d.updatedAt,
      daysSinceUpdate: Math.max(0, Math.floor((now - updatedAtMs) / dayMs)),
      daysUntilClose: Math.ceil((closeMs - now) / dayMs),
      overdue: closeMs < now && OPEN_STAGES.has(d.stage),
      recentNotes: notes,
    };
  });
  // Cap the payload to keep the prompt small
  return { monthLabel, totals, deals: compact.slice(0, 40) };
}

function computeTotals(deals: Deal[], probabilities: Record<string, number>) {
  const now = Date.now();
  const cutoff = now - STALE_DAYS * 86_400_000;
  let openPipeline = 0;
  let weightedForecast = 0;
  let openDealCount = 0;
  let overdueCount = 0;
  let staleCount = 0;
  for (const d of deals) {
    const p = probabilities[d.stage] ?? 0;
    weightedForecast += (d.value * p) / 100;
    if (OPEN_STAGES.has(d.stage)) {
      openPipeline += d.value;
      openDealCount += 1;
      if (new Date(d.closeDate).getTime() < now) overdueCount += 1;
      if (new Date(d.updatedAt).getTime() < cutoff) staleCount += 1;
    }
  }
  return { openPipeline, weightedForecast, openDealCount, overdueCount, staleCount };
}

function renderMarkdown(md: string) {
  const lines = md.split(/\r?\n/);
  const out: React.ReactNode[] = [];
  let listBuf: string[] = [];
  const flushList = (key: string) => {
    if (!listBuf.length) return;
    out.push(
      <ul key={`ul-${key}`} className="ml-5 list-disc space-y-1 text-sm text-foreground/90">
        {listBuf.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    listBuf = [];
  };
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line) {
      flushList(`b-${i}`);
      return;
    }
    const bulletMatch = line.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      listBuf.push(bulletMatch[1]);
      return;
    }
    flushList(`p-${i}`);
    // Heading: **Title** or **Title** — desc
    const heading = line.match(/^\*\*(.+?)\*\*\s*(?:[—:-]\s*(.*))?$/);
    if (heading) {
      out.push(
        <h4 key={i} className="mt-3 text-sm font-semibold text-foreground first:mt-0">
          {heading[1]}
          {heading[2] ? <span className="ml-2 font-normal text-muted-foreground">{heading[2]}</span> : null}
        </h4>,
      );
      return;
    }
    out.push(
      <p key={i} className="text-sm text-foreground/90">
        {renderInline(line)}
      </p>,
    );
  });
  flushList("end");
  return out;
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold text-foreground">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export function PipelineAiSummary({
  deals,
  probabilities,
  monthLabel,
}: {
  deals: Deal[];
  probabilities: Record<string, number>;
  monthLabel: string;
}) {
  const totals = useMemo(() => computeTotals(deals, probabilities), [deals, probabilities]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload(deals, totals, monthLabel);
      return generatePipelineSummary({ data: payload });
    },
  });

  const result = mutation.data;
  const errorMsg =
    mutation.error instanceof Response
      ? undefined // Response bodies aren't easily read here; show generic
      : mutation.error instanceof Error
        ? mutation.error.message
        : undefined;

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            AI pipeline summary
          </CardTitle>
          <CardDescription>
            Manager view — highlights risks, stale deals, and themes from recent notes for {monthLabel}.
          </CardDescription>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          <RefreshCw className={mutation.isPending ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
          {mutation.isPending ? "Analyzing…" : result ? "Refresh" : "Generate summary"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {!result && !mutation.isPending && !mutation.isError && (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            Click <span className="font-medium text-foreground">Generate summary</span> to have AI analyze
            {" "}
            <span className="font-medium text-foreground">{totals.openDealCount}</span> open deals — including
            {" "}
            <span className="font-medium text-foreground">{totals.overdueCount}</span> overdue and
            {" "}
            <span className="font-medium text-foreground">{totals.staleCount}</span> stale — and surface the biggest risks.
          </div>
        )}
        {mutation.isPending && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        )}
        {mutation.isError && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <div>
              <div className="font-medium">Couldn't generate the summary.</div>
              <div className="text-xs opacity-80">{errorMsg ?? "Please try refreshing in a moment."}</div>
            </div>
          </div>
        )}
        {result && (
          <div className="space-y-2">
            <div className="prose prose-sm max-w-none">{renderMarkdown(result.text)}</div>
            <p className="text-xs text-muted-foreground">
              Generated {new Date(result.generatedAt).toLocaleTimeString()} · based on {totals.openDealCount} open deals
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}