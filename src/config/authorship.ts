import { BRAND } from "./brand";
import type { Locale } from "@/i18n/config";

/** Only confirmed identity data. Add verified public profiles here when supplied. */
export const AUTHORSHIP = {
  name: "Ortwin Verreck",
  path: "/authors/ortwin-verreck",
  sameAs: { person: [] as string[], organization: [] as string[] },
} as const;

export function getAuthorUrl(locale: Locale): string {
  return new URL(`/${locale}${AUTHORSHIP.path}`, BRAND.siteUrl).href;
}

/** Keep unknown/invalid dates absent; never substitute the build or request date. */
export function getGuideUpdatedDate(value?: number | string | null): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "number" && (!Number.isFinite(value) || value <= 0)) return undefined;
  if (typeof value === "string" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(typeof value === "string" ? `${value}T00:00:00Z` : value);
  if (!Number.isFinite(date.getTime())) return undefined;
  const day = date.toISOString().slice(0, 10);
  return typeof value === "string" && day !== value ? undefined : day;
}
