import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { Button, Input, Select } from "@/components/ui";
import { BRAND } from "@/config/brand";
import { calculateQuickEstimate } from "../../../../../convex/lib/fitAlgorithm";
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
  title: "Frame Size Calculator | BestBikeFit4U",
  description:
    "Estimate bike frame size using BestBikeFit4U algorithm functions based on height, inseam, and bike category.",
  keywords: [
    "frame size calculator",
    "bike size calculator",
    "road bike size estimate",
    "gravel bike sizing",
  ],
  openGraph: {
    title: "Frame Size Calculator",
    description:
      "Get a quick frame size estimate powered by the BestBikeFit4U fit engine.",
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

  const pageUrl = new URL("/calculators/frame-size", BRAND.siteUrl).toString();
  const faqs = [
    {
      q: "Can a frame-size calculator replace a complete bike fit?",
      a: "No. Frame size is only one part of the fit. Reach, drop, and contact points still determine whether the bike works well for you.",
    },
    {
      q: "Why does inseam matter for frame size?",
      a: "It strongly affects saddle height and overall proportions, which influence which size ranges are realistic.",
    },
  ];

  return (
    <div className="py-16">
      <JsonLd
        schema={[
          buildWebApplicationSchema({
            name: "BestBikeFit4U Frame Size Calculator",
            description:
              "Estimate bike frame size using BestBikeFit4U algorithm functions based on height, inseam, and bike category.",
            url: pageUrl,
          }),
          buildFaqPageSchema(faqs),
        ]}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900">Frame Size Calculator</h1>
        <p className="mt-4 text-lg text-gray-600">
          Quick frame-size estimate using the fit engine&apos;s
          category-specific size bands and saddle-height baseline.
        </p>

        <form className="mt-10 rounded-xl border border-gray-200 bg-white p-6" method="GET">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Height (cm)"
              id="frame-size-height"
              name="heightCm"
              type="number"
              min={130}
              max={210}
              step="0.1"
              defaultValue={submittedHeight ?? ""}
              tooltip="Stand barefoot against a wall. Measure floor to top of head (cm). Used for initial frame-size and reach estimates (typical 130–210 cm)."
              required
            />

            <Input
              label="Inseam (cm)"
              id="frame-size-inseam"
              name="inseamCm"
              type="number"
              min={55}
              max={105}
              step="0.1"
              defaultValue={submittedInseam ?? ""}
              tooltip="Barefoot inseam: feet 10–15 cm apart, press a book firmly into the crotch, measure floor to book top (cm). Primary input for saddle height (typical 55–105 cm)."
              required
            />

            <div className="sm:col-span-2">
              <Select
                label="Bike Category"
                id="frame-size-category"
                name="category"
                defaultValue={category}
                tooltip="Choose the category that matches your bike and intended use. This adjusts comfort vs. aerodynamics assumptions."
                options={PUBLIC_BIKE_CATEGORY_OPTIONS}
              />
            </div>
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
          links={getRelatedLinks("frame-size", "en")}
          locale="en"
        />
      </div>
    </div>
  );
}
