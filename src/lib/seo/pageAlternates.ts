import type { Locale } from "@/i18n/config";
import { BRAND } from "@/config/brand";
import { withLocalePrefix } from "@/i18n/navigation";

function toAbsoluteUrl(pathname: string): string {
  return new URL(pathname, BRAND.siteUrl).toString();
}

type SelectiveLocaleAlternates = {
  canonical: string;
  languages: Record<string, string>;
};

export function buildSelectiveLocaleAlternates(
  pathnames: Partial<Record<Locale, string>>,
  canonicalLocale: Locale
): SelectiveLocaleAlternates {
  const canonicalPath = pathnames[canonicalLocale];

  if (!canonicalPath) {
    throw new Error(`Missing canonical pathname for locale "${canonicalLocale}"`);
  }

  const languages = Object.fromEntries(
    Object.entries(pathnames).map(([locale, pathname]) => [
      locale,
      toAbsoluteUrl(withLocalePrefix(pathname ?? "/", locale as Locale)),
    ])
  );

  const canonical = toAbsoluteUrl(withLocalePrefix(canonicalPath, canonicalLocale));

  return {
    canonical,
    languages: {
      ...languages,
      "x-default": canonical,
    },
  };
}
