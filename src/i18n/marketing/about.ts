import type { Locale } from "@/i18n/config";

export const aboutPresentation = {
  nl: {
    eyebrow: "Methodiek",
    imageAlt: "Meetgereedschap als basis voor een bikefit",
    chips: ["Biomechanische basis", "Praktische afstelstappen", "NL en EN beschikbaar"],
    trustEyebrow: "Waarom dit betrouwbaar voelt",
    trustTitle: "Methodiek zonder schijnnauwkeurigheid",
    trustBody: "Deze pagina laat zien hoe BestBikeFit4U van fitprincipes naar bruikbare keuzes komt.",
    scienceEyebrow: "Van maten naar afstelling",
    ctaEyebrow: "Start je fit",
  },
  en: {
    eyebrow: "Methodology",
    imageAlt: "Measuring tools as the basis for a bike fit",
    chips: ["Biomechanical foundation", "Practical setup steps", "Available in Dutch and English"],
    trustEyebrow: "Why this feels trustworthy",
    trustTitle: "Methodology without false precision",
    trustBody: "This page shows how BestBikeFit4U moves from fitting principles to usable decisions.",
    scienceEyebrow: "From measurements to setup",
    ctaEyebrow: "Start your fit",
  },
};

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

export const aboutCopy: Record<Locale, AboutCopy> = {
  en: {
    metadata: {
      title: "How BestBikeFit4U Works | Bike Fitting Methodology",
      description:
        "Learn how BestBikeFit4U turns proven bike fitting methods, rider-specific inputs, and " +
        "practical adjustment priorities into clearer fit guidance.",
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
      "BestBikeFit4U uses proven biomechanical formulas developed over decades of " +
      "professional bike fitting research. Our algorithm combines established methods to " +
      "provide recommendations tailored to your body, riding style, and goals.",
    saddleTitle: "Saddle Height Calculation",
    saddleBody1:
      "We use the LeMond/Hamley method as our baseline. This formula multiplies inseam by a " +
      "bike-specific coefficient to estimate saddle height from bottom bracket center to " +
      "saddle top.",
    saddleBody2: "We then apply adjustments based on:",
    saddleBullets: [
      "Flexibility score and mobility limits",
      "Core stability and ability to hold position",
      "Bike category and terrain demands",
      "Goal orientation: comfort vs performance",
    ],
    reachTitle: "Reach and Stack Targets",
    reachBody1:
      "Reach uses torso and arm proportions to create a balanced cockpit. Stack and reach " +
      "coordinates are used for cross-brand frame comparisons.",
    reachBody2: "The algorithm adapts to riding style:",
    reachBullets: [
      "Comfort: higher stack and shorter reach",
      "Balanced: moderate all-round position",
      "Performance: lower stack and longer reach",
      "Aero: aggressive racing geometry",
    ],
    dropTitle: "Handlebar Drop",
    dropBody1:
      "The vertical saddle-to-bar distance strongly affects comfort and aerodynamics. We " +
      "estimate drop based on flexibility, torso proportions, and ambition.",
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
      { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
      { href: "/science/bike-fit-methods", label: "Bike Fitting Methods Explained" },
      { href: "/science/stack-and-reach", label: "Stack and Reach Guide" },
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
        "Lees hoe BestBikeFit4U bewezen bikefitting-methodes, persoonlijke gegevens en praktische " +
        "afstelprioriteiten vertaalt naar duidelijkere fitbegeleiding.",
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
      "BestBikeFit4U gebruikt bewezen biomechanische formules uit jarenlange " +
      "bikefitting-praktijk. Het algoritme combineert meerdere methodes tot aanbevelingen " +
      "die passen bij jouw lichaam, rijstijl en doelen.",
    saddleTitle: "Berekening van zadelhoogte",
    saddleBody1:
      "Als basis gebruiken we de LeMond/Hamley-methode. Deze formule gebruikt je " +
      "binnenbeenlengte en een fietsafhankelijke factor om zadelhoogte te schatten.",
    saddleBody2: "Daarna corrigeren we op basis van:",
    saddleBullets: [
      "Flexibiliteit en mobiliteit",
      "Rompstabiliteit en houdingscontrole",
      "Fietstype en terrein",
      "Doelstelling: comfort versus prestaties",
    ],
    reachTitle: "Reach- en stackdoelen",
    reachBody1:
      "Reach wordt bepaald met romp- en armverhoudingen voor een gebalanceerde cockpit. Met " +
      "stack en reach kun je framemerken goed vergelijken.",
    reachBody2: "Het algoritme past aan op rijstijl:",
    reachBullets: [
      "Comfort: hogere stack en kortere reach",
      "Gebalanceerd: allround positie",
      "Prestatie: lagere stack en langere reach",
      "Aero: agressieve racepositie",
    ],
    dropTitle: "Stuurdrop",
    dropBody1:
      "De verticale afstand tussen zadel en stuur is belangrijk voor comfort en " +
      "aerodynamica. We schatten drop op basis van flexibiliteit, torsoverhouding en " +
      "ambitie.",
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
        text:
          "Gebaseerd op binnenbeenlengte en bewegingsvrijheid voor efficienter trappen en minder " +
          "gewrichtsbelasting.",
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
    considerBody: "Onze aanbevelingen combineren meerdere gegevens:",
    considerBullets: [
      "Lengte en binnenbeenlengte",
      "Arm- en torso-lengte",
      "Schouderbreedte",
      "Flexibiliteitstest",
      "Rompstabiliteit",
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
      { href: "/calculators/bike-fit", label: "Bike fit calculator" },
      { href: "/science/bike-fit-methods", label: "Bikefit-methodes uitgelegd" },
      { href: "/science/stack-and-reach", label: "Stack en reach gids" },
    ],
    ctaTitle: "Klaar voor een duidelijkere volgende fitstap?",
    ctaBody:
      "Start een gratis fitsessie en bekijk praktische fitbegeleiding op basis van bewezen bikefitting-methodes.",
    ctaButton: "Start gratis fit",
  },
};


export const aboutTrustPoints = {
  "en": [
    {
      "title": "Built on proven biomechanics",
      "description":
        "We start from established fit methods and translate them into practical decisions " +
        "instead of abstract theory."
    },
    {
      "title": "Measurable and repeatable",
      "description": "The output is designed to make setups comparable and rebuildable in millimeters and degrees."
    },
    {
      "title": "Built for real rides",
      "description": "Goals, terrain, flexibility, and comfort remain part of the interpretation, not just the formula."
    }
  ],
  "nl": [
    {
      "title": "Bewezen biomechanische uitgangspunten",
      "description":
        "We vertrekken vanuit bekende fitmethodes en vertalen die naar praktische beslissingen " +
        "in plaats van losse theorie."
    },
    {
      "title": "Meetbaar en herhaalbaar",
      "description":
        "De uitkomst maakt fietsafstellingen vergelijkbaar en opnieuw instelbaar in " +
        "millimeters en graden."
    },
    {
      "title": "Gebouwd voor echte ritten",
      "description":
        "Doelen, terrein, flexibiliteit en comfort blijven onderdeel van de interpretatie, " +
        "niet alleen de formule."
    }
  ]
};
