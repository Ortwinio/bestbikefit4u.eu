export const SUPPORTED_LOCALES = ["en", "nl"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE_NAME = "bf_locale";
export const LOCALE_HEADER_NAME = "x-bf-locale";

const SUPPORTED_LOCALE_SET = new Set<string>(SUPPORTED_LOCALES);

function normalizeLanguageTag(value: string): string {
  return value.trim().toLowerCase().split("-")[0];
}

export function isLocale(value: string | null | undefined): value is Locale {
  if (!value) {
    return false;
  }

  return SUPPORTED_LOCALE_SET.has(value);
}

export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) {
    return null;
  }

  const normalized = normalizeLanguageTag(value);
  if (!isLocale(normalized)) {
    return null;
  }

  return normalized;
}

type AcceptLanguageMatch = {
  locale: Locale;
  q: number;
  order: number;
};

export function resolveLocaleFromAcceptLanguage(
  headerValue: string | null | undefined
): Locale {
  if (!headerValue) {
    return DEFAULT_LOCALE;
  }

  const matches: AcceptLanguageMatch[] = [];

  headerValue
    .split(",")
    .map((item) => item.trim())
    .forEach((item, order) => {
      if (!item) {
        return;
      }

      const [languageTag, ...params] = item.split(";");
      const locale = normalizeLocale(languageTag);
      if (!locale) {
        return;
      }

      let q = 1;
      let hasExplicitQuality = false;
      for (const param of params) {
        const [key, rawValue] = param.trim().split("=");
        if (key !== "q") {
          continue;
        }

        hasExplicitQuality = true;
        const parsed = Number.parseFloat(rawValue);
        if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) {
          q = parsed;
        }
      }

      if (hasExplicitQuality && q === 0) {
        return;
      }

      matches.push({ locale, q, order });
    });

  if (matches.length === 0) {
    return DEFAULT_LOCALE;
  }

  matches.sort((a, b) => {
    if (b.q === a.q) {
      return a.order - b.order;
    }

    return b.q - a.q;
  });

  return matches[0].locale;
}

export function resolvePreferredLocale({
  cookieLocale,
  acceptLanguageHeader,
}: {
  cookieLocale: string | null | undefined;
  acceptLanguageHeader: string | null | undefined;
}): Locale {
  const fromCookie = normalizeLocale(cookieLocale);
  if (fromCookie) {
    return fromCookie;
  }

  return resolveLocaleFromAcceptLanguage(acceptLanguageHeader);
}
