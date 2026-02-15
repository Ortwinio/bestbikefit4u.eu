import type { Metadata } from "next";
import Link from "next/link";
import { FieldLabel } from "@/components/ui";
import { calculateQuickEstimate } from "../../../../../convex/lib/fitAlgorithm";
import {
  PUBLIC_BIKE_CATEGORY_OPTIONS,
  getFirstSearchParam,
  parseBikeCategory,
  parsePositiveNumberParam,
  type SearchParamRecord,
} from "@/lib/publicCalculators";

export const metadata: Metadata = {
  title: "Frame Size Calculator | BikeFit AI",
  description:
    "Estimate bike frame size using BikeFit AI algorithm functions based on height, inseam, and bike category.",
  keywords: [
    "frame size calculator",
    "bike size calculator",
    "road bike size estimate",
    "gravel bike sizing",
  ],
  openGraph: {
    title: "Frame Size Calculator",
    description:
      "Get a quick frame size estimate powered by the BikeFit AI fit engine.",
    type: "website",
  },
};

interface FrameSizeCalculatorPageProps {
  searchParams: Promise<SearchParamRecord>;
}

export default async function FrameSizeCalculatorPage({
  searchParams,
}: FrameSizeCalculatorPageProps) {
  const params = await searchParams;
  const submittedHeight = getFirstSearchParam(params, "heightCm");
  const submittedInseam = getFirstSearchParam(params, "inseamCm");
  const hasSubmitted = submittedHeight !== undefined || submittedInseam !== undefined;
  const heightCm = parsePositiveNumberParam(params, "heightCm");
  const inseamCm = parsePositiveNumberParam(params, "inseamCm");
  const category = parseBikeCategory(getFirstSearchParam(params, "category"));

  let error: string | null = null;
  let result: { frameSize: string; saddleHeightMm: number } | null = null;

  if (hasSubmitted) {
    if (heightCm === null || inseamCm === null) {
      error = "Please enter valid numeric values for height and inseam.";
    } else if (heightCm < 130 || heightCm > 210) {
      error = "Please enter height between 130 and 210 cm.";
    } else if (inseamCm < 55 || inseamCm > 105) {
      error = "Please enter inseam between 55 and 105 cm.";
    } else if (inseamCm >= heightCm) {
      error = "Inseam cannot be equal to or greater than total height.";
    } else {
      const estimate = calculateQuickEstimate({
        heightMm: Math.round(heightCm * 10),
        inseamMm: Math.round(inseamCm * 10),
        category,
      });
      result = {
        frameSize: estimate.estimatedFrameSize,
        saddleHeightMm: estimate.estimatedSaddleHeight,
      };
    }
  }

  const calculatorJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BikeFit AI Frame Size Calculator",
    url: "/calculators/frame-size",
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
        <h1 className="text-4xl font-bold text-gray-900">Frame Size Calculator</h1>
        <p className="mt-4 text-lg text-gray-600">
          Quick frame-size estimate using the fit engine&apos;s
          category-specific size bands and saddle-height baseline.
        </p>

        <form className="mt-10 rounded-xl border border-gray-200 bg-white p-6" method="GET">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel
                label="Height (cm)"
                htmlFor="frame-size-height"
                tooltip="Stand barefoot against a wall. Measure floor to top of head (cm). Used for initial frame-size and reach estimates (typical 130–210 cm)."
              />
              <input
                id="frame-size-height"
                name="heightCm"
                type="number"
                min={130}
                max={210}
                step="0.1"
                defaultValue={submittedHeight ?? ""}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                required
              />
            </div>

            <div>
              <FieldLabel
                label="Inseam (cm)"
                htmlFor="frame-size-inseam"
                tooltip="Barefoot inseam: feet 10–15 cm apart, press a book firmly into the crotch, measure floor to book top (cm). Primary input for saddle height (typical 55–105 cm)."
              />
              <input
                id="frame-size-inseam"
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

            <div className="sm:col-span-2">
              <FieldLabel
                label="Bike Category"
                htmlFor="frame-size-category"
                tooltip="Choose the category that matches your bike and intended use. This adjusts comfort vs. aerodynamics assumptions."
              />
              <select
                id="frame-size-category"
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

        {result && (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-6">
            <h2 className="text-xl font-semibold text-gray-900">Result</h2>
            <p className="mt-3 text-gray-800">
              Estimated frame size: <span className="font-bold">{result.frameSize}</span>
            </p>
            <p className="mt-1 text-sm text-gray-700">
              Estimated saddle-height baseline: {result.saddleHeightMm} mm
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
            href="/calculators/crank-length"
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            Crank Length Calculator
          </Link>
          <Link
            href="/science/stack-and-reach"
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            Stack and Reach Guide
          </Link>
        </div>
      </div>
    </div>
  );
}
