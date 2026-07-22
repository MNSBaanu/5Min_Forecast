import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/import")({
  head: () => ({
    meta: [
      { title: "CSV Import — Five Minute Forecast" },
      { name: "description", content: "Bring deals and contacts over from spreadsheets in a single guided import." },
      { property: "og:title", content: "CSV Import — Five Minute Forecast" },
      { property: "og:description", content: "Bring deals and contacts over from spreadsheets in a single guided import." },
    ],
  }),
  component: ImportPage,
});

function ImportPage() {
  return (
    <PagePlaceholder
      title="CSV Import"
      description="Upload a spreadsheet, map columns to fields, and import deals or contacts in bulk."
    />
  );
}