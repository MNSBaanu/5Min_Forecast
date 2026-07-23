import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, FileSpreadsheet, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { STAGE_META, type StageId } from "@/hooks/use-deals";
import { useContacts } from "@/hooks/use-contacts";

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

const FIELDS = [
  { key: "company", label: "Company" },
  { key: "contact", label: "Contact" },
  { key: "value", label: "Value" },
  { key: "stage", label: "Stage" },
  { key: "closeDate", label: "Expected Close Date" },
  { key: "owner", label: "Owner" },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];
type Mapping = Record<FieldKey, string>;

const IGNORE = "__ignore__";

const emptyMapping = (): Mapping => ({
  company: IGNORE,
  contact: IGNORE,
  value: IGNORE,
  stage: IGNORE,
  closeDate: IGNORE,
  owner: IGNORE,
});

// Minimal RFC 4180-ish CSV parser (handles quoted fields with commas / escaped quotes).
function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/\r\n?/g, "\n");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  const cleaned = rows.filter((r) => r.some((v) => v.trim() !== ""));
  if (cleaned.length === 0) return { headers: [], rows: [] };
  const [headers, ...body] = cleaned;
  return { headers: headers.map((h) => h.trim()), rows: body };
}

function autoMap(headers: string[]): Mapping {
  const map = emptyMapping();
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const hints: Record<FieldKey, string[]> = {
    company: ["company", "account", "organization", "org", "customer"],
    contact: ["contact", "name", "person", "lead"],
    value: ["value", "amount", "price", "deal", "revenue"],
    stage: ["stage", "status", "phase"],
    closeDate: ["closedate", "close", "expectedclose", "eta", "date"],
    owner: ["owner", "rep", "assignedto", "assignee", "salesrep"],
  };
  for (const field of FIELDS) {
    const found = headers.find((h) => hints[field.key].some((hint) => norm(h).includes(hint)));
    if (found) map[field.key] = found;
  }
  return map;
}

type Step = "upload" | "map" | "preview";

function normalizeStage(raw: string): StageId {
  const s = raw.toLowerCase().replace(/[^a-z]/g, "");
  if (!s) return "lead";
  if (s.includes("won")) return "closed_won";
  if (s.includes("lost")) return "closed_lost";
  if (s.includes("negot")) return "negotiation";
  if (s.includes("propos")) return "proposal";
  if (s.includes("qual")) return "qualified";
  if (s.includes("lead") || s.includes("new")) return "lead";
  const match = STAGE_META.find((m) => m.id.replace(/_/g, "") === s || m.label.toLowerCase().replace(/\s/g, "") === s);
  return match?.id ?? "lead";
}

function parseValue(raw: string): number {
  const n = Number(raw.replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function parseDate(raw: string): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function ImportPage() {
  const { companies, contacts, addCompany, addContact } = useContacts();
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Mapping>(emptyMapping);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please upload a .csv file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is larger than 5MB");
      return;
    }
    try {
      const text = await file.text();
      const parsed = parseCsv(text);
      if (parsed.headers.length === 0) {
        toast.error("This CSV appears to be empty");
        return;
      }
      setFileName(file.name);
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      setMapping(autoMap(parsed.headers));
      setStep("map");
    } catch {
      toast.error("Couldn't read that file");
    }
  };

  const reset = () => {
    setStep("upload");
    setFileName(null);
    setHeaders([]);
    setRows([]);
    setMapping(emptyMapping());
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const mappedCount = useMemo(
    () => FIELDS.filter((f) => mapping[f.key] !== IGNORE).length,
    [mapping],
  );

  const previewRows = useMemo(() => {
    return rows.slice(0, 25).map((r) => {
      const record: Record<FieldKey, string> = {
        company: "", contact: "", value: "", stage: "", closeDate: "", owner: "",
      };
      for (const field of FIELDS) {
        const header = mapping[field.key];
        if (header === IGNORE) continue;
        const idx = headers.indexOf(header);
        if (idx >= 0) record[field.key] = (r[idx] ?? "").trim();
      }
      return record;
    });
  }, [rows, mapping, headers]);

  const confirmImport = async () => {
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) {
      toast.error("Please sign in to import deals");
      return;
    }
    setImporting(true);
    try {
      // Build normalized rows from full dataset
      const normalized = rows.map((r) => {
        const rec: Record<FieldKey, string> = {
          company: "", contact: "", value: "", stage: "", closeDate: "", owner: "",
        };
        for (const field of FIELDS) {
          const header = mapping[field.key];
          if (header === IGNORE) continue;
          const idx = headers.indexOf(header);
          if (idx >= 0) rec[field.key] = (r[idx] ?? "").trim();
        }
        return rec;
      }).filter((r) => r.company || r.contact);

      if (normalized.length === 0) {
        toast.error("No importable rows — map at least Company or Contact");
        setImporting(false);
        return;
      }

      // Create missing companies
      const companyByName = new Map(companies.map((c) => [c.name.toLowerCase(), c]));
      const uniqueCompanyNames = Array.from(
        new Set(normalized.map((r) => r.company).filter(Boolean)),
      );
      for (const name of uniqueCompanyNames) {
        if (!companyByName.has(name.toLowerCase())) {
          const co = await addCompany({ name, industry: "", website: "" });
          if (co) companyByName.set(co.name.toLowerCase(), co);
        }
      }

      // Create missing contacts (keyed by name + company)
      const contactByKey = new Map(
        contacts.map((c) => [`${c.name.toLowerCase()}|${(c.company ?? "").toLowerCase()}`, c]),
      );
      const uniqueContacts = new Map<string, { name: string; company: string }>();
      for (const r of normalized) {
        if (!r.contact) continue;
        const key = `${r.contact.toLowerCase()}|${r.company.toLowerCase()}`;
        if (!contactByKey.has(key) && !uniqueContacts.has(key)) {
          uniqueContacts.set(key, { name: r.contact, company: r.company });
        }
      }
      for (const { name, company } of uniqueContacts.values()) {
        const c = await addContact({ name, email: "", phone: "", companyName: company });
        if (c) contactByKey.set(`${c.name.toLowerCase()}|${(c.company ?? "").toLowerCase()}`, c);
      }

      // Insert deals
      const dealRows = normalized.map((r) => {
        const co = r.company ? companyByName.get(r.company.toLowerCase()) : null;
        const contactKey = `${r.contact.toLowerCase()}|${r.company.toLowerCase()}`;
        const ct = r.contact ? contactByKey.get(contactKey) : null;
        return {
          company_name: r.company || ct?.name || "Untitled",
          company_id: co?.id ?? null,
          contact_name: r.contact || null,
          contact_id: ct?.id ?? null,
          value: parseValue(r.value),
          stage_id: normalizeStage(r.stage),
          expected_close_date: parseDate(r.closeDate),
          owner: r.owner || userRes.user.email || "Unassigned",
          created_by: userRes.user.id,
        };
      });

      const { error } = await supabase.from("deals").insert(dealRows);
      if (error) {
        toast.error("Import failed", { description: error.message });
        setImporting(false);
        return;
      }
      toast.success(`Imported ${dealRows.length} deal${dealRows.length === 1 ? "" : "s"}`);
      reset();
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">CSV Import</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a spreadsheet, map its columns to your CRM fields, then review before importing.
        </p>
      </div>

      <Stepper step={step} />

      {step === "upload" && (
        <Card aria-labelledby="import-upload-heading">
          <CardHeader>
            <CardTitle>
              <h2 id="import-upload-heading" className="text-base font-semibold leading-none">
                Upload your CSV
              </h2>
            </CardTitle>
            <CardDescription>
              Drop a .csv export from your spreadsheet. First row should contain column headers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label
              htmlFor="csv-file"
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files?.[0];
                if (f) void handleFile(f);
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 text-center transition-colors",
                dragOver ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40",
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Drop your CSV here, or click to browse
                </p>
                <p className="mt-1 text-xs text-muted-foreground">.csv up to 5MB</p>
              </div>
              <input
                id="csv-file"
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                }}
              />
            </label>
          </CardContent>
        </Card>
      )}

      {step === "map" && (
        <Card aria-labelledby="import-map-heading">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>
                <h2 id="import-map-heading" className="text-base font-semibold leading-none">
                  Map your columns
                </h2>
              </CardTitle>
              <CardDescription>
                Match each CRM field to a column from your file. Leave optional fields unmapped.
              </CardDescription>
            </div>
            <FileChip name={fileName} rows={rows.length} onClear={reset} />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {FIELDS.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={`map-${field.key}`}>{field.label}</Label>
                  <Select
                    value={mapping[field.key]}
                    onValueChange={(v) => setMapping((m) => ({ ...m, [field.key]: v }))}
                  >
                    <SelectTrigger id={`map-${field.key}`}>
                      <SelectValue placeholder="Select a column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={IGNORE}>— Don't import —</SelectItem>
                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" onClick={reset}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                Start over
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {mappedCount} of {FIELDS.length} fields mapped
                </span>
                <Button onClick={() => setStep("preview")} disabled={mappedCount === 0}>
                  Preview import
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "preview" && (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>
                <h2 id="import-preview-heading" className="text-base font-semibold leading-none">
                  Review deals
                </h2>
              </CardTitle>
              <CardDescription>
                Showing the first {Math.min(rows.length, 25)} of {rows.length} rows. Confirm to import all.
              </CardDescription>
            </div>
            <FileChip name={fileName} rows={rows.length} onClear={reset} />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {FIELDS.map((f) => (
                      <TableHead key={f.key}>
                        <div className="flex items-center gap-2">
                          <span>{f.label}</span>
                          {mapping[f.key] === IGNORE && (
                            <Badge variant="outline" className="text-[10px]">Skipped</Badge>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((r, i) => (
                    <TableRow key={i}>
                      {FIELDS.map((f) => (
                        <TableCell key={f.key} className="max-w-[220px] truncate">
                          {r[f.key] || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {previewRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={FIELDS.length} className="py-6 text-center text-sm text-muted-foreground">
                        No rows to preview.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep("map")}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to mapping
              </Button>
              <Button onClick={confirmImport} disabled={importing}>
                <CheckCircle2 className="mr-1 h-4 w-4" />
                {importing ? "Importing…" : `Confirm import (${rows.length})`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "upload", label: "Upload" },
    { key: "map", label: "Map columns" },
    { key: "preview", label: "Review & import" },
  ];
  const activeIdx = steps.findIndex((s) => s.key === step);
  return (
    <ol className="flex items-center gap-2 text-sm">
      {steps.map((s, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        return (
          <li key={s.key} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border text-xs font-medium",
                active && "border-primary bg-primary text-primary-foreground",
                done && "border-primary bg-primary/10 text-primary",
                !active && !done && "border-border bg-background text-muted-foreground",
              )}
            >
              {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={cn(active ? "font-medium text-foreground" : "text-muted-foreground")}>
              {s.label}
            </span>
            {i < steps.length - 1 && <span className="mx-2 h-px w-8 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}

function FileChip({ name, rows, onClear }: { name: string | null; rows: number; onClear: () => void }) {
  if (!name) return null;
  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-1.5 text-xs">
      <FileSpreadsheet className="h-4 w-4 text-primary" />
      <span className="max-w-[180px] truncate font-medium text-foreground">{name}</span>
      <span className="text-muted-foreground">· {rows} rows</span>
      <button
        type="button"
        onClick={onClear}
        className="ml-1 rounded p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
        aria-label="Remove file"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}