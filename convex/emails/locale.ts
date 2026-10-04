import { SITE_ORIGIN } from "../../shared/brand";
import { DEFAULT_LOCALE, type Locale } from "../../src/i18n/config";

export function resolveEmailLocale(
  user?: { locale?: Locale } | null,
  requestLocale?: unknown
): Locale {
  if (user?.locale === "nl" || user?.locale === "en") {
    return user.locale;
  }
  if (requestLocale === "nl" || requestLocale === "en") {
    return requestLocale;
  }
  return DEFAULT_LOCALE;
}

function pathLocale(pathname: string): Locale | undefined {
  const segment = pathname.split("/")[1];
  return segment === "nl" || segment === "en" ? segment : undefined;
}

export function loginEmailLocale(url: string): Locale {
  if (!url.startsWith("/") && !/^https?:\/\//.test(url)) {
    return DEFAULT_LOCALE;
  }
  try {
    const parsed = new URL(url, SITE_ORIGIN);
    const explicitLocale = pathLocale(parsed.pathname);
    if (explicitLocale) {
      return explicitLocale;
    }
    const redirectTo = parsed.searchParams.get("redirectTo");
    if (redirectTo && (redirectTo.startsWith("/") || /^https?:\/\//.test(redirectTo))) {
      return pathLocale(new URL(redirectTo, parsed).pathname) ?? DEFAULT_LOCALE;
    }
  } catch {
    return DEFAULT_LOCALE;
  }
  return DEFAULT_LOCALE;
}
