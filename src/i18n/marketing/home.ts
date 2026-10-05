import type { Locale } from "@/i18n/config";

type HomeCopy = {
  badge: string; title: string; description: string; start: string; reportLink: string;
  toolsEyebrow: string; toolsTitle: string; toolsDescription: string;
  tools: { title: string; description: string }[];
  stepsTitle: string; painEyebrow: string; painTitle: string; readGuide: string;
  pains: { title: string; description: string }[]; testimonialsTitle: string;
  changes: string[]; reportTitle: string; crankAdvice: string;
  closingTitle: string; paused: string; account: string; compare: string;
  discover: string; foundations: string; guides: string; scenarios: string; allGuides: string;
  foundationLinks: { href: string; title: string }[];
  teaser: { try: string; title: string; inseam: string; direction: string; context: string; refine: string; adjust: string };
};

export const homeMarketing: Record<Locale, HomeCopy> = {
  nl: {
    badge: "Online bikefit · gratis starten, geen account nodig", title: "Haal meer uit elke rit.",
    description: "Stel je fiets af op jouw lichaam en rijstijl. Vul je maten in en krijg concrete millimeters voor zadel, reach en stuur.",
    start: "Start gratis bike fit", reportLink: "Wat zit in het rapport?",
    toolsEyebrow: "Gratis configurators", toolsTitle: "Kies wat je wilt afstellen", toolsDescription: "Gratis tools die je direct kunt gebruiken, zonder account.",
    tools: [
      { title: "Volledige bikefit", description: "Zadel, reach, drop en framemaat in één overzicht." },
      { title: "Zadelhoogte", description: "Een startwaarde in millimeters, met een aanpassingsmarge." },
      { title: "Framemaat", description: "Welke maat past bij jouw proporties?" },
      { title: "Bandenspanning", description: "Voor en achter, op basis van gewicht en ondergrond." },
      { title: "Zadelbreedte", description: "Schatting vanuit je zitbeenderen." },
      { title: "Cranklengte", description: "De cranklengte die past bij jouw rijpositie." },
      { title: "Verzet", description: "Ontwikkeling per pedaalslag, per versnelling." },
      { title: "Meetgids", description: "Meet op blote voeten met een boek tegen de muur." },
    ],
    stepsTitle: "Van meten naar rijden in drie stappen", painEyebrow: "Start bij je klacht", painTitle: "Waar knelt het?", readGuide: "Lees de gids",
    pains: [
      { title: "Knieën", description: "Lees hoe zadelpositie en cleats knieklachten beïnvloeden." },
      { title: "Onderrug", description: "Lees over reach, drop en zadelhoek bij rugklachten." },
      { title: "Handen & nek", description: "Lees over reach, stuurbreedte en druk op je handen." },
      { title: "Zadelpijn", description: "Breedte, zadelterugstand en kanteling samen bekeken." },
    ],
    testimonialsTitle: "Kleine aanpassing, groot verschil", changes: ["zadel −4 mm", "stuur +10 mm", "zadel 3 mm terug"],
    reportTitle: "Je rapport bevat de getallen die ertoe doen", crankAdvice: "Advies voor cranklengte",
    closingTitle: "Begin met een gratis account.",
    paused: "Losse meting €13,50 of jaarabonnement €21,50 per jaar. Je kunt altijd gratis beginnen.",
    account: "Maak gratis account", compare: "Bekijk prijzen",
    discover: "Verdiep je verder", foundations: "Fitfundament", guides: "Bikefitting gidsen", scenarios: "Rijsituaties en klachten", allGuides: "Bekijk alle gidsen",
    foundationLinks: [{ href: "/guides/road-bike-fit-guide", title: "Racefiets afstellen" }, { href: "/bikefitting", title: "Bikefitting uitgelegd" }, { href: "/measurement-guide", title: "Meetgids" }, { href: "/pain", title: "Bikefit bij veelvoorkomende klachten" }, { href: "/science/stack-and-reach", title: "Stack en reach uitgelegd" }],
    teaser: { try: "Probeer het nu", title: "Startpunt voor je zadel", inseam: "Binnenbeenlengte", direction: "trapas → bovenkant zadel", context: "Racefiets · gebalanceerd · gemiddelde lenigheid en rompstabiliteit. Aanpassingsmarge:", refine: "Verfijn je zadelhoogte", adjust: "Schuif naar jouw maat" },
  },
  en: {
    badge: "Online bike fit · start free, no account needed", title: "Get more from every ride.",
    description: "Set up your bike for your body and riding style. Enter your measurements and get concrete millimeters for saddle, reach, and handlebars.",
    start: "Start free bike fit", reportLink: "What's in the report?",
    toolsEyebrow: "Free calculators", toolsTitle: "Choose what to adjust", toolsDescription: "Free tools you can use right away, without an account.",
    tools: [
      { title: "Complete bike fit", description: "Saddle, reach, drop, and frame size in one overview." },
      { title: "Saddle height", description: "A starting point in millimeters, with an adjustment range." },
      { title: "Frame size", description: "Which size suits your proportions?" },
      { title: "Tire pressure", description: "Front and rear, based on weight and surface." },
      { title: "Saddle width", description: "An estimate based on your sit bones." },
      { title: "Crank length", description: "Crank length to suit your riding position." },
      { title: "Gearing", description: "Distance per pedal stroke, in each gear." },
      { title: "Measurement guide", description: "Measure barefoot with a book against the wall." },
    ],
    stepsTitle: "From measuring to riding in three steps", painEyebrow: "Start with your discomfort", painTitle: "Where does it hurt?", readGuide: "Read the guide",
    pains: [
      { title: "Knees", description: "Read how saddle position and cleats affect knee discomfort." },
      { title: "Lower back", description: "Learn about reach, drop, and saddle angle for back discomfort." },
      { title: "Hands & neck", description: "Read about reach, bar width, and pressure on your hands." },
      { title: "Saddle discomfort", description: "Consider saddle width, setback, and tilt together." },
    ],
    testimonialsTitle: "Small adjustment, big difference", changes: ["saddle −4 mm", "handlebars +10 mm", "saddle 3 mm back"],
    reportTitle: "Your report has the numbers that matter", crankAdvice: "Crank length advice",
    closingTitle: "Start with a free account.",
    paused: "Single fit €13.50 or annual plan €21.50 per year. You can always start free.",
    account: "Create free account", compare: "View pricing",
    discover: "Explore further", foundations: "Fit foundations", guides: "Bike fitting guides", scenarios: "Riding scenarios and discomfort", allGuides: "View all guides",
    foundationLinks: [{ href: "/bike-fitting", title: "Bike fitting at home" }, { href: "/measurement-guide", title: "Measurement guide" }, { href: "/pain", title: "Bike fit for common pain points" }, { href: "/science/stack-and-reach", title: "Stack and reach explained" }, { href: "/guides/road-bike-fit-guide", title: "Road bike fit guide" }],
    teaser: { try: "Try it now", title: "A starting point for your saddle", inseam: "Inseam", direction: "bottom bracket → saddle top", context: "Road bike · balanced · average flexibility and core stability. Adjustment range:", refine: "Refine your saddle height", adjust: "Slide to your measurement" },
  },
};
