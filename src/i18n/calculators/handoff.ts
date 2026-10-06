import type { HandoffCalculator, HandoffField, HandoffMethod } from "@/lib/handoff/store";

interface CalculatorBenefit {
  headline: string;
  betterBody: string;
  nextTitle: string;
  nextBody: string;
}
interface HandoffCopy {
  eyebrow: string;
  title: string;
  carryTitle: string;
  count: string;
  empty: string;
  cta: string;
  reassurance: string;
  previous: string;
  prefillInseam: string;
  prefill: string;
  sessionOnly: string;
  methods: Record<HandoffMethod | "unknown", string>;
  fields: Record<HandoffField, string>;
  values: Record<string, string>;
  benefits: { savedTitle: string; savedBody: string; betterTitle: string };
  calculators: Record<HandoffCalculator, CalculatorBenefit>;
}

const performanceNl: CalculatorBenefit = {
  headline: "Bewaar je FTP en gewicht één keer; elke klim- en versnellingsberekening gebruikt ze.",
  betterBody: "Met je eigen gewicht en FTP kun je berekeningen beter vergelijken.",
  nextTitle: "De volgende stap staat klaar.",
  nextBody: "Neem je gegevens mee naar de klimplanner, verzetcalculator of voedingscalculator.",
};
const performanceEn: CalculatorBenefit = {
  headline: "Save your FTP and weight once; every climbing and gearing calculation uses them.",
  betterBody: "Your own weight and FTP make it easier to compare calculations.",
  nextTitle: "Your next step is ready.",
  nextBody: "Take your details to the climb planner, gearing calculator or nutrition calculator.",
};

const nl: HandoffCopy = {
  eyebrow: "Gratis account",
  title: "Maak dit advies persoonlijker",
  carryTitle: "Dit nemen we mee naar je account",
  count: "{count} gegevens klaar om te bewaren",
  empty: "Nog niets ingevuld. Schuif een waarde of kies een optie; alleen wat jij invult gaat mee.",
  cta: "Bewaar mijn gegevens · gratis account",
  reassurance: "Je ingevulde waarden gaan mee; je hoeft niets opnieuw in te vullen. "
    + "Geen account? Je uitkomst hierboven blijft gewoon staan.",
  previous: "vorige calculator",
  prefillInseam: "Je binnenbeen van de vorige calculator is al ingevuld.",
  prefill: "Al ingevuld vanuit je vorige calculator: {fields}.",
  sessionOnly: "Je ingevulde gegevens blijven alleen in deze browsersessie bewaard.",
  methods: { measured: "gemeten", estimated: "geschat", declared: "opgegeven", bike: "fiets", unknown: "methode onbekend" },
  fields: {
    heightCm: "Lichaamslengte", inseamCm: "Binnenbeenlengte", flexibilityScore: "Flexibiliteit",
    coreStabilityScore: "Rompstabiliteit", ridingGoal: "Rijdoel", weightKg: "Gewicht", ftpWatts: "FTP",
    ftpMethod: "FTP-methode", sitBoneWidthMm: "Zitbotbreedte", sweatProfile: "Zweetprofiel",
    bikeCategory: "Type fiets", currentSaddleHeightMm: "Huidige zadelhoogte", currentCrankLengthMm: "Huidige cranklengte",
    currentSaddleWidthMm: "Huidige zadelbreedte", currentSaddleModel: "Huidig zadel",
    tireWidthFrontMm: "Bandbreedte voor", tireWidthRearMm: "Bandbreedte achter", rimType: "Velgtype",
    surface: "Ondergrond", outerChainringTeeth: "Groot kettingblad", innerChainringTeeth: "Klein kettingblad",
    cassetteSmallestCogTeeth: "Kleinste krans", cassetteLargestCogTeeth: "Grootste krans",
    powerWatts: "Vermogen", speedKph: "Snelheid", bikeWeightKg: "Fietsgewicht",
    gradientPercent: "Stijgingspercentage", distanceKm: "Afstand", durationMinutes: "Duur",
    temperatureC: "Temperatuur", bottleSizeMl: "Bidoninhoud", twentyMinuteWatts: "20-minutenvermogen",
    rampWatts: "Rampvermogen", intensity: "Inspanning", hipCircumferenceCm: "Heupomtrek",
  },
  values: {
    easy: "Rustig", endurance: "Duur", tempo: "Tempo", race: "Wedstrijd",
    road: "Racefiets", gravel: "Gravel", mtb: "MTB", mountain: "MTB", city: "Stadsfiets",
    hybrid: "Hybride fiets", tt_triathlon: "Tijdrit / triatlon", cyclocross: "Cyclocross", touring: "Toerfiets",
    comfort: "Comfort", balanced: "Gebalanceerd", performance: "Prestatie", aero: "Aerodynamisch",
    low: "Weinig", medium: "Gemiddeld", high: "Veel", known: "Bekende FTP",
    twentyMinute: "20-minutentest", ramp: "Ramptest", hooked: "Velg met haak", hookless: "Velg zonder haak",
    smooth_asphalt: "Glad asfalt", average_asphalt: "Gemiddeld asfalt", rough_asphalt: "Ruw asfalt",
    hardpack_gravel: "Hard gravel", loose_gravel: "Los gravel", trail: "Bospad",
    very_limited: "Zeer beperkt", limited: "Beperkt", average: "Gemiddeld", good: "Goed", excellent: "Zeer goed",
  },
  benefits: {
    savedTitle: "Je gegevens blijven bewaard.",
    savedBody: "Nooit meer opnieuw invullen, ook niet in andere calculators.",
    betterTitle: "Een kleinere marge.",
  },
  calculators: {
    "bike-fit": {
      headline: "Je reach is nu geschat uit je lengte. Met je arm- en torsolengte rekenen we hem uit.",
      betterBody: "Met je arm- en torsolengte rekenen we met jouw maten, niet met gemiddelden.",
      nextTitle: "De volgende stap staat klaar.", nextBody: "Gebruik dezelfde gegevens voor je zadelhoogte en cranklengte.",
    },
    "saddle-height": {
      headline: "Vergelijk met de zadelhoogte van je eigen fiets en zie precies hoeveel millimeter je verstelt.",
      betterBody: "Met je flexibiliteit en cranklengte rekenen we met jouw waarden, niet met gemiddelden.",
      nextTitle: "De volgende stap staat klaar.", nextBody: "Zadelbreedte en bike fit gebruiken dezelfde gegevens.",
    },
    "frame-size": {
      headline: "Check deze maat tegen de geometrie van echte fietsen uit onze database.",
      betterBody: "Met je eigen maten vergelijk je de geometrie van fietsen die je overweegt.",
      nextTitle: "De volgende stap staat klaar.", nextBody: "Gebruik je maten voor de bike-fitcalculator.",
    },
    "crank-length": {
      headline: "Zie wat een andere crank betekent voor je zadelhoogte en versnellingen.",
      betterBody: "Met je huidige cranklengte kun je het verschil met een andere crank bekijken.",
      nextTitle: "De volgende stap staat klaar.", nextBody: "Neem je binnenbeenlengte mee naar de zadelhoogtecalculator.",
    },
    "saddle-width": {
      headline: "Bewaar je zitbotmeting, zodat elk zadeladvies er voortaan rekening mee houdt.",
      betterBody: "Met je eigen zitbotmeting begin je bij jouw maten.",
      nextTitle: "De volgende stap staat klaar.", nextBody: "Controleer ook de hoogte van je zadel.",
    },
    "tire-pressure": {
      headline: "Bewaar je banden en wielen; je spanning past zich aan als je gewicht verandert.",
      betterBody: "Met je eigen banden, velgen en gewicht bereken je de spanning voor jouw fiets.",
      nextTitle: "De volgende stap staat klaar.", nextBody: "Neem je gewicht mee naar de verzetcalculator.",
    },
    gearing: performanceNl,
    "power-speed": performanceNl,
    "climb-planner": performanceNl,
    "ftp-wkg": performanceNl,
    "fuel-hydration": {
      headline: "Je voedingsplan op basis van je echte gewicht en vermogen.",
      betterBody: "Met je eigen gewicht, FTP en zweetprofiel maak je een plan voor jouw rit.",
      nextTitle: "De volgende stap staat klaar.", nextBody: "Gebruik je gewicht en FTP ook voor de klimplanner.",
    },
  },
};

const en: HandoffCopy = {
  eyebrow: "Free account",
  title: "Make this advice more personal",
  carryTitle: "These details go with you to your account",
  count: "{count} details ready to save",
  empty: "Nothing entered yet. Move a slider or choose an option; only what you enter goes with you.",
  cta: "Save my details · free account",
  reassurance: "Your entered values go with you; there is no need to enter them again. "
    + "No account? Your result above stays available.",
  previous: "previous calculator",
  prefillInseam: "Your inseam from the previous calculator is already filled in.",
  prefill: "Already filled in from your previous calculator: {fields}.",
  sessionOnly: "Your entered details are only remembered for this browser session.",
  methods: { measured: "measured", estimated: "estimated", declared: "provided", bike: "bike", unknown: "method unknown" },
  fields: {
    heightCm: "Height", inseamCm: "Inseam", flexibilityScore: "Flexibility", coreStabilityScore: "Core stability",
    ridingGoal: "Riding goal", weightKg: "Weight", ftpWatts: "FTP", ftpMethod: "FTP method",
    sitBoneWidthMm: "Sit-bone width", sweatProfile: "Sweat profile", bikeCategory: "Bike type",
    currentSaddleHeightMm: "Current saddle height", currentCrankLengthMm: "Current crank length",
    currentSaddleWidthMm: "Current saddle width", currentSaddleModel: "Current saddle",
    tireWidthFrontMm: "Front tire width", tireWidthRearMm: "Rear tire width", rimType: "Rim type", surface: "Surface",
    outerChainringTeeth: "Outer chainring", innerChainringTeeth: "Inner chainring",
    cassetteSmallestCogTeeth: "Smallest sprocket", cassetteLargestCogTeeth: "Largest sprocket",
    powerWatts: "Power", speedKph: "Speed", bikeWeightKg: "Bike weight",
    gradientPercent: "Gradient", distanceKm: "Distance", durationMinutes: "Duration",
    temperatureC: "Temperature", bottleSizeMl: "Bottle capacity", twentyMinuteWatts: "20-minute power",
    rampWatts: "Ramp power", intensity: "Intensity", hipCircumferenceCm: "Hip circumference",
  },
  values: {
    easy: "Easy", endurance: "Endurance", tempo: "Tempo", race: "Race",
    road: "Road bike", gravel: "Gravel", mtb: "MTB", mountain: "MTB", city: "City bike",
    hybrid: "Hybrid bike", tt_triathlon: "Time trial / triathlon", cyclocross: "Cyclocross", touring: "Touring bike",
    comfort: "Comfort", balanced: "Balanced", performance: "Performance", aero: "Aerodynamic",
    low: "Low", medium: "Medium", high: "High", known: "Known FTP", twentyMinute: "20-minute test", ramp: "Ramp test",
    hooked: "Hooked rim", hookless: "Hookless rim", smooth_asphalt: "Smooth asphalt",
    average_asphalt: "Average asphalt", rough_asphalt: "Rough asphalt", hardpack_gravel: "Hardpack gravel",
    loose_gravel: "Loose gravel", trail: "Trail", very_limited: "Very limited", limited: "Limited",
    average: "Average", good: "Good", excellent: "Excellent",
  },
  benefits: {
    savedTitle: "Your details stay saved.",
    savedBody: "No need to enter them again, even in other calculators.",
    betterTitle: "A narrower range.",
  },
  calculators: {
    "bike-fit": {
      headline: "Your reach is currently estimated from your height. With your arm and torso lengths, we calculate it.",
      betterBody: "Your arm and torso lengths let us use your measurements instead of averages.",
      nextTitle: "Your next step is ready.", nextBody: "Use the same details for your saddle height and crank length.",
    },
    "saddle-height": {
      headline: "Compare with your own bike’s saddle height and see exactly how many millimeters to adjust.",
      betterBody: "Your flexibility and crank length let us use your values instead of averages.",
      nextTitle: "Your next step is ready.", nextBody: "Saddle width and bike fit use the same details.",
    },
    "frame-size": {
      headline: "Check this size against the geometry of real bikes in our database.",
      betterBody: "Use your own measurements to compare the geometry of bikes you are considering.",
      nextTitle: "Your next step is ready.", nextBody: "Use your measurements in the bike-fit calculator.",
    },
    "crank-length": {
      headline: "See what a different crank means for your saddle height and gearing.",
      betterBody: "Your current crank length lets you compare it with a different crank.",
      nextTitle: "Your next step is ready.", nextBody: "Take your inseam to the saddle-height calculator.",
    },
    "saddle-width": {
      headline: "Save your sit-bone measurement so every saddle recommendation can take it into account.",
      betterBody: "Your own sit-bone measurement starts the advice with your dimensions.",
      nextTitle: "Your next step is ready.", nextBody: "Check your saddle height too.",
    },
    "tire-pressure": {
      headline: "Save your tires and wheels; your pressure adjusts when your weight changes.",
      betterBody: "Your tires, rims and weight let you calculate pressure for your own bike.",
      nextTitle: "Your next step is ready.", nextBody: "Take your weight to the gearing calculator.",
    },
    gearing: performanceEn,
    "power-speed": performanceEn,
    "climb-planner": performanceEn,
    "ftp-wkg": performanceEn,
    "fuel-hydration": {
      headline: "Your nutrition plan based on your actual weight and power.",
      betterBody: "Your weight, FTP and sweat profile help you plan for your ride.",
      nextTitle: "Your next step is ready.", nextBody: "Use your weight and FTP in the climb planner too.",
    },
  },
};

export const handoffMessages = { nl, en };
