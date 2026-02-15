import type { Metadata } from "next";
import type { Locale } from "./config";
import { withLocalePrefix } from "./navigation";

export function buildLocaleAlternates(pathname: string, locale: Locale) {
  return {
    canonical: withLocalePrefix(pathname, locale),
    languages: {
      en: withLocalePrefix(pathname, "en"),
      nl: withLocalePrefix(pathname, "nl"),
      "x-default": withLocalePrefix(pathname, "en"),
    },
  } satisfies Metadata["alternates"];
}
