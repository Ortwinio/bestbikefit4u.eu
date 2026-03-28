import type { Metadata } from "next";
import Link from "next/link";
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
  const helperPoints = [
    "Frame size is the first filter, not the final answer.",
    "Inseam changes your realistic saddle-height baseline and therefore the sizes that make sense.",
    "Use this to shortlist bikes before you compare full fit targets.",
  ];

  return (
    <div className="py-16 text-foreground">
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
        <section className="rounded-[28px] border border-border bg-[color:color-mix(in_oklch,var(--card)_88%,var(--primary)_12%)] p-8 shadow-sm sm:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              BestBikeFit4U calculator
            </p>
            <h1 className="mt-4 text-4xl font-bold text-foreground sm:text-5xl">
              Frame Size Calculator
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Shortlist realistic frame sizes before you compare bikes, parts, and setup changes.
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
                Estimate your size band
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Height, inseam, and category are enough for a reliable first-pass size estimate.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Input
                label="Height (cm)"
                id="frame-size-height"
                name="heightCm"
                type="number"
                min={130}
                max={210}
                step="0.1"
                defaultValue={submittedHeight ?? ""}
                tooltip="Stand barefoot against a wall. Measure floor to top of head in centimeters."
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
                tooltip="Measure from floor to the top of a book held firmly between the legs."
                required
              />
              <div className="sm:col-span-2">
                <Select
                  label="Bike Category"
                  id="frame-size-category"
                  name="category"
                  defaultValue={category}
                  tooltip="Choose the category that matches your bike and intended use."
                  options={PUBLIC_BIKE_CATEGORY_OPTIONS}
                />
              </div>
            </div>

            <Button type="submit" className="mt-6">
              Calculate frame size
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
          <h2 className="mt-2 text-2xl font-semibold text-foreground">Your shortlist baseline</h2>
          {result ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-primary/20 bg-primary-soft p-5">
                <p className="text-sm text-muted-foreground">Estimated frame size</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">{result.frameSize}</p>
              </div>
              <div className="rounded-2xl border border-border bg-[color:var(--secondary)] p-5">
                <p className="text-sm text-muted-foreground">Saddle-height baseline</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {result.saddleHeightMm} mm
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-[color:var(--secondary)] px-4 py-5 text-sm text-muted-foreground">
              Enter your details to estimate a realistic frame-size range.
            </div>
          )}
        </section>

        <section className="mt-10 rounded-3xl border border-border bg-[color:color-mix(in_oklch,var(--card)_88%,var(--secondary)_12%)] p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-foreground">Next step</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Once you know the likely size range, compare reach, drop, and overall fit targets so the bike works in practice, not just on paper.
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
          links={getRelatedLinks("frame-size", "en")}
          locale="en"
        />
      </div>
    </div>
  );
}
