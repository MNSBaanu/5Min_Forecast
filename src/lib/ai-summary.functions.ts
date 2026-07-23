import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type DealSummaryInput = {
  id: string;
  company: string;
  contact: string | null;
  owner: string;
  stage: string;
  value: number;
  closeDate: string;
  updatedAt: string;
  daysSinceUpdate: number;
  daysUntilClose: number;
  overdue: boolean;
  recentNotes: { author: string; body: string; daysAgo: number }[];
};

export type PipelineSummaryPayload = {
  monthLabel: string;
  totals: {
    openPipeline: number;
    weightedForecast: number;
    openDealCount: number;
    overdueCount: number;
    staleCount: number;
  };
  deals: DealSummaryInput[];
};

export const generatePipelineSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: PipelineSummaryPayload) => data)
  .handler(async ({ data, context }) => {
    // Manager gate — validate role server-side using RLS-scoped supabase client
    const { data: roleRows } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const isManager = (roleRows ?? []).some((r) => r.role === "sales_manager");
    if (!isManager) {
      throw new Response("Managers only", { status: 403 });
    }

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Response("Missing LOVABLE_API_KEY", { status: 500 });

    const currency = (n: number) =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

    const dealLines = data.deals
      .map((d) => {
        const notes = d.recentNotes.length
          ? d.recentNotes
              .map((n) => `      • ${n.author} (${n.daysAgo}d ago): ${n.body.replace(/\s+/g, " ").slice(0, 240)}`)
              .join("\n")
          : "      • (no notes)";
        return [
          `- ${d.company}${d.contact ? ` / ${d.contact}` : ""}`,
          `    owner=${d.owner} stage=${d.stage} value=${currency(d.value)}`,
          `    close=${d.closeDate} (${d.overdue ? `OVERDUE by ${-d.daysUntilClose}d` : `in ${d.daysUntilClose}d`}), last update ${d.daysSinceUpdate}d ago`,
          notes,
        ].join("\n");
      })
      .join("\n");

    const userPrompt = [
      `Filtered view: ${data.monthLabel}.`,
      `Totals: open pipeline ${currency(data.totals.openPipeline)}, weighted forecast ${currency(data.totals.weightedForecast)}, ${data.totals.openDealCount} open deals, ${data.totals.overdueCount} overdue, ${data.totals.staleCount} stale (>14d).`,
      "",
      "Deals:",
      dealLines || "(none)",
    ].join("\n");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "openai/gpt-5.5",
        messages: [
          {
            role: "system",
            content:
              "You are a sales operations analyst helping a Sales Manager understand pipeline health in under a minute. " +
              "Return concise Markdown with these sections, each with a bold heading on its own line:\n" +
              "**Overview** — 1–2 sentences on the current pipeline state.\n" +
              "**Risks** — bullet list of specific at-risk deals (name them), calling out overdue close dates and stale deals (>14d no update).\n" +
              "**Themes** — bullet list of common themes from recent notes.\n" +
              "**Recommended next steps** — 2–4 short bullets.\n" +
              "Reference deals by company name. Do not invent deals or numbers. If a section has nothing to report, say so briefly.",
          },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      if (res.status === 429) throw new Response("Rate limit — try again in a moment.", { status: 429 });
      if (res.status === 402) throw new Response("AI credits exhausted for this workspace.", { status: 402 });
      throw new Response(`AI error (${res.status}): ${body.slice(0, 200)}`, { status: 502 });
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = json.choices?.[0]?.message?.content?.trim() ?? "";
    return { text, generatedAt: new Date().toISOString() };
  });