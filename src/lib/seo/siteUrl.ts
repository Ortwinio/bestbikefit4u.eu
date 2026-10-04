import { BRAND } from "@/config/brand";
import { LEGACY_SITE_HOSTS } from "../../../shared/brand";

export function currentSiteUrl(value: string): string;
export function currentSiteUrl(value: string | undefined): string | undefined;
export function currentSiteUrl(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  try {
    const url = new URL(value);
    if ((url.protocol === "https:" || url.protocol === "http:") &&
      LEGACY_SITE_HOSTS.some((host) => url.hostname === host)) {
      return `${BRAND.siteUrl}${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    return value;
  }
  return value;
}
