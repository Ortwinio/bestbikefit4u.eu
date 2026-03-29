import { BRAND } from "@/config/brand";
import type { Locale } from "@/i18n/config";

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
  locale?: Locale;
}): string[] {
  const { session, recommendation, locale = "en" } = params;
  const fit = recommendation.calculatedFit;
  const goalFocus = buildGoalFocusLines(session.primaryGoal)[locale];
  const sortedAdjustments = [...recommendation.adjustmentPriorities].sort(
    (a, b) => a.priority - b.priority
  );
  const isDutch = locale === "nl";

  const executiveSummaryLines = sortedAdjustments
    .slice(0, 3)
    .map((item, index) => {
      const benefit = expectedBenefitForComponent(item.component)[locale];
      return [`${index + 1}. ${item.component}: ${item.recommendedValue}`, `   ${benefit}`];
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
        `${index + 1}. ${item.component} | ${isDutch ? "Huidig" : "Current"}: ${
          item.currentValue ?? "n/a"
        } | ${isDutch ? "Doel" : "Target"}: ${item.recommendedValue} | ${item.rationale}`
    );

  const noteLines = recommendation.fitNotes
    .slice(0, 5)
    .map((note, index) => `- ${index + 1}. ${note}`);

  return [
    BRAND.reportTitle,
    "======================================",
    "",
    `${isDutch ? "Sessie-ID" : "Session ID"}: ${session._id}`,
    `${isDutch ? "Aangemaakt" : "Created"}: ${formatDate(session.createdAt)}`,
    `${isDutch ? "Voltooid" : "Completed"}: ${formatDate(session.completedAt)}`,
    `${isDutch ? "Fietstype" : "Bike Type"}: ${humanizeValue(session.bikeType)}`,
    `${isDutch ? "Rijstijl" : "Riding Style"}: ${humanizeValue(session.ridingStyle)}`,
    `${isDutch ? "Hoofddoel" : "Primary Goal"}: ${humanizeValue(session.primaryGoal)}`,
    `${isDutch ? "Algoritmeversie" : "Algorithm Version"}: ${recommendation.algorithmVersion}`,
    `${isDutch ? "Betrouwbaarheidsscore" : "Confidence Score"}: ${recommendation.confidenceScore}%`,
    "",
    isDutch ? "Samenvatting" : "Executive Summary",
    "-----------------",
    ...(executiveSummaryLines.length > 0
      ? executiveSummaryLines.flat()
      : [isDutch ? "Geen prioritaire aanpassingen gegenereerd." : "No priority adjustments generated."]),
    "",
    isDutch ? "Waarom bikefitting belangrijk is" : "Why Bike Fitting Matters",
    "-------------------------------------",
    ...(isDutch
      ? [
          "- Vermindert herhaalde overbelasting bij veelvoorkomende klachten.",
          "- Verbetert trapefficientie en praktische krachtoverdracht.",
          "- Verhoogt controle en vertrouwen op langere ritten.",
          "- Voorkomt compensaties die chronische klachten kunnen worden.",
          `Doelfocus: ${goalFocus}`,
        ]
      : [
          "- Reduces repetitive overload linked to common rider pain patterns.",
          "- Improves pedaling efficiency and practical power transfer.",
          "- Increases control and confidence for longer rides.",
          "- Prevents compensations that can become chronic discomfort.",
          `Goal Focus: ${goalFocus}`,
        ]),
    "",
    isDutch ? "Wetenschappelijke basis" : "Scientific Basis",
    "--------------------",
    ...(isDutch
      ? [
          "- Gebouwd op erkende bikefitting formules en fitprincipes.",
          "- Combineert metingen, fietstype en doelspecifieke correcties.",
          "- Gebruikt stack/reach-doelen voor consistente framevergelijking.",
          "- Beste praktijk is stapsgewijs valideren: een wijziging per keer.",
        ]
      : [
          "- Built from established bike fitting formulas and fit principles.",
          "- Combines measurements, bike type, and goal-specific corrections.",
          "- Uses stack/reach targets for geometry consistency across brands.",
          "- Best practice is progressive validation: one change at a time.",
        ]),
    "",
    isDutch ? "Kern fitwaarden" : "Core Fit Metrics",
    "----------------",
    ...(isDutch
      ? [
          `Zadelhoogte: ${fit.saddleHeightMm} mm (bereik ${fit.saddleHeightRange.min}-${fit.saddleHeightRange.max} mm)`,
          `Zadelterugstand: ${fit.saddleSetbackMm} mm`,
          `Stuurdrop: ${fit.handlebarDropMm} mm`,
          `Stuur-reach: ${fit.handlebarReachMm} mm`,
          `Stuurpen: ${fit.stemLengthMm} mm | ${fit.stemAngleRecommendation}`,
          `Cranklengte: ${fit.crankLengthMm} mm`,
          `Stuurbreedte: ${fit.handlebarWidthMm} mm`,
          `Doel frame stack: ${fit.recommendedStackMm} mm`,
          `Doel frame reach: ${fit.recommendedReachMm} mm`,
          `Effectieve bovenbuis: ${fit.effectiveTopTubeMm} mm`,
        ]
      : [
          `Saddle Height: ${fit.saddleHeightMm} mm (range ${fit.saddleHeightRange.min}-${fit.saddleHeightRange.max} mm)`,
          `Saddle Setback: ${fit.saddleSetbackMm} mm`,
          `Handlebar Drop: ${fit.handlebarDropMm} mm`,
          `Handlebar Reach: ${fit.handlebarReachMm} mm`,
          `Stem: ${fit.stemLengthMm} mm | ${fit.stemAngleRecommendation}`,
          `Crank Length: ${fit.crankLengthMm} mm`,
          `Handlebar Width: ${fit.handlebarWidthMm} mm`,
          `Frame Stack Target: ${fit.recommendedStackMm} mm`,
          `Frame Reach Target: ${fit.recommendedReachMm} mm`,
          `Effective Top Tube: ${fit.effectiveTopTubeMm} mm`,
        ]),
    "",
    isDutch ? "Volgorde van aanpassingen" : "Adjustment Order",
    "------------------------",
    ...(adjustmentLines.length > 0
      ? adjustmentLines
      : [isDutch ? "Geen prioritaire aanpassingen gegenereerd." : "No adjustment priorities generated."]),
    "",
    isDutch ? "Samenvatting framemaatadvies" : "Frame Recommendation Summary",
    "----------------------------",
    ...(frameRecommendations.length > 0
      ? frameRecommendations
      : [isDutch ? "Geen framemaatadvies beschikbaar." : "No frame-size recommendations available."]),
    "",
    isDutch ? "14-daags implementatieplan" : "14-Day Implementation Plan",
    "----------------------------",
    ...(isDutch
      ? [
          "Dagen 1-3: pas alleen prioriteit 1 toe (max 2-5 mm), test rustig.",
          "Dagen 4-7: bij stabiliteit prioriteit 2 toepassen en opnieuw beoordelen.",
          "Dagen 8-14: prioriteit 3 toepassen en settings vastzetten na hercontrole.",
          "Volg per rit pijnscore, drukpunten, controle en trapgevoel op.",
        ]
      : [
          "Days 1-3: apply priority 1 only (2-5 mm max), test easy rides.",
          "Days 4-7: if stable, apply priority 2 and reassess comfort/control.",
          "Days 8-14: apply priority 3 and lock settings after repeated checks.",
          "Track pain score, pressure points, control, and pedaling feel each ride.",
        ]),
    "",
    isDutch ? "Fitnotities" : "Fit Notes",
    "---------",
    ...(noteLines.length > 0 ? noteLines : [isDutch ? "Geen aanvullende fitnotities." : "No additional fit notes."]),
    "",
    isDutch ? "Veiligheidsdisclaimer" : "Safety Disclaimer",
    "-------------------",
    ...(isDutch
      ? [
          "Dit rapport is een hulpmiddel en geen medisch advies.",
          "Pas aanpassingen stapsgewijs toe (2-5 mm), een per keer.",
          "Stop met rijden en raadpleeg fitter of arts bij aanhoudende pijn.",
        ]
      : [
          "This report is a guidance tool and not medical advice.",
          "Apply adjustments in small steps (2-5 mm), one at a time.",
          "Stop riding and consult a fitter or clinician if pain persists.",
        ]),
    "",
    isDutch ? "Afsluiting" : "Motivational Close",
    "------------------",
    ...(isDutch
      ? [
          "Bikefit is een proces, geen taak die in een dag perfect moet zijn.",
          "Kleine consistente verbeteringen verminderen pijn en verhogen kwaliteit.",
          "Gebruik dit plan stap voor stap en evalueer na elke aanpassing.",
          "Deel dit rapport met je fietsenmaker, coach of trainingspartner.",
          "Een betere positie nu kan jaren sterker en langer fietsen opleveren.",
        ]
      : [
          "Bike fit is a process, not a one-day perfection task.",
          "Small consistent improvements reduce pain and improve ride quality.",
          "Use this plan step-by-step and evaluate after each change.",
          "Share this report with your bike shop, coach, or training partner.",
          "A better position now can unlock stronger and longer riding for years.",
        ]),
  ];
}
