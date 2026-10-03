import type { Locale } from "./config";
import { PUBLIC_CALCULATOR_ROUTE_REGISTRY } from "@/lib/public-calculators/routes";

export const PRESSURE_BIKE_SLUGS = {
  racefiets: "road-bike",
  gravelbike: "gravel-bike",
  mountainbike: "mountain-bike",
} as const;

export const LOCALE_ROUTE_PAIRS: readonly Record<Locale, string>[] = [
  { en: "/bike-fitting", nl: "/bikefitting" },
  ...Object.entries(PRESSURE_BIKE_SLUGS).map(([nl, en]) => ({
    en: `/tire-pressure/${en}`, nl: `/bandenspanning/${nl}`,
  })),
  ...Object.values(PUBLIC_CALCULATOR_ROUTE_REGISTRY).map((entry) => entry.localizedPaths),
];

export function getLocaleRoutePair(pathname: string): Record<Locale, string> | undefined {
  const path = pathname.replace(/^\/(en|nl)(?=\/|$)/i, "").replace(/\/$/, "") || "/";
  if (path === "/fiets-afstellen") return { en: "/bike-fitting", nl: "/bikefitting" };
  const known = LOCALE_ROUTE_PAIRS.find((pair) => pair.en === path || pair.nl === path);
  if (known) return known;
  const pressure = path.match(/^\/(?:tire-pressure|bandenspanning)\/(\d+)kg-(.+)$/);
  if (!pressure) return undefined;
  const bike = Object.entries(PRESSURE_BIKE_SLUGS).find(([dutch, english]) =>
    pressure[2] === dutch || pressure[2] === english);
  if (!bike) return undefined;
  return {
    en: `/tire-pressure/${pressure[1]}kg-${bike[1]}`,
    nl: `/bandenspanning/${pressure[1]}kg-${bike[0]}`,
  };
}

export function getLegacyLocaleRedirect(pathname: string): string | undefined {
  const match = pathname.match(/^\/(en|nl)\/(?:bikefitting|bike-fitting|fiets-afstellen)$/);
  if (!match) return undefined;
  const destination = match[1] === "nl" ? "/nl/bikefitting" : "/en/bike-fitting";
  return pathname === destination ? undefined : destination;
}

/** Retire weight pages and cross-language pressure aliases in one hop. */
export function getConsolidatedPressureRedirect(pathname: string, preferredLocale: Locale): string | undefined {
  const match = pathname.match(/^\/(?:(en|nl)\/)?(?:tire-pressure|bandenspanning)\/(?:\d+kg-)?([^/]+)\/?$/);
  if (!match) return undefined;
  const locale = (match[1] ?? preferredLocale) as Locale;
  const slug = match[2] === "mtb" ? "mountainbike" : match[2];
  const bike = Object.entries(PRESSURE_BIKE_SLUGS).find(([nl, en]) => slug === nl || slug === en);
  if (!bike) return undefined;
  const destination = locale === "nl" ? `/nl/bandenspanning/${bike[0]}` : `/en/tire-pressure/${bike[1]}`;
  return pathname === destination ? undefined : destination;
}
