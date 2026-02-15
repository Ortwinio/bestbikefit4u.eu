import type { Ambition, BikeCategory } from "../../convex/lib/fitAlgorithm";

export type SearchParamRecord = Record<string, string | string[] | undefined>;

export const PUBLIC_BIKE_CATEGORY_OPTIONS: Array<{
  value: BikeCategory;
  label: string;
}> = [
  { value: "road", label: "Road" },
  { value: "gravel", label: "Gravel" },
  { value: "mtb", label: "Mountain" },
  { value: "city", label: "City / Hybrid" },
];

export const AMBITION_OPTIONS: Array<{
  value: Ambition;
  label: string;
}> = [
  { value: "comfort", label: "Comfort" },
  { value: "balanced", label: "Balanced" },
  { value: "performance", label: "Performance" },
  { value: "aero", label: "Aero" },
];

export function getFirstSearchParam(
  searchParams: SearchParamRecord,
  key: string
): string | undefined {
  const value = searchParams[key];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function parsePositiveNumberParam(
  searchParams: SearchParamRecord,
  key: string
): number | null {
  const value = getFirstSearchParam(searchParams, key);
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function parseBikeCategory(
  value: string | undefined,
  fallback: BikeCategory = "road"
): BikeCategory {
  if (value === "road" || value === "gravel" || value === "mtb" || value === "city") {
    return value;
  }
  return fallback;
}

export function parseAmbition(
  value: string | undefined,
  fallback: Ambition = "balanced"
): Ambition {
  if (
    value === "comfort" ||
    value === "balanced" ||
    value === "performance" ||
    value === "aero"
  ) {
    return value;
  }
  return fallback;
}

export function parseScore1to5(
  value: string | undefined,
  fallback: 1 | 2 | 3 | 4 | 5 = 3
): 1 | 2 | 3 | 4 | 5 {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  const rounded = Math.round(parsed);
  if (rounded >= 1 && rounded <= 5) {
    return rounded as 1 | 2 | 3 | 4 | 5;
  }
  return fallback;
}
