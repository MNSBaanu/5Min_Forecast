import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/components/page-placeholder";

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
    <PagePlaceholder
      title="Manager Settings"
      description="Team members, pipeline stages, forecast targets, and workspace preferences."
    />
  );
}