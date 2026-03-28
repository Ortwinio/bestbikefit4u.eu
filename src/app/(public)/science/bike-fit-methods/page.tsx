import type { Metadata } from "next";
import { BookOpen, Compass, Ruler } from "lucide-react";
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
  title: "Bike Fit Methods Comparison | BestBikeFit4U Science",
  description:
    "Compare common bike fitting methods including LeMond, KOPS, and dynamic fit systems, and see where each method is useful.",
  keywords: [
    "bike fit methods",
    "LeMond method",
    "KOPS bike fit",
    "bike fitting comparison",
  ],
  openGraph: {
    title: "Bike Fit Methods Comparison",
    description:
      "A practical comparison of major bike fitting methods and where they fit in modern workflows.",
    type: "article",
  },
};

const methods = [
  {
    name: "LeMond / Hamley Saddle Height",
    focus: "Baseline saddle height from inseam",
    strength: "Simple and repeatable starting point",
    limit: "Needs personal adjustment for flexibility and goals",
  },
  {
    name: "KOPS (Knee Over Pedal Spindle)",
    focus: "Saddle fore-aft reference",
    strength: "Easy workshop reference",
    limit: "Not a complete performance model",
  },
  {
    name: "Dynamic / Motion-Capture Fit",
    focus: "Joint angles under pedaling load",
    strength: "Rich movement data",
    limit: "Requires equipment and specialist time",
  },
];

const links = [
  { href: "/science/calculation-engine", label: "Calculation Engine" },
  { href: "/science/stack-and-reach", label: "Stack and Reach Guide" },
  { href: "/calculators/crank-length", label: "Crank Length Calculator" },
  { href: "/guides/road-bike-fit-guide", label: "Road Bike Fit Guide" },
  { href: "/guides/mountain-bike-fit-guide", label: "Mountain Bike Fit Guide" },
];

export default async function BikeFitMethodsPage() {
  const locale = await getRequestLocale();
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Bike Fit Methods Comparison",
    description:
      "Comparison of LeMond, KOPS, and dynamic fitting approaches.",
    author: {
      "@type": "Organization",
      name: "BestBikeFit4U",
    },
    mainEntityOfPage: "/science/bike-fit-methods",
  };

  return (
    <PublicPageShell className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--secondary)_22%,var(--background)_78%)_100%)] text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <PublicHero
        eyebrow="Science"
        title="Bike Fit Methods"
        description="Modern fitting combines foundational formulas with rider-specific context. No single method solves everything in isolation."
        chips={["LeMond / Hamley", "KOPS", "Dynamic fit"]}
        illustration={
          <PublicIllustrationPanel
            caption="Different methods answer different questions inside the full fit workflow."
            className="w-full"
          >
            <div className="grid w-full gap-3">
              {[
                { icon: <Ruler className="h-5 w-5" />, label: "Baseline geometry" },
                { icon: <Compass className="h-5 w-5" />, label: "Saddle position reference" },
                { icon: <BookOpen className="h-5 w-5" />, label: "Dynamic movement validation" },
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
          eyebrow: "Comparison",
          title: "Where each method fits",
          description:
            "Use formulas as strong starting points, then validate them against the rider’s stability, flexibility, and real riding context.",
        }}
      >
        <div className="grid gap-5">
          {methods.map((method) => (
            <PublicSurfaceCard
              key={method.name}
              title={method.name}
              description={method.focus}
              leading={<Ruler className="h-5 w-5" />}
            >
              <div className="space-y-2 text-sm leading-6">
                <p className="text-[color:var(--muted-foreground)]">
                  <span className="font-semibold text-[color:var(--foreground)]">
                    Strength:
                  </span>{" "}
                  {method.strength}
                </p>
                <p className="text-[color:var(--muted-foreground)]">
                  <span className="font-semibold text-[color:var(--foreground)]">
                    Limit:
                  </span>{" "}
                  {method.limit}
                </p>
              </div>
            </PublicSurfaceCard>
          ))}
        </div>
      </PublicSection>

      <RelatedLinksSection title="Related resources" links={links} locale={locale} />
    </PublicPageShell>
  );
}
