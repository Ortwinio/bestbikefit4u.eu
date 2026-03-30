import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { Button } from "@/components/ui";
import { BRAND } from "@/config/brand";
import {
  buildFaqPageSchema,
  buildHowToSchema,
  buildWebApplicationSchema,
} from "@/lib/seo/jsonLd";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";
import { SaddleHeightCalculatorForm } from "./SaddleHeightCalculatorForm";

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

export default async function SaddleHeightCalculatorPage() {
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

        <SaddleHeightCalculatorForm />

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
