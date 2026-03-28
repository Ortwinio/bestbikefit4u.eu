import type { Metadata } from "next";
import { Calculator, ShieldCheck, SlidersHorizontal } from "lucide-react";
import {
  PublicHero,
  PublicIllustrationPanel,
  PublicPageShell,
  PublicSection,
  PublicSurfaceCard,
} from "@/components/public";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { getRequestLocale } from "@/i18n/request";

export const metadata: Metadata = {
  title: "Bike Fit Calculation Engine | BestBikeFit4U Science",
  description:
    "Detailed explanation of the BestBikeFit4U calculation engine: input validation, saddle height, reach, bar drop, and frame target logic.",
  keywords: [
    "bike fit calculation engine",
    "cycling fit algorithm",
    "saddle height calculation",
    "stack reach algorithm",
  ],
  openGraph: {
    title: "Bike Fit Calculation Engine",
    description:
      "Understand how BestBikeFit4U transforms rider measurements into setup recommendations.",
    type: "article",
  },
};

const relatedLinks = [
  { href: "/science/stack-and-reach", label: "Stack and Reach Guide" },
  { href: "/science/bike-fit-methods", label: "Bike Fit Methods Comparison" },
  { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
  { href: "/calculators/frame-size", label: "Frame Size Calculator" },
  { href: "/guides/bike-fitting-for-knee-pain", label: "Bike Fitting for Knee Pain" },
  { href: "/guides/triathlon-bike-fit-guide", label: "Triathlon Bike Fit Guide" },
];

export default async function CalculationEnginePage() {
  const locale = await getRequestLocale();
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Bike Fit Calculation Engine",
    description:
      "How BestBikeFit4U calculates saddle height, bar drop, reach, and frame targets from rider inputs.",
    author: {
      "@type": "Organization",
      name: "BestBikeFit4U",
    },
    mainEntityOfPage: "/science/calculation-engine",
  };

  return (
    <PublicPageShell className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--muted)_24%,var(--background)_76%)_100%)] text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <PublicHero
        eyebrow="Science"
        title="Calculation Engine"
        description="The BestBikeFit4U engine combines validated measurement rules with proven bike-fit equations to produce actionable setup recommendations."
        chips={["Input validation", "Geometry outputs", "Safety guardrails"]}
        illustration={
          <PublicIllustrationPanel
            caption="The engine reduces raw rider input into repeatable setup targets."
            className="w-full"
          >
            <div className="grid w-full gap-3">
              {[
                { icon: <Calculator className="h-5 w-5" />, label: "Measurements in" },
                { icon: <SlidersHorizontal className="h-5 w-5" />, label: "Fit targets out" },
                { icon: <ShieldCheck className="h-5 w-5" />, label: "Guardrails applied" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--primary-soft)] text-[color:var(--primary)]">
                    {item.icon}
                  </div>
                  <span className="text-sm font-semibold text-[color:var(--foreground)]">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </PublicIllustrationPanel>
        }
      />

      <PublicSection
        header={{
          eyebrow: "Pipeline",
          title: "How the engine works",
          description:
            "Each layer narrows uncertainty: first clean the input, then calculate fit values, then translate those values into practical setup guidance.",
        }}
      >
        <div className="grid gap-5">
          <PublicSurfaceCard
            title="1. Input Validation"
            description="Required measurements are checked against hard limits before the fit calculation begins."
            leading={<ShieldCheck className="h-5 w-5" />}
          />
          <PublicSurfaceCard
            title="2. Core Geometry Outputs"
            description="The engine calculates crank length, saddle height, setback, drop, and reach from inseam, category, flexibility, core stability, and ambition profile."
            leading={<Calculator className="h-5 w-5" />}
          />
          <PublicSurfaceCard
            title="3. Frame Targets"
            description="Stack and reach targets are derived from saddle and cockpit coordinates, then translated into realistic stem and spacer combinations."
            leading={<SlidersHorizontal className="h-5 w-5" />}
          />
          <PublicSurfaceCard
            title="4. Safety Guardrails"
            description="Warnings flag aggressive drop, out-of-range reach, and risky saddle heights so riders can apply changes more conservatively."
            leading={<ShieldCheck className="h-5 w-5" />}
          />
        </div>
      </PublicSection>

      <RelatedLinksSection title="Related guides" links={relatedLinks} locale={locale} />
    </PublicPageShell>
  );
}
