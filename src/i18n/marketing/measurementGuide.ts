import type { Locale } from "@/i18n/config";

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

export const measurementGuideCopy: Record<Locale, MeasurementGuideCopy> = {
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
    rangeLabel: "Gebruikelijk bereik",
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
      "Sla je profiel op en start een fitsessie voor je persoonlijke afstelling.",
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

export const measurementGuidePresentation = {
  nl: {
    eyebrow: "Metingen · thuis aan de slag",
    begin: "Begin met meten",
    openTool: "Open de bikefit-tool",
    heroAlt: "Meetset met boek en meetlint in huisstijl",
    measurementsEyebrow: "Van lengte tot voet",
    measurementsTitle: "Werk stap voor stap",
    measurementsIntro: "De eerste twee maten zijn verplicht. Voeg daarna optionele metingen toe voor een vollediger fitprofiel.",
    nextEyebrow: "Van meten naar afstellen",
    nextTitle: "Gebruik je maten meteen.",
    nextBody: "Vertaal je lichaamsmaten naar een eerste complete bikefit. Of begin met je zadelhoogte.",
    bikeFit: "Bereken je bikefit",
    saddleHeight: "Bereken je zadelhoogte",
    recheck: "Hercontrole",
    related: "Verdieping",
    science: "Bekijk hoe je maten het advies bepalen",
    methods: "Bikefit-methodes uitgelegd",
    pain: "Bekijk veelvoorkomende klachten",
    diagramLabels: [
      "Van kruin tot vloer", "Van kruis tot vloer", "Van schouder tot heup", "Van schouder tot pols",
      "Tussen schouderpunten", "Van heup tot knie", "Van hiel tot langste teen",
    ],
  },
  en: {
    eyebrow: "Measurements · get started at home",
    begin: "Start measuring",
    openTool: "Open the bike fit tool",
    heroAlt: "Illustrated measuring kit with a book and tape measure",
    measurementsEyebrow: "From height to foot length",
    measurementsTitle: "Work step by step",
    measurementsIntro: "The first two measurements are required. Then add optional measurements for a more complete fit profile.",
    nextEyebrow: "From measuring to adjusting",
    nextTitle: "Put your measurements to work.",
    nextBody: "Turn your body measurements into a first complete bike fit. Or start with your saddle height.",
    bikeFit: "Calculate your bike fit",
    saddleHeight: "Calculate your saddle height",
    recheck: "Recheck",
    related: "Learn more",
    science: "See how your measurements shape the recommendations",
    methods: "Bike fitting methods explained",
    pain: "Explore common cycling discomfort",
    diagramLabels: [
      "From head to floor", "From crotch to floor", "From shoulder to hip", "From shoulder to wrist",
      "Between shoulder points", "From hip to knee", "From heel to longest toe",
    ],
  },
} satisfies Record<Locale, Record<string, string | string[]>>;
