import { createFileRoute } from "@tanstack/react-router";
import { PipelineBoard } from "@/components/pipeline-board";

const HERO_IMAGE = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4c4948de-f7e4-41a5-a356-8a5d221e56cb/id-preview-ad8f1576--cc076d1c-1c2b-44d7-a379-b70482f11de4.lovable.app-1784740463797.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pipeline — 5Min Forecast" },
      { name: "description", content: "Drag deals through your sales pipeline and keep every stage current in minutes." },
      { property: "og:title", content: "Pipeline — 5Min Forecast" },
      { property: "og:description", content: "Drag deals through your sales pipeline and keep every stage current in minutes." },
      { property: "og:image", content: HERO_IMAGE },
      { name: "twitter:image", content: HERO_IMAGE },
    ],
  }),
  component: PipelinePage,
});

function PipelinePage() {
  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pipeline</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag deals between stages. Moves into Closed Lost require a reason.
        </p>
      </div>
      <PipelineBoard />
    </div>
  );
}