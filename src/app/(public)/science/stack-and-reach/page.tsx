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
import type { Locale } from "@/i18n/config";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { BRAND } from "@/config/brand";

const copy: Record<
  Locale,
  {
    metadata: { title: string; description: string; keywords: string[] };
    hero: {
      eyebrow: string;
      title: string;
      description: string;
      chips: string[];
      caption: string;
      labels: string[];
    };
    section: { eyebrow: string; title: string; description: string };
    cards: Array<{ title: string; description: string }>;
    linksTitle: string;
    links: Array<{ href: string; label: string }>;
  }
> = {
  en: {
    metadata: {
      title: "Stack and Reach Explained | BestBikeFit4U Science",
      description:
        "Learn how stack and reach work, why they are better than seat-tube sizing, and how to use them for frame comparison.",
      keywords: [
        "stack and reach explained",
        "bike frame sizing",
        "frame stack reach",
        "cycling geometry guide",
      ],
    },
    hero: {
      eyebrow: "Science",
      title: "Stack and Reach",
      description:
        "Stack and reach provide a consistent way to compare bike frames across brands without relying on inconsistent size labels.",
      chips: ["Vertical fit", "Horizontal fit", "Frame comparison"],
      caption:
        "These two coordinates say more about rider position than a nominal frame size alone.",
      labels: [
        "Stack = vertical distance",
        "Reach = horizontal distance",
        "Useful across brands",
      ],
    },
    section: {
      eyebrow: "Core concepts",
      title: "The geometry references that actually travel between frames",
      description:
        "Seat-tube sizing hides too much variation. Stack and reach give you a cleaner baseline when you want to compare positions from one frame to another.",
    },
    cards: [
      {
        title: "What is stack?",
        description:
          "Stack is the vertical distance from the bottom bracket to the top center of the head tube. Higher stack generally means a more upright riding posture.",
      },
      {
        title: "What is reach?",
        description:
          "Reach is the horizontal distance from the bottom bracket to the same head-tube reference point. Longer reach usually creates a more stretched cockpit.",
      },
      {
        title: "Why it matters",
        description:
          "Stack and reach reflect real rider position and are the best baseline when matching a frame to fit targets.",
      },
    ],
    linksTitle: "Continue reading",
    links: [
      { href: "/science/calculation-engine", label: "Calculation Engine" },
      { href: "/science/bike-fit-methods", label: "Fit Methods Comparison" },
      { href: "/calculators/frame-size", label: "Frame Size Calculator" },
      { href: "/guides/road-bike-fit-guide", label: "Road Bike Fit Guide" },
      { href: "/guides/gravel-bike-fit-guide", label: "Gravel Bike Fit Guide" },
    ],
  },
  nl: {
    metadata: {
      title: "Stack en reach uitgelegd | BestBikeFit4U Science",
      description:
        "Leer hoe stack en reach werken, waarom ze beter zijn dan framematen op basis van zitbuislabels en hoe je ze gebruikt voor framevergelijking.",
      keywords: [
        "stack en reach uitgelegd",
        "fiets framemaat",
        "frame stack reach",
        "fietsgeometrie gids",
      ],
    },
    hero: {
      eyebrow: "Wetenschap",
      title: "Stack en reach",
      description:
        "Stack en reach geven een consistente manier om fietsframes tussen merken te vergelijken zonder te vertrouwen op inconsistente framelabels.",
      chips: ["Verticale fit", "Horizontale fit", "Framevergelijking"],
      caption:
        "Deze twee coordinaten zeggen meer over rijpositie dan alleen een nominale framemaat.",
      labels: [
        "Stack = verticale afstand",
        "Reach = horizontale afstand",
        "Handig tussen merken",
      ],
    },
    section: {
      eyebrow: "Kernbegrippen",
      title: "De geometrieverwijzingen die echt tussen frames meereizen",
      description:
        "Zitbuismaten verbergen te veel variatie. Stack en reach geven je een schonere basis wanneer je posities van het ene frame naar het andere wilt vergelijken.",
    },
    cards: [
      {
        title: "Wat is stack?",
        description:
          "Stack is de verticale afstand van het bracket tot het bovenste middelpunt van de balhoofdbuis. Meer stack betekent meestal een rechtere rijhouding.",
      },
      {
        title: "Wat is reach?",
        description:
          "Reach is de horizontale afstand van het bracket tot hetzelfde referentiepunt op de balhoofdbuis. Meer reach geeft meestal een langere cockpit.",
      },
      {
        title: "Waarom het telt",
        description:
          "Stack en reach weerspiegelen echte rijpositie en zijn de beste basis om een frame aan fitdoelen te koppelen.",
      },
    ],
    linksTitle: "Verder lezen",
    links: [
      { href: "/science/calculation-engine", label: "Calculatiemotor" },
      { href: "/science/bike-fit-methods", label: "Vergelijking van bikefit-methodes" },
      { href: "/calculators/frame-size", label: "Framemaat calculator" },
      { href: "/guides/road-bike-fit-guide", label: "Racefiets fit gids" },
      { href: "/guides/gravel-bike-fit-guide", label: "Gravel fit gids" },
    ],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const alternates = buildLocaleAlternates("/science/stack-and-reach", locale);

  return {
    title: page.metadata.title,
    description: page.metadata.description,
    keywords: page.metadata.keywords,
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description,
      type: "article",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function StackAndReachPage() {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const pageUrl = new URL(withLocalePrefix("/science/stack-and-reach", locale), BRAND.siteUrl).toString();
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.metadata.title,
    description: page.metadata.description,
    author: {
      "@type": "Organization",
      name: "BestBikeFit4U",
    },
    mainEntityOfPage: pageUrl,
  };

  return (
    <PublicPageShell className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--secondary)_20%,var(--background)_80%)_100%)] text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <PublicHero
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        description={page.hero.description}
        chips={page.hero.chips}
        illustration={
          <PublicIllustrationPanel caption={page.hero.caption} className="w-full">
            <div className="grid w-full gap-3">
              {[
                { icon: <ArrowUpDown className="h-5 w-5" />, label: page.hero.labels[0] },
                { icon: <MoveHorizontal className="h-5 w-5" />, label: page.hero.labels[1] },
                { icon: <Bike className="h-5 w-5" />, label: page.hero.labels[2] },
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
          eyebrow: page.section.eyebrow,
          title: page.section.title,
          description: page.section.description,
        }}
      >
        <div className="grid gap-5">
          {page.cards.map((card, index) => {
            const icon =
              index === 0 ? (
                <ArrowUpDown className="h-5 w-5" />
              ) : index === 1 ? (
                <MoveHorizontal className="h-5 w-5" />
              ) : (
                <Bike className="h-5 w-5" />
              );

            return (
              <PublicSurfaceCard
                key={card.title}
                title={card.title}
                description={card.description}
                leading={icon}
              />
            );
          })}
        </div>
      </PublicSection>

      <RelatedLinksSection title={page.linksTitle} links={page.links} locale={locale} />
    </PublicPageShell>
  );
}
