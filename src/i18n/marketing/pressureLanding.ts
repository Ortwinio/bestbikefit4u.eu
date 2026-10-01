export const pressureLandingMessages = {
  en: {
    notFound: "Not found",
    description: (weight: number, bike: string) =>
      `Recommended front and rear tire pressure for a ${weight} kg ${bike} rider, ` +
      "with bar and PSI values plus a quick tube-type comparison.",
    keywords: (weight: number, bike: string) => [
      `tire pressure ${weight}kg ${bike}`,
      `${bike} tire pressure ${weight}kg`,
      `${bike} cyclist tire pressure`,
    ],
    breadcrumb: "Breadcrumb",
    home: "Home",
    calculator: "Tire Pressure Calculator",
    eyebrow: "BestBikeFit4U pressure guide",
    title: (weight: number, bike: string) => `Tire Pressure for ${weight}kg ${bike} Rider`,
    intro: (weight: number, bike: string) =>
      `This landing page gives a static starting recommendation for a ${weight} kg rider on a ${bike} ` +
      "with common tire widths. Use it as a quick reference, then move to the full calculator for your exact setup.",
    example: "Starting recommendation",
    illustration: "Pen illustration of a bicycle tire and pressure gauge",
    assumptions: "Here is what the recommendation is based on.",
    mass: "Rider and bike",
    width: "Front and rear tire width",
    surface: "Surface",
    goal: "Riding goal",
    balance: "Balance",
    surfaces: { average_asphalt: "Average asphalt", hardpack_gravel: "Hardpack gravel", trail: "Trail" },
    bikeAssumption: "Bike weight is a fixed assumption; no personal bike profile has been entered.",
    resultsEyebrow: "Front and rear tires",
    results: "Your starting pressures, side by side.",
    tubeType: "Tire setup",
    front: "Front",
    rear: "Rear",
    tubeless: "Tubeless",
    innerTube: "Inner tube",
    explanation: (width: number, surface: string) =>
      `Recommended pressure for a ${width}mm tubeless setup on ${surface}.`,
    innerTubeNote: "Inner tubes typically require slightly higher pressure to reduce pinch-flat risk.",
    baselineEyebrow: "How to use this baseline",
    baseline: "A reference, not a finish line.",
    steps: [
      {
        title: "Start with this recommendation",
        body: "Use it as a starting point, not as a fixed race-day pressure.",
      },
      {
        title: "Check your own tires",
        body: "Exact tire width, surface, and casing construction can still move the recommendation.",
      },
      { title: "Refine the calculation", body: "Switch to the full calculator when you want setup-specific numbers." },
    ],
    faq: "Frequently asked questions",
    faqTitle: "Does this advice always fit?",
    faqFixed: (front: number, rear: number, weight: number) =>
      `Is ${front}/${rear} bar a fixed pressure for every ${weight}kg rider?`,
    faqFixedAnswer:
      "No. It is a strong starting point based on rider weight, default tire width, surface, and bike type. " +
      "Your exact setup can still change the final number.",
    faqTubes: "Why compare tubeless with inner tubes?",
    faqTubesAnswer:
      "Tube type changes the safe and comfortable pressure range. " +
      "Tubeless setups usually support slightly lower pressures for the same rider and tire width.",
    next: "Make the recommendation fit your bike.",
    nextBody:
      "If you want a recommendation tied to your exact tire width, terrain, and tube type, " +
      "use the full calculator next.",
    cta: "Open Tire Pressure Calculator",
    guideCta: (bike: string) => `Read ${bike[0].toUpperCase() + bike.slice(1)} Fit Guide`,
    related: "Related tools and guides",
    schemaDescription: (weight: number, bike: string) =>
      `Static tire-pressure recommendation page for a ${weight} kg ${bike} rider.`,
  },
  nl: {
    notFound: "Niet gevonden",
    description: (weight: number, bike: string) =>
      `Aanbevolen voor- en achterdruk voor een rijder van ${weight} kg op een ${bike}, ` +
      "inclusief bar, PSI en vergelijking tussen tubeless en binnenband.",
    keywords: (weight: number, bike: string) => [
      `bandenspanning ${weight}kg ${bike}`,
      `${bike} bandenspanning ${weight}kg`,
      `${bike} bandendruk advies`,
    ],
    breadcrumb: "Broodkruimelpad",
    home: "Home",
    calculator: "Bandenspanningscalculator",
    eyebrow: "BestBikeFit4U bandenspanningsgids",
    title: (weight: number, bike: string) => `Bandenspanning voor ${weight}kg ${bike}`,
    intro: (weight: number, bike: string) =>
      `Weeg je ${weight} kg en rijd je op een ${bike}? Hier vind je een startadvies met gangbare bandbreedtes. ` +
      "Gebruik de volledige calculator voor advies op basis van je eigen banden en fiets.",
    example: "Startadvies",
    illustration: "Pentekening van een fietsband en bandenspanningsmeter",
    assumptions: "Hier is het advies op gebaseerd.",
    mass: "Rijder en fiets",
    width: "Bandbreedte voor en achter",
    surface: "Ondergrond",
    goal: "Voorkeur",
    balance: "Balans",
    surfaces: { average_asphalt: "Gemiddeld asfalt", hardpack_gravel: "Hard gravel", trail: "Bospad" },
    bikeAssumption: "Het fietsgewicht is een vaste aanname. Je eigen fietsprofiel is niet ingevuld.",
    resultsEyebrow: "Voor- en achterband",
    results: "Je startdruk voor en achter.",
    tubeType: "Bandtype",
    front: "Voorband",
    rear: "Achterband",
    tubeless: "Tubeless",
    innerTube: "Binnenband",
    explanation: (width: number, surface: string) =>
      `Aanbevolen spanning voor een tubeless band van ${width} mm op ${surface.toLowerCase()}.`,
    innerTubeNote: "Binnenband vraagt meestal iets meer druk om stootlekken te beperken.",
    baselineEyebrow: "Zo gebruik je de waarden",
    baseline: "Een referentie, geen eindpunt.",
    steps: [
      { title: "Begin bij dit advies", body: "Gebruik dit als startpunt, niet als definitieve wedstrijdspanning." },
      {
        title: "Bekijk je eigen banden",
        body: "Bandbreedte, ondergrond en bandtype kunnen je echte ideale druk nog verschuiven.",
      },
      { title: "Verfijn de berekening", body: "Gebruik de volledige calculator voor je eigen banden en fiets." },
    ],
    faq: "Veelgestelde vragen",
    faqTitle: "Past dit advies altijd?",
    faqFixed: (front: number, rear: number, weight: number) =>
      `Is ${front}/${rear} bar altijd juist voor elke rijder van ${weight} kg?`,
    faqFixedAnswer:
      "Nee. Dit is een sterk startpunt op basis van gewicht, standaard bandbreedte, ondergrond en fietstype. " +
      "Je eigen banden en fiets kunnen het eindadvies nog veranderen.",
    faqTubes: "Waarom vergelijk je tubeless met een binnenband?",
    faqTubesAnswer:
      "Het bandtype verandert het veilige en comfortabele drukbereik. " +
      "Tubeless kan meestal iets lager gereden worden bij dezelfde rijder en bandbreedte.",
    next: "Maak het advies passend voor je fiets.",
    nextBody:
      "Wil je advies op basis van je eigen bandbreedte, ondergrond en bandtype? " +
      "Gebruik dan de volledige calculator.",
    cta: "Open bandenspanningscalculator",
    guideCta: (bike: string) => `Lees de afstelgids voor je ${bike}`,
    related: "Gerelateerde tools en gidsen",
    schemaDescription: (weight: number, bike: string) =>
      `Statische bandenspanningspagina voor een rijder van ${weight} kg op een ${bike}.`,
  },
};
