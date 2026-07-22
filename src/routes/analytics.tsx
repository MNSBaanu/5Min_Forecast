import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/components/page-placeholder";

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
    <PagePlaceholder
      title="Analytics"
      description="Forecast, conversion, and revenue trends rolled up across the team."
    />
  );
}