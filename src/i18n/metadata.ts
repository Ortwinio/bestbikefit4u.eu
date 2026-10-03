import type { Metadata } from "next";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "./config";
import { switchLocalePathname } from "./navigation";
import { BRAND } from "@/config/brand";

function toAbsoluteUrl(pathname: string): string {
  return new URL(pathname, BRAND.siteUrl).toString();
}

export function buildLocaleAlternates(pathname: string, locale: Locale) {
  const localizedPaths = Object.fromEntries(
    SUPPORTED_LOCALES.map((supportedLocale) => [
      supportedLocale,
      switchLocalePathname(pathname, supportedLocale),
    ])
  ) as Record<Locale, string>;

  return buildLocalizedAlternates(localizedPaths, locale);
}

export function buildLocalizedAlternates(
  localizedPaths: Record<Locale, string>,
  locale: Locale,
  defaultLocale: Locale = DEFAULT_LOCALE
) {
  const canonicalPath = switchLocalePathname(localizedPaths[locale], locale);
  const defaultPath = switchLocalePathname(localizedPaths[defaultLocale] ?? canonicalPath, defaultLocale);

  return {
    canonical: toAbsoluteUrl(canonicalPath),
    languages: Object.fromEntries(
      [
        ...SUPPORTED_LOCALES.map((supportedLocale) => [
          supportedLocale,
          toAbsoluteUrl(switchLocalePathname(localizedPaths[supportedLocale], supportedLocale)),
        ]),
        ["x-default", toAbsoluteUrl(defaultPath)],
      ]
    ),
  } satisfies Metadata["alternates"];
}
