import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Manager Settings — Five Minute Forecast" },
      { name: "description", content: "Configure pipeline stages, forecast targets, and team access for your CRM." },
      { property: "og:title", content: "Manager Settings — Five Minute Forecast" },
      { property: "og:description", content: "Configure pipeline stages, forecast targets, and team access for your CRM." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Manager Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Team members, pipeline stages, forecast targets, and workspace preferences.
        </p>
      </div>
      <section aria-labelledby="settings-groups" className="space-y-4">
        <h2 id="settings-groups" className="text-lg font-semibold text-foreground">Configuration</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { name: "Team", desc: "Invite reps, assign roles, and manage who owns which accounts." },
            { name: "Pipeline stages", desc: "Rename stages and set win-probability defaults per stage." },
            { name: "Forecast targets", desc: "Set monthly and quarterly revenue targets for the team." },
            { name: "Workspace", desc: "Currency, timezone, and default view preferences." },
          ].map((g) => (
            <Card key={g.name}>
              <CardHeader>
                <CardTitle className="text-base">{g.name}</CardTitle>
                <CardDescription>{g.desc}</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">Managers only</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}