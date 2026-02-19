import { BRAND } from "@/config/brand";

type FitSessionForPdf = {
  _id: string;
  createdAt: number;
  completedAt?: number;
  bikeType?: string;
  ridingStyle: string;
  primaryGoal: string;
};

type RecommendationForPdf = {
  algorithmVersion: string;
  confidenceScore: number;
  calculatedFit: {
    recommendedStackMm: number;
    recommendedReachMm: number;
    effectiveTopTubeMm: number;
    saddleHeightMm: number;
    saddleSetbackMm: number;
    saddleHeightRange: { min: number; max: number };
    handlebarDropMm: number;
    handlebarReachMm: number;
    stemLengthMm: number;
    stemAngleRecommendation: string;
    crankLengthMm: number;
    handlebarWidthMm: number;
  };
  frameSizeRecommendations: Array<{
    brand?: string;
    size: string;
    fitScore: number;
    notes?: string;
  }>;
  adjustmentPriorities: Array<{
    priority: number;
    component: string;
    currentValue?: string;
    recommendedValue: string;
    rationale: string;
  }>;
  fitNotes: string[];
};

function formatDate(value: number | undefined): string {
  if (!value) {
    return "n/a";
  }
  return new Date(value).toISOString().slice(0, 10);
}

function humanizeValue(value: string | undefined): string {
  if (!value) {
    return "n/a";
  }
  return value.replaceAll("_", " ");
}

function buildGoalFocusLines(primaryGoal: string): { en: string; nl: string } {
  switch (primaryGoal) {
    case "comfort":
      return {
        en: "This setup prioritizes sustainable comfort and lower pressure build-up.",
        nl: "Deze setup geeft prioriteit aan duurzaam comfort en lagere drukopbouw.",
      };
    case "performance":
      return {
        en: "This setup prioritizes power transfer with stable bike handling.",
        nl: "Deze setup geeft prioriteit aan krachtoverdracht met stabiele handling.",
      };
    case "aerodynamics":
      return {
        en: "This setup balances aerodynamic posture with holdability under fatigue.",
        nl: "Deze setup balanceert aerodynamica met houdbaarheid onder vermoeidheid.",
      };
    case "balanced":
      return {
        en: "This setup balances comfort, control, and performance for all-round riding.",
        nl: "Deze setup balanceert comfort, controle en prestaties voor allround rijden.",
      };
    default:
      return {
        en: "This setup is tailored to your goal and riding context.",
        nl: "Deze setup is afgestemd op je doel en rijcontext.",
      };
  }
}

function expectedBenefitForComponent(component: string): {
  en: string;
  nl: string;
} {
  const key = component.toLowerCase();
  if (key.includes("saddle height")) {
    return {
      en: "Reduce knee stress and improve extension timing.",
      nl: "Vermindert kniebelasting en verbetert extensie-timing.",
    };
  }
  if (key.includes("saddle setback")) {
    return {
      en: "Improve hip position and pedaling stability.",
      nl: "Verbetert heuppositie en trapstabiliteit.",
    };
  }
  if (key.includes("drop") || key.includes("reach")) {
    return {
      en: "Improve torso support and pressure balance.",
      nl: "Verbetert rompondersteuning en drukverdeling.",
    };
  }
  if (key.includes("stem")) {
    return {
      en: "Improve steering stability and cockpit control.",
      nl: "Verbetert stuurstabiliteit en cockpitcontrole.",
    };
  }
  if (key.includes("crank")) {
    return {
      en: "Improve leverage while reducing joint strain.",
      nl: "Verbetert hefboomwerking met minder gewrichtsbelasting.",
    };
  }
  if (key.includes("handlebar width")) {
    return {
      en: "Improve shoulder comfort and breathing mechanics.",
      nl: "Verbetert schoudercomfort en ademhalingsmechaniek.",
    };
  }
  return {
    en: "Improve fit quality and on-bike consistency.",
    nl: "Verbetert fitkwaliteit en consistentie op de fiets.",
  };
}

export function buildRecommendationPdfLines(params: {
  session: FitSessionForPdf;
  recommendation: RecommendationForPdf;
}): string[] {
  const { session, recommendation } = params;
  const fit = recommendation.calculatedFit;
  const goalFocus = buildGoalFocusLines(session.primaryGoal);
  const sortedAdjustments = [...recommendation.adjustmentPriorities].sort(
    (a, b) => a.priority - b.priority
  );

  const executiveSummaryLines = sortedAdjustments
    .slice(0, 3)
    .map((item, index) => {
      const benefit = expectedBenefitForComponent(item.component);
      return [
        `${index + 1}. ${item.component}: ${item.recommendedValue}`,
        `   EN: ${benefit.en}`,
        `   NL: ${benefit.nl}`,
      ];
    });

  const frameRecommendations = recommendation.frameSizeRecommendations
    .slice(0, 3)
    .map((frame, index) => {
      const brandPart = frame.brand ? `${frame.brand} ` : "";
      const notesPart = frame.notes ? ` | ${frame.notes}` : "";
      return `${index + 1}. ${brandPart}${frame.size} (${frame.fitScore}%)${notesPart}`;
    });

  const adjustmentLines = sortedAdjustments
    .slice(0, 8)
    .map(
      (item, index) =>
        `${index + 1}. ${item.component} | Current: ${item.currentValue ?? "n/a"} | Target: ${item.recommendedValue} | ${item.rationale}`
    );

  const noteLines = recommendation.fitNotes
    .slice(0, 5)
    .map((note, index) => `- ${index + 1}. ${note}`);

  return [
    BRAND.reportTitle,
    "======================================",
    "",
    `Session ID: ${session._id}`,
    `Created: ${formatDate(session.createdAt)}`,
    `Completed: ${formatDate(session.completedAt)}`,
    `Bike Type: ${humanizeValue(session.bikeType)}`,
    `Riding Style: ${humanizeValue(session.ridingStyle)}`,
    `Primary Goal: ${humanizeValue(session.primaryGoal)}`,
    `Algorithm Version: ${recommendation.algorithmVersion}`,
    `Confidence Score: ${recommendation.confidenceScore}%`,
    "",
    "Executive Summary / Samenvatting",
    "--------------------------------",
    ...(executiveSummaryLines.length > 0
      ? executiveSummaryLines.flat()
      : [
          "EN: No priority adjustments generated.",
          "NL: Geen prioritaire aanpassingen gegenereerd.",
        ]),
    "",
    "Why Bike Fitting Matters / Waarom bikefitting relevant is",
    "---------------------------------------------------------",
    "- EN: Reduces repetitive overload linked to common rider pain patterns.",
    "- NL: Vermindert herhaalde overbelasting bij veelvoorkomende klachten.",
    "- EN: Improves pedaling efficiency and practical power transfer.",
    "- NL: Verbetert trapefficientie en praktische krachtoverdracht.",
    "- EN: Increases control and confidence for longer rides.",
    "- NL: Verhoogt controle en vertrouwen op langere ritten.",
    "- EN: Prevents compensations that can become chronic discomfort.",
    "- NL: Voorkomt compensaties die chronische klachten kunnen worden.",
    `Goal Focus EN: ${goalFocus.en}`,
    `Doelfocus NL: ${goalFocus.nl}`,
    "",
    "Scientific Basis / Wetenschappelijke basis",
    "------------------------------------------",
    "- EN: Built from established bike fitting formulas and fit principles.",
    "- NL: Gebouwd op erkende bikefitting formules en fitprincipes.",
    "- EN: Combines measurements, bike type, and goal-specific corrections.",
    "- NL: Combineert metingen, fietstype en doelspecifieke correcties.",
    "- EN: Uses stack/reach targets for geometry consistency across brands.",
    "- NL: Gebruikt stack/reach-doelen voor consistente framevergelijking.",
    "- EN: Best practice is progressive validation: one change at a time.",
    "- NL: Beste praktijk is stapsgewijs valideren: een wijziging per keer.",
    "",
    "Core Fit Metrics / Kern fitwaarden",
    "-----------------------------------",
    `EN Saddle Height: ${fit.saddleHeightMm} mm (range ${fit.saddleHeightRange.min}-${fit.saddleHeightRange.max} mm)`,
    `NL Zadelhoogte: ${fit.saddleHeightMm} mm (bereik ${fit.saddleHeightRange.min}-${fit.saddleHeightRange.max} mm)`,
    `EN Saddle Setback: ${fit.saddleSetbackMm} mm`,
    `NL Zadelterugstand: ${fit.saddleSetbackMm} mm`,
    `EN Handlebar Drop: ${fit.handlebarDropMm} mm`,
    `NL Stuurdrop: ${fit.handlebarDropMm} mm`,
    `EN Handlebar Reach: ${fit.handlebarReachMm} mm`,
    `NL Stuur-reach: ${fit.handlebarReachMm} mm`,
    `EN Stem: ${fit.stemLengthMm} mm | ${fit.stemAngleRecommendation}`,
    `NL Stuurpen: ${fit.stemLengthMm} mm | ${fit.stemAngleRecommendation}`,
    `EN Crank Length: ${fit.crankLengthMm} mm`,
    `NL Cranklengte: ${fit.crankLengthMm} mm`,
    `EN Handlebar Width: ${fit.handlebarWidthMm} mm`,
    `NL Stuurbreedte: ${fit.handlebarWidthMm} mm`,
    `EN Frame Stack Target: ${fit.recommendedStackMm} mm`,
    `NL Doel frame stack: ${fit.recommendedStackMm} mm`,
    `EN Frame Reach Target: ${fit.recommendedReachMm} mm`,
    `NL Doel frame reach: ${fit.recommendedReachMm} mm`,
    `EN Effective Top Tube: ${fit.effectiveTopTubeMm} mm`,
    `NL Effectieve bovenbuis: ${fit.effectiveTopTubeMm} mm`,
    "",
    "Adjustment Order",
    "----------------",
    ...(adjustmentLines.length > 0 ? adjustmentLines : ["No adjustment priorities generated."]),
    "",
    "Frame Recommendation Summary",
    "----------------------------",
    ...(frameRecommendations.length > 0
      ? frameRecommendations
      : ["No frame-size recommendations available."]),
    "",
    "14-Day Implementation Plan / 14-daags implementatieplan",
    "-------------------------------------------------------",
    "EN Days 1-3: apply priority 1 only (2-5 mm max), test easy rides.",
    "NL Dagen 1-3: pas alleen prioriteit 1 toe (max 2-5 mm), test rustig.",
    "EN Days 4-7: if stable, apply priority 2 and reassess comfort/control.",
    "NL Dagen 4-7: bij stabiliteit prioriteit 2 toepassen en opnieuw beoordelen.",
    "EN Days 8-14: apply priority 3 and lock settings after repeated checks.",
    "NL Dagen 8-14: prioriteit 3 toepassen en settings vastzetten na hercontrole.",
    "EN Track pain score, pressure points, control, and pedaling feel each ride.",
    "NL Volg per rit pijnscore, drukpunten, controle en trapgevoel op.",
    "",
    "Fit Notes",
    "---------",
    ...(noteLines.length > 0 ? noteLines : ["No additional fit notes."]),
    "",
    "Safety Disclaimer / Veiligheidsdisclaimer",
    "-----------------------------------------",
    "EN: This report is a guidance tool and not medical advice.",
    "NL: Dit rapport is een hulpmiddel en geen medisch advies.",
    "EN: Apply adjustments in small steps (2-5 mm), one at a time.",
    "NL: Pas aanpassingen stapsgewijs toe (2-5 mm), een per keer.",
    "EN: Stop riding and consult a fitter or clinician if pain persists.",
    "NL: Stop met rijden en raadpleeg fitter of arts bij aanhoudende pijn.",
    "",
    "Motivational Close / Motiverende afsluiting",
    "-------------------------------------------",
    "EN: Bike fit is a process, not a one-day perfection task.",
    "NL: Bikefit is een proces, geen taak die in een dag perfect moet zijn.",
    "EN: Small consistent improvements reduce pain and improve ride quality.",
    "NL: Kleine consistente verbeteringen verminderen pijn en verhogen kwaliteit.",
    "EN: Use this plan step-by-step and evaluate after each change.",
    "NL: Gebruik dit plan stap voor stap en evalueer na elke aanpassing.",
    "EN: Share this report with your bike shop, coach, or training partner.",
    "NL: Deel dit rapport met je fietsenmaker, coach of trainingspartner.",
    "EN: A better position now can unlock stronger and longer riding for years.",
    "NL: Een betere positie nu kan jaren sterker en langer fietsen opleveren.",
  ];
}
