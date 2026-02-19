import type { Metadata } from "next";
import type { Locale } from "./config";
import { withLocalePrefix } from "./navigation";
import { BRAND } from "@/config/brand";

function toAbsoluteUrl(pathname: string): string {
  return new URL(pathname, BRAND.siteUrl).toString();
}

export function buildLocaleAlternates(pathname: string, locale: Locale) {
  const canonicalPath = withLocalePrefix(pathname, locale);
  const enPath = withLocalePrefix(pathname, "en");
  const nlPath = withLocalePrefix(pathname, "nl");

  return {
    canonical: toAbsoluteUrl(canonicalPath),
    languages: {
      en: toAbsoluteUrl(enPath),
      nl: toAbsoluteUrl(nlPath),
      "x-default": toAbsoluteUrl(enPath),
    },
  } satisfies Metadata["alternates"];
}
