import type { ReportV2Copy } from "./reportV2Copy";

const LOCALE_VALUE_LABELS = {
  en: {
    bikeType: {
      road: "Road",
      gravel: "Gravel",
      mountain: "Mountain",
      hybrid: "Hybrid",
      tt_triathlon: "TT / triathlon",
      cyclocross: "Cyclocross",
      touring: "Touring",
      city: "City",
    },
    ridingStyle: {
      recreational: "Recreational",
      fitness: "Fitness",
      sportive: "Sportive",
      racing: "Racing",
      commuting: "Commuting",
      touring: "Touring",
    },
    goal: {
      comfort: "Comfort",
      balanced: "Balanced",
      performance: "Performance",
      aero: "Aero",
    },
    experienceLevel: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
    },
    weeklyHours: {
      "0-3": "0-3 hrs/week",
      "3-6": "3-6 hrs/week",
      "6-10": "6-10 hrs/week",
      "10-15": "10-15 hrs/week",
      "15+": "15+ hrs/week",
    },
    rideLength: {
      short: "Short (<30 km)",
      medium: "Medium (30-80 km)",
      long: "Long (80-150 km)",
      ultra: "Ultra (150+ km)",
    },
    positionPriority: {
      comfort: "Maximum comfort",
      balanced: "Balanced",
      performance: "Performance",
    },
    typeOfRiding: {
      casual: "Casual / fitness",
      group: "Group rides",
      training: "Structured training",
      racing: "Racing",
      tt: "Time trial / triathlon",
      asphalt: "Asphalt only",
      paved: "Paved + light gravel",
      xc: "Cross-country",
      trail: "Trail",
      enduro: "Enduro",
      dh: "Downhill / bike park",
    },
  },
  nl: {
    bikeType: {
      road: "Racefiets",
      gravel: "Gravelbike",
      mountain: "Mountainbike",
      hybrid: "Hybride fiets",
      tt_triathlon: "TT / triatlon",
      cyclocross: "Cyclocross",
      touring: "Toerfiets",
      city: "Stadsfiets",
    },
    ridingStyle: {
      recreational: "Recreatief",
      fitness: "Fitness",
      sportive: "Sportief",
      racing: "Wedstrijd",
      commuting: "Woon-werk",
      touring: "Toeren",
    },
    goal: {
      comfort: "Comfort",
      balanced: "Gebalanceerd",
      performance: "Prestatie",
      aero: "Aero",
    },
    experienceLevel: {
      beginner: "Beginner",
      intermediate: "Gevorderd",
      advanced: "Vergevorderd",
    },
    weeklyHours: {
      "0-3": "0-3 uur/week",
      "3-6": "3-6 uur/week",
      "6-10": "6-10 uur/week",
      "10-15": "10-15 uur/week",
      "15+": "15+ uur/week",
    },
    rideLength: {
      short: "Kort (<30 km)",
      medium: "Middel (30-80 km)",
      long: "Lang (80-150 km)",
      ultra: "Ultra (150+ km)",
    },
    positionPriority: {
      comfort: "Maximaal comfort",
      balanced: "Gebalanceerd",
      performance: "Prestatie",
    },
    typeOfRiding: {
      casual: "Casual / fitness",
      group: "Groepsritten",
      training: "Gestructureerde training",
      racing: "Wedstrijd",
      tt: "Tijdrit / triatlon",
      asphalt: "Alleen asfalt",
      paved: "Verhard + lichte gravel",
      xc: "Cross-country",
      trail: "Trail",
      enduro: "Enduro",
      dh: "Downhill / bike park",
    },
  },
} as const;

export type PdfReportAssets = {
  logo: string;
  bikeDimensions: string;
  pressure: string;
  measureSet: string;
  stackReach: string;
};

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function formatPdfDate(value: string, copy: ReportV2Copy): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat(copy.locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function localizePdfValue(
  value: string | null | undefined,
  copy: ReportV2Copy,
  group?: string,
): string {
  if (!value || value === "n/a") return "";
  const labels = LOCALE_VALUE_LABELS[copy.locale === "nl" ? "nl" : "en"];
  const normalized = value.toLowerCase().replaceAll(" ", "_");
  const maps = group && group in labels ? [labels[group as keyof typeof labels]] : Object.values(labels);
  for (const map of maps) {
    const found = (map as Record<string, string>)[normalized];
    if (found) return found;
  }
  return value;
}
