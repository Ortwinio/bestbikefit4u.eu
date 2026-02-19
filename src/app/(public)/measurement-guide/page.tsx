import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";
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

  return {
    title: page.metadata.title,
    description: page.metadata.description,
    keywords: page.metadata.keywords,
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description,
      type: "website",
    },
    alternates: buildLocaleAlternates("/measurement-guide", locale),
  };
}

export default async function MeasurementGuidePage() {
  const locale = await getRequestLocale();
  const page = content[locale];

  return (
    <div className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900">{page.title}</h1>
        <p className="mt-4 text-xl text-gray-600">{page.subtitle}</p>

        <section className="mt-10 rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h2 className="text-xl font-semibold text-gray-900">{page.beforeStartTitle}</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
            {page.beforeStartBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {page.items.map((item) => (
            <article key={item.id} className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{item.name}</h2>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    item.required ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {item.required ? page.requiredLabel : page.optionalLabel}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                {page.unitLabel}: {item.unit}
                {item.targetRange ? ` | ${page.rangeLabel}: ${item.targetRange}` : ""}
              </p>

              <h3 className="mt-4 text-sm font-semibold text-gray-900">{page.toolsLabel}</h3>
              <p className="mt-1 text-sm text-gray-600">{item.tools.join(" • ")}</p>

              <h3 className="mt-4 text-sm font-semibold text-gray-900">{page.measureLabel}</h3>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-700">
                {item.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>

              <h3 className="mt-4 text-sm font-semibold text-gray-900">{page.mistakesLabel}</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                {item.mistakes.map((mistake) => (
                  <li key={mistake}>{mistake}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <section className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-xl font-semibold text-gray-900">{page.remeasureTitle}</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
            {page.remeasureBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-12 rounded-2xl bg-blue-600 p-8 text-center">
          <h2 className="text-2xl font-semibold text-white">{page.ctaTitle}</h2>
          <p className="mt-2 text-blue-100">{page.ctaBody}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href={withLocalePrefix("/profile", locale)}>
              <Button className="bg-white text-blue-700 hover:bg-blue-50">{page.ctaProfile}</Button>
            </Link>
            <Link href={withLocalePrefix("/fit", locale)}>
              <Button variant="outline" className="border-white text-white hover:bg-blue-700">
                {page.ctaFit}
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
