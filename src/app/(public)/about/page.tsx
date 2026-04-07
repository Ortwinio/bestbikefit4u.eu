import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Gauge, Ruler, ShieldCheck } from "lucide-react";
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
import type { Locale } from "@/i18n/config";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { buildLocaleAlternates } from "@/i18n/metadata";

type SectionCard = { title: string; text: string };
type SectionLink = { href: string; label: string };

type AboutCopy = {
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  title: string;
  subtitle: string;
  scienceTitle: string;
  scienceBody: string;
  saddleTitle: string;
  saddleBody1: string;
  saddleBody2: string;
  saddleBullets: string[];
  reachTitle: string;
  reachBody1: string;
  reachBody2: string;
  reachBullets: string[];
  dropTitle: string;
  dropBody1: string;
  dropBody2: string;
  dropBullets: string[];
  componentsTitle: string;
  componentsBody: string;
  componentCards: SectionCard[];
  considerTitle: string;
  considerBody: string;
  considerBullets: string[];
  guideTitle: string;
  guideBody: string;
  guideLinks: SectionLink[];
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
};

const content: Record<Locale, AboutCopy> = {
  en: {
    metadata: {
      title: "How BestBikeFit4U Works | Bike Fitting Methodology",
      description:
        "Learn how BestBikeFit4U turns proven bike fitting methods, rider-specific inputs, and practical adjustment priorities into clearer fit guidance.",
      keywords: [
        "bike fitting methodology",
        "LeMond method",
        "saddle height formula",
        "bike fit science",
        "cycling biomechanics",
      ],
    },
    title: "How BestBikeFit4U Works",
    subtitle: "A professional bike fitting method, practical for every rider.",
    scienceTitle: "The Science Behind Your Fit",
    scienceBody:
      "BestBikeFit4U uses proven biomechanical formulas developed over decades of professional bike fitting research. Our algorithm combines established methods to provide recommendations tailored to your body, riding style, and goals.",
    saddleTitle: "Saddle Height Calculation",
    saddleBody1:
      "We use the LeMond/Hamley method as our baseline. This formula multiplies inseam by a bike-specific coefficient to estimate saddle height from bottom bracket center to saddle top.",
    saddleBody2: "We then apply adjustments based on:",
    saddleBullets: [
      "Flexibility score and mobility limits",
      "Core stability and ability to hold position",
      "Bike category and terrain demands",
      "Goal orientation: comfort vs performance",
    ],
    reachTitle: "Reach and Stack Targets",
    reachBody1:
      "Reach uses torso and arm proportions to create a balanced cockpit. Stack and reach coordinates are used for cross-brand frame comparisons.",
    reachBody2: "The algorithm adapts to riding style:",
    reachBullets: [
      "Comfort: higher stack and shorter reach",
      "Balanced: moderate all-round position",
      "Performance: lower stack and longer reach",
      "Aero: aggressive racing geometry",
    ],
    dropTitle: "Handlebar Drop",
    dropBody1:
      "The vertical saddle-to-bar distance strongly affects comfort and aerodynamics. We estimate drop based on flexibility, torso proportions, and ambition.",
    dropBody2: "Typical ranges:",
    dropBullets: [
      "Comfort: 0-50mm",
      "Balanced: 50-80mm",
      "Performance: 80-120mm",
      "Aero/Racing: 120mm+",
    ],
    componentsTitle: "Component Recommendations",
    componentsBody: "Beyond frame geometry, we provide recommendations for:",
    componentCards: [
      {
        title: "Crank Length",
        text: "Based on inseam and movement constraints to improve pedaling efficiency and reduce joint stress.",
      },
      {
        title: "Handlebar Width",
        text: "Matched to shoulder width for stable handling and efficient breathing.",
      },
      {
        title: "Stem Length",
        text: "Calculated to meet target reach while keeping steering behavior predictable.",
      },
      {
        title: "Saddle Setback",
        text: "Adjusted for power transfer, pelvic stability, and long-ride comfort.",
      },
    ],
    considerTitle: "What We Consider",
    considerBody: "Our recommendations combine multiple rider-specific inputs:",
    considerBullets: [
      "Height and inseam",
      "Arm and torso length",
      "Shoulder width",
      "Flexibility assessment",
      "Core stability",
      "Bike type",
      "Riding goals",
      "Weekly training volume",
      "Pain points",
      "Injury history",
    ],
    guideTitle: "Continue with practical fit guides",
    guideBody:
      "Use targeted guides for pain points and riding disciplines, then apply the next fit steps to your own setup.",
    guideLinks: [
      { href: "/guides/bike-fitting-for-knee-pain", label: "Bike Fitting for Knee Pain" },
      { href: "/guides/road-bike-fit-guide", label: "Road Bike Fit Guide" },
      { href: "/guides/triathlon-bike-fit-guide", label: "Triathlon Bike Fit Guide" },
    ],
    ctaTitle: "Ready for a clearer next fit step?",
    ctaBody:
      "Start a free fit session and review practical fit guidance based on proven bike fitting methods.",
    ctaButton: "Start Free Fit",
  },
  nl: {
    metadata: {
      title: "Hoe BestBikeFit4U werkt | Bikefitting methodiek",
      description:
        "Lees hoe BestBikeFit4U bewezen bikefitting-methodes, persoonlijke input en praktische afstelprioriteiten vertaalt naar duidelijkere fitbegeleiding.",
      keywords: [
        "bikefitting methodiek",
        "LeMond methode",
        "zadelhoogte formule",
        "fietspositie",
      ],
    },
    title: "Hoe BestBikeFit4U werkt",
    subtitle: "Een professionele bikefitting-methodiek, praktisch voor elke fietser.",
    scienceTitle: "De wetenschap achter je fit",
    scienceBody:
      "BestBikeFit4U gebruikt bewezen biomechanische formules uit jarenlange bikefitting-praktijk. Het algoritme combineert meerdere methodes tot aanbevelingen die passen bij jouw lichaam, rijstijl en doelen.",
    saddleTitle: "Berekening van zadelhoogte",
    saddleBody1:
      "Als basis gebruiken we de LeMond/Hamley-methode. Deze formule gebruikt je binnenbeenlengte en een fietsafhankelijke factor om zadelhoogte te schatten.",
    saddleBody2: "Daarna corrigeren we op basis van:",
    saddleBullets: [
      "Flexibiliteit en mobiliteit",
      "Core-stabiliteit en houdingscontrole",
      "Fietstype en terrein",
      "Doelstelling: comfort versus prestaties",
    ],
    reachTitle: "Reach- en stackdoelen",
    reachBody1:
      "Reach wordt bepaald met romp- en armverhoudingen voor een gebalanceerde cockpit. Met stack en reach kun je framemerken goed vergelijken.",
    reachBody2: "Het algoritme past aan op rijstijl:",
    reachBullets: [
      "Comfort: hogere stack en kortere reach",
      "Gebalanceerd: allround positie",
      "Prestatie: lagere stack en langere reach",
      "Aero: agressieve racepositie",
    ],
    dropTitle: "Stuurdrop",
    dropBody1:
      "De verticale afstand tussen zadel en stuur is belangrijk voor comfort en aerodynamica. We schatten drop op basis van flexibiliteit, torsoverhouding en ambitie.",
    dropBody2: "Typische bandbreedtes:",
    dropBullets: [
      "Comfort: 0-50 mm",
      "Gebalanceerd: 50-80 mm",
      "Prestatie: 80-120 mm",
      "Aero/Race: 120 mm+",
    ],
    componentsTitle: "Componentaanbevelingen",
    componentsBody: "Naast framegeometrie adviseren we ook over:",
    componentCards: [
      {
        title: "Cranklengte",
        text: "Gebaseerd op binnenbeenlengte en bewegingsvrijheid voor efficienter trappen en minder gewrichtsbelasting.",
      },
      {
        title: "Stuurbreedte",
        text: "Afgestemd op schouderbreedte voor stabiele controle en goede ademhaling.",
      },
      {
        title: "Stuurpenlengte",
        text: "Berekend om je doel-reach te halen met voorspelbaar stuurgedrag.",
      },
      {
        title: "Zadelterugstand",
        text: "Aangepast voor krachtoverdracht, bekkenstabiliteit en comfort op lange ritten.",
      },
    ],
    considerTitle: "Wat we meenemen",
    considerBody: "Onze aanbevelingen combineren meerdere inputs:",
    considerBullets: [
      "Lengte en binnenbeenlengte",
      "Arm- en torso-lengte",
      "Schouderbreedte",
      "Flexibiliteitstest",
      "Core-stabiliteit",
      "Fietstype",
      "Rijdoelen",
      "Wekelijkse trainingsuren",
      "Pijnpunten",
      "Blessuregeschiedenis",
    ],
    guideTitle: "Praktische vervolggidsen",
    guideBody:
      "Bekijk gerichte gidsen voor klachten en disciplines en vertaal dat naar je eigen fitbegeleiding.",
    guideLinks: [
      { href: "/guides/bike-fitting-for-knee-pain", label: "Bikefitting bij kniepijn" },
      { href: "/guides/road-bike-fit-guide", label: "Racefiets fit gids" },
      { href: "/guides/triathlon-bike-fit-guide", label: "Triathlon fit gids" },
    ],
    ctaTitle: "Klaar voor een duidelijkere volgende fitstap?",
    ctaBody:
      "Start een gratis fitsessie en bekijk praktische fitbegeleiding op basis van bewezen bikefitting-methodes.",
    ctaButton: "Start gratis fit",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = content[locale];
  const alternates = buildLocaleAlternates("/about", locale);

  return {
    title: page.metadata.title,
    description: page.metadata.description,
    keywords: page.metadata.keywords,
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function AboutPage() {
  const locale = await getRequestLocale();
  const page = content[locale];
  const pagePath = withLocalePrefix("/about", locale);
  const trustPoints =
    locale === "nl"
      ? [
          {
            title: "Bewezen biomechanische uitgangspunten",
            description:
              "We vertrekken vanuit bekende fitmethodes en vertalen die naar praktische beslissingen in plaats van losse theorie.",
            icon: <ShieldCheck className="h-5 w-5" />,
          },
          {
            title: "Meetbaar en herhaalbaar",
            description:
              "De uitkomst is bedoeld om setups vergelijkbaar en opnieuw opbouwbaar te maken in millimeters en graden.",
            icon: <Ruler className="h-5 w-5" />,
          },
          {
            title: "Gebouwd voor echte ritten",
            description:
              "Doelen, terrein, flexibiliteit en comfort blijven onderdeel van de interpretatie, niet alleen de formule.",
            icon: <Gauge className="h-5 w-5" />,
          },
        ]
      : [
          {
            title: "Built on proven biomechanics",
            description:
              "We start from established fit methods and translate them into practical decisions instead of abstract theory.",
            icon: <ShieldCheck className="h-5 w-5" />,
          },
          {
            title: "Measurable and repeatable",
            description:
              "The output is designed to make setups comparable and rebuildable in millimeters and degrees.",
            icon: <Ruler className="h-5 w-5" />,
          },
          {
            title: "Built for real rides",
            description:
              "Goals, terrain, flexibility, and comfort remain part of the interpretation, not just the formula.",
            icon: <Gauge className="h-5 w-5" />,
          },
        ];

  return (
    <PublicPageShell className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--secondary)_35%,var(--background)_65%)_100%)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <PublicHero
          eyebrow={locale === "nl" ? "Methodiek" : "Methodology"}
          title={page.title}
          description={page.subtitle}
          chips={
            locale === "nl"
              ? ["Biomechanische basis", "Praktische afstelstappen", "NL en EN beschikbaar"]
              : ["Biomechanical foundation", "Practical setup steps", "Available in Dutch and English"]
          }
        />

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: locale === "nl" ? "Waarom dit betrouwbaar voelt" : "Why this feels trustworthy",
            title:
              locale === "nl"
                ? "Methodiek zonder schijnnauwkeurigheid"
                : "Methodology without false precision",
            description:
              locale === "nl"
                ? "Deze pagina laat zien hoe BestBikeFit4U van fitprincipes naar bruikbare keuzes komt."
                : "This page shows how BestBikeFit4U moves from fitting principles to usable decisions.",
          }}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {trustPoints.map((point) => (
              <PublicFeatureCard
                key={point.title}
                icon={point.icon}
                title={point.title}
                description={point.description}
              />
            ))}
          </div>
        </PublicSection>

        <PublicSection
          className="mt-10"
          header={{ title: page.scienceTitle, description: page.scienceBody }}
        >
          <div className="grid gap-6 md:grid-cols-3">
            <PublicSurfaceCard title={page.saddleTitle} description={page.saddleBody1}>
              <p className="text-sm leading-6 text-muted-foreground">{page.saddleBody2}</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {page.saddleBullets.map((item) => (
                  <li key={item} className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </PublicSurfaceCard>
            <PublicSurfaceCard title={page.reachTitle} description={page.reachBody1}>
              <p className="text-sm leading-6 text-muted-foreground">{page.reachBody2}</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {page.reachBullets.map((item) => (
                  <li key={item} className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </PublicSurfaceCard>
            <PublicSurfaceCard title={page.dropTitle} description={page.dropBody1}>
              <p className="text-sm leading-6 text-muted-foreground">{page.dropBody2}</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {page.dropBullets.map((item) => (
                  <li key={item} className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </PublicSurfaceCard>
          </div>
        </PublicSection>

        <PublicSection
          className="mt-10"
          header={{ title: page.componentsTitle, description: page.componentsBody }}
        >
          <div className="grid gap-6 md:grid-cols-2">
            {page.componentCards.map((card, index) => (
              <PublicSurfaceCard
                key={card.title}
                title={card.title}
                description={card.text}
                footer={
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </span>
                }
              >
                <div />
              </PublicSurfaceCard>
            ))}
          </div>
        </PublicSection>

        <PublicSection
          className="mt-10"
          header={{ title: page.considerTitle, description: page.considerBody }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {page.considerBullets.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-sm"
              >
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </PublicSection>

        <PublicSection
          className="mt-10"
          header={{ title: page.guideTitle, description: page.guideBody }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {page.guideLinks.map((link) => (
              <Link
                key={link.href}
                href={withLocalePrefix(link.href, locale)}
                className="rounded-2xl border border-border/70 bg-background/90 px-4 py-3 text-sm font-medium text-primary shadow-sm transition hover:bg-secondary/70"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </PublicSection>

        <PublicCtaBand
          className="mt-12"
          eyebrow={locale === "nl" ? "Start je fit" : "Start your fit"}
          title={page.ctaTitle}
          description={page.ctaBody}
          actions={
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/login", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="about_final_cta"
                  ctaLabel={page.ctaButton}
                />
              }
            >
              {page.ctaButton}
            </Button>
          }
        />
      </div>
    </PublicPageShell>
  );
}
