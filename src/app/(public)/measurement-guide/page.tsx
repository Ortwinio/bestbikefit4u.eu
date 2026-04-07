import type { Metadata } from "next";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { Ruler, ScanLine, UserRound } from "lucide-react";
import {
  PublicCtaBand,
  PublicHero,
  PublicIllustrationPanel,
  PublicPageShell,
  PublicSection,
  PublicSurfaceCard,
} from "@/components/public";
import type { Locale } from "@/i18n/config";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { buildLocaleAlternates } from "@/i18n/metadata";

type MeasurementGuideItem = {
  id: string;
  name: string;
  required: boolean;
  unit: string;
  targetRange?: string;
  tools: string[];
  steps: string[];
  mistakes: string[];
};

type MeasurementGuideCopy = {
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  title: string;
  subtitle: string;
  beforeStartTitle: string;
  beforeStartBullets: string[];
  requiredLabel: string;
  optionalLabel: string;
  unitLabel: string;
  rangeLabel: string;
  toolsLabel: string;
  measureLabel: string;
  mistakesLabel: string;
  remeasureTitle: string;
  remeasureBullets: string[];
  ctaTitle: string;
  ctaBody: string;
  ctaProfile: string;
  ctaFit: string;
  items: MeasurementGuideItem[];
};

const content: Record<Locale, MeasurementGuideCopy> = {
  en: {
    metadata: {
      title: "How To Measure For Bike Fit - Measurement Guide",
      description:
        "Step-by-step guide to measure height, inseam, torso, arm, shoulder width, femur length, and foot length for accurate BestBikeFit4U recommendations.",
      keywords: [
        "bike fit measurement guide",
        "how to measure inseam",
        "cycling fit measurements",
        "bike sizing measurements",
      ],
    },
    title: "Measurement Guide",
    subtitle:
      "Accurate measurements improve fit precision. Required values are enough to start; optional values improve cockpit and stability recommendations.",
    beforeStartTitle: "Before You Start",
    beforeStartBullets: [
      "Measure barefoot on a hard, flat surface.",
      "Take each measurement twice and use the average.",
      "Ask someone to help for torso, arm, shoulder, and femur.",
      "Use consistent units: centimeters except foot length in millimeters.",
    ],
    requiredLabel: "Required",
    optionalLabel: "Optional",
    unitLabel: "Unit",
    rangeLabel: "Typical range",
    toolsLabel: "Tools",
    measureLabel: "How to measure",
    mistakesLabel: "Common mistakes",
    remeasureTitle: "When To Re-Measure",
    remeasureBullets: [
      "If two attempts differ by more than 1 cm (or 5 mm for foot length).",
      "After major body changes, injury recovery, or flexibility improvements.",
      "If recommendations feel inconsistent with your on-bike comfort.",
    ],
    ctaTitle: "Ready to use your measurements?",
    ctaBody:
      "Save your profile and start a fit session to get your personalized setup.",
    ctaProfile: "Go to Profile",
    ctaFit: "Start Fit Session",
    items: [
      {
        id: "height",
        name: "Height",
        required: true,
        unit: "cm",
        targetRange: "130-210 cm",
        tools: ["Tape measure", "Wall", "Flat floor"],
        steps: [
          "Stand barefoot with heels against a wall and look straight ahead.",
          "Keep your back and hips lightly touching the wall.",
          "Place a book flat on your head, mark the wall, then measure to the floor.",
        ],
        mistakes: ["Measuring while wearing shoes.", "Tilting your head up or down."],
      },
      {
        id: "inseam",
        name: "Inseam",
        required: true,
        unit: "cm",
        targetRange: "55-105 cm",
        tools: ["Tape measure", "Hardcover book", "Wall"],
        steps: [
          "Stand barefoot with feet shoulder-width apart and back against a wall.",
          "Pull a hardcover book up firmly into the crotch to simulate saddle pressure.",
          "Measure from the top edge of the book straight down to the floor.",
        ],
        mistakes: ["Holding the book loosely.", "Measuring from the wrong edge of the book."],
      },
      {
        id: "torso",
        name: "Torso Length",
        required: false,
        unit: "cm",
        tools: ["Tape measure", "Helper (recommended)"],
        steps: [
          "Stand naturally in a neutral posture.",
          "Find the top of your hip bone (iliac crest) and shoulder point (acromion).",
          "Measure straight-line distance between those two landmarks.",
        ],
        mistakes: [
          "Measuring while hunched forward.",
          "Using different body sides for start and end landmarks.",
        ],
      },
      {
        id: "arm",
        name: "Arm Length",
        required: false,
        unit: "cm",
        tools: ["Tape measure", "Helper (recommended)"],
        steps: [
          "Relax your shoulders and extend your arm slightly forward.",
          "Measure from shoulder point (acromion) to the wrist crease.",
          "Repeat once and average both attempts.",
        ],
        mistakes: [
          "Locking the elbow aggressively.",
          "Measuring around the curve instead of straight-line distance.",
        ],
      },
      {
        id: "shoulder",
        name: "Shoulder Width",
        required: false,
        unit: "cm",
        tools: ["Tape measure", "Helper"],
        steps: [
          "Stand upright with relaxed shoulders.",
          "Measure from one acromion point to the other across your back.",
          "Keep tape level and straight.",
        ],
        mistakes: [
          "Measuring chest width instead of acromion-to-acromion.",
          "Pulling tape too tight around the body.",
        ],
      },
      {
        id: "femur",
        name: "Femur Length",
        required: false,
        unit: "cm",
        tools: ["Tape measure", "Helper"],
        steps: [
          "Stand naturally with knees unlocked.",
          "Locate the hip joint landmark (greater trochanter).",
          "Measure from hip landmark to center of the knee.",
        ],
        mistakes: [
          "Guessing the hip landmark location.",
          "Measuring to kneecap edge instead of knee center.",
        ],
      },
      {
        id: "foot",
        name: "Foot Length",
        required: false,
        unit: "mm",
        targetRange: "220-320 mm",
        tools: ["Paper", "Pen", "Ruler"],
        steps: [
          "Stand on a sheet of paper wearing thin socks.",
          "Mark heel and longest toe.",
          "Measure between marks in millimeters.",
        ],
        mistakes: [
          "Measuring while seated (load is different).",
          "Using centimeters when input expects millimeters.",
        ],
      },
    ],
  },
  nl: {
    metadata: {
      title: "Hoe meten voor bike fit - Meetgids",
      description:
        "Stapsgewijze gids voor het meten van lengte, binnenbeen, torso, arm, schouderbreedte, femurlengte en voetlengte voor nauwkeurige BestBikeFit4U-aanbevelingen.",
      keywords: [
        "bike fit meetgids",
        "binnenbeen meten",
        "fiets fit metingen",
        "framemaat metingen",
      ],
    },
    title: "Meetgids",
    subtitle:
      "Nauwkeurige metingen verbeteren je fit. Verplichte waarden zijn genoeg om te starten; optionele waarden verfijnen cockpit- en stabiliteitsadvies.",
    beforeStartTitle: "Voordat je begint",
    beforeStartBullets: [
      "Meet op blote voeten op een harde, vlakke ondergrond.",
      "Neem elke meting twee keer en gebruik het gemiddelde.",
      "Vraag hulp bij torso-, arm-, schouder- en femurmeting.",
      "Gebruik consistente eenheden: centimeter, behalve voetlengte in millimeter.",
    ],
    requiredLabel: "Verplicht",
    optionalLabel: "Optioneel",
    unitLabel: "Eenheid",
    rangeLabel: "Gebruikelijke range",
    toolsLabel: "Benodigdheden",
    measureLabel: "Zo meet je",
    mistakesLabel: "Veelgemaakte fouten",
    remeasureTitle: "Wanneer opnieuw meten",
    remeasureBullets: [
      "Als twee pogingen meer dan 1 cm verschillen (of 5 mm bij voetlengte).",
      "Na grote lichamelijke veranderingen, herstel of flexibiliteitswinst.",
      "Als aanbevelingen niet overeenkomen met je comfort op de fiets.",
    ],
    ctaTitle: "Klaar om je metingen te gebruiken?",
    ctaBody:
      "Sla je profiel op en start een fit-sessie voor een persoonlijke setup.",
    ctaProfile: "Ga naar profiel",
    ctaFit: "Start fit-sessie",
    items: [
      {
        id: "height",
        name: "Lengte",
        required: true,
        unit: "cm",
        targetRange: "130-210 cm",
        tools: ["Meetlint", "Muur", "Vlakke vloer"],
        steps: [
          "Sta op blote voeten met je hielen tegen een muur en kijk recht vooruit.",
          "Houd rug en heupen licht tegen de muur.",
          "Leg een boek plat op je hoofd, markeer de muur en meet tot de vloer.",
        ],
        mistakes: ["Meten met schoenen aan.", "Je hoofd omhoog of omlaag kantelen."],
      },
      {
        id: "inseam",
        name: "Binnenbeenlengte",
        required: true,
        unit: "cm",
        targetRange: "55-105 cm",
        tools: ["Meetlint", "Hardcover boek", "Muur"],
        steps: [
          "Sta op blote voeten met voeten op schouderbreedte en rug tegen de muur.",
          "Trek een hardcover boek stevig omhoog in het kruis om zadelcontact te simuleren.",
          "Meet vanaf de bovenkant van het boek recht naar de vloer.",
        ],
        mistakes: ["Boek te los vasthouden.", "Vanaf de verkeerde boekrand meten."],
      },
      {
        id: "torso",
        name: "Torso-lengte",
        required: false,
        unit: "cm",
        tools: ["Meetlint", "Helper (aanbevolen)"],
        steps: [
          "Sta natuurlijk in neutrale houding.",
          "Vind de bovenkant van je heupbot en schouderpunt.",
          "Meet de rechte afstand tussen beide punten.",
        ],
        mistakes: [
          "Meten terwijl je voorover hangt.",
          "Start- en eindpunt op verschillende lichaamszijden kiezen.",
        ],
      },
      {
        id: "arm",
        name: "Armlengte",
        required: false,
        unit: "cm",
        tools: ["Meetlint", "Helper (aanbevolen)"],
        steps: [
          "Ontspan je schouders en strek je arm licht naar voren.",
          "Meet van schouderpunt tot polsplooi.",
          "Herhaal en neem het gemiddelde.",
        ],
        mistakes: [
          "Elleboog te hard strekken.",
          "Langs de kromming meten in plaats van rechte afstand.",
        ],
      },
      {
        id: "shoulder",
        name: "Schouderbreedte",
        required: false,
        unit: "cm",
        tools: ["Meetlint", "Helper"],
        steps: [
          "Sta rechtop met ontspannen schouders.",
          "Meet van acromion tot acromion over de rug.",
          "Houd het lint recht en horizontaal.",
        ],
        mistakes: [
          "Borstbreedte meten in plaats van schouderpunten.",
          "Meetlint te strak over het lichaam trekken.",
        ],
      },
      {
        id: "femur",
        name: "Femurlengte",
        required: false,
        unit: "cm",
        tools: ["Meetlint", "Helper"],
        steps: [
          "Sta natuurlijk met licht ontspannen knieën.",
          "Bepaal het heupreferentiepunt (trochanter major).",
          "Meet van heuppunt tot midden van de knie.",
        ],
        mistakes: [
          "Heuppunt verkeerd schatten.",
          "Meten naar de rand van de knieschijf i.p.v. het midden.",
        ],
      },
      {
        id: "foot",
        name: "Voetlengte",
        required: false,
        unit: "mm",
        targetRange: "220-320 mm",
        tools: ["Papier", "Pen", "Liniaal"],
        steps: [
          "Ga op een vel papier staan met dunne sokken.",
          "Markeer hiel en langste teen.",
          "Meet de afstand tussen de markeringen in millimeters.",
        ],
        mistakes: [
          "Zittend meten (andere belasting).",
          "Centimeters gebruiken terwijl het veld millimeters verwacht.",
        ],
      },
    ],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = content[locale];
  const alternates = buildLocaleAlternates("/measurement-guide", locale);

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

export default async function MeasurementGuidePage() {
  const locale = await getRequestLocale();
  const page = content[locale];
  const pagePath = withLocalePrefix("/measurement-guide", locale);

  return (
    <PublicPageShell className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--secondary)_24%,var(--background)_76%)_100%)]">
      <PublicHero
        eyebrow={locale === "nl" ? "Metingen" : "Measurements"}
        title={page.title}
        description={page.subtitle}
        chips={[
          page.requiredLabel,
          page.optionalLabel,
          locale === "nl" ? "Nauwkeuriger fitrapport" : "Better fit precision",
        ]}
        illustration={
          <PublicIllustrationPanel
            caption={locale === "nl" ? "Goede metingen geven betere cockpit- en stabiliteitsaanbevelingen." : "Better measurements produce better cockpit and stability recommendations."}
            className="w-full"
          >
            <div className="grid w-full gap-3">
              {[
                { icon: <UserRound className="h-5 w-5" />, label: locale === "nl" ? "Twee verplichte metingen" : "Two required measurements" },
                { icon: <Ruler className="h-5 w-5" />, label: locale === "nl" ? "Extra cockpitcontext" : "Extra cockpit context" },
                { icon: <ScanLine className="h-5 w-5" />, label: locale === "nl" ? "Minder giswerk in je setup" : "Less guesswork in your setup" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--primary-soft)] text-[color:var(--primary)]">
                    {item.icon}
                  </div>
                  <span className="text-sm font-semibold text-[color:var(--foreground)]">{item.label}</span>
                </div>
              ))}
            </div>
          </PublicIllustrationPanel>
        }
      />

      <PublicSection
        header={{
          eyebrow: locale === "nl" ? "Voorbereiding" : "Preparation",
          title: page.beforeStartTitle,
          description:
            locale === "nl"
              ? "Gebruik deze checklist voordat je begint met meten."
              : "Use this checklist before you start measuring.",
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {page.beforeStartBullets.map((item) => (
            <PublicSurfaceCard key={item} compact title={item} leading={<Ruler className="h-4 w-4" />} />
          ))}
        </div>
      </PublicSection>

      <PublicSection
        header={{
          eyebrow: locale === "nl" ? "Metingen" : "Measurements",
          title: locale === "nl" ? "Werk stap voor stap" : "Work step by step",
          description:
            locale === "nl"
              ? "Begin met de verplichte velden en voeg daarna optionele metingen toe voor een rijker fitprofiel."
              : "Start with the required fields, then add optional measurements for a richer fit profile.",
        }}
      >
        <div className="grid gap-6 md:grid-cols-2">
          {page.items.map((item) => (
            <PublicSurfaceCard
              key={item.id}
              title={item.name}
              description={`${item.required ? page.requiredLabel : page.optionalLabel} • ${page.unitLabel}: ${item.unit}${item.targetRange ? ` • ${page.rangeLabel}: ${item.targetRange}` : ""}`}
              leading={<ScanLine className="h-5 w-5" />}
            >
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold text-[color:var(--foreground)]">{page.toolsLabel}</p>
                  <p className="mt-1 leading-6 text-[color:var(--muted-foreground)]">{item.tools.join(" • ")}</p>
                </div>
                <div>
                  <p className="font-semibold text-[color:var(--foreground)]">{page.measureLabel}</p>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-[color:var(--muted-foreground)]">
                    {item.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <p className="font-semibold text-[color:var(--foreground)]">{page.mistakesLabel}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[color:var(--muted-foreground)]">
                    {item.mistakes.map((mistake) => (
                      <li key={mistake}>{mistake}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </PublicSurfaceCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection
        header={{
          eyebrow: locale === "nl" ? "Hercontrole" : "Recheck",
          title: page.remeasureTitle,
          description:
            locale === "nl"
              ? "Herhaal je metingen wanneer de kwaliteit van de input twijfelachtig is."
              : "Repeat your measurements when the quality of the input is uncertain.",
        }}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {page.remeasureBullets.map((item) => (
            <PublicSurfaceCard key={item} compact title={item} leading={<UserRound className="h-4 w-4" />} />
          ))}
        </div>
      </PublicSection>

      <PublicCtaBand
        eyebrow={locale === "nl" ? "Volgende stap" : "Next step"}
        title={page.ctaTitle}
        description={page.ctaBody}
        actions={
          <>
            <Button
              size="lg"
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/login", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="measurement_guide_primary_cta"
                  ctaLabel={page.ctaProfile}
                  conversionKey="pricing_signup"
                />
              }
            >
              {page.ctaProfile}
            </Button>
            <Button
              variant="outline"
              size="lg"
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/calculators/bike-fit", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="measurement_guide_secondary_cta"
                  ctaLabel={page.ctaFit}
                />
              }
            >
              {page.ctaFit}
            </Button>
          </>
        }
      />
    </PublicPageShell>
  );
}
