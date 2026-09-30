import type { Locale } from "@/i18n/config";

export const methodsCopy: Record<
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
        "Learn how common bike fitting methods such as LeMond, KOPS, and dynamic fit " +
        "systems work, where each method helps, and when to use a guide instead.",
      keywords: ["bike fit methods", "LeMond method", "KOPS bike fit", "bike fitting comparison"],
    },
    hero: {
      eyebrow: "Science",
      title: "Bike Fitting Methods Explained",
      description:
        "Modern fitting combines foundational formulas with rider-specific context. " +
        "No single method solves everything in isolation, which is why the guide " +
        "library matters.",
      chips: ["LeMond / Hamley", "KOPS", "Dynamic fit"],
      caption: "Different methods answer different questions inside the full fit workflow.",
      labels: ["Baseline geometry", "Saddle position reference", "Dynamic movement validation"],
    },
    section: {
      eyebrow: "Comparison",
      title: "Where each method fits",
      description:
        "Use formulas as strong starting points, then validate them against the " +
        "rider's stability, flexibility, and real riding context.",
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
        "Leer hoe veelgebruikte bikefit-methodes zoals LeMond, KOPS en dynamische " +
        "fitsystemen werken, waar elke methode helpt en wanneer je beter een gids " +
        "volgt.",
      keywords: ["bikefit methodes", "LeMond methode", "KOPS bikefit", "vergelijking bikefitting"],
    },
    hero: {
      eyebrow: "Wetenschap",
      title: "Bikefit-methodes uitgelegd",
      description:
        "Moderne bikefitting combineert basale formules met rijderspecifieke " +
        "context. Geen enkele methode lost alles op zichzelf op, en daarom is de " +
        "gidsenbibliotheek belangrijk.",
      chips: ["LeMond / Hamley", "KOPS", "Dynamische fit"],
      caption: "Verschillende methodes beantwoorden verschillende vragen binnen dezelfde " + "fitflow.",
      labels: ["Basisgeometrie", "Referentie voor zadelpositie", "Dynamische bewegingscontrole"],
    },
    section: {
      eyebrow: "Vergelijking",
      title: "Waar elke methode het best past",
      description:
        "Gebruik formules als sterke startpunten en toets ze daarna aan stabiliteit, " +
        "flexibiliteit en de echte rijcontext van de rijder.",
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

export const engineCopy: Record<
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
    sections: Array<{
      eyebrow: string;
      title: string;
      description: string;
      cards: EngineCard[];
    }>;
    linksTitle: string;
    links: Array<{ href: string; label: string }>;
  }
> = {
  en: {
    metadata: {
      title: "Bike Fit Calculation Engine | BestBikeFit4U Science",
      description:
        "See how BestBikeFit4U combines body measurements, fit methods, and rider " +
        "context to calculate saddle height, reach, and next-step fit guidance.",
      keywords: [
        "bike fit calculation engine",
        "bike fitting calculations",
        "saddle height formula",
        "online bike fit method",
      ],
    },
    hero: {
      eyebrow: "Science",
      title: "How the Bike Fit Calculation Engine Works",
      description:
        "The calculation engine turns body measurements, bike category, and fit " +
        "priorities into practical setup guidance. The goal is not one perfect " +
        "formula, but a reliable decision path toward better saddle height, reach, " +
        "and cockpit balance.",
      chips: ["Body measurements", "Fit methods", "Context-aware output"],
      caption:
        "Measurements become useful only when the engine translates them into real " +
        "adjustment priorities.",
      labels: ["Saddle baseline", "Reach logic", "Practical next step"],
    },
    sections: [
      {
        eyebrow: "Inputs",
        title: "What the engine looks at first",
        description:
          "The calculator starts with measurable rider dimensions, then adds fit " +
          "context so the output stays practical instead of theoretical.",
        cards: [
          {
            title: "Body measurements",
            description:
              "Height, inseam, torso, arm length, and shoulder width establish the first " +
              "geometry baseline.",
          },
          {
            title: "Riding context",
            description:
              "Road, gravel, MTB, triathlon, and comfort-vs-performance intent change " +
              "which output ranges are realistic.",
          },
          {
            title: "Constraint checks",
            description:
              "Pain history, flexibility, and stability help prevent aggressive " +
              "recommendations that a rider cannot sustain.",
          },
        ],
      },
      {
        eyebrow: "Output logic",
        title: "Why the result is more than one number",
        description:
          "Saddle height is only the start. The engine connects that baseline to " +
          "reach, support, and the most useful next adjustment.",
        cards: [
          {
            title: "Saddle height baseline",
            description:
              "Formula-driven saddle height creates the first mechanical reference for " +
              "efficient pedaling and pelvic stability.",
          },
          {
            title: "Reach and stack translation",
            description:
              "Cockpit recommendations use torso and arm proportions so frame size and " +
              "cockpit decisions stay linked.",
          },
          {
            title: "Next-step prioritization",
            description:
              "The engine points riders toward the next relevant page, calculator, or " +
              "guide instead of leaving them with a static output.",
          },
        ],
      },
    ],
    linksTitle: "Related calculators and science pages",
    links: [
      { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
      { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
      { href: "/measurement-guide", label: "Measurement Guide" },
      { href: "/science/bike-fit-methods", label: "Bike Fitting Methods Explained" },
      { href: "/science/stack-and-reach", label: "Stack and Reach Guide" },
      { href: "/about", label: "How BestBikeFit4U Works" },
    ],
  },
  nl: {
    metadata: {
      title: "Bikefit berekeningsengine | BestBikeFit4U Science",
      description:
        "Bekijk hoe BestBikeFit4U lichaamsmaten, fitmethodes en rijcontext " +
        "combineert om zadelhoogte, reach en praktische vervolgstappen te berekenen.",
      keywords: [
        "bikefit berekeningen",
        "fiets afstellen met berekeningen",
        "zadelhoogte formule",
        "bikefitting methode online",
      ],
    },
    hero: {
      eyebrow: "Wetenschap",
      title: "Hoe de bikefit berekeningsengine werkt",
      description:
        "De berekeningsengine vertaalt lichaamsmaten, fietstype en fitprioriteiten " +
        "naar praktische afstelbegeleiding. Het doel is niet één perfecte formule, " +
        "maar een betrouwbare beslisroute naar betere zadelhoogte, reach en " +
        "cockpitbalans.",
      chips: ["Lichaamsmaten", "Fitmethodes", "Contextafhankelijke output"],
      caption: "Metingen worden pas waardevol wanneer de engine ze omzet in echte " + "afstelprioriteiten.",
      labels: ["Zadelbasis", "Reach-logica", "Praktische vervolgstap"],
    },
    sections: [
      {
        eyebrow: "Input",
        title: "Waar de engine eerst naar kijkt",
        description:
          "De calculator start met meetbare lichaamsmaten en voegt daarna fitcontext " +
          "toe, zodat de uitkomst praktisch blijft in plaats van puur theoretisch.",
        cards: [
          {
            title: "Lichaamsmaten",
            description:
              "Lengte, binnenbeenlengte, romplengte, armlengte en schouderbreedte vormen " +
              "de eerste geometrische basis.",
          },
          {
            title: "Rijcontext",
            description:
              "Race, gravel, MTB, triathlon en comfort-versus-prestatie bepalen welke " +
              "uitkomsten realistisch zijn.",
          },
          {
            title: "Beperkingen",
            description:
              "Pijnhistorie, flexibiliteit en stabiliteit voorkomen aanbevelingen die te " +
              "agressief zijn om vol te houden.",
          },
        ],
      },
      {
        eyebrow: "Uitkomstlogica",
        title: "Waarom de uitkomst meer is dan één getal",
        description:
          "Zadelhoogte is alleen het begin. De engine verbindt die basis met reach, " +
          "ondersteuning en de meest nuttige volgende aanpassing.",
        cards: [
          {
            title: "Basis voor zadelhoogte",
            description:
              "Formulegedreven zadelhoogte levert de eerste mechanische referentie voor " +
              "efficiënt trappen en bekkenstabiliteit.",
          },
          {
            title: "Vertaling naar reach en stack",
            description:
              "Cockpitaanbevelingen gebruiken romp- en armverhoudingen zodat framemaat en " +
              "cockpitkeuzes samen blijven hangen.",
          },
          {
            title: "Prioriteit voor de volgende stap",
            description:
              "De engine stuurt je door naar de volgende relevante pagina, calculator of " +
              "gids in plaats van je met alleen een statische output achter te laten.",
          },
        ],
      },
    ],
    linksTitle: "Gerelateerde calculators en science-pagina's",
    links: [
      { href: "/calculators/bike-fit", label: "Bike fit calculator" },
      { href: "/calculators/saddle-height", label: "Zadelhoogte calculator" },
      { href: "/measurement-guide", label: "Meetgids" },
      { href: "/science/bike-fit-methods", label: "Bikefit-methodes uitgelegd" },
      { href: "/science/stack-and-reach", label: "Stack en reach gids" },
      { href: "/about", label: "Hoe BestBikeFit4U werkt" },
    ],
  },
};

export const stackCopy: Record<
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
    section: { eyebrow: string; title: string; description: string };
    cards: Array<{ title: string; description: string }>;
    linksTitle: string;
    links: Array<{ href: string; label: string }>;
  }
> = {
  en: {
    metadata: {
      title: "Stack and Reach Explained | BestBikeFit4U Science",
      description:
        "Learn how stack and reach work, why they are better than seat-tube sizing, " +
        "and how to use them for frame comparison alongside the guide library.",
      keywords: [
        "stack and reach explained",
        "bike frame sizing",
        "frame stack reach",
        "cycling geometry guide",
      ],
    },
    hero: {
      eyebrow: "Science",
      title: "Stack and Reach Explained",
      description:
        "Stack and reach provide a consistent way to compare bike frames across " +
        "brands without relying on inconsistent size labels or legacy fit shorthand.",
      chips: ["Vertical fit", "Horizontal fit", "Frame comparison"],
      caption: "These two coordinates say more about rider position than a nominal frame " + "size alone.",
      labels: ["Stack = vertical distance", "Reach = horizontal distance", "Useful across brands"],
    },
    section: {
      eyebrow: "Core concepts",
      title: "The geometry references that actually travel between frames",
      description:
        "Seat-tube sizing hides too much variation. Stack and reach give you a " +
        "cleaner baseline when you want to compare positions from one frame to " +
        "another.",
    },
    cards: [
      {
        title: "What is stack?",
        description:
          "Stack is the vertical distance from the bottom bracket to the top center of " +
          "the head tube. Higher stack generally means a more upright riding posture.",
      },
      {
        title: "What is reach?",
        description:
          "Reach is the horizontal distance from the bottom bracket to the same " +
          "head-tube reference point. Longer reach usually creates a more stretched " +
          "cockpit.",
      },
      {
        title: "Why it matters",
        description:
          "Stack and reach reflect real rider position and are the best baseline when " +
          "matching a frame to fit targets.",
      },
    ],
    linksTitle: "Continue reading",
    links: [
      { href: "/calculators/frame-size", label: "Frame Size Calculator" },
      { href: "/guides/road-bike-fit-guide", label: "Road Bike Fit Guide" },
      { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
      { href: "/science/bike-fit-methods", label: "Bike Fitting Methods Explained" },
      { href: "/about", label: "How BestBikeFit4U Works" },
    ],
  },
  nl: {
    metadata: {
      title: "Stack en reach uitgelegd | BestBikeFit4U Science",
      description:
        "Leer hoe stack en reach werken, waarom ze beter zijn dan framematen op " +
        "basis van zitbuislabels en hoe je ze gebruikt voor framevergelijking.",
      keywords: ["stack en reach uitgelegd", "fiets framemaat", "frame stack reach", "fietsgeometrie gids"],
    },
    hero: {
      eyebrow: "Wetenschap",
      title: "Stack en reach uitgelegd",
      description:
        "Stack en reach geven een consistente manier om fietsframes tussen merken te " +
        "vergelijken zonder te vertrouwen op inconsistente framelabels of oude " +
        "fit-afkortingen.",
      chips: ["Verticale fit", "Horizontale fit", "Framevergelijking"],
      caption: "Deze twee coordinaten zeggen meer over rijpositie dan alleen een nominale " + "framemaat.",
      labels: ["Stack = verticale afstand", "Reach = horizontale afstand", "Handig tussen merken"],
    },
    section: {
      eyebrow: "Kernbegrippen",
      title: "De geometrieverwijzingen die echt tussen frames meereizen",
      description:
        "Zitbuismaten verbergen te veel variatie. Stack en reach geven je een " +
        "schonere basis wanneer je posities van het ene frame naar het andere wilt " +
        "vergelijken.",
    },
    cards: [
      {
        title: "Wat is stack?",
        description:
          "Stack is de verticale afstand van het bracket tot het bovenste middelpunt " +
          "van de balhoofdbuis. Meer stack betekent meestal een rechtere rijhouding.",
      },
      {
        title: "Wat is reach?",
        description:
          "Reach is de horizontale afstand van het bracket tot hetzelfde " +
          "referentiepunt op de balhoofdbuis. Meer reach geeft meestal een langere " +
          "cockpit.",
      },
      {
        title: "Waarom het telt",
        description:
          "Stack en reach weerspiegelen echte rijpositie en zijn de beste basis om een " +
          "frame aan fitdoelen te koppelen.",
      },
    ],
    linksTitle: "Verder lezen",
    links: [
      { href: "/calculators/frame-size", label: "Framemaat calculator" },
      { href: "/guides/road-bike-fit-guide", label: "Racefiets fit gids" },
      { href: "/calculators/bike-fit", label: "Bike fit calculator" },
      { href: "/science/bike-fit-methods", label: "Bikefit-methodes uitgelegd" },
      { href: "/about", label: "Hoe BestBikeFit4U werkt" },
    ],
  },
};

export const scienceExtras = {
  en: {
    diagram: "Stack and reach measured from the bottom bracket to the top center of the " + "head tube",
    diagramCaption:
      "Schematic, not to scale. Stack is vertical and reach is horizontal. " +
      "Both use the bottom bracket and the top center of the head tube as " +
      "reference points.",
    ctaTitle: "Put the explanation into practice.",
    ctaDescription: "Use your measurements as a starting point, then test your position on the bike.",
    fitCta: "Start your bike fit",
    frameCta: "Calculate frame size",
  },
  nl: {
    diagram: "Stack en reach gemeten van de trapas tot het bovenste middelpunt van de " + "balhoofdbuis",
    diagramCaption:
      "Schematisch, niet op schaal. Stack is verticaal en reach horizontaal. " +
      "Beide gebruiken de trapas en het bovenste middelpunt van de balhoofdbuis " +
      "als referentiepunten.",
    ctaTitle: "Van uitleg naar jouw afstelling.",
    ctaDescription: "Gebruik je maten als vertrekpunt en test daarna je positie op de fiets.",
    fitCta: "Start je bikefit",
    frameCta: "Bereken je framemaat",
  },
};

type MethodItem = {
  name: string;
  focus: string;
  strength: string;
  limit: string;
};

type EngineCard = {
  title: string;
  description: string;
};
