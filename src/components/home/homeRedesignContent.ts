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
      name: "Thomas V.",
      bikeContext: "Canyon Endurace 2022 · Comfort rider",
      quote: "Saddle 4 mm lower. Knee pain gone after two rides.",
      initials: "TV",
    },
    stats: [
      { value: "2,400+", label: "fits completed" },
      { value: "180+", label: "bike brands covered" },
      { value: "Free", label: "to start" },
    ],
  },
  nl: {
    quote: {
      name: "Thomas V.",
      bikeContext: "Canyon Endurace 2022 · Comfort-rijder",
      quote: "Zadel 4 mm lager. Kniepijn weg na twee ritten.",
      initials: "TV",
    },
    stats: [
      { value: "2.400+", label: "fits uitgevoerd" },
      { value: "180+", label: "fietsmerken gedekt" },
      { value: "Gratis", label: "om te starten" },
    ],
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
    trustLine: "Trusted by 2,400+ riders across 180+ bike brands.",
    ctaNote: "No credit card required. Start free and upgrade only if you want the full report.",
  },
  nl: {
    trustLine: "Vertrouwd door 2.400+ rijders verdeeld over 180+ fietsmerken.",
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
    socialProof: "Join 2,400+ riders who started with the same baseline flow.",
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
    socialProof: "Sluit je aan bij 2.400+ rijders die met deze basisflow zijn gestart.",
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
    description: "The homepage should quickly show where the platform is strong: data, sequence, and rider-specific guidance.",
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
    description: "De homepage moet snel laten zien waar het platform sterk in is: data, volgorde en rijdergerichte begeleiding.",
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
    items: [
      {
        name: "Thomas V.",
        initials: "TV",
        bikeContext: "Canyon Endurace 2022 · Comfort rider",
        result: "Saddle 4 mm lower. Knee pain gone after two rides.",
        quote: "I had knee pain for years. The fit finally told me what to change first.",
      },
      {
        name: "Laura M.",
        initials: "LM",
        bikeContext: "Trek Domane 2023 · Recreational rider",
        result: "Handlebar 10 mm higher. No back pain on long rides.",
        quote: "It was fast and practical. I had usable numbers within minutes.",
      },
      {
        name: "Pieter J.",
        initials: "PJ",
        bikeContext: "Specialized Tarmac 2021 · Performance rider",
        result: "Saddle 3 mm rearward. Better balance through harder efforts.",
        quote: "The database gave me a realistic starting point for the bike I already ride.",
      },
    ],
  },
  nl: {
    eyebrow: "Resultaten van rijders",
    title: "Wat rijders na de fit hebben aangepast",
    description: "Concrete afstelwijzigingen zijn geloofwaardiger dan anonieme complimenten.",
    badgeLabel: "Geverifieerd rijderverhaal",
    items: [
      {
        name: "Thomas V.",
        initials: "TV",
        bikeContext: "Canyon Endurace 2022 · Comfort-rijder",
        result: "Zadel 4 mm lager. Kniepijn weg na twee ritten.",
        quote: "Ik had al jaren knieklachten. De fit liet eindelijk zien wat ik eerst moest aanpassen.",
      },
      {
        name: "Laura M.",
        initials: "LM",
        bikeContext: "Trek Domane 2023 · Recreatieve rijder",
        result: "Stuur 10 mm hoger. Geen rugpijn meer op lange ritten.",
        quote: "Het was snel en praktisch. Binnen een paar minuten had ik bruikbare waarden.",
      },
      {
        name: "Pieter J.",
        initials: "PJ",
        bikeContext: "Specialized Tarmac 2021 · Sportieve rijder",
        result: "Zadel 3 mm verder naar achter. Betere balans bij zwaardere inspanningen.",
        quote: "De database gaf meteen een realistisch startpunt voor de fiets die ik al rijd.",
      },
    ],
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
    pricingLabel: "Vergelijk Free vs Pro",
  },
};
