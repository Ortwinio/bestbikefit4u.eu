import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { Button } from "@/components/ui";
import { BRAND } from "@/config/brand";
import { buildFaqPageSchema, buildWebApplicationSchema } from "@/lib/seo/jsonLd";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";
import { FrameSizeCalculatorForm } from "./FrameSizeCalculatorForm";

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

export default async function FrameSizeCalculatorPage() {
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

        <FrameSizeCalculatorForm />

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
