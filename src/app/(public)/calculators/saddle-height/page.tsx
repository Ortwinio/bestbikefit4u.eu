import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { Button, Input, Select } from "@/components/ui";
import { BRAND } from "@/config/brand";
import { mapCoreScore, mapFlexibilityScore } from "../../../../../convex/lib/fitAlgorithm";
import { calculateSaddleHeight } from "../../../../../convex/lib/fitAlgorithm/calculations";
import type { CalculationContext } from "../../../../../convex/lib/fitAlgorithm/types";
import {
  buildFaqPageSchema,
  buildHowToSchema,
  buildWebApplicationSchema,
} from "@/lib/seo/jsonLd";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";
import {
  AMBITION_OPTIONS,
  PUBLIC_BIKE_CATEGORY_OPTIONS,
  getFirstSearchParam,
  parseAmbition,
  parseBikeCategory,
  parsePositiveNumberParam,
  parseScore1to5,
  type SearchParamRecord,
} from "@/lib/publicCalculators";

export const metadata: Metadata = {
  title: "Saddle Height Calculator | BestBikeFit4U",
  description:
    "Calculate recommended saddle height using the BestBikeFit4U algorithm with bike category, ambition, flexibility, and core stability inputs.",
  keywords: [
    "saddle height calculator",
    "bike fit saddle height",
    "cycling saddle position",
  ],
  openGraph: {
    title: "Saddle Height Calculator",
    description:
      "Get an algorithm-based saddle height estimate and safe adjustment range.",
    type: "website",
  },
};

interface SaddleHeightCalculatorPageProps {
  searchParams: Promise<SearchParamRecord>;
}

export default async function SaddleHeightCalculatorPage({
  searchParams,
}: SaddleHeightCalculatorPageProps) {
  const params = await searchParams;
  const submittedInseam = getFirstSearchParam(params, "inseamCm");
  const hasSubmitted = submittedInseam !== undefined;
  const inseamCm = parsePositiveNumberParam(params, "inseamCm");
  const category = parseBikeCategory(getFirstSearchParam(params, "category"));
  const ambition = parseAmbition(getFirstSearchParam(params, "ambition"));
  const flexibility = parseScore1to5(getFirstSearchParam(params, "flexibility"), 3);
  const core = parseScore1to5(getFirstSearchParam(params, "core"), 3);

  let error: string | null = null;
  let recommendation: { saddleHeightMm: number; minMm: number; maxMm: number } | null = null;

  if (hasSubmitted) {
    if (inseamCm === null || inseamCm < 55 || inseamCm > 105) {
      error = "Please enter inseam between 55 and 105 cm.";
    } else {
      const inseamMm = Math.round(inseamCm * 10);
      const flexScore = mapFlexibilityScore(flexibility);
      const coreScore = mapCoreScore(core);

      const ctx: CalculationContext = {
        inputs: {
          category,
          ambition,
          heightMm: 1750,
          inseamMm,
          flexibilityScore: flexScore,
          coreScore,
        },
        flexIndex: flexScore - 5,
        coreIndex: coreScore - 5,
      };

      const result = calculateSaddleHeight(ctx);
      recommendation = {
        saddleHeightMm: result.height,
        minMm: result.range.min,
        maxMm: result.range.max,
      };
    }
  }

  const pageUrl = new URL("/calculators/saddle-height", BRAND.siteUrl).toString();
  const faqs = [
    {
      q: "How do I measure inseam for saddle height?",
      a: "Stand barefoot, place a book firmly between the legs, and measure from floor to the top of the book.",
    },
    {
      q: "Why does flexibility affect saddle-height guidance?",
      a: "The calculator combines inseam with riding context. Flexibility and core affect the wider fit posture around the saddle, which matters when choosing a safe starting point.",
    },
  ];
  const helperPoints = [
    "Use a careful barefoot inseam measurement rather than trouser size.",
    "Treat the result as a starting point, then validate it over a few rides.",
    "Flexibility and core stability matter because they change how sustainable the position feels.",
  ];

  return (
    <div className="py-16 text-foreground">
      <JsonLd
        schema={[
          buildWebApplicationSchema({
            name: "BestBikeFit4U Saddle Height Calculator",
            description:
              "Calculate recommended saddle height using the BestBikeFit4U algorithm with bike category, ambition, flexibility, and core stability inputs.",
            url: pageUrl,
          }),
          buildFaqPageSchema(faqs),
          buildHowToSchema({
            name: "How to calculate saddle height",
            description: "Quick process for getting a safe saddle-height starting point.",
            steps: [
              "Measure your inseam carefully.",
              "Choose bike category and riding goal.",
              "Rate flexibility and core stability.",
              "Use the result as a starting point and test it conservatively.",
            ],
          }),
        ]}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <section className="rounded-[28px] border border-border bg-[color:color-mix(in_oklch,var(--card)_88%,var(--primary)_12%)] p-8 shadow-sm sm:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              BestBikeFit4U calculator
            </p>
            <h1 className="mt-4 text-4xl font-bold text-foreground sm:text-5xl">
              Saddle Height Calculator
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Get a clean, conservative saddle-height baseline before you start making larger fit changes.
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
                Build your starting point
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Inseam sets the baseline. Category, ambition, flexibility, and core help refine how aggressive the recommendation can be.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Input
                label="Inseam (cm)"
                id="saddle-height-inseam"
                name="inseamCm"
                type="number"
                min={55}
                max={105}
                step="0.1"
                defaultValue={submittedInseam ?? ""}
                tooltip="Stand barefoot, place a book firmly between the legs, and measure from floor to the top of the book."
                required
              />
              <Select
                label="Bike Category"
                id="saddle-height-category"
                name="category"
                defaultValue={category}
                tooltip="Choose the category that matches your bike and intended use."
                options={PUBLIC_BIKE_CATEGORY_OPTIONS}
              />
              <Select
                label="Riding Goal"
                id="saddle-height-ambition"
                name="ambition"
                defaultValue={ambition}
                tooltip="Choose whether your setup should prioritize comfort, balance, performance, or aerodynamics."
                options={AMBITION_OPTIONS}
              />
              <Input
                label="Flexibility (1-5)"
                id="saddle-height-flexibility"
                name="flexibility"
                type="number"
                min={1}
                max={5}
                defaultValue={flexibility}
                tooltip="1 = very stiff, 5 = very flexible."
              />
              <Input
                label="Core Stability (1-5)"
                id="saddle-height-core"
                name="core"
                type="number"
                min={1}
                max={5}
                defaultValue={core}
                tooltip="1 = low, 5 = strong."
              />
            </div>

            <Button type="submit" className="mt-6">
              Calculate saddle height
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
          <h2 className="mt-2 text-2xl font-semibold text-foreground">Your baseline</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Use this as a safe starting point, not as the final word.
          </p>

          {recommendation ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-primary/20 bg-primary-soft p-5">
                <p className="text-sm text-muted-foreground">Recommended saddle height</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  {recommendation.saddleHeightMm} mm
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-[color:var(--secondary)] p-5">
                <p className="text-sm text-muted-foreground">Safe starting band</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {recommendation.minMm}-{recommendation.maxMm} mm
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-[color:var(--secondary)] px-4 py-5 text-sm text-muted-foreground">
              Enter your details to generate a first-pass saddle-height recommendation.
            </div>
          )}
        </section>

        <section className="mt-10 rounded-3xl border border-border bg-[color:color-mix(in_oklch,var(--card)_88%,var(--secondary)_12%)] p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-foreground">Next step</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Once you know the saddle baseline, compare it against reach, drop, and frame targets so the whole position stays coherent.
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
          links={getRelatedLinks("saddle-height", "en")}
          locale="en"
        />
      </div>
    </div>
  );
}
