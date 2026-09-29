const en = {
  eyebrow: "Free bike fit · your starting point",
  title: "Build your first fit profile",
  description:
    "Slide in your measurements and riding style. See a starting position to test on your own bike.",
  bodyTitle: "Your body",
  ridingTitle: "Your riding style",
  height: "Height",
  heightHint: "Stand upright without shoes.",
  inseam: "Inseam",
  inseamHint: "Measure barefoot from the floor to the top of a book held firmly between your legs.",
  measureLink: "How do I measure this?",
  source: "Where did your measurements come from?",
  sources: { missing: "Example", measured: "Measured", estimated: "Estimated" },
  exampleNote:
    "These are example measurements. Choose measured or estimated before using the result " +
    "as your own.",
  measuredNote: "Your measured height and inseam are now used for this starting point.",
  estimatedNote: "These measurements are estimates. Measure again before changing your bike.",
  category: "Bike category",
  categories: { road: "Road", gravel: "Gravel", mtb: "MTB", city: "City / touring" },
  goal: "Riding goal",
  goals: { comfort: "Comfort", balanced: "Balanced", performance: "Performance", aero: "Aero" },
  goalHints: {
    comfort: "A relaxed position",
    balanced: "Comfort and pace",
    performance: "A more sporting position",
    aero: "Lower and more aerodynamic",
  },
  aeroAdjusted: "For city and mountain bikes, the aero choice uses the performance starting point.",
  flexibility: "Flexibility",
  flexibilityHint: "Choose the level you can hold comfortably, without forcing the stretch.",
  flexibilityLevels: ["Very limited", "Limited", "Average", "Good", "Excellent"],
  core: "Core stability",
  coreHint: "Think about how steadily you can hold your riding posture.",
  coreLevels: ["Very low", "Low", "Average", "Good", "Excellent"],
  example: "Example result",
  resultTitle: "Your position, live",
  visualHint: "Illustration, not to scale",
  visualAlt:
    "Side view of a bicycle with saddle height, horizontal reach and signed handlebar drop",
  resultsLabel: "Fit starting points",
  confidenceLabel: "Input confidence",
  confidence: {
    high: "High confidence",
    medium: "Moderate confidence",
    lower: "Limited confidence",
  },
  saddle: "Saddle height",
  saddleReference: "From bottom-bracket centre to saddle top, along the seat tube.",
  saddleBand: "Safe starting band",
  reach: "Saddle-to-bar reach",
  reachReference: "Horizontal distance from saddle nose to handlebar centre.",
  reachBand: "Reach range",
  drop: "Saddle-to-bar drop",
  barsAbove: "Handlebars above the saddle",
  barsBelow: "Handlebars below the saddle",
  barsLevel: "Handlebars level with the saddle",
  frameSize: "Frame-size shortlist",
  frameHint: "Check the actual frame geometry before choosing a size.",
  frameTargets: "Frame targets",
  stack: "Stack target",
  frameReach: "Frame reach target",
  targetsHint: "Starting targets; compare stack, reach and cockpit on the actual bicycle.",
  setback: "Saddle setback",
  setbackReference: "Saddle nose behind the bottom bracket",
  orderTitle: "Adjust in this order",
  orderHeight: "Start with saddle height",
  orderHeightHint: "Make small changes and test them over a few rides.",
  orderSetback: "Then check setback",
  orderSetbackHint: "Measure the saddle nose behind the bottom bracket.",
  orderBars: "Check handlebar height and reach last",
  orderBarsHint: "The full account flow also covers cleats and your current setup.",
  warningsTitle: "Check before you adjust",
  warnings: {
    saddle_too_high:
      "The saddle starting point is relatively high. If it feels uncomfortable, lower it gradually.",
    saddle_too_low:
      "The saddle starting point is relatively low. If it feels cramped, raise it gradually.",
    drop_risk:
      "This handlebar drop needs care. Try a more upright position if you cannot sustain it " +
      "comfortably.",
    reach_risk:
      "Reach is near the upper end. If your hands feel numb, consider a shorter or higher cockpit.",
    flexibility_warning:
      "The handlebar drop may be demanding for your flexibility. Try a higher handlebar position.",
    core_warning:
      "The handlebar drop may become tiring with your current core stability. Try a more " +
      "upright position.",
    measurement_warning:
      "Your height and inseam are an unusual combination. Check both measurements before adjusting.",
  },
  limitsTitle: "A starting point, not a final fit",
  limits:
    "Cleat stack, saddle shape and asymmetry are not included. Persistent pain needs an " +
    "in-person assessment.",
  accountCta: "Create a free account",
  accountHint:
    "Build your rider profile and start a personal fit. These calculator values are not " +
    "saved automatically.",
  stickyLink: "View result",
};

const nl: typeof en = {
  eyebrow: "Gratis bike fit · jouw startpunt",
  title: "Bouw je eerste fitprofiel",
  description:
    "Schuif je maten en rijstijl in. Bekijk een startpositie om op je eigen fiets te testen.",
  bodyTitle: "Jouw lichaam",
  ridingTitle: "Jouw rijstijl",
  height: "Lichaamslengte",
  heightHint: "Meet rechtop zonder schoenen.",
  inseam: "Binnenbeenlengte",
  inseamHint:
    "Meet blootsvoets van de vloer tot de bovenkant van een boek dat je stevig tussen je " +
    "benen klemt.",
  measureLink: "Hoe meet ik dit?",
  source: "Herkomst van je maten",
  sources: { missing: "Voorbeeld", measured: "Zelf gemeten", estimated: "Geschat" },
  exampleNote:
    "Dit zijn voorbeeldmaten. Kies zelf gemeten of geschat voordat je de uitkomst als jouw " +
    "advies gebruikt.",
  measuredNote:
    "Je gemeten lichaamslengte en binnenbeenlengte worden nu gebruikt voor dit startpunt.",
  estimatedNote: "Deze maten zijn schattingen. Meet opnieuw voordat je iets aan je fiets verstelt.",
  category: "Type fiets",
  categories: { road: "Race", gravel: "Gravel", mtb: "MTB", city: "Stad / tour" },
  goal: "Rijdoel",
  goals: { comfort: "Comfort", balanced: "Gebalanceerd", performance: "Prestatie", aero: "Aero" },
  goalHints: {
    comfort: "Een ontspannen houding",
    balanced: "Comfort en tempo",
    performance: "Een sportievere houding",
    aero: "Lager en aerodynamischer",
  },
  aeroAdjusted:
    "Bij stadsfietsen en mountainbikes gebruikt de keuze aero het startpunt voor prestatie.",
  flexibility: "Lenigheid",
  flexibilityHint: "Kies wat je ontspannen kunt volhouden, zonder de rek te forceren.",
  flexibilityLevels: ["Zeer beperkt", "Beperkt", "Gemiddeld", "Goed", "Uitstekend"],
  core: "Rompstabiliteit",
  coreHint: "Bedenk hoe stabiel je jouw fietshouding kunt vasthouden.",
  coreLevels: ["Zeer laag", "Laag", "Gemiddeld", "Goed", "Uitstekend"],
  example: "Voorbeelduitkomst",
  resultTitle: "Jouw positie, live",
  visualHint: "Illustratie, niet op schaal",
  visualAlt:
    "Zijaanzicht van een fiets met zadelhoogte, horizontale reach en stuurdrop met richting",
  resultsLabel: "Startpunten voor je fit",
  confidenceLabel: "Invoerkwaliteit",
  confidence: {
    high: "Hoge betrouwbaarheid",
    medium: "Gemiddelde betrouwbaarheid",
    lower: "Beperkte betrouwbaarheid",
  },
  saddle: "Zadelhoogte",
  saddleReference: "Van midden trapas tot bovenkant zadel, langs de zadelbuis.",
  saddleBand: "Veilige startzone",
  reach: "Reach zadelneus → stuur",
  reachReference: "Horizontaal van zadelneus tot stuurmidden.",
  reachBand: "Reach-bereik",
  drop: "Drop zadel → stuur",
  barsAbove: "Stuur boven het zadel",
  barsBelow: "Stuur onder het zadel",
  barsLevel: "Stuur op zadelhoogte",
  frameSize: "Framemaat om te vergelijken",
  frameHint: "Controleer de echte framegeometrie voordat je een maat kiest.",
  frameTargets: "Framedoelen",
  stack: "Stack-doel",
  frameReach: "Frame reach-doel",
  targetsHint: "Startdoelen; vergelijk stack, reach en cockpit op de echte fiets.",
  setback: "Setback van het zadel",
  setbackReference: "Zadelneus achter de trapas",
  orderTitle: "Pas in deze volgorde aan",
  orderHeight: "Begin met de zadelhoogte",
  orderHeightHint: "Verstel in kleine stappen en test het een paar ritten.",
  orderSetback: "Controleer daarna de setback",
  orderSetbackHint: "Meet de zadelneus achter de trapas.",
  orderBars: "Controleer stuurhoogte en reach als laatste",
  orderBarsHint: "De volledige fit in je account neemt ook cleats en je huidige afstelling mee.",
  warningsTitle: "Controleer voordat je verstelt",
  warnings: {
    saddle_too_high:
      "De zadelstartwaarde is relatief hoog. Voelt dat onprettig, verlaag dan geleidelijk.",
    saddle_too_low:
      "De zadelstartwaarde is relatief laag. Voelt het krap, verhoog dan geleidelijk.",
    drop_risk:
      "Deze stuurdrop vraagt aandacht. Probeer een rechtere houding als je dit niet prettig " +
      "kunt volhouden.",
    reach_risk:
      "De reach zit aan de lange kant. Bij dove handen kun je een kortere of hogere cockpit proberen.",
    flexibility_warning:
      "De stuurdrop kan veel vragen van je lenigheid. Probeer het stuur hoger te zetten.",
    core_warning:
      "De stuurdrop kan vermoeiend worden met je huidige rompstabiliteit. Probeer een " +
      "rechtere houding.",
    measurement_warning:
      "Lichaamslengte en binnenbeenlengte vormen een ongebruikelijke combinatie. Meet beide opnieuw.",
  },
  limitsTitle: "Een startpunt, geen eindafstelling",
  limits:
    "Schoenplaatstack, zadelvorm en asymmetrie zijn niet meegenomen. Laat aanhoudende pijn " +
    "persoonlijk beoordelen.",
  accountCta: "Maak een gratis account aan",
  accountHint:
    "Bouw je rijdersprofiel op en start een persoonlijke fit. Deze calculatorwaarden " +
    "worden niet automatisch bewaard.",
  stickyLink: "Bekijk uitkomst",
};

export const bikeFitMessages = { en, nl };
export type BikeFitMessages = typeof en;
