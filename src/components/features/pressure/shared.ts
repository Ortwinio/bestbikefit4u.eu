import type {
  CasingType,
  Discipline,
  RidingGoal,
  Surface,
  TubeType,
  WarningKey,
} from "@/lib/pressure-engine";

export type PressureResultLabels = {
  front: string;
  rear: string;
  bar: string;
  psi: string;
  explanation: string;
  warningsTitle: string;
  disclaimer: string;
  warningMessages: Record<WarningKey, string>;
  comfortScore: string;
  gripScore: string;
  efficiencyScore: string;
};

export type PressureStatus =
  | "optimal"
  | "slightly_high"
  | "too_high"
  | "too_low"
  | "no_measurement";

export type InlineTireInput = {
  widthFrontMm: number;
  widthRearMm: number;
  tubeType: TubeType;
  casingType?: CasingType;
  rimType?: "hooked" | "hookless";
  maxPressureBar?: number;
  internalRimWidthFrontMm?: number;
  internalRimWidthRearMm?: number;
};

export function disciplineLabel(
  discipline: Discipline | undefined,
  locale: "en" | "nl"
): string {
  const labels = {
    en: {
      road: "Road bike",
      gravel: "Gravel bike",
      mtb: "MTB",
      tt: "TT / Triathlon",
    },
    nl: {
      road: "Racefiets",
      gravel: "Gravelbike",
      mtb: "MTB",
      tt: "Tri/TT",
    },
  } as const;

  if (!discipline) {
    return "-";
  }

  return labels[locale][discipline];
}

export function tubeTypeLabel(
  tubeType: TubeType | undefined,
  locale: "en" | "nl"
): string {
  const labels = {
    en: {
      inner_tube: "Inner tube",
      latex_tube: "Latex tube",
      tubeless: "Tubeless",
    },
    nl: {
      inner_tube: "Binnenband",
      latex_tube: "Latex binnenband",
      tubeless: "Tubeless",
    },
  } as const;

  return tubeType ? labels[locale][tubeType] : "-";
}

export function ridingGoalLabel(
  goal: RidingGoal,
  locale: "en" | "nl"
): string {
  const labels = {
    en: { speed: "Speed", balance: "Balance", comfort: "Comfort" },
    nl: { speed: "Snelheid", balance: "Balans", comfort: "Comfort" },
  } as const;

  return labels[locale][goal];
}

export function pressureUseCaseLabel(
  useCase: "race" | "endurance" | "wet_weather" | "gravel_mixed" | "comfort" | "custom",
  locale: "en" | "nl"
): string {
  const labels = {
    en: {
      race: "Race",
      endurance: "Endurance",
      wet_weather: "Wet weather",
      gravel_mixed: "Gravel mixed",
      comfort: "Comfort",
      custom: "Custom",
    },
    nl: {
      race: "Race",
      endurance: "Endurance",
      wet_weather: "Nat weer",
      gravel_mixed: "Gravel mixed",
      comfort: "Comfort",
      custom: "Aangepast",
    },
  } as const;

  return labels[locale][useCase];
}

export function surfaceLabel(surface: Surface, locale: "en" | "nl"): string {
  const labels = {
    en: {
      smooth_asphalt: "Smooth asphalt",
      average_asphalt: "Average asphalt",
      rough_asphalt: "Rough asphalt",
      hardpack_gravel: "Hardpack gravel",
      loose_gravel: "Loose gravel",
      trail: "Trail",
    },
    nl: {
      smooth_asphalt: "Glad asfalt",
      average_asphalt: "Gemiddeld asfalt",
      rough_asphalt: "Slecht asfalt",
      hardpack_gravel: "Hardpack gravel",
      loose_gravel: "Losse gravel",
      trail: "Trail",
    },
  } as const;

  return labels[locale][surface];
}
