import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ClipboardList, Ruler, ShieldCheck } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { PublicCtaBand, PublicHero, PublicPageShell, PublicSection, PublicSurfaceCard } from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection, type RelatedLink } from "@/components/seo/RelatedLinksSection";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { BRAND } from "@/config/brand";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { buildBreadcrumbListSchema, buildFaqPageSchema } from "@/lib/seo/jsonLd";
import { buildSelectiveLocaleAlternates } from "@/lib/seo/pageAlternates";

const PAGE_PATH = "/bikefitting";
const ALTERNATES = buildSelectiveLocaleAlternates({ nl: PAGE_PATH }, "nl");

const faqItems = [
  {
    q: "Wat krijg je uit een online bikefitting?",
    a: "Je krijgt een praktisch startplan met afstelwaarden en prioriteiten: bijvoorbeeld zadelhoogte, reach, drop en de logische volgorde van aanpassingen. Het doel is een betere eerstvolgende stap, niet een vage indruk.",
  },
  {
    q: "Voor wie is online bikefitting geschikt?",
    a: "Voor rijders die thuis beter willen starten, een bestaande positie willen controleren of een nieuwe fiets/logische setup willen beoordelen zonder meteen naar een fysieke fitter te gaan.",
  },
  {
    q: "Wanneer kies je beter voor een fysieke bikefitter?",
    a: "Bij terugkerende zware pijn, een blessure, duidelijke asymmetrie of een situatie waarin live observatie en directe feedback nodig zijn.",
  },
] as const;

const relatedLinks: RelatedLink[] = [
  {
    href: "/calculators/bike-fit",
    label: "Bike fit calculator",
    description: "De hoofdroute voor een complete online bikefitting-start.",
  },
  {
    href: "/how-it-works",
    label: "Hoe het werkt",
    description: "Bekijk hoe metingen, rijdoelen en fietscontext samenkomen in het fitproces.",
  },
  {
    href: "/pricing",
    label: "Free vs Pro",
    description: "Zie wat je gratis krijgt en wanneer een uitgebreider rapport zinvol is.",
  },
  {
    href: "/measurement-guide",
    label: "Meetgids",
    description: "Meet eerst nauwkeuriger voordat je je online bikefitting start.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  if (locale !== "nl") {
    return {
      title: "Page not found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: "Bikefitting thuis beginnen | BestBikeFit4U",
    description:
      "Ontdek hoe online bikefitting je helpt met een praktisch startplan voor zadelhoogte, reach, drop en comfort. Begin thuis en zie wanneer een fysieke fitter nodig is.",
    keywords: [
      "bikefitting",
      "online bikefitting",
      "bikefit berekenen",
      "bikefitting thuis",
      "digitale bikefit",
    ],
    openGraph: {
      title: "Bikefitting thuis beginnen | BestBikeFit4U",
      description:
        "Een productgerichte landingspagina voor rijders die online bikefitting willen gebruiken als eerste stap.",
      type: "website",
      url: ALTERNATES.canonical,
    },
    alternates: ALTERNATES,
  };
}

export default async function BikefittingPage() {
  const locale = await getRequestLocale();

  if (locale !== "nl") {
    notFound();
  }

  const pagePath = withLocalePrefix(PAGE_PATH, "nl");
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const homeUrl = new URL(withLocalePrefix("/", "nl"), BRAND.siteUrl).toString();

  return (
    <PublicPageShell className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--muted)_38%,var(--background)_62%)_100%)]">
      <JsonLd
        schema={[
          buildBreadcrumbListSchema([
            { name: "Home", item: homeUrl },
            { name: "Bikefitting", item: pageUrl },
          ]),
          buildFaqPageSchema([...faqItems]),
        ]}
      />

      <PublicHero
        eyebrow="Online bikefitting"
        title="Bikefitting als eerste stap, zonder direct te gokken"
        description="Online bikefitting werkt het best als je snel duidelijkheid wilt over je huidige positie, je belangrijkste afstellingen en de vraag of je thuis al voldoende verder kunt. Het resultaat moet concreet zijn: millimeters, prioriteiten en trade-offs."
        chips={["Zadel, reach en drop", "Comfort versus prestatie", "Heldere vervolgstap"]}
        actions={
          <>
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/calculators/bike-fit", "nl")}
                  locale="nl"
                  pagePath={pagePath}
                  section="hero_primary"
                  ctaLabel="Start online bikefitting"
                />
              }
            >
              Start online bikefitting
            </Button>
            <Button
              variant="outline"
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/login", "nl")}
                  locale="nl"
                  pagePath={pagePath}
                  section="hero_secondary"
                  ctaLabel="Maak account voor rapport"
                />
              }
            >
              Maak account voor rapport
            </Button>
          </>
        }
      />

      <PublicSection
        className="mt-10"
        header={{
          eyebrow: "Wat je eruit haalt",
          title: "Waar online bikefitting goed in is",
          description:
            "Dit is geen algemene blogpagina. Deze route is bedoeld voor rijders die een concrete afstelbeslissing willen nemen en daarna gericht willen testen.",
        }}
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <PublicSurfaceCard
            title="Concrete startwaarden"
            description="Geen losse tips, maar een verdedigbare eerste fit in millimeters."
            leading={<Ruler className="h-5 w-5" />}
          >
            <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
              Denk aan zadelhoogte, globale reach en cockpitbalans als startwaarden die je daarna op de fiets beoordeelt.
            </p>
          </PublicSurfaceCard>
          <PublicSurfaceCard
            title="Betere prioriteiten"
            description="Je ziet welke aanpassing eerst logisch is en welke pas later zin heeft."
            leading={<ClipboardList className="h-5 w-5" />}
          >
            <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
              Dat voorkomt het bekende patroon van willekeurig iets veranderen en niet meer weten wat het effect was.
            </p>
          </PublicSurfaceCard>
          <PublicSurfaceCard
            title="Eerlijke grenzen"
            description="Online fitting is sterk als eerste laag, niet als vervanging van elke fysieke observatie."
            leading={<ShieldCheck className="h-5 w-5" />}
          >
            <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
              Bij zware klachten of duidelijke asymmetrie moet de volgende stap nog steeds een fitter of specialist zijn.
            </p>
          </PublicSurfaceCard>
        </div>
      </PublicSection>

      <PublicSection
        className="mt-10"
        header={{
          eyebrow: "Kies de juiste route",
          title: "Wanneer online bikefitting logisch is",
          description:
            "De beste gebruikers zijn niet per se professionals, maar rijders die thuis een goede eerste structuur willen voordat ze verder investeren.",
        }}
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <PublicSurfaceCard title="Goede match voor online" leading={<ArrowRight className="h-5 w-5" />}>
            <ul className="space-y-3 text-sm leading-6 text-[color:var(--foreground)]">
              <li>Je wilt je huidige positie beter begrijpen zonder direct een afspraak te plannen.</li>
              <li>Je bent net begonnen met serieuzer fietsen en wilt een logisch startpunt.</li>
              <li>Je wilt een nieuwe fiets of setup eerst thuis beoordelen.</li>
              <li>Je wilt voorbereid een eventuele fysieke fit ingaan.</li>
            </ul>
          </PublicSurfaceCard>
          <PublicSurfaceCard title="Minder geschikt als enige stap" leading={<ShieldCheck className="h-5 w-5" />}>
            <ul className="space-y-3 text-sm leading-6 text-[color:var(--foreground)]">
              <li>Je hebt terugkerende kniepijn, rugklachten of gevoelloosheid ondanks eerdere aanpassingen.</li>
              <li>Je herstelt van een blessure of hebt duidelijke links-rechtsverschillen.</li>
              <li>Je hebt een complexe prestatiedoelstelling waarbij live observatie belangrijk is.</li>
            </ul>
          </PublicSurfaceCard>
        </div>
      </PublicSection>

      <RelatedLinksSection locale="nl" title="Verdiep je online bikefitting-route" links={relatedLinks} />

      <PublicSection
        className="mt-10"
        header={{
          eyebrow: "FAQ",
          title: "Veelgestelde vragen over bikefitting",
        }}
      >
        <div className="space-y-4">
          {faqItems.map((item) => (
            <PublicSurfaceCard key={item.q} title={item.q} titleAs="h3">
              <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">{item.a}</p>
            </PublicSurfaceCard>
          ))}
        </div>
      </PublicSection>

      <div className="mt-10">
        <PublicCtaBand
          eyebrow="Start je eerste rapport"
          title="Wil je jouw bikefitting omzetten naar een praktisch afstelplan?"
          description="Begin met de bike-fit calculator en gebruik daarna je account als je sessies, meerdere fietsen of rapportopslag nodig hebt."
          actions={
            <>
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/calculators/bike-fit", "nl")}
                    locale="nl"
                    pagePath={pagePath}
                    section="closing_primary"
                    ctaLabel="Start gratis bike fit"
                  />
                }
              >
                Start gratis bike fit
              </Button>
              <Button variant="outline" render={<Link href={withLocalePrefix("/login", "nl")} />}>
                Maak account aan
              </Button>
            </>
          }
          aside="Geschikt als eerste laag voordat je beslist of een fysieke bikefitting nog nodig is."
        />
      </div>
    </PublicPageShell>
  );
}
