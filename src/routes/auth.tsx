import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Sparkles, LineChart } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/logo.png.asset.json";


const NEXT_KEY = "fmf.auth.next";

function sanitizeNext(next: string | undefined): string {
  if (!next) return "/";
  // Same-origin relative path only.
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — 5Min Forecast" },
      { name: "description", content: "Sign in to 5Min Forecast to manage your pipeline and forecasts." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const target = sanitizeNext(next);

  // If already signed in, bounce to target.
  useEffect(() => {
    let cancelled = false;
    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled && data.session) {
        const stored = sessionStorage.getItem(NEXT_KEY);
        sessionStorage.removeItem(NEXT_KEY);
        window.location.href = sanitizeNext(stored ?? target);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [target]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth?next=${encodeURIComponent(target)}` },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: target as string });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    // Persist target across the OAuth round-trip; redirect_uri must be a public
    // same-origin URL, so we return to /auth and complete the redirect here.
    sessionStorage.setItem(NEXT_KEY, target);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth`,
    });
    if (result.error) {
      setError(result.error.message ?? "Google sign in failed");
      return;
    }
    if (result.redirected) return;
    window.location.href = target;
  }

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(600px circle at 20% 10%, oklch(0.35 0.08 165 / 0.6), transparent 60%), radial-gradient(500px circle at 80% 90%, oklch(0.6 0.14 85 / 0.35), transparent 55%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative flex items-center gap-3">
          <img
            src={logoAsset.url}
            alt="5Min Forecast"
            className="h-10 w-10 rounded-xl object-cover shadow-glow"
          />
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold tracking-tight">5Min Forecast</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-sidebar-foreground/60">
              Sales CRM
            </p>
          </div>
        </div>


        <div className="relative max-w-md">
          <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight">
            Close the month with a forecast you actually trust.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-sidebar-foreground/70">
            A lightweight CRM built for small sales teams. Move deals across
            stages, keep notes fresh, and hand your manager a clean weighted
            forecast — in under five minutes a day.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              { icon: LineChart, label: "Weighted monthly forecast at a glance" },
              { icon: Sparkles, label: "AI pipeline summaries for managers" },
              { icon: ShieldCheck, label: "Role-based access with row-level security" },
            ].map((f) => (
              <li key={f.label} className="flex items-center gap-3 text-sidebar-foreground/85">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-accent text-gold">
                  <f.icon className="h-4 w-4" />
                </span>
                {f.label}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-sidebar-foreground/50">
          © {new Date().getFullYear()} 5Min Forecast · Built for teams that ship.
        </p>
      </aside>

      {/* Form panel */}
      <section className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img
              src={logoAsset.url}
              alt="5Min Forecast"
              className="h-10 w-10 rounded-xl object-cover shadow-glow"
            />
            <p className="font-display text-lg font-semibold tracking-tight text-foreground">
              5Min Forecast
            </p>
          </div>


          <div className="mb-8">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to pick up your pipeline where you left off."
                : "Start forecasting in five minutes. No credit card required."}
            </p>
          </div>

          <Button
            variant="outline"
            className="h-11 w-full font-medium"
            onClick={handleGoogle}
            disabled={busy}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              or with email
            </span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleEmail} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@company.com"
                className="h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <p
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="h-11 w-full bg-gradient-brand font-medium shadow-elegant hover:opacity-95"
              disabled={busy}
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to 5Min Forecast? " : "Already have an account? "}
            <button
              type="button"
              className="font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "Create an account" : "Sign in instead"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
