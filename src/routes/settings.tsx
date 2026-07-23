import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const STAGES = [
  { id: "lead", label: "Lead", accent: "bg-slate-500", default: 10 },
  { id: "qualified", label: "Qualified", accent: "bg-blue-500", default: 25 },
  { id: "proposal", label: "Proposal", accent: "bg-indigo-500", default: 50 },
  { id: "negotiation", label: "Negotiation", accent: "bg-amber-500", default: 75 },
  { id: "closed_won", label: "Closed Won", accent: "bg-emerald-500", default: 100 },
  { id: "closed_lost", label: "Closed Lost", accent: "bg-rose-500", default: 0 },
] as const;

type StageId = (typeof STAGES)[number]["id"];
type Probabilities = Record<StageId, number>;

const STORAGE_KEY = "fmf.stage-probabilities";
const DEFAULTS: Probabilities = STAGES.reduce((acc, s) => {
  acc[s.id] = s.default;
  return acc;
}, {} as Probabilities);

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
  const [values, setValues] = useState<Record<StageId, string>>(() =>
    STAGES.reduce((acc, s) => {
      acc[s.id] = String(s.default);
      return acc;
    }, {} as Record<StageId, string>),
  );
  const [errors, setErrors] = useState<Partial<Record<StageId, string>>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<Probabilities>;
      setValues((prev) => {
        const next = { ...prev };
        for (const s of STAGES) {
          const v = parsed[s.id];
          if (typeof v === "number" && v >= 0 && v <= 100) next[s.id] = String(v);
        }
        return next;
      });
    } catch {
      /* ignore */
    }
  }, []);

  const validate = (raw: string): { ok: boolean; error?: string; value?: number } => {
    if (raw.trim() === "") return { ok: false, error: "Required" };
    const n = Number(raw);
    if (!Number.isFinite(n)) return { ok: false, error: "Must be a number" };
    if (n < 0 || n > 100) return { ok: false, error: "Must be between 0 and 100" };
    return { ok: true, value: n };
  };

  const handleChange = (id: StageId, raw: string) => {
    setValues((prev) => ({ ...prev, [id]: raw }));
    const res = validate(raw);
    setErrors((prev) => ({ ...prev, [id]: res.ok ? undefined : res.error }));
  };

  const handleSave = () => {
    const parsed = {} as Probabilities;
    const newErrors: Partial<Record<StageId, string>> = {};
    for (const s of STAGES) {
      const res = validate(values[s.id]);
      if (!res.ok) newErrors[s.id] = res.error;
      else parsed[s.id] = res.value!;
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length) {
      toast.error("Fix invalid probabilities before saving.");
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    toast.success("Forecast probabilities saved.");
  };

  const handleReset = () => {
    setValues(STAGES.reduce((acc, s) => {
      acc[s.id] = String(s.default);
      return acc;
    }, {} as Record<StageId, string>));
    setErrors({});
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Manager Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Team members, pipeline stages, forecast targets, and workspace preferences.
        </p>
      </div>

      <section aria-labelledby="stage-probabilities" className="space-y-4">
        <div>
          <h2 id="stage-probabilities" className="text-lg font-semibold text-foreground">
            Forecast probabilities
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Set the default win probability for each pipeline stage. These weights drive the monthly weighted forecast.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline stages</CardTitle>
            <CardDescription>Values must be between 0% and 100%.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {STAGES.map((s) => {
                const err = errors[s.id];
                const inputId = `prob-${s.id}`;
                return (
                  <div key={s.id} className="space-y-2">
                    <Label htmlFor={inputId} className="flex items-center gap-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${s.accent}`} aria-hidden />
                      {s.label}
                    </Label>
                    <div className="relative">
                      <Input
                        id={inputId}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={100}
                        step={1}
                        value={values[s.id]}
                        onChange={(e) => handleChange(s.id, e.target.value)}
                        aria-invalid={!!err}
                        aria-describedby={err ? `${inputId}-error` : undefined}
                        className="pr-8"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                        %
                      </span>
                    </div>
                    {err ? (
                      <p id={`${inputId}-error`} className="text-xs text-destructive">
                        {err}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Default: {s.default}%</p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={handleSave}>Save probabilities</Button>
              <Button variant="outline" onClick={handleReset}>
                Reset to defaults
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="settings-groups" className="space-y-4">
        <h2 id="settings-groups" className="text-lg font-semibold text-foreground">Configuration</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { name: "Team", desc: "Invite reps, assign roles, and manage who owns which accounts." },
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