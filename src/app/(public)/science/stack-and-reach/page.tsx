import type { Metadata } from "next";
import { ArrowUpDown, Bike, MoveHorizontal } from "lucide-react";
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
  title: "Stack and Reach Explained | BestBikeFit4U Science",
  description:
    "Learn how stack and reach work, why they are better than seat-tube sizing, and how to use them for frame comparison.",
  keywords: [
    "stack and reach explained",
    "bike frame sizing",
    "frame stack reach",
    "cycling geometry guide",
  ],
  openGraph: {
    title: "Stack and Reach Explained",
    description:
      "A practical guide to using stack and reach to choose and compare bike frames.",
    type: "article",
  },
};

const links = [
  { href: "/science/calculation-engine", label: "Calculation Engine" },
  { href: "/science/bike-fit-methods", label: "Fit Methods Comparison" },
  { href: "/calculators/frame-size", label: "Frame Size Calculator" },
  { href: "/guides/road-bike-fit-guide", label: "Road Bike Fit Guide" },
  { href: "/guides/gravel-bike-fit-guide", label: "Gravel Bike Fit Guide" },
];

export default async function StackAndReachPage() {
  const locale = await getRequestLocale();
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Stack and Reach Explained",
    description:
      "How stack and reach describe bike geometry and improve frame selection accuracy.",
    author: {
      "@type": "Organization",
      name: "BestBikeFit4U",
    },
    mainEntityOfPage: "/science/stack-and-reach",
  };

  return (
    <PublicPageShell className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--secondary)_20%,var(--background)_80%)_100%)] text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <PublicHero
        eyebrow="Science"
        title="Stack and Reach"
        description="Stack and reach provide a consistent way to compare bike frames across brands without relying on inconsistent size labels."
        chips={["Vertical fit", "Horizontal fit", "Frame comparison"]}
        illustration={
          <PublicIllustrationPanel
            caption="These two coordinates say more about rider position than a nominal frame size alone."
            className="w-full"
          >
            <div className="grid w-full gap-3">
              {[
                { icon: <ArrowUpDown className="h-5 w-5" />, label: "Stack = vertical distance" },
                { icon: <MoveHorizontal className="h-5 w-5" />, label: "Reach = horizontal distance" },
                { icon: <Bike className="h-5 w-5" />, label: "Useful across brands" },
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
          eyebrow: "Core concepts",
          title: "The geometry references that actually travel between frames",
          description:
            "Seat-tube sizing hides too much variation. Stack and reach give you a cleaner baseline when you want to compare positions from one frame to another.",
        }}
      >
        <div className="grid gap-5">
          <PublicSurfaceCard
            title="What is stack?"
            description="Stack is the vertical distance from the bottom bracket to the top center of the head tube. Higher stack generally means a more upright riding posture."
            leading={<ArrowUpDown className="h-5 w-5" />}
          />
          <PublicSurfaceCard
            title="What is reach?"
            description="Reach is the horizontal distance from the bottom bracket to the same head-tube reference point. Longer reach usually creates a more stretched cockpit."
            leading={<MoveHorizontal className="h-5 w-5" />}
          />
          <PublicSurfaceCard
            title="Why it matters"
            description="Stack and reach reflect real rider position and are the best baseline when matching a frame to fit targets."
            leading={<Bike className="h-5 w-5" />}
          />
        </div>
      </PublicSection>

      <RelatedLinksSection title="Continue reading" links={links} locale={locale} />
    </PublicPageShell>
  );
}
