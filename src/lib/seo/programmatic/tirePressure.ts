import type {
  BasicPressureInput,
  Discipline,
} from "@/lib/pressure-engine";
import { BRAND } from "@/config/brand";

export const WEIGHT_STEPS = [55, 60, 65, 70, 75, 80, 85, 90, 95, 100] as const;

export const EN_BIKE_TYPES = ["road-bike", "gravel-bike", "mountain-bike"] as const;
export const NL_BIKE_TYPES = ["racefiets", "gravelbike", "mountainbike"] as const;

export type EnBikeType = (typeof EN_BIKE_TYPES)[number];
export type NlBikeType = (typeof NL_BIKE_TYPES)[number];

export const EN_TO_DISCIPLINE: Record<EnBikeType, Discipline> = {
  "road-bike": "road",
  "gravel-bike": "gravel",
  "mountain-bike": "mtb",
};

export const NL_TO_EN: Record<NlBikeType, EnBikeType> = {
  racefiets: "road-bike",
  gravelbike: "gravel-bike",
  mountainbike: "mountain-bike",
};

export const BIKE_TYPE_LABELS: Record<
  EnBikeType,
  { en: string; nl: string; guideHref: string; calculatorHref: string }
> = {
  "road-bike": {
    en: "road bike",
    nl: "racefiets",
    guideHref: "/guides/road-bike-fit-guide",
    calculatorHref: "/bandenspanning/racefiets",
  },
  "gravel-bike": {
    en: "gravel bike",
    nl: "gravelbike",
    guideHref: "/guides/gravel-bike-fit-guide",
    calculatorHref: "/bandenspanning/gravelbike",
  },
  "mountain-bike": {
    en: "mountain bike",
    nl: "mountainbike",
    guideHref: "/guides/mountain-bike-fit-guide",
    calculatorHref: "/bandenspanning/mtb",
  },
};

export const BIKE_TYPE_DEFAULTS: Record<
  EnBikeType,
  Pick<BasicPressureInput, "surface" | "widthFrontMm" | "widthRearMm">
> = {
  "road-bike": {
    surface: "average_asphalt",
    widthFrontMm: 28,
    widthRearMm: 28,
  },
  "gravel-bike": {
    surface: "hardpack_gravel",
    widthFrontMm: 40,
    widthRearMm: 40,
  },
  "mountain-bike": {
    surface: "trail",
    widthFrontMm: 57,
    widthRearMm: 57,
  },
};

export function parseEnglishPressureSlug(
  slug: string
): { weight: number; bikeType: EnBikeType } | null {
  const match = slug.match(/^(\d+)kg-(road-bike|gravel-bike|mountain-bike)$/);
  if (!match) {
    return null;
  }

  return {
    weight: Number(match[1]),
    bikeType: match[2] as EnBikeType,
  };
}

export function parseDutchPressureSlug(
  slug: string
): { weight: number; bikeType: EnBikeType } | null {
  const match = slug.match(/^(\d+)kg-(racefiets|gravelbike|mountainbike)$/);
  if (!match) {
    return null;
  }

  return {
    weight: Number(match[1]),
    bikeType: NL_TO_EN[match[2] as NlBikeType],
  };
}

export function buildPressureInput(
  weight: number,
  bikeType: EnBikeType,
  tubeType: BasicPressureInput["tubeType"] = "tubeless"
): BasicPressureInput {
  const defaults = BIKE_TYPE_DEFAULTS[bikeType];

  return {
    discipline: EN_TO_DISCIPLINE[bikeType],
    bodyWeightKg: weight,
    widthFrontMm: defaults.widthFrontMm,
    widthRearMm: defaults.widthRearMm,
    surface: defaults.surface,
    tubeType,
    ridingGoal: "balance",
  };
}

export function buildEnglishPressureSlug(weight: number, bikeType: EnBikeType) {
  return `${weight}kg-${bikeType}`;
}

export function buildDutchPressureSlug(weight: number, bikeType: EnBikeType) {
  const dutchBikeType = Object.entries(NL_TO_EN).find(
    ([, value]) => value === bikeType
  )?.[0] as NlBikeType | undefined;

  return dutchBikeType ? `${weight}kg-${dutchBikeType}` : `${weight}kg-racefiets`;
}

export function getProgrammaticCalculatorEntries() {
  return WEIGHT_STEPS.flatMap((weight) =>
    EN_BIKE_TYPES.map((bikeType) => ({
      id: `programmatic-pressure-${weight}-${bikeType}`,
      localizedPaths: {
        en: `/tire-pressure/${buildEnglishPressureSlug(weight, bikeType)}`,
        nl: `/bandenspanning/${buildDutchPressureSlug(weight, bikeType)}`,
      },
      lastmod: "2026-03-18",
      changefreq: "weekly" as const,
      priority: 0.7,
    }))
  );
}

export function buildPressureAlternates(
  weight: number,
  bikeType: EnBikeType,
  locale: "en" | "nl"
) {
  const englishPath = `/en/tire-pressure/${buildEnglishPressureSlug(weight, bikeType)}`;
  const dutchPath = `/nl/bandenspanning/${buildDutchPressureSlug(weight, bikeType)}`;
  const canonicalPath = locale === "nl" ? dutchPath : englishPath;

  return {
    canonical: `${BRAND.siteUrl}${canonicalPath}`,
    languages: {
      en: `${BRAND.siteUrl}${englishPath}`,
      nl: `${BRAND.siteUrl}${dutchPath}`,
      "x-default": `${BRAND.siteUrl}${englishPath}`,
    },
  } as const;
}
