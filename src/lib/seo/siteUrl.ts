import { BRAND } from "@/config/brand";
import { isLegacySiteHost, SITE_HOST_ALIASES } from "../../../shared/brand";

export function currentSiteUrl(value: string): string;
export function currentSiteUrl(value: string | undefined): string | undefined;
export function currentSiteUrl(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  try {
    const url = new URL(value);
    if ((url.protocol === "https:" || url.protocol === "http:") &&
      (isLegacySiteHost(url.hostname) || SITE_HOST_ALIASES.some((host) => url.hostname === host))) {
      return `${BRAND.siteUrl}${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    return value;
  }
  return value;
}
