import type { Metadata } from "next";
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
        <h1 className="text-4xl font-bold text-foreground">Crank Length Calculator</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Uses the fit engine&apos;s inseam lookup table with bike-category
          adjustments.
        </p>

        <form className="mt-10 rounded-xl border border-border bg-card p-6" method="GET">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Inseam (cm)"
              id="crank-length-inseam"
              name="inseamCm"
              type="number"
              min={55}
              max={105}
              step="0.1"
              defaultValue={submittedInseam ?? ""}
              tooltip="Barefoot inseam: feet 10–15 cm apart, press a book firmly into the crotch, measure floor to book top (cm). Primary input for saddle height (typical 55–105 cm)."
              required
            />

            <Select
              label="Bike Category"
              id="crank-length-category"
              name="category"
              defaultValue={category}
              tooltip="Choose the category that matches your bike and intended use. This adjusts comfort vs. aerodynamics assumptions."
              options={PUBLIC_BIKE_CATEGORY_OPTIONS}
            />
          </div>

          <Button type="submit" className="mt-6">
            Calculate
          </Button>
        </form>

        {error && (
          <div className="mt-6 rounded-lg border border-destructive/20 bg-destructive-soft px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {crankLengthMm !== null && (
          <div className="mt-6 rounded-xl border border-primary/20 bg-primary-soft p-6">
            <h2 className="text-xl font-semibold text-foreground">Result</h2>
            <p className="mt-3 text-foreground">
              Recommended crank length:{" "}
              <span className="font-bold">{crankLengthMm} mm</span>
            </p>
          </div>
        )}

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
