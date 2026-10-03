import { homeTrust } from "@/i18n/marketing/homeTrust";
import type { Locale } from "@/i18n/config";
import type { PublicCalculatorId } from "@/lib/public-calculators";

type Localized<T> = Record<Locale, T>;

export const HOME_PROOF_BAR_CONTENT: Localized<{
  quote: {
    name: string;
    bikeContext: string;
    quote: string;
    initials: string;
  };
  stats: Array<{
    value: string;
    label: string;
  }>;
}> = {
  en: {
    quote: {
      name: homeTrust.en.principle.title,
      bikeContext: homeTrust.en.principle.context,
      quote: homeTrust.en.principle.text,
      initials: "BB",
    },
    stats: homeTrust.en.stats,
  },
  nl: {
    quote: {
      name: homeTrust.nl.principle.title,
      bikeContext: homeTrust.nl.principle.context,
      quote: homeTrust.nl.principle.text,
      initials: "BB",
    },
    stats: homeTrust.nl.stats,
  },
};

export const HOME_HERO_PROOF_CARDS: Localized<
  Array<{
    title: string;
    description: string;
    icon: "check" | "ruler" | "alert";
  }>
> = {
  en: [
    {
      title: "Method-backed guidance",
      description: "Evidence-based calculations instead of trial-and-error adjustments.",
      icon: "check",
    },
    {
      title: "Millimeter targets",
      description: "Saddle height, reach, and drop translated into usable numbers.",
      icon: "ruler",
    },
    {
      title: "Transparent limits",
      description: "Clear about what online fitting can solve and when to validate outdoors.",
      icon: "alert",
    },
  ],
  nl: [
    {
      title: "Onderbouwde begeleiding",
      description: "Berekeningen op basis van methode in plaats van afstellen op gevoel.",
      icon: "check",
    },
    {
      title: "Doelen in millimeters",
      description: "Zadelhoogte, reach en drop vertaald naar direct bruikbare waarden.",
      icon: "ruler",
    },
    {
      title: "Eerlijk over grenzen",
      description: "Duidelijk over wat online fitting oplost en wat je buiten nog moet valideren.",
      icon: "alert",
    },
  ],
};

export const HOME_HERO_MICROCOPY: Localized<{
  trustLine: string;
  ctaNote: string;
}> = {
  en: {
    trustLine: homeTrust.en.note,
    ctaNote: "No credit card required. Start free and upgrade only if you want the full report.",
  },
  nl: {
    trustLine: homeTrust.nl.note,
    ctaNote: "Geen creditcard nodig. Start gratis en upgrade alleen als je het volledige rapport wilt.",
  },
};

export const HOME_STEPPER_CONTENT: Localized<{
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  socialProof: string;
  steps: Array<{
    number: string;
    title: string;
    description: string;
    icon: "ruler" | "bike" | "check";
  }>;
}> = {
  en: {
    eyebrow: "How it works",
    title: "A clear fit flow in three steps",
    description: "Measure what matters, connect your bike, and get the next setup changes in a usable order.",
    cta: "Get my fit plan",
    socialProof: homeTrust.en.note,
    steps: [
      {
        number: "01",
        title: "Measure your body",
        description: "Enter height, inseam, arm length, and the body inputs that drive real setup decisions.",
        icon: "ruler",
      },
      {
        number: "02",
        title: "Connect your bike",
        description: "Pick your bike from the database or continue with a manual geometry path when needed.",
        icon: "bike",
      },
      {
        number: "03",
        title: "Get your fit plan",
        description: "Review saddle, reach, cockpit, and next-step priorities in a practical order.",
        icon: "check",
      },
    ],
  },
  nl: {
    eyebrow: "Hoe het werkt",
    title: "Een duidelijke fitflow in drie stappen",
    description: "Meet wat telt, koppel je fiets en ontvang de volgende afstelstappen in een bruikbare volgorde.",
    cta: "Ontvang mijn afstelplan",
    socialProof: homeTrust.nl.note,
    steps: [
      {
        number: "01",
        title: "Meet je lichaam",
        description: "Vul lengte, binnenbeen, armlengte en de lichaamsdata in die echte setupkeuzes sturen.",
        icon: "ruler",
      },
      {
        number: "02",
        title: "Koppel je fiets",
        description: "Kies je fiets uit de database of ga verder via de handmatige geometrie-route wanneer dat nodig is.",
        icon: "bike",
      },
      {
        number: "03",
        title: "Ontvang je fitplan",
        description: "Bekijk zadel, reach, cockpit en de volgende afstelstappen in een praktische volgorde.",
        icon: "check",
      },
    ],
  },
};

export const HOME_DIFFERENTIATORS: Localized<{
  eyebrow: string;
  title: string;
  description: string;
  items: Array<{
    title: string;
    description: string;
    icon: "database" | "ordered" | "target";
  }>;
}> = {
  en: {
    eyebrow: "Why it works",
    title: "Less guesswork. Better next steps.",
    description: "Three principles that make every fit decision more concrete and reliable than guessing or starting from scratch.",
    items: [
      {
        title: "Geometry-backed database",
        description: "Use verified bike geometry and supporting setup data instead of starting every fit from scratch.",
        icon: "database",
      },
      {
        title: "A structured adjustment order",
        description: "See what to change first instead of moving multiple fit variables at the same time.",
        icon: "ordered",
      },
      {
        title: "Matched to riding intent",
        description: "Guide the fit toward comfort, endurance, or performance instead of one generic position.",
        icon: "target",
      },
    ],
  },
  nl: {
    eyebrow: "Waarom dit werkt",
    title: "Minder giswerk. Betere vervolgstappen.",
    description: "Drie principes die elke fitbeslissing concreter en betrouwbaarder maken dan schatten of opnieuw beginnen.",
    items: [
      {
        title: "Geometriedatabase als basis",
        description: "Werk met geverifieerde fietsgeometrie en setupdata in plaats van elke fit opnieuw vanaf nul te starten.",
        icon: "database",
      },
      {
        title: "Een duidelijke volgorde van aanpassen",
        description: "Zie wat je eerst verandert in plaats van meerdere fitvariabelen tegelijk te verschuiven.",
        icon: "ordered",
      },
      {
        title: "Afgestemd op jouw rijdoel",
        description: "Stuur de fit richting comfort, uithoudingsvermogen of prestatie in plaats van één algemene houding.",
        icon: "target",
      },
    ],
  },
};

export const HOME_TESTIMONIALS: Localized<{
  eyebrow: string;
  title: string;
  description: string;
  badgeLabel: string;
  items: Array<{
    name: string;
    initials: string;
    bikeContext: string;
    result: string;
    quote: string;
  }>;
}> = {
  en: {
    eyebrow: "Rider outcomes",
    title: "What riders changed after the fit",
    description: "Concrete setup changes are more credible than anonymous praise.",
    badgeLabel: "Verified rider story",
    items: [],
  },
  nl: {
    eyebrow: "Resultaten van rijders",
    title: "Wat rijders na de fit hebben aangepast",
    description: "Concrete afstelwijzigingen zijn geloofwaardiger dan anonieme complimenten.",
    badgeLabel: "Geverifieerd rijderverhaal",
    items: [],
  },
};

export const HOME_BIKE_SEARCH_CONTENT: Localized<{
  eyebrow: string;
  title: string;
  description: string;
  placeholder: string;
  submitLabel: string;
  manualLabel: string;
  manualHintLabel: string;
  useInFitLabel: string;
}> = {
  en: {
    eyebrow: "Start from your bike",
    title: "Already know your bike?",
    description: "Search by brand or model and jump into the fit flow with a better starting point.",
    placeholder: "Search brand or model...",
    submitLabel: "Search bike",
    manualLabel: "Bike not found? Enter geometry manually.",
    manualHintLabel: "Can't find your bike? Enter the geometry manually instead.",
    useInFitLabel: "Use in my fit",
  },
  nl: {
    eyebrow: "Start vanuit je fiets",
    title: "Weet je al welke fiets je hebt?",
    description: "Zoek op merk of model en stap direct in de fitflow met een beter startpunt.",
    placeholder: "Zoek merk of model...",
    submitLabel: "Zoek fiets",
    manualLabel: "Fiets niet gevonden? Voer de geometrie handmatig in.",
    manualHintLabel: "Kun je je fiets niet vinden? Voer de geometrie dan handmatig in.",
    useInFitLabel: "Gebruik in mijn fit",
  },
};

export const HOME_CALCULATOR_SUBTITLES: Localized<Record<PublicCalculatorId, string>> = {
  en: {
    "bike-fit": "Gives saddle position, reach, and cockpit balance.",
    "saddle-height": "Gives your ideal saddle height in millimeters.",
    "saddle-width": "Estimates saddle width from sit-bone context.",
    "frame-size": "Checks the frame size that best fits your body.",
    "crank-length": "Finds the crank length that matches your riding position.",
    gearing: "Calculates gear development per pedal stroke.",
    "tire-pressure": "Finds tyre pressure from weight and tyre setup.",
  },
  nl: {
    "bike-fit": "Geeft zadelpositie, reach en cockpitbalans.",
    "saddle-height": "Geeft je ideale zadelhoogte in millimeters.",
    "saddle-width": "Schat zadelbreedte op basis van zitbeencontext.",
    "frame-size": "Controleert welke framemaat het best bij jouw lichaam past.",
    "crank-length": "Bepaalt de cranklengte die past bij jouw rijpositie.",
    gearing: "Berekent de ontwikkeling per pedaalomwenteling.",
    "tire-pressure": "Bepaalt bandenspanning op basis van gewicht en bandsetup.",
  },
};

export const HOME_CLOSING_CTA_CONTENT: Localized<{
  eyebrow: string;
  cardEyebrow: string;
  pricingLabel: string;
}> = {
  en: {
    eyebrow: "Ready for the next step?",
    cardEyebrow: "Try it free first",
    pricingLabel: "Compare Free vs Pro",
  },
  nl: {
    eyebrow: "Klaar voor de volgende stap?",
    cardEyebrow: "Probeer het vrijblijvend",
    pricingLabel: "Vergelijk Free en Pro",
  },
};
