import type { Metadata } from "next";
import Link from "next/link";
import { FieldLabel } from "@/components/ui";
import { mapCoreScore, mapFlexibilityScore } from "../../../../../convex/lib/fitAlgorithm";
import { calculateSaddleHeight } from "../../../../../convex/lib/fitAlgorithm/calculations";
import type { CalculationContext } from "../../../../../convex/lib/fitAlgorithm/types";
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
  title: "Saddle Height Calculator | BikeFit AI",
  description:
    "Calculate recommended saddle height using the BikeFit AI algorithm with bike category, ambition, flexibility, and core stability inputs.",
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

  const calculatorJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BikeFit AI Saddle Height Calculator",
    url: "/calculators/saddle-height",
    applicationCategory: "SportsApplication",
    operatingSystem: "Any",
  };

  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorJsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900">Saddle Height Calculator</h1>
        <p className="mt-4 text-lg text-gray-600">
          Uses the production BikeFit AI saddle-height formula from the fit
          engine, including flexibility, core, and ambition modifiers.
        </p>

        <form className="mt-10 rounded-xl border border-gray-200 bg-white p-6" method="GET">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel
                label="Inseam (cm)"
                htmlFor="saddle-height-inseam"
                tooltip="Barefoot inseam: feet 10-15 cm apart, press a book firmly into the crotch, measure floor to book top (cm). Primary input for saddle height (typical 55-105 cm)."
              />
              <input
                id="saddle-height-inseam"
                name="inseamCm"
                type="number"
                step="0.1"
                min={55}
                max={105}
                defaultValue={submittedInseam ?? ""}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                required
              />
            </div>

            <div>
              <FieldLabel
                label="Bike Category"
                htmlFor="saddle-height-category"
                tooltip="Choose the category that matches your bike and intended use. This adjusts comfort vs. aerodynamics assumptions."
              />
              <select
                id="saddle-height-category"
                name="category"
                defaultValue={category}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              >
                {PUBLIC_BIKE_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel
                label="Riding Goal"
                htmlFor="saddle-height-ambition"
                tooltip="Pick your primary goal (comfort, endurance, race, TT/aero). The app will trade off stability, comfort, and aerodynamics accordingly."
              />
              <select
                id="saddle-height-ambition"
                name="ambition"
                defaultValue={ambition}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              >
                {AMBITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel
                label="Flexibility (1-5)"
                htmlFor="saddle-height-flexibility"
                tooltip="Rate hamstring/hip flexibility: 1 = very limited (cannot touch toes), 3 = toes, 5 = palms on floor. Lower scores reduce handlebar drop and reach."
              />
              <input
                id="saddle-height-flexibility"
                name="flexibility"
                type="number"
                min={1}
                max={5}
                defaultValue={flexibility}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>

            <div>
              <FieldLabel
                label="Core Stability (1-5)"
                htmlFor="saddle-height-core"
                tooltip="Rate core stability: 1 = <45s stable plank, 3 = ~60s, 5 = 90s+ controlled. Lower scores reduce aggressive reach/drop to protect the lower back."
              />
              <input
                id="saddle-height-core"
                name="core"
                type="number"
                min={1}
                max={5}
                defaultValue={core}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Calculate
          </button>
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

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          <Link
            href="/calculators/frame-size"
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            Frame Size Calculator
          </Link>
          <Link
            href="/calculators/crank-length"
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            Crank Length Calculator
          </Link>
          <Link
            href="/science/calculation-engine"
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            Calculation Engine Notes
          </Link>
        </div>
      </div>
    </div>
  );
}
