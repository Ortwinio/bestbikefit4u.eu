import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { Button, Input, Select } from "@/components/ui";
import { BRAND } from "@/config/brand";
import { calculateCrankLength } from "../../../../../convex/lib/fitAlgorithm/calculations";
import { buildFaqPageSchema, buildWebApplicationSchema } from "@/lib/seo/jsonLd";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";
import {
  PUBLIC_BIKE_CATEGORY_OPTIONS,
  getFirstSearchParam,
  parseBikeCategory,
  parsePositiveNumberParam,
  type SearchParamRecord,
} from "@/lib/publicCalculators";

export const metadata: Metadata = {
  title: "Crank Length Calculator | BestBikeFit4U",
  description:
    "Calculate recommended crank length from inseam and bike category using BestBikeFit4U fit algorithm logic.",
  keywords: [
    "crank length calculator",
    "bike crank size",
    "cycling crank length fit",
  ],
  openGraph: {
    title: "Crank Length Calculator",
    description:
      "Find a crank-length recommendation based on inseam and category.",
    type: "website",
  },
};

interface CrankLengthCalculatorPageProps {
  searchParams: Promise<SearchParamRecord>;
}

export default async function CrankLengthCalculatorPage({
  searchParams,
}: CrankLengthCalculatorPageProps) {
  const params = await searchParams;
  const submittedInseam = getFirstSearchParam(params, "inseamCm");
  const hasSubmitted = submittedInseam !== undefined;
  const inseamCm = parsePositiveNumberParam(params, "inseamCm");
  const category = parseBikeCategory(getFirstSearchParam(params, "category"));

  let error: string | null = null;
  let crankLengthMm: number | null = null;

  if (hasSubmitted) {
    if (inseamCm === null || inseamCm < 55 || inseamCm > 105) {
      error = "Please enter inseam between 55 and 105 cm.";
    } else {
      crankLengthMm = calculateCrankLength(Math.round(inseamCm * 10), category);
    }
  }

  const pageUrl = new URL("/calculators/crank-length", BRAND.siteUrl).toString();
  const faqs = [
    {
      q: "Does a shorter crank always improve comfort?",
      a: "Not always. Crank length needs to match your inseam, bike category, and position goals rather than following a blanket rule.",
    },
    {
      q: "Why is MTB crank guidance sometimes shorter?",
      a: "MTB setups may favor slightly shorter cranks for pedal clearance and terrain control.",
    },
  ];
  const helperPoints = [
    "Crank length should match inseam, bike category, and posture demands.",
    "Shorter is not automatically better. The right choice balances clearance, comfort, and pedaling feel.",
    "Use this together with saddle height and full fit targets rather than in isolation.",
  ];

  return (
    <div className="py-16 text-foreground">
      <JsonLd
        schema={[
          buildWebApplicationSchema({
            name: "BestBikeFit4U Crank Length Calculator",
            description:
              "Calculate recommended crank length from inseam and bike category using BestBikeFit4U fit algorithm logic.",
            url: pageUrl,
          }),
          buildFaqPageSchema(faqs),
        ]}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <section className="rounded-[28px] border border-border bg-[color:color-mix(in_oklch,var(--card)_88%,var(--primary)_12%)] p-8 shadow-sm sm:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              BestBikeFit4U calculator
            </p>
            <h1 className="mt-4 text-4xl font-bold text-foreground sm:text-5xl">
              Crank Length Calculator
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Get a practical starting point for crank length before you change components.
            </p>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <form className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8" method="GET">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Inputs
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">
                Generate a baseline
              </h2>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Input
                label="Inseam (cm)"
                id="crank-length-inseam"
                name="inseamCm"
                type="number"
                min={55}
                max={105}
                step="0.1"
                defaultValue={submittedInseam ?? ""}
                tooltip="Measure from floor to the top of a book held firmly between the legs."
                required
              />

              <Select
                label="Bike Category"
                id="crank-length-category"
                name="category"
                defaultValue={category}
                tooltip="Choose the category that matches your bike and intended use."
                options={PUBLIC_BIKE_CATEGORY_OPTIONS}
              />
            </div>

            <Button type="submit" className="mt-6">
              Calculate crank length
            </Button>
          </form>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-border bg-[color:var(--secondary)] p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Guidance
              </p>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {helperPoints.map((point) => (
                  <li key={point} className="rounded-2xl border border-border/60 bg-card px-4 py-3">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </section>

        {error ? (
          <div className="mt-6 rounded-2xl border border-destructive/20 bg-destructive-soft px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Output
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            Component recommendation
          </h2>
          {crankLengthMm !== null ? (
            <div className="mt-6 rounded-2xl border border-primary/20 bg-primary-soft p-5">
              <p className="text-sm text-muted-foreground">Recommended crank length</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{crankLengthMm} mm</p>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-[color:var(--secondary)] px-4 py-5 text-sm text-muted-foreground">
              Enter your details to generate a first-pass crank-length recommendation.
            </div>
          )}
        </section>

        <section className="mt-10 rounded-3xl border border-border bg-[color:color-mix(in_oklch,var(--card)_88%,var(--secondary)_12%)] p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-foreground">Next step</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Crank length works best when you consider it alongside saddle height, reach, and the rest of the fit.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button render={<Link href="/calculators/bike-fit" />}>Open bike-fit calculator</Button>
            <Button render={<Link href="/login" />} variant="outline">
              Continue in dashboard
            </Button>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-2xl font-semibold text-foreground">FAQ</h2>
          <div className="mt-4 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-semibold text-foreground">{faq.q}</h3>
                <p className="mt-1 text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <RelatedLinksSection
          title="Related tools and guides"
          links={getRelatedLinks("crank-length", "en")}
          locale="en"
        />
      </div>
    </div>
  );
}
