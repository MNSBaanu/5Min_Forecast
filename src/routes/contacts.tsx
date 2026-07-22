import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Contacts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Searchable table of people and companies linked to deals in your pipeline.
        </p>
      </div>
      <section aria-labelledby="contacts-directory">
        <h2 id="contacts-directory" className="mb-3 text-lg font-semibold text-foreground">Directory</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No contacts yet</CardTitle>
            <CardDescription>
              Import a CSV or add a deal on the Pipeline to start populating the directory. Every
              contact is tied to a company and an owning rep so the team always knows who has the
              relationship.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Contacts show name, role, company, owner, and the last deal touched.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}