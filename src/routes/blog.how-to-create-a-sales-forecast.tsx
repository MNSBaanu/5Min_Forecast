import { createFileRoute } from "@tanstack/react-router";

const TITLE = "How to Create a Sales Forecast: Step-by-Step Guide for Managers";
const DESCRIPTION =
  "A practical, step-by-step guide for sales managers on how to create an accurate sales forecast in minutes using pipeline stages, probabilities, and historical data.";
const URL = "https://fiveminforecast.lovable.app/blog/how-to-create-a-sales-forecast";

export const Route = createFileRoute("/blog/how-to-create-a-sales-forecast")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: SalesForecastGuide,
});

function SalesForecastGuide() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12 prose prose-slate dark:prose-invert">
      <header className="mb-8 not-prose">
        <p className="text-sm font-medium text-muted-foreground">Sales Forecasting Guide</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground">
          How to Create a Sales Forecast: A Step-by-Step Guide for Sales Managers
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A practical, repeatable process for building an accurate monthly sales forecast — even if your team is
          moving off spreadsheets.
        </p>
      </header>

      <p>
        A good sales forecast tells you what revenue you can realistically expect to close in a given month or
        quarter. It's not about hitting a perfect number — it's about giving your team, your leadership, and
        your finance partners a reliable view of what's coming. This guide walks through exactly how to build
        one, step by step.
      </p>

      <h2>1. Define your pipeline stages</h2>
      <p>
        Every forecast starts with a clear set of pipeline stages. Each stage represents a milestone in your
        sales process — from first contact to closed deal. A simple, effective set of stages looks like this:
      </p>
      <ul>
        <li><strong>Lead</strong> — a new contact worth pursuing.</li>
        <li><strong>Qualified</strong> — the prospect has a real need and budget.</li>
        <li><strong>Proposal</strong> — you've sent pricing or a formal proposal.</li>
        <li><strong>Negotiation</strong> — commercial terms are being finalized.</li>
        <li><strong>Closed Won</strong> — signed and booked.</li>
        <li><strong>Closed Lost</strong> — the deal did not close.</li>
      </ul>
      <p>
        Keep the stages few and well-defined. Reps should never have to guess which stage a deal belongs in.
      </p>

      <h2>2. Assign a probability to each stage</h2>
      <p>
        Each pipeline stage should have a probability of closing — the historical percentage of deals in that
        stage that eventually convert to Closed Won. Typical starting probabilities look like:
      </p>
      <ul>
        <li>Lead — 10%</li>
        <li>Qualified — 25%</li>
        <li>Proposal — 50%</li>
        <li>Negotiation — 75%</li>
        <li>Closed Won — 100%</li>
        <li>Closed Lost — 0%</li>
      </ul>
      <p>
        These are starting points. After a few quarters of data, adjust them based on your actual win rates per
        stage.
      </p>

      <h2>3. Collect the deal data you need</h2>
      <p>For every open deal, you need at minimum:</p>
      <ul>
        <li>Deal value (expected revenue)</li>
        <li>Current stage</li>
        <li>Expected close date</li>
        <li>Owner (which rep is responsible)</li>
      </ul>
      <p>
        This is the raw material for your forecast. If any of these fields are stale or missing, the forecast
        will be wrong — so build a habit of updating deals at least weekly.
      </p>

      <h2>4. Calculate the weighted forecast</h2>
      <p>
        The core formula for a weighted forecast is straightforward:
      </p>
      <pre><code>Weighted value = Deal value × Stage probability</code></pre>
      <p>
        For example, a $20,000 deal in the Proposal stage (50%) contributes $10,000 to the forecast. Sum the
        weighted values of every open deal with an expected close date in the forecast period, and you have
        your weighted forecast for that month or quarter.
      </p>

      <h2>5. Segment the forecast</h2>
      <p>
        A single number is useful, but segmenting the forecast makes it actionable. Slice it by:
      </p>
      <ul>
        <li><strong>Rep</strong> — who is on track, who needs coaching.</li>
        <li><strong>Stage</strong> — is the pipeline top-heavy on early-stage deals?</li>
        <li><strong>Close month</strong> — how does this month compare to next?</li>
      </ul>

      <h2>6. Identify risks and stale deals</h2>
      <p>
        Flag any deal that hasn't been updated in the last two weeks, has an expected close date in the past,
        or is stuck in the same stage far longer than average. These are the deals that quietly break a
        forecast. Review them with each rep in your weekly 1:1.
      </p>

      <h2>7. Compare forecast to quota — and to reality</h2>
      <p>
        Once you have a weighted forecast, compare it to two numbers:
      </p>
      <ul>
        <li>Your team's quota for the period.</li>
        <li>The forecast you made last week or last month.</li>
      </ul>
      <p>
        Movement between forecasts tells you whether the pipeline is strengthening or slipping. That trend is
        often more valuable than the absolute number.
      </p>

      <h2>8. Refresh the forecast on a regular cadence</h2>
      <p>
        A forecast is only useful if it's fresh. Establish a rhythm:
      </p>
      <ul>
        <li>Reps update their deals daily or at minimum weekly.</li>
        <li>Managers review the full forecast weekly.</li>
        <li>Leadership sees a rolled-up view monthly.</li>
      </ul>

      <h2>Common sales forecasting mistakes to avoid</h2>
      <ul>
        <li><strong>Optimistic close dates.</strong> Reps often push dates forward. Sanity-check them.</li>
        <li><strong>Deals with no next step.</strong> If nothing is scheduled, the deal is probably stalled.</li>
        <li><strong>Ignoring history.</strong> Your stage probabilities should reflect your actual win rates.</li>
        <li><strong>Forecasting only one number.</strong> Show best case, weighted, and commit separately.</li>
      </ul>

      <h2>Do it in minutes, not hours</h2>
      <p>
        A sales forecast should take minutes to produce, not a full afternoon of spreadsheet wrangling. That's
        exactly what Five Minute Forecast is built for: reps update deals in a simple pipeline board, and
        managers get an accurate, weighted forecast automatically — no formulas, no VLOOKUPs, no guesswork.
      </p>
      <p>
        Follow the eight steps above and you'll have a forecast you can trust — and defend — every single
        month.
      </p>
    </article>
  );
}