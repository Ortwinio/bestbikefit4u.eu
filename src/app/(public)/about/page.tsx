import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
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
        "Learn how BestBikeFit4U calculates your fit report using proven bike fitting methods, rider-specific inputs, and practical adjustment priorities.",
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
      "Use targeted guides for pain points and riding disciplines, then apply your personalized report.",
    guideLinks: [
      { href: "/guides/bike-fitting-for-knee-pain", label: "Bike Fitting for Knee Pain" },
      { href: "/guides/road-bike-fit-guide", label: "Road Bike Fit Guide" },
      { href: "/guides/triathlon-bike-fit-guide", label: "Triathlon Bike Fit Guide" },
    ],
    ctaTitle: "Ready to Find Your Perfect Fit?",
    ctaBody:
      "Start a free fit session and receive a personalized fit report based on proven bike fitting methods.",
    ctaButton: "Start Free Fit",
  },
  nl: {
    metadata: {
      title: "Hoe BestBikeFit4U werkt | Bikefitting methodiek",
      description:
        "Lees hoe BestBikeFit4U je fitrapport berekent met bewezen bikefitting-methodes, persoonlijke input en praktische afstelprioriteiten.",
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
      "Bekijk gerichte gidsen voor klachten en disciplines en vertaal dat naar je eigen fitrapport.",
    guideLinks: [
      { href: "/guides/bike-fitting-for-knee-pain", label: "Bikefitting bij kniepijn" },
      { href: "/guides/road-bike-fit-guide", label: "Racefiets fit gids" },
      { href: "/guides/triathlon-bike-fit-guide", label: "Triathlon fit gids" },
    ],
    ctaTitle: "Klaar om je perfecte fit te vinden?",
    ctaBody:
      "Start een gratis fitsessie en ontvang een persoonlijk fitrapport op basis van bewezen bikefitting-methodes.",
    ctaButton: "Start gratis fit",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = content[locale];

  return {
    title: page.metadata.title,
    description: page.metadata.description,
    keywords: page.metadata.keywords,
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description,
      type: "website",
    },
    alternates: buildLocaleAlternates("/about", locale),
  };
}

export default async function AboutPage() {
  const locale = await getRequestLocale();
  const page = content[locale];
  const pagePath = withLocalePrefix("/about", locale);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900">{page.title}</h1>
        <p className="mt-4 text-xl text-gray-600">{page.subtitle}</p>

        <div className="mt-12 space-y-12">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900">{page.scienceTitle}</h2>
            <p className="mt-4 text-gray-600 leading-relaxed">{page.scienceBody}</p>
          </section>

          <section className="bg-blue-50 -mx-4 px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900">{page.saddleTitle}</h3>
            <p className="mt-4 text-gray-600 leading-relaxed">{page.saddleBody1}</p>
            <p className="mt-4 text-gray-600 leading-relaxed">{page.saddleBody2}</p>
            <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside">
              {page.saddleBullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900">{page.reachTitle}</h3>
            <p className="mt-4 text-gray-600 leading-relaxed">{page.reachBody1}</p>
            <p className="mt-4 text-gray-600 leading-relaxed">{page.reachBody2}</p>
            <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside">
              {page.reachBullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="bg-gray-50 -mx-4 px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900">{page.dropTitle}</h3>
            <p className="mt-4 text-gray-600 leading-relaxed">{page.dropBody1}</p>
            <p className="mt-4 text-gray-600 leading-relaxed">{page.dropBody2}</p>
            <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside">
              {page.dropBullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900">{page.componentsTitle}</h3>
            <p className="mt-4 text-gray-600 leading-relaxed">{page.componentsBody}</p>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {page.componentCards.map((card) => (
                <div key={card.title} className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900">{card.title}</h4>
                  <p className="mt-2 text-sm text-gray-600">{card.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">{page.considerTitle}</h2>
            <p className="mt-4 text-gray-600 leading-relaxed">{page.considerBody}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {page.considerBullets.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-2xl font-semibold text-gray-900">{page.guideTitle}</h2>
            <p className="mt-3 text-gray-600">{page.guideBody}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {page.guideLinks.map((link) => (
                <Link
                  key={link.href}
                  href={withLocalePrefix(link.href, locale)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="bg-blue-600 -mx-4 px-4 py-12 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-white">{page.ctaTitle}</h2>
            <p className="mt-4 text-blue-100 max-w-2xl mx-auto">{page.ctaBody}</p>
            <TrackedCtaLink
              href={withLocalePrefix("/login", locale)}
              locale={locale}
              pagePath={pagePath}
              section="about_final_cta"
              ctaLabel={page.ctaButton}
            >
              <Button size="lg" className="mt-8 bg-white text-blue-600 hover:bg-blue-50">
                {page.ctaButton}
              </Button>
            </TrackedCtaLink>
          </section>
        </div>
      </div>
    </div>
  );
}
