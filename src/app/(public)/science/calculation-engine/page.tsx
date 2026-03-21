import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bike Fit Calculation Engine | BestBikeFit4U Science",
  description:
    "Detailed explanation of the BestBikeFit4U calculation engine: input validation, saddle height, reach, bar drop, and frame target logic.",
  keywords: [
    "bike fit calculation engine",
    "cycling fit algorithm",
    "saddle height calculation",
    "stack reach algorithm",
  ],
  openGraph: {
    title: "Bike Fit Calculation Engine",
    description:
      "Understand how BestBikeFit4U transforms rider measurements into setup recommendations.",
    type: "article",
  },
};

const relatedLinks = [
  { href: "/science/stack-and-reach", label: "Stack and Reach Guide" },
  { href: "/science/bike-fit-methods", label: "Bike Fit Methods Comparison" },
  { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
  { href: "/calculators/frame-size", label: "Frame Size Calculator" },
  { href: "/guides/bike-fitting-for-knee-pain", label: "Bike Fitting for Knee Pain" },
  { href: "/guides/triathlon-bike-fit-guide", label: "Triathlon Bike Fit Guide" },
];

export default function CalculationEnginePage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Bike Fit Calculation Engine",
    description:
      "How BestBikeFit4U calculates saddle height, bar drop, reach, and frame targets from rider inputs.",
    author: {
      "@type": "Organization",
      name: "BestBikeFit4U",
    },
    mainEntityOfPage: "/science/calculation-engine",
  };

  return (
    <div className="py-16 text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-foreground">Calculation Engine</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The BestBikeFit4U engine combines validated measurement rules with proven
          bike-fit equations to produce actionable setup recommendations.
        </p>

        <div className="mt-10 space-y-8">
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-2xl font-semibold text-foreground">1. Input Validation</h2>
            <p className="mt-3 text-muted-foreground">
              Required measurements are checked against hard limits. Invalid
              inputs are rejected before any fit values are computed.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-2xl font-semibold text-foreground">2. Core Geometry Outputs</h2>
            <p className="mt-3 text-muted-foreground">
              The algorithm calculates crank length, saddle height, setback, bar
              drop, and saddle-to-bar reach from inseam, category, flexibility,
              core stability, and ambition profile.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-2xl font-semibold text-foreground">3. Frame Targets</h2>
            <p className="mt-3 text-muted-foreground">
              Recommended stack and reach targets are derived from saddle and
              cockpit coordinates, then translated into practical stem and spacer
              combinations.
            </p>
          </section>

          <section className="rounded-xl border border-primary/20 bg-primary-soft p-6">
            <h2 className="text-2xl font-semibold text-foreground">4. Safety Guardrails</h2>
            <p className="mt-3 text-muted-foreground">
              Warning rules flag aggressive drop, out-of-range reach, and risky
              saddle heights to reduce injury risk and guide conservative setup
              changes.
            </p>
          </section>
        </div>

        <section className="mt-12 rounded-xl border border-border bg-muted p-6">
          <h2 className="text-xl font-semibold text-foreground">Related Guides</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-primary hover:bg-secondary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
