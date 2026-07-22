import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

function AnalyticsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Forecast, conversion, and revenue trends rolled up across the team.
        </p>
      </div>
      <section aria-labelledby="forecast-summary">
        <h2 id="forecast-summary" className="mb-3 text-lg font-semibold text-foreground">This month at a glance</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { name: "Forecast", desc: "Weighted pipeline expected to close this month." },
            { name: "Win rate", desc: "Closed-won share of the deals resolved this quarter." },
            { name: "Coverage", desc: "Open pipeline value vs. the team's monthly target." },
          ].map((k) => (
            <Card key={k.name}>
              <CardHeader>
                <CardTitle className="text-base">{k.name}</CardTitle>
                <CardDescription>{k.desc}</CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-semibold text-foreground">—</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}