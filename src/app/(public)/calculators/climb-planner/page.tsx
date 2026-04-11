import type { Metadata } from "next";
import { Mountain, Route, ShieldAlert } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import {
  PublicCtaBand,
  PublicFeatureCard,
  PublicHero,
  PublicPageShell,
  PublicSection,
  PublicSurfaceCard,
} from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { BRAND } from "@/config/brand";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import {
  buildFaqPageSchema,
  buildHowToSchema,
  buildWebApplicationSchema,
} from "@/lib/seo/jsonLd";

const copy = {
  en: {
    metadata: {
      title: "Climb Planner | BestBikeFit4U",
      description:
        "Plan climbing effort, pacing, and fueling context before a route or event so the first hard climb does not become a guess.",
      keywords: ["climb planner", "cycling climb calculator", "pacing planner"],
    },
    hero: {
      eyebrow: "BestBikeFit4U calculator",
      title: "Climb Planner",
      description:
        "Plan a climb with the right pacing and fueling context before the effort starts, then refine the plan in the dashboard if needed.",
      chips: ["Climb pacing", "Event prep", "Fueling context"],
    },
    intro: {
      eyebrow: "What this tool is for",
      title: "A practical way to plan harder climbs",
      description:
        "A climb is not just a gradient. Duration, effort, body mass, wind, and fueling all shape how the climb feels and how well you can execute it.",
    },
    features: [
      {
        title: "Build a pacing plan",
        description:
          "Use gradient and duration to choose a more realistic opening effort and avoid overcommitting early.",
        icon: <Route className="h-5 w-5" />,
      },
      {
        title: "Keep effort sustainable",
        description:
          "A good climb plan protects the rest of the ride or event, not just the first ten minutes of the ascent.",
        icon: <Mountain className="h-5 w-5" />,
      },
      {
        title: "Flag risk early",
        description:
          "If the plan depends on aggressive pacing, poor fueling, or unrealistic expectations, the tool should make that obvious.",
        icon: <ShieldAlert className="h-5 w-5" />,
      },
    ],
    sections: [
      {
        title: "Common problems riders try to solve",
        items: [
          "Opening a climb too hard and paying for it later in the ride.",
          "Guessing pacing from power alone without considering gradient or duration.",
          "Underfueling a long climb because the effort was treated like a short effort.",
        ],
      },
      {
        title: "What to check first",
        items: [
          "Check climb length, average gradient, and whether the effort is steady or variable.",
          "Decide if the goal is finishing cleanly, racing the climb, or protecting the rest of the day.",
          "Make sure fueling and hydration match the expected duration and heat.",
        ],
      },
      {
        title: "What not to change blindly",
        items: [
          "Do not raise the target effort just because the climb looks short on paper.",
          "Do not ignore longer recovery impact when a climb is one part of a bigger route.",
          "Do not assume the same pacing choice works equally well for every rider profile.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is this only useful for racing?",
        a: "No. It is also useful for long training rides, gran fondos, and route planning when climbs change how the ride should be managed.",
      },
      {
        q: "Should fueling be part of climb planning?",
        a: "Yes. On longer climbs or harder days, pacing and fueling work together rather than separately.",
      },
    ],
    relatedTitle: "Related guides",
    relatedLinks: [
      { href: "/guides/wkg-and-power-zones-guide", label: "W/kg and Power Zones Guide" },
      { href: "/guides/power-to-speed-guide", label: "Power-to-Speed Guide" },
      { href: "/guides/cycling-fueling-basics", label: "Cycling Fueling Basics" },
      { href: "/guides/climb-time-and-event-pacing-guide", label: "Climb Time and Event Pacing Guide" },
    ],
    cta: {
      eyebrow: "Next step",
      title: "Keep the route plan in the dashboard",
      description:
        "Start a free account to keep climb, bike, and pacing decisions together and continue the guided workflow when the route gets more complex.",
      label: "Start Free Fit",
    },
  },
  nl: {
    metadata: {
      title: "Klimplanner | BestBikeFit4U",
      description:
        "Plan kliminspanning, pacing en voedingscontext vóór een route of event zodat de eerste echte klim geen gok wordt.",
      keywords: ["klimplanner", "fiets klim calculator", "pacing planner"],
    },
    hero: {
      eyebrow: "BestBikeFit4U calculator",
      title: "Klimplanner",
      description:
        "Plan een klim met de juiste pacing- en voedingscontext voordat de inspanning start en verfijn daarna indien nodig in het dashboard.",
      chips: ["Klimpacing", "Eventvoorbereiding", "Voedingscontext"],
    },
    intro: {
      eyebrow: "Waar deze tool voor is",
      title: "Een praktische manier om zwaardere klimmen te plannen",
      description:
        "Een klim is niet alleen een klimpercentage. Duur, inspanning, lichaamsmassa, wind en voeding bepalen samen hoe de klim voelt en hoe goed je hem uitvoert.",
    },
    features: [
      {
        title: "Bouw een pacingplan",
        description:
          "Gebruik klimpercentage en duur om een realistischer openingsvermogen te kiezen en te voorkomen dat je te hard opent.",
        icon: <Route className="h-5 w-5" />,
      },
      {
        title: "Houd de inspanning houdbaar",
        description:
          "Een goed klimplan beschermt ook de rest van de rit of wedstrijd, niet alleen de eerste tien minuten van de klim.",
        icon: <Mountain className="h-5 w-5" />,
      },
      {
        title: "Markeer risico vroeg",
        description:
          "Als het plan leunt op agressieve pacing, te weinig voeding of onrealistische verwachtingen, moet de tool dat zichtbaar maken.",
        icon: <ShieldAlert className="h-5 w-5" />,
      },
    ],
    sections: [
      {
        title: "Veelvoorkomende problemen die rijders willen oplossen",
        items: [
          "Een klim te hard openen en daar later in de rit voor betalen.",
          "Pacing gokken op vermogen alleen zonder klimpercentage of duur mee te nemen.",
          "Een lange klim ondervoeden omdat de inspanning als kort werd behandeld.",
        ],
      },
      {
        title: "Wat je eerst controleert",
        items: [
          "Controleer klimlengte, gemiddeld klimpercentage en of de inspanning stabiel of variabel is.",
          "Bepaal of het doel netjes uitrijden, de klim racen of de rest van de dag beschermen is.",
          "Zorg dat voeding en hydratatie passen bij de verwachte duur en warmte.",
        ],
      },
      {
        title: "Wat je niet blind verandert",
        items: [
          "Verhoog het target niet alleen omdat de klim op papier kort lijkt.",
          "Negeer het herstel dat later nodig is niet wanneer de klim maar één deel van een grotere route is.",
          "Ga er niet van uit dat dezelfde pacingkeuze voor elke rijder werkt.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is dit alleen nuttig voor wedstrijden?",
        a: "Nee. Ook op lange trainingen, gran fondo's en routeplanning helpt het om klimmen beter te managen.",
      },
      {
        q: "Moet voeding deel zijn van klimplanning?",
        a: "Ja. Op langere klimmen of zwaardere dagen werken pacing en voeding samen in plaats van los van elkaar.",
      },
    ],
    relatedTitle: "Gerelateerde gidsen",
    relatedLinks: [
      { href: "/guides/wkg-and-power-zones-guide", label: "W/kg- en powerzonesgids" },
      { href: "/guides/power-to-speed-guide", label: "Power-naar-snelheidsgids" },
      { href: "/guides/cycling-fueling-basics", label: "Basis van fietsvoeding" },
      { href: "/guides/climb-time-and-event-pacing-guide", label: "Klimtijd- en eventpacinggids" },
    ],
    cta: {
      eyebrow: "Volgende stap",
      title: "Bewaar je routeplan in het dashboard",
      description:
        "Start een gratis account om klim-, fiets- en pacingkeuzes samen te houden en gebruik daarna de begeleide workflow bij complexere routes.",
      label: "Start gratis fit",
    },
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const alternates = buildLocaleAlternates("/calculators/climb-planner", locale);

  return {
    title: page.metadata.title,
    description: page.metadata.description,
    keywords: [...page.metadata.keywords],
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function ClimbPlannerPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const page = copy[locale];
  const pagePath = withLocalePrefix("/calculators/climb-planner", locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();

  return (
    <PublicPageShell className="text-foreground">
      <JsonLd
        schema={[
          buildWebApplicationSchema({
            name: page.metadata.title,
            description: page.metadata.description,
            url: pageUrl,
          }),
          buildHowToSchema({
            name: isNl ? "Hoe gebruik je de klimplanner" : "How to use the climb planner",
            description: isNl
              ? "Een korte flow om pacing en voeding rond een klim te plannen."
              : "A short flow for planning pacing and fueling around a climb.",
            steps: isNl
              ? [
                  "Schat duur, gradient en inspanningsvorm in.",
                  "Controleer of pacing en voeding bij het doel passen.",
                  "Lees de uitkomst als een praktisch referentiepunt.",
                  "Test het plan opnieuw op een echte route.",
                ]
              : [
                  "Estimate duration, gradient, and effort type.",
                  "Check whether pacing and fueling fit the goal.",
                  "Read the result as a practical reference point.",
                  "Test the plan again on a real route.",
                ],
          }),
          buildFaqPageSchema([...page.faqs]),
        ]}
      />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <PublicHero
          eyebrow={page.hero.eyebrow}
          title={page.hero.title}
          description={page.hero.description}
          chips={[...page.hero.chips]}
        />

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: page.intro.eyebrow,
            title: page.intro.title,
            description: page.intro.description,
          }}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {page.features.map((feature) => (
              <PublicFeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </PublicSection>

        {page.sections.map((section) => (
          <PublicSection
            key={section.title}
            className="mt-10"
            header={{ title: section.title }}
          >
            <div className="grid gap-4">
              {section.items.map((item) => (
                <PublicSurfaceCard key={item} description={item} />
              ))}
            </div>
          </PublicSection>
        ))}

        <PublicSection className="mt-10" header={{ eyebrow: "FAQ", title: "FAQ" }}>
          <div className="grid gap-4">
            {page.faqs.map((faq) => (
              <PublicSurfaceCard key={faq.q} title={faq.q} description={faq.a} />
            ))}
          </div>
        </PublicSection>

        <RelatedLinksSection
          title={page.relatedTitle}
          links={[...page.relatedLinks]}
          locale={locale}
        />

        <PublicCtaBand
          className="mt-10"
          eyebrow={page.cta.eyebrow}
          title={page.cta.title}
          description={page.cta.description}
          actions={
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/login", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="climb_planner_primary_cta"
                  ctaLabel={page.cta.label}
                />
              }
            >
              {page.cta.label}
            </Button>
          }
        />
      </div>
    </PublicPageShell>
  );
}
