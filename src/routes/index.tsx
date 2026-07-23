import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3,
  Check,
  Kanban,
  LineChart,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import logoAsset from "@/assets/logo.png.asset.json";
import { useCurrentUser } from "@/hooks/use-current-user";

const HERO_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4c4948de-f7e4-41a5-a356-8a5d221e56cb/id-preview-ad8f1576--cc076d1c-1b2b-44d7-a379-b70482f11de4.lovable.app-1784740463797.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "5Min Forecast — Lightweight CRM & Sales Forecasting for Small Teams" },
      {
        name: "description",
        content:
          "5Min Forecast is a lightweight CRM for small sales teams. Drag deals through your pipeline, keep notes fresh, and generate a weighted monthly forecast in minutes.",
      },
      {
        property: "og:title",
        content: "5Min Forecast — Lightweight CRM & Sales Forecasting for Small Teams",
      },
      {
        property: "og:description",
        content:
          "Drag deals through your pipeline, keep notes fresh, and generate a weighted monthly forecast in minutes.",
      },
      { property: "og:image", content: HERO_IMAGE },
      { name: "twitter:image", content: HERO_IMAGE },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { isAuthenticated, loading } = useCurrentUser();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoAsset.url}
              alt="5Min Forecast"
              className="h-9 w-9 rounded-xl object-cover shadow-glow"
            />
            <div className="leading-tight">
              <p className="font-display text-base font-semibold tracking-tight text-foreground">
                5Min Forecast
              </p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Sales CRM
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              How it works
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {!loading && isAuthenticated ? (
              <Button asChild className="bg-gradient-brand font-medium shadow-elegant hover:opacity-95">
                <Link to="/pipeline">Go to workspace</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="hidden font-medium text-foreground sm:inline-flex">
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild className="bg-gradient-brand font-medium shadow-elegant hover:opacity-95">
                  <Link to="/auth">Get started free</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(800px circle at 70% 20%, oklch(0.42 0.1 165 / 0.12), transparent 60%), radial-gradient(600px circle at 20% 80%, oklch(0.75 0.13 85 / 0.1), transparent 55%)",
            }}
          />
          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 shadow-elegant">
                <span className="flex h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  Built for 5-person sales teams
                </span>
              </div>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Close the month with a forecast you actually trust.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                A lightweight CRM that helps small sales teams move off spreadsheets. Reps update deals in
                minutes, managers get a clean weighted forecast, and nobody wastes Friday afternoon chasing
                numbers.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {!loading && isAuthenticated ? (
                  <Button
                    size="lg"
                    asChild
                    className="h-12 bg-gradient-brand px-8 text-base font-medium shadow-elegant hover:opacity-95"
                  >
                    <Link to="/pipeline">Go to your pipeline</Link>
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      asChild
                      className="h-12 bg-gradient-brand px-8 text-base font-medium shadow-elegant hover:opacity-95"
                    >
                      <Link to="/auth">Start forecasting free</Link>
                    </Button>
                    <Button
                      size="lg"
                      asChild
                      variant="outline"
                      className="h-12 px-8 text-base font-medium"
                    >
                      <Link to="/auth">Sign in</Link>
                    </Button>
                  </>
                )}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Free to try. No credit card required.
              </p>
            </div>

            <div className="mt-16">
              <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-glow">
                <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-background/80 to-transparent" />
                <img
                  src={HERO_IMAGE}
                  alt="5Min Forecast pipeline board showing deals organized into sales stages"
                  className="w-full"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Trust bar */}
        <section className="border-y border-border bg-muted/30 px-6 py-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Weighted forecast in one click
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              CSV import in three steps
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Role-based access
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              AI pipeline summaries
            </span>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                Features
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Everything a small sales team needs
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                No bloat, no enterprise complexity. Just the tools you need to keep deals moving and
                forecasts accurate.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Kanban}
                title="Drag-and-drop pipeline"
                description="Move deals across six fixed stages. Cards update instantly and the whole team stays aligned."
              />
              <FeatureCard
                icon={LineChart}
                title="Weighted monthly forecast"
                description="Stage probabilities turn your open pipeline into a realistic forecast number in seconds."
              />
              <FeatureCard
                icon={Sparkles}
                title="AI summaries for managers"
                description="Get a quick read on pipeline health, risks, and themes without reading every note."
              />
              <FeatureCard
                icon={Upload}
                title="CSV import with mapping"
                description="Upload a spreadsheet, map the columns, preview the rows, and import deals in minutes."
              />
              <FeatureCard
                icon={Users}
                title="Contacts & companies"
                description="Link deals to the people and accounts behind them. See every related opportunity in one place."
              />
              <FeatureCard
                icon={ShieldCheck}
                title="Role-based access"
                description="Sales reps own their deals. Sales managers see the full picture. Row-level security keeps data safe."
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="relative overflow-hidden px-6 py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(700px circle at 30% 50%, oklch(0.42 0.1 165 / 0.08), transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                How it works
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                From spreadsheet chaos to clear forecast
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <StepCard
                step="01"
                title="Set your stages"
                description="Start with six proven pipeline stages and default probabilities. Adjust them to match your sales motion."
              />
              <StepCard
                step="02"
                title="Add or import deals"
                description="Create deals one by one or import a CSV. Contacts and companies are linked automatically."
              />
              <StepCard
                step="03"
                title="Review the forecast"
                description="Reps update stages daily. Managers open the analytics dashboard and see a weighted forecast in minutes."
              />
            </div>
          </div>
        </section>

        {/* Metrics / social proof */}
        <section className="border-y border-border bg-muted/30 px-6 py-16">
          <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-3">
            <MetricCard value="5 min" label="Average time for a rep to update their pipeline" />
            <MetricCard value="1 view" label="Manager dashboard with weighted forecast" />
            <MetricCard value="0 spreadsheets" label="Replace scattered files with one source of truth" />
          </div>
        </section>

        {/* Pricing teaser */}
        <section id="pricing" className="px-6 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Pricing</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Simple and free to start
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No per-seat pricing, no hidden fees. Get your team in and start forecasting today.
            </p>
            <Card className="mt-10 mx-auto max-w-md border-border bg-card shadow-elegant">
              <CardContent className="p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Early access
                </p>
                <div className="mt-4 flex items-baseline justify-center gap-2">
                  <span className="font-display text-5xl font-semibold text-foreground">Free</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">During beta</p>
                <Separator className="my-6" />
                <ul className="space-y-3 text-left text-sm text-foreground">
                  {[
                    "Unlimited deals and contacts",
                    "Full pipeline board",
                    "Weighted forecast dashboard",
                    "CSV import",
                    "AI pipeline summaries",
                    "Google sign-in",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="mt-8 w-full bg-gradient-brand font-medium shadow-elegant hover:opacity-95"
                >
                  <Link to="/auth">Get started free</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 py-24">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-sidebar px-6 py-16 text-center sm:px-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                background:
                  "radial-gradient(600px circle at 20% 20%, oklch(0.35 0.08 165 / 0.6), transparent 60%), radial-gradient(500px circle at 80% 90%, oklch(0.6 0.14 85 / 0.35), transparent 55%)",
              }}
            />
            <div className="relative">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-sidebar-foreground sm:text-4xl">
                Ready to forecast in five minutes?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sidebar-foreground/70">
                Join teams that have replaced spreadsheet chaos with a clean, shared pipeline. Sign up free
                and invite your reps.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  asChild
                  className="h-12 bg-gradient-gold px-8 text-base font-medium text-gold-foreground hover:opacity-95"
                >
                  <Link to="/auth">Start for free</Link>
                </Button>
                <Button
                  size="lg"
                  asChild
                  variant="outline"
                  className="h-12 border-sidebar-border/60 bg-sidebar/50 px-8 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <Link to="/auth">Sign in</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <img
              src={logoAsset.url}
              alt="5Min Forecast"
              className="h-8 w-8 rounded-lg object-cover"
            />
            <div className="leading-tight">
              <p className="font-display text-sm font-semibold text-foreground">5Min Forecast</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Sales CRM</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/blog/how-to-create-a-sales-forecast" className="hover:text-foreground">
              Sales forecast guide
            </Link>
            <Link to="/auth" className="hover:text-foreground">
              Sign in
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} 5Min Forecast. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Card className="group border-border bg-card shadow-elegant transition-shadow hover:shadow-glow">
      <CardContent className="p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="relative rounded-2xl border border-border bg-card p-8 shadow-elegant">
      <span className="font-display text-5xl font-semibold text-muted/60">{step}</span>
      <h3 className="mt-6 font-display text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-4xl font-semibold text-foreground sm:text-5xl">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
