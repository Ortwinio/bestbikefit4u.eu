export const frameSizeMessages = {
  en: {
    eyebrow: "Frame size · shortlist smarter",
    title: "Which size fits you?",
    description:
      "Start with your measurements. Compare the shortlist with the manufacturer's stack, " +
      "reach and cockpit.",
    body: "Your measurements",
    bike: "Bike category",
    height: "Height",
    inseam: "Inseam",
    heightHint: "Measure standing tall without shoes.",
    inseamHint: "Barefoot, hold a book firmly between your legs against a wall.",
    confirmHeight: "Confirm my height",
    confirmInseam: "Confirm my inseam",
    confirmed: "Measurements confirmed",
    example: "Example measurements — adjust or confirm both measurements to use your own result.",
    exampleResult: "Example shortlist",
    shortlist: "Your shortlist",
    scale: "Frame size bands",
    recommended: "shortlist",
    limit:
      "A starting point based on height and bike category, not a fit guarantee. Inseam " +
      "changes the saddle estimate, not this size band.",
    proportions: "Your proportions",
    ratio: "Inseam / height",
    ratioHint: "Measurement context only. This ratio does not select a larger or smaller frame.",
    low: "Lower ratio",
    high: "Higher ratio",
    measurementCheck: "Check your measurements",
    saddle: "Saddle-height baseline",
    saddleHint: "A quick estimate; refine your saddle position separately.",
    nextTitle: "Size is the first filter",
    nextBody:
      "Stack, reach and cockpit determine whether a bike really fits. Compare these " +
      "measurements with the manufacturer's geometry.",
    startFit: "Start complete bike fit",
    geometry: "Understand stack and reach",
    resultLink: "View result",
    categories: {
      road: { label: "Road", description: "Road, endurance" },
      gravel: { label: "Gravel", description: "Allroad, bikepacking" },
      mtb: { label: "MTB", description: "Trail, XC" },
      city: { label: "City / touring", description: "Trekking, hybrid" },
    },
  },
  nl: {
    eyebrow: "Framemaat · slim shortlisten",
    title: "Welke maat past bij jou?",
    description:
      "Begin met je maten. Vergelijk je shortlist met stack, reach en cockpit van de fabrikant.",
    body: "Jouw maten",
    bike: "Soort fiets",
    height: "Lichaamslengte",
    inseam: "Binnenbeenlengte",
    heightHint: "Meet rechtop zonder schoenen.",
    inseamHint: "Blootsvoets, met een boek stevig tussen je benen tegen de muur.",
    confirmHeight: "Bevestig mijn lichaamslengte",
    confirmInseam: "Bevestig mijn binnenbeenlengte",
    confirmed: "Maten bevestigd",
    example:
      "Voorbeeldmaten — pas beide maten aan of bevestig ze om je eigen resultaat te gebruiken.",
    exampleResult: "Voorbeeldshortlist",
    shortlist: "Je shortlist",
    scale: "Framemaatschalen",
    recommended: "shortlist",
    limit:
      "Een startpunt op lichaamslengte en soort fiets, geen pasgarantie. Binnenbeenlengte " +
      "verandert de zadelschatting, niet deze maatband.",
    proportions: "Jouw proporties",
    ratio: "Binnenbeen / lichaamslengte",
    ratioHint: "Alleen meetcontext. Deze verhouding kiest geen grotere of kleinere framemaat.",
    low: "Lagere verhouding",
    high: "Hogere verhouding",
    measurementCheck: "Controleer je metingen",
    saddle: "Basis voor zadelhoogte",
    saddleHint: "Een snelle schatting; verfijn je zadelpositie apart.",
    nextTitle: "Maat is de eerste filter",
    nextBody:
      "Stack, reach en cockpit bepalen of een fiets echt past. Vergelijk deze maten met de " +
      "geometrie van de fabrikant.",
    startFit: "Start complete bike fit",
    geometry: "Stack en reach uitgelegd",
    resultLink: "Bekijk resultaat",
    categories: {
      road: { label: "Race", description: "Wegfiets, lange ritten" },
      gravel: { label: "Gravel", description: "Allroad, bikepacking" },
      mtb: { label: "MTB", description: "Trail, XC" },
      city: { label: "Stad / tour", description: "Trekking, hybride" },
    },
  },
};
export type FrameSizeCalculatorCopy = typeof frameSizeMessages.en;
