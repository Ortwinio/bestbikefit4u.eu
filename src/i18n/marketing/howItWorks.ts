import type { Locale } from "@/i18n/config";

export const howItWorksPresentation = {
  nl: {
    heroAlt: "Pentekening van een racefiets als vertrekpunt voor je afstelling",
    heroCaption: "Jouw lichaam. Jouw fiets. Een praktische volgende stap.",
    processEyebrow: "Van meten naar afstellen",
    processTitle: "Inzicht zonder omwegen.",
    measurementLink: "Bekijk de meetgids",
    prepEyebrow: "Voorbereiding & resultaat",
    prepHeading: "Weet wat je nodig hebt. En wat je terugkrijgt.",
    prepAlt: "Meetlint en meetgereedschap om je lichaamsmaten voor te bereiden",
    helpEyebrow: "Werk stap voor stap",
    helpTitle: "De juiste hulp op het juiste moment.",
    helpIntro: "Meet eerst, bereken je eerste bikefit en kijk daarna gericht naar je zadelhoogte of reach.",
    links: [
      { href: "/measurement-guide", title: "Meet zorgvuldig", body: "De meetgids helpt je aan een goede basis." },
      { href: "/calculators/bike-fit", title: "Bereken je bikefit", body: "Bekijk je afstelling in samenhang." },
      { href: "/calculators/saddle-height", title: "Controleer je zadelhoogte", body: "Zoom in op één belangrijk afstelpunt." },
      { href: "/science/calculation-engine", title: "Bekijk de onderbouwing", body: "Lees hoe je afsteladvies tot stand komt." },
    ],
    ctaEyebrow: "Kies je volgende stap",
    ctaTitle: "Begin klein. Of bekijk het geheel.",
    ctaBody: "De gratis fit geeft meer context. De calculator geeft een snelle eerste richting als je nog niet klaar bent voor de volledige vragenlijst.",
  },
  en: {
    heroAlt: "Pen drawing of a road bike as the starting point for your setup",
    heroCaption: "Your body. Your bike. A practical next step.",
    processEyebrow: "From measuring to adjusting",
    processTitle: "Clarity without detours.",
    measurementLink: "View the measurement guide",
    prepEyebrow: "Preparation & results",
    prepHeading: "Know what you need. And what you get back.",
    prepAlt: "Tape measure and measuring tools to prepare your body measurements",
    helpEyebrow: "Work step by step",
    helpTitle: "The right help at the right moment.",
    helpIntro: "Measure first, calculate your first bike fit, then take a closer look at saddle height or reach.",
    links: [
      { href: "/measurement-guide", title: "Measure carefully", body: "The measurement guide helps you build a solid foundation." },
      { href: "/calculators/bike-fit", title: "Calculate your bike fit", body: "Look at your whole setup together." },
      { href: "/calculators/saddle-height", title: "Check your saddle height", body: "Focus on one important adjustment." },
      { href: "/science/calculation-engine", title: "Explore the reasoning", body: "Read how your fit guidance is calculated." },
    ],
    ctaEyebrow: "Choose your next step",
    ctaTitle: "Start small. Or see the whole picture.",
    ctaBody: "The free fit gives you more context. The calculator gives a quick first direction if you are not ready for the full questionnaire yet.",
  },
};

export const howItWorksCopy: Record<
  Locale,
  {
    metadata: { title: string; description: string; keywords: string[] };
    eyebrow: string;
    title: string;
    intro: string;
    sectionTitle: string;
    sectionIntro: string;
    prepTitle: string;
    prepBody: string;
    afterTitle: string;
    afterBody: string;
    primaryCta: string;
    secondaryCta: string;
    steps: Array<{ title: string; body: string }>;
  }
> = {
  en: {
    metadata: {
      title: "How It Works | BestBikeFit4U",
      description:
        "See how BestBikeFit4U turns your measurements, riding goals, and bike context into practical fit guidance.",
      keywords: ["how online bike fit works", "bike fit process", "digital bike fitting"],
    },
    eyebrow: "Transparent process",
    title: "How BestBikeFit4U works",
    intro:
      "BestBikeFit4U combines your body measurements, riding goals, and bike context to help you make clearer fit decisions. The goal is a better next step on the bike you actually ride.",
    sectionTitle: "What happens in the fit flow",
    sectionIntro:
      "The flow is designed to move from useful inputs to practical recommendations without forcing riders through unnecessary complexity.",
    prepTitle: "What to prepare before you start",
    prepBody:
      "Bring your body measurements, a rough sense of your riding goals, and the bike context that matters most. The better the context, the clearer the output.",
    afterTitle: "What happens after you submit",
    afterBody:
      "You get fit guidance that helps you review your current position, understand the likely tradeoffs, and decide what to test next in a more structured way.",
    primaryCta: "Start Free Fit",
    secondaryCta: "Open Bike Fit Calculator",
    steps: [
      {
        title: "Step 1: Enter your measurements",
        body: "Start with the measurements that matter most for practical fit guidance, including height and inseam, with optional extra inputs when you have them.",
      },
      {
        title: "Step 2: Add your riding context",
        body: "Describe how you ride, what kind of bike you use, and whether comfort, performance, or bike choice is the bigger priority right now.",
      },
      {
        title: "Step 3: Review your recommendations",
        body: "See a clearer fit starting point, practical setup targets, and the most sensible next adjustments to review first.",
      },
    ],
  },
  nl: {
    metadata: {
      title: "Hoe het werkt | BestBikeFit4U",
      description:
        "Bekijk hoe BestBikeFit4U jouw metingen, rijdoelen en fietscontext omzet in praktische fit-aanbevelingen.",
      keywords: ["hoe online bikefit werkt", "bikefit proces", "digitale bikefitting"],
    },
    eyebrow: "Transparant proces",
    title: "Hoe BestBikeFit4U werkt",
    intro:
      "BestBikeFit4U combineert je lichaamsmetingen, rijdoelen en fietscontext om je te helpen duidelijkere fitbeslissingen te nemen. Het doel is een betere volgende stap op de fiets die je echt rijdt.",
    sectionTitle: "Zo verloopt je bikefit",
    sectionIntro:
      "Je vult je gegevens in en krijgt praktische aanbevelingen. Zonder onnodige stappen.",
    prepTitle: "Wat je voorbereidt voordat je start",
    prepBody:
      "Zorg voor je lichaamsmetingen, een globaal beeld van je rijdoelen en de fietscontext die het belangrijkst is. Hoe beter de context, hoe duidelijker de uitkomst.",
    afterTitle: "Wat er gebeurt na het invullen",
    afterBody:
      "Je krijgt fitadvies waarmee je je huidige positie kunt beoordelen, de belangrijkste afwegingen begrijpt en gerichter kunt bepalen wat je daarna wilt testen.",
    primaryCta: "Start gratis fit",
    secondaryCta: "Bereken je bikefit",
    steps: [
      {
        title: "Stap 1: Vul je metingen in",
        body: "Begin met de metingen die het belangrijkst zijn voor praktisch fitadvies, zoals lengte en binnenbeenlengte, met extra optionele inputs als je die hebt.",
      },
      {
        title: "Stap 2: Voeg je rijcontext toe",
        body: "Beschrijf hoe je rijdt, wat voor fiets je gebruikt en of comfort, prestaties of fietskeuze nu de belangrijkste prioriteit is.",
      },
      {
        title: "Stap 3: Bekijk je aanbevelingen",
        body: "Zie een duidelijker fit-startpunt, praktische afsteldoelen en de meest logische volgende aanpassingen om als eerste te beoordelen.",
      },
    ],
  },
};
