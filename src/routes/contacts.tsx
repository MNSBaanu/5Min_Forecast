import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: "Contacts — Five Minute Forecast" },
      { name: "description", content: "Central table of every customer and prospect the team is working with." },
      { property: "og:title", content: "Contacts — Five Minute Forecast" },
      { property: "og:description", content: "Central table of every customer and prospect the team is working with." },
    ],
  }),
  component: ContactsPage,
});

function ContactsPage() {
  return (
    <PagePlaceholder
      title="Contacts"
      description="Searchable table of people and companies linked to deals in your pipeline."
    />
  );
}