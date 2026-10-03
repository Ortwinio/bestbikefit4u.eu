import { calculateBasicPressure } from "@/lib/pressure-engine";
import { BRAND } from "@/config/brand";
import type {
  BasicPressureInput,
  Discipline,
} from "@/lib/pressure-engine";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { PRESSURE_BIKE_SLUGS } from "@/i18n/localeRoutes";

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

export const NL_TO_EN: Record<NlBikeType, EnBikeType> = PRESSURE_BIKE_SLUGS;

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
  return buildLocaleAlternates(`/tire-pressure/${buildEnglishPressureSlug(weight, bikeType)}`, locale);
}

/** Canonical bike-type pages replace the old per-weight pages; parsers above remain for redirects. */
export function parsePressureBikeSlug(slug: string, locale: "en" | "nl"): EnBikeType | null {
  if (locale === "en") return EN_BIKE_TYPES.includes(slug as EnBikeType) ? slug as EnBikeType : null;
  return Object.hasOwn(NL_TO_EN, slug) ? NL_TO_EN[slug as NlBikeType] : null;
}

export function getPressureBikePath(bikeType: EnBikeType, locale: "en" | "nl") {
  const dutch = NL_BIKE_TYPES.find(slug => NL_TO_EN[slug] === bikeType);
  return locale === "en" ? `/tire-pressure/${bikeType}` : `/bandenspanning/${dutch}`;
}

export function buildPressureBikeTable(bikeType: EnBikeType) {
  return WEIGHT_STEPS.map(weightKg => ({
    weightKg,
    tubeless: calculateBasicPressure(buildPressureInput(weightKg, bikeType, "tubeless")),
    innerTube: calculateBasicPressure(buildPressureInput(weightKg, bikeType, "inner_tube")),
  }));
}

export function getPressureBikeEntries() {
  return EN_BIKE_TYPES.map(bikeType => ({
    id: `pressure-bike-${bikeType}`,
    localizedPaths: { en: getPressureBikePath(bikeType, "en"), nl: getPressureBikePath(bikeType, "nl") },
    lastmod: "2026-10-03", changefreq: "monthly" as const, priority: 0.7,
  }));
}

export function buildPressureBikeAlternates(bikeType: EnBikeType, locale: "en" | "nl") {
  const absolute = (language: "en" | "nl") => new URL(`/${language}${getPressureBikePath(bikeType, language)}`, BRAND.siteUrl).href;
  return { canonical: absolute(locale), languages: { en: absolute("en"), nl: absolute("nl"), "x-default": absolute("en") } };
}
