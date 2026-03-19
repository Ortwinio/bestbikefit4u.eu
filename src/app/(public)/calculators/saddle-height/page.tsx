import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { Button, Input, Select } from "@/components/ui";
import { BRAND } from "@/config/brand";
import { mapCoreScore, mapFlexibilityScore } from "../../../../../convex/lib/fitAlgorithm";
import { calculateSaddleHeight } from "../../../../../convex/lib/fitAlgorithm/calculations";
import type { CalculationContext } from "../../../../../convex/lib/fitAlgorithm/types";
import { buildFaqPageSchema, buildHowToSchema, buildWebApplicationSchema } from "@/lib/seo/jsonLd";
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

  return (
    <div className="py-16">
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
        <h1 className="text-4xl font-bold text-gray-900">Saddle Height Calculator</h1>
        <p className="mt-4 text-lg text-gray-600">
          Uses the production BestBikeFit4U saddle-height formula from the fit
          engine, including flexibility, core, and ambition modifiers.
        </p>

        <form className="mt-10 rounded-xl border border-gray-200 bg-white p-6" method="GET">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Inseam (cm)"
              id="saddle-height-inseam"
              name="inseamCm"
              type="number"
              step="0.1"
              min={55}
              max={105}
              defaultValue={submittedInseam ?? ""}
              tooltip="Barefoot inseam: feet 10-15 cm apart, press a book firmly into the crotch, measure floor to book top (cm). Primary input for saddle height (typical 55-105 cm)."
              required
            />

            <Select
              label="Bike Category"
              id="saddle-height-category"
              name="category"
              defaultValue={category}
              tooltip="Choose the category that matches your bike and intended use. This adjusts comfort vs. aerodynamics assumptions."
              options={PUBLIC_BIKE_CATEGORY_OPTIONS}
            />

            <Select
              label="Riding Goal"
              id="saddle-height-ambition"
              name="ambition"
              defaultValue={ambition}
              tooltip="Pick your primary goal (comfort, endurance, race, TT/aero). The app will trade off stability, comfort, and aerodynamics accordingly."
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
              tooltip="Rate hamstring/hip flexibility: 1 = very limited (cannot touch toes), 3 = toes, 5 = palms on floor. Lower scores reduce handlebar drop and reach."
            />

            <Input
              label="Core Stability (1-5)"
              id="saddle-height-core"
              name="core"
              type="number"
              min={1}
              max={5}
              defaultValue={core}
              tooltip="Rate core stability: 1 = <45s stable plank, 3 = ~60s, 5 = 90s+ controlled. Lower scores reduce aggressive reach/drop to protect the lower back."
            />
          </div>

          <Button type="submit" className="mt-6">
            Calculate
          </Button>
        </form>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {recommendation && (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-6">
            <h2 className="text-xl font-semibold text-gray-900">Result</h2>
            <p className="mt-3 text-gray-800">
              Recommended saddle height:{" "}
              <span className="font-bold">{recommendation.saddleHeightMm} mm</span>
            </p>
            <p className="mt-1 text-sm text-gray-700">
              Suggested adjustment band: {recommendation.minMm}-{recommendation.maxMm} mm
            </p>
          </div>
        )}

        <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-2xl font-semibold text-gray-900">FAQ</h2>
          <div className="mt-4 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-semibold text-gray-900">{faq.q}</h3>
                <p className="mt-1 text-gray-600">{faq.a}</p>
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
