import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pipeline — Five Minute Forecast" },
      { name: "description", content: "Drag deals through your sales pipeline and keep every stage current in minutes." },
      { property: "og:title", content: "Pipeline — Five Minute Forecast" },
      { property: "og:description", content: "Drag deals through your sales pipeline and keep every stage current in minutes." },
    ],
  }),
  component: PipelinePage,
});

function PipelinePage() {
  return (
    <PagePlaceholder
      title="Pipeline"
      description="Kanban board of open deals grouped by stage. Reps update their own deals daily."
    />
  );
}
