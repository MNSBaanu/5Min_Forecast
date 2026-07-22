import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const HERO_IMAGE = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4c4948de-f7e4-41a5-a356-8a5d221e56cb/id-preview-ad8f1576--cc076d1c-1c2b-44d7-a379-b70482f11de4.lovable.app-1784740463797.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pipeline — Five Minute Forecast" },
      { name: "description", content: "Drag deals through your sales pipeline and keep every stage current in minutes." },
      { property: "og:title", content: "Pipeline — Five Minute Forecast" },
      { property: "og:description", content: "Drag deals through your sales pipeline and keep every stage current in minutes." },
      { property: "og:image", content: HERO_IMAGE },
      { name: "twitter:image", content: HERO_IMAGE },
    ],
  }),
  component: PipelinePage,
});

function PipelinePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pipeline</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kanban board of open deals grouped by stage. Reps update their own deals daily.
        </p>
      </div>
      <section aria-labelledby="pipeline-stages">
        <h2 id="pipeline-stages" className="mb-3 text-lg font-semibold text-foreground">Stages</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { name: "Prospecting", desc: "New leads waiting on a first working session." },
            { name: "Qualified", desc: "Fit confirmed, discovery call booked." },
            { name: "Proposal", desc: "Pricing and scope sent, awaiting response." },
            { name: "Negotiation", desc: "Redlines, procurement, and final terms." },
            { name: "Closed Won", desc: "Signed deals rolling into this month's forecast." },
          ].map((s) => (
            <Card key={s.name}>
              <CardHeader>
                <CardTitle className="text-base">{s.name}</CardTitle>
                <CardDescription>{s.desc}</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">0 deals</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
