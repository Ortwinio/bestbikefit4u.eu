import type { Locale } from "./config";
import { PUBLIC_CALCULATOR_ROUTE_REGISTRY } from "@/lib/public-calculators/routes";

export const PRESSURE_BIKE_SLUGS = {
  racefiets: "road-bike",
  gravelbike: "gravel-bike",
  mountainbike: "mountain-bike",
} as const;

export const LOCALE_ROUTE_PAIRS: readonly Record<Locale, string>[] = [
  { en: "/bike-fitting", nl: "/bikefitting" },
  ...Object.values(PUBLIC_CALCULATOR_ROUTE_REGISTRY).map((entry) => entry.localizedPaths),
];

export function getLocaleRoutePair(pathname: string): Record<Locale, string> | undefined {
  const path = pathname.replace(/^\/(en|nl)(?=\/|$)/i, "").replace(/\/$/, "") || "/";
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
  if (pathname !== "/en/bikefitting" && pathname !== "/nl/bike-fitting") return undefined;
  const locale = pathname.startsWith("/nl/") ? "nl" : "en";
  return `/${locale}${getLocaleRoutePair(pathname)![locale]}`;
}
