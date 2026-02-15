import type { Metadata } from "next";
import Link from "next/link";
import { FieldLabel } from "@/components/ui";
import { calculateCrankLength } from "../../../../../convex/lib/fitAlgorithm/calculations";
import {
  PUBLIC_BIKE_CATEGORY_OPTIONS,
  getFirstSearchParam,
  parseBikeCategory,
  parsePositiveNumberParam,
  type SearchParamRecord,
} from "@/lib/publicCalculators";

export const metadata: Metadata = {
  title: "Crank Length Calculator | BikeFit AI",
  description:
    "Calculate recommended crank length from inseam and bike category using BikeFit AI fit algorithm logic.",
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

  const calculatorJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BikeFit AI Crank Length Calculator",
    url: "/calculators/crank-length",
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
        <h1 className="text-4xl font-bold text-gray-900">Crank Length Calculator</h1>
        <p className="mt-4 text-lg text-gray-600">
          Uses the fit engine&apos;s inseam lookup table with bike-category
          adjustments.
        </p>

        <form className="mt-10 rounded-xl border border-gray-200 bg-white p-6" method="GET">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel
                label="Inseam (cm)"
                htmlFor="crank-length-inseam"
                tooltip="Barefoot inseam: feet 10–15 cm apart, press a book firmly into the crotch, measure floor to book top (cm). Primary input for saddle height (typical 55–105 cm)."
              />
              <input
                id="crank-length-inseam"
                name="inseamCm"
                type="number"
                min={55}
                max={105}
                step="0.1"
                defaultValue={submittedInseam ?? ""}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                required
              />
            </div>

            <div>
              <FieldLabel
                label="Bike Category"
                htmlFor="crank-length-category"
                tooltip="Choose the category that matches your bike and intended use. This adjusts comfort vs. aerodynamics assumptions."
              />
              <select
                id="crank-length-category"
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

        {crankLengthMm !== null && (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-6">
            <h2 className="text-xl font-semibold text-gray-900">Result</h2>
            <p className="mt-3 text-gray-800">
              Recommended crank length:{" "}
              <span className="font-bold">{crankLengthMm} mm</span>
            </p>
          </div>
        )}

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          <Link
            href="/calculators/saddle-height"
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            Saddle Height Calculator
          </Link>
          <Link
            href="/calculators/frame-size"
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            Frame Size Calculator
          </Link>
          <Link
            href="/science/bike-fit-methods"
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            Bike Fit Methods
          </Link>
        </div>
      </div>
    </div>
  );
}
