import type { Metadata } from "next";
import { BookOpen, Compass, Ruler } from "lucide-react";
import {
  PublicHero,
  PublicIllustrationPanel,
  PublicPageShell,
  PublicSection,
  PublicSurfaceCard,
} from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import type { Locale } from "@/i18n/config";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { BRAND } from "@/config/brand";

type MethodItem = {
  name: string;
  focus: string;
  strength: string;
  limit: string;
};

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
    section: {
      eyebrow: string;
      title: string;
      description: string;
      strengthLabel: string;
      limitLabel: string;
    };
    methods: MethodItem[];
    linksTitle: string;
    links: Array<{ href: string; label: string }>;
  }
> = {
  en: {
    metadata: {
      title: "Bike Fitting Methods Explained | BestBikeFit4U Science",
      description:
        "Learn how common bike fitting methods such as LeMond, KOPS, and dynamic fit systems work, where each method helps, and when to use a guide instead.",
      keywords: [
        "bike fit methods",
        "LeMond method",
        "KOPS bike fit",
        "bike fitting comparison",
      ],
    },
    hero: {
      eyebrow: "Science",
      title: "Bike Fitting Methods Explained",
      description:
        "Modern fitting combines foundational formulas with rider-specific context. No single method solves everything in isolation, which is why the guide library matters.",
      chips: ["LeMond / Hamley", "KOPS", "Dynamic fit"],
      caption:
        "Different methods answer different questions inside the full fit workflow.",
      labels: [
        "Baseline geometry",
        "Saddle position reference",
        "Dynamic movement validation",
      ],
    },
    section: {
      eyebrow: "Comparison",
      title: "Where each method fits",
      description:
        "Use formulas as strong starting points, then validate them against the rider's stability, flexibility, and real riding context.",
      strengthLabel: "Strength",
      limitLabel: "Limit",
    },
    methods: [
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
    ],
    linksTitle: "Related guides and tools",
    links: [
      { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
      { href: "/guides/road-bike-fit-guide", label: "Road Bike Fit Guide" },
      { href: "/guides/bike-fitting-for-knee-pain", label: "Bike Fitting for Knee Pain" },
      { href: "/science/stack-and-reach", label: "Stack and Reach Guide" },
      { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
      { href: "/about", label: "How BestBikeFit4U Works" },
    ],
  },
  nl: {
    metadata: {
      title: "Bikefit-methodes uitgelegd | BestBikeFit4U Science",
      description:
        "Leer hoe veelgebruikte bikefit-methodes zoals LeMond, KOPS en dynamische fitsystemen werken, waar elke methode helpt en wanneer je beter een gids volgt.",
      keywords: [
        "bikefit methodes",
        "LeMond methode",
        "KOPS bikefit",
        "vergelijking bikefitting",
      ],
    },
    hero: {
      eyebrow: "Wetenschap",
      title: "Bikefit-methodes uitgelegd",
      description:
        "Moderne bikefitting combineert basale formules met rijderspecifieke context. Geen enkele methode lost alles op zichzelf op, en daarom is de gidsenbibliotheek belangrijk.",
      chips: ["LeMond / Hamley", "KOPS", "Dynamische fit"],
      caption:
        "Verschillende methodes beantwoorden verschillende vragen binnen dezelfde fitflow.",
      labels: [
        "Basisgeometrie",
        "Referentie voor zadelpositie",
        "Dynamische bewegingscontrole",
      ],
    },
    section: {
      eyebrow: "Vergelijking",
      title: "Waar elke methode het best past",
      description:
        "Gebruik formules als sterke startpunten en toets ze daarna aan stabiliteit, flexibiliteit en de echte rijcontext van de rijder.",
      strengthLabel: "Sterkte",
      limitLabel: "Beperking",
    },
    methods: [
      {
        name: "LeMond / Hamley-zadelhoogte",
        focus: "Basis-zadelhoogte vanuit binnenbeenlengte",
        strength: "Eenvoudig en herhaalbaar startpunt",
        limit: "Heeft persoonlijke correctie nodig voor flexibiliteit en doelen",
      },
      {
        name: "KOPS (Knee Over Pedal Spindle)",
        focus: "Referentie voor zadel-voor/achter",
        strength: "Handige werkplaatsreferentie",
        limit: "Geen compleet prestatiemodel",
      },
      {
        name: "Dynamische / motion-capture fit",
        focus: "Gewrichtshoeken onder pedaalbelasting",
        strength: "Rijke bewegingsdata",
        limit: "Vraagt apparatuur en specialistische tijd",
      },
    ],
    linksTitle: "Gerelateerde gidsen en tools",
    links: [
      { href: "/calculators/bike-fit", label: "Bike fit calculator" },
      { href: "/guides/road-bike-fit-guide", label: "Racefiets fit gids" },
      { href: "/guides/bike-fitting-for-knee-pain", label: "Bikefitting bij kniepijn" },
      { href: "/science/stack-and-reach", label: "Stack en reach gids" },
      { href: "/calculators/saddle-height", label: "Zadelhoogte calculator" },
      { href: "/about", label: "Hoe BestBikeFit4U werkt" },
    ],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const alternates = buildLocaleAlternates("/science/bike-fit-methods", locale);

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

export default async function BikeFitMethodsPage() {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const pageUrl = new URL(withLocalePrefix("/science/bike-fit-methods", locale), BRAND.siteUrl).toString();
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
    <PublicPageShell className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--secondary)_22%,var(--background)_78%)_100%)] text-foreground">
      <JsonLd schema={articleJsonLd} />

      <PublicHero
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        description={page.hero.description}
        chips={page.hero.chips}
        illustration={
          <PublicIllustrationPanel caption={page.hero.caption} className="w-full">
            <div className="grid w-full gap-3">
              {[
                { icon: <Ruler className="h-5 w-5" />, label: page.hero.labels[0] },
                { icon: <Compass className="h-5 w-5" />, label: page.hero.labels[1] },
                { icon: <BookOpen className="h-5 w-5" />, label: page.hero.labels[2] },
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
          {page.methods.map((method) => (
            <PublicSurfaceCard
              key={method.name}
              title={method.name}
              description={method.focus}
              leading={<Ruler className="h-5 w-5" />}
            >
              <div className="space-y-2 text-sm leading-6">
                <p className="text-[color:var(--muted-foreground)]">
                  <span className="font-semibold text-[color:var(--foreground)]">
                    {page.section.strengthLabel}:
                  </span>{" "}
                  {method.strength}
                </p>
                <p className="text-[color:var(--muted-foreground)]">
                  <span className="font-semibold text-[color:var(--foreground)]">
                    {page.section.limitLabel}:
                  </span>{" "}
                  {method.limit}
                </p>
              </div>
            </PublicSurfaceCard>
          ))}
        </div>
      </PublicSection>

      <RelatedLinksSection title={page.linksTitle} links={page.links} locale={locale} />
    </PublicPageShell>
  );
}
