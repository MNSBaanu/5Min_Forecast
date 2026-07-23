import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Building2, Mail, Phone, Globe, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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

type Contact = { id: string; name: string; email: string; phone: string; company: string };
type Company = { id: string; name: string; industry: string; website: string };
type LinkedDeal = { id: string; title: string; company: string; contact: string; value: number; stage: string };

const STAGE_LABELS: Record<string, string> = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

const INITIAL_COMPANIES: Company[] = [
  { id: "c1", name: "Acme Corp", industry: "Manufacturing", website: "acme.com" },
  { id: "c2", name: "Globex", industry: "Energy", website: "globex.com" },
  { id: "c3", name: "Initech", industry: "Software", website: "initech.com" },
  { id: "c4", name: "Stark Industries", industry: "Defense", website: "stark.com" },
  { id: "c5", name: "Wayne Enterprises", industry: "Conglomerate", website: "wayne.com" },
];

const INITIAL_CONTACTS: Contact[] = [
  { id: "p1", name: "Jane Cooper", email: "jane@acme.com", phone: "+1 415 555 0110", company: "Acme Corp" },
  { id: "p2", name: "Wade Warren", email: "wade@globex.com", phone: "+1 415 555 0122", company: "Globex" },
  { id: "p3", name: "Esther Howard", email: "esther@initech.com", phone: "+1 415 555 0155", company: "Initech" },
  { id: "p4", name: "Robert Downey", email: "robert@stark.com", phone: "+1 415 555 0177", company: "Stark Industries" },
  { id: "p5", name: "Bruce Wayne", email: "bruce@wayne.com", phone: "+1 415 555 0188", company: "Wayne Enterprises" },
];

const DEALS: LinkedDeal[] = [
  { id: "d1", title: "Acme Q3 renewal", company: "Acme Corp", contact: "Jane Cooper", value: 12000, stage: "lead" },
  { id: "d2", title: "Globex expansion", company: "Globex", contact: "Wade Warren", value: 45000, stage: "lead" },
  { id: "d3", title: "Initech pilot", company: "Initech", contact: "Esther Howard", value: 8000, stage: "qualified" },
  { id: "d5", title: "Stark platform", company: "Stark Industries", contact: "Robert Downey", value: 92000, stage: "proposal" },
  { id: "d6", title: "Wayne enterprise deal", company: "Wayne Enterprises", contact: "Bruce Wayne", value: 128000, stage: "negotiation" },
];

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [selected, setSelected] = useState<
    | { kind: "contact"; item: Contact }
    | { kind: "company"; item: Company }
    | null
  >(null);

  const linkedDeals = useMemo(() => {
    if (!selected) return [];
    return selected.kind === "contact"
      ? DEALS.filter((d) => d.contact === selected.item.name)
      : DEALS.filter((d) => d.company === selected.item.name);
  }, [selected]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Contacts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Shared directory of contacts and companies linked to your pipeline deals.
        </p>
      </div>

      <Tabs defaultValue="contacts" className="w-full">
        <div className="flex items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
            <TabsTrigger value="companies">Companies ({companies.length})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="contacts" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">People</CardTitle>
                <CardDescription>Everyone your team is talking to.</CardDescription>
              </div>
              <AddContactDialog
                companies={companies}
                onAdd={(c) => setContacts((prev) => [...prev, c])}
              />
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Company</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((c) => (
                    <TableRow
                      key={c.id}
                      className="cursor-pointer"
                      onClick={() => setSelected({ kind: "contact", item: c })}
                    >
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.email}</TableCell>
                      <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                      <TableCell>{c.company}</TableCell>
                    </TableRow>
                  ))}
                  {contacts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                        No contacts yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Companies</CardTitle>
                <CardDescription>Every account with an active or past deal.</CardDescription>
              </div>
              <AddCompanyDialog onAdd={(c) => setCompanies((prev) => [...prev, c])} />
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Website</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((c) => (
                    <TableRow
                      key={c.id}
                      className="cursor-pointer"
                      onClick={() => setSelected({ kind: "company", item: c })}
                    >
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.industry}</TableCell>
                      <TableCell className="text-muted-foreground">{c.website}</TableCell>
                    </TableRow>
                  ))}
                  {companies.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                        No companies yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {selected.kind === "company" ? <Building2 className="h-5 w-5" /> : null}
                  {selected.item.name}
                </SheetTitle>
                <SheetDescription>
                  {selected.kind === "contact"
                    ? `Contact at ${(selected.item as Contact).company}`
                    : `${(selected.item as Company).industry} · ${(selected.item as Company).website}`}
                </SheetDescription>
              </SheetHeader>

              {selected.kind === "contact" && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" /> {(selected.item as Contact).email}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" /> {(selected.item as Contact).phone}
                  </div>
                </div>
              )}
              {selected.kind === "company" && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" /> {(selected.item as Company).website}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  Linked deals ({linkedDeals.length})
                </h3>
                <div className="space-y-2">
                  {linkedDeals.map((d) => (
                    <div key={d.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{d.title}</div>
                        <Badge variant="secondary">{STAGE_LABELS[d.stage] ?? d.stage}</Badge>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {selected.kind === "contact" ? d.company : d.contact} · {currency.format(d.value)}
                      </div>
                    </div>
                  ))}
                  {linkedDeals.length === 0 && (
                    <p className="text-sm text-muted-foreground">No active deals linked yet.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function AddContactDialog({ companies, onAdd }: { companies: Company[]; onAdd: (c: Contact) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState<string>(companies[0]?.name ?? "");

  function submit() {
    if (!name.trim()) return;
    onAdd({ id: crypto.randomUUID(), name: name.trim(), email: email.trim(), phone: phone.trim(), company });
    setName(""); setEmail(""); setPhone("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4" /> Add contact</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New contact</DialogTitle>
          <DialogDescription>Add a person to the shared directory.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="c-name">Name</Label>
            <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-email">Email</Label>
            <Input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-phone">Phone</Label>
            <Input id="c-phone" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} />
          </div>
          <div className="space-y-1.5">
            <Label>Company</Label>
            <Select value={company} onValueChange={setCompany}>
              <SelectTrigger><SelectValue placeholder="Select a company" /></SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!name.trim()}>Add contact</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddCompanyDialog({ onAdd }: { onAdd: (c: Company) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");

  function submit() {
    if (!name.trim()) return;
    onAdd({ id: crypto.randomUUID(), name: name.trim(), industry: industry.trim(), website: website.trim() });
    setName(""); setIndustry(""); setWebsite("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4" /> Add company</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New company</DialogTitle>
          <DialogDescription>Add an account to the shared directory.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="co-name">Name</Label>
            <Input id="co-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="co-industry">Industry</Label>
            <Input id="co-industry" value={industry} onChange={(e) => setIndustry(e.target.value)} maxLength={80} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="co-web">Website</Label>
            <Input id="co-web" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="example.com" maxLength={255} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!name.trim()}>Add company</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}