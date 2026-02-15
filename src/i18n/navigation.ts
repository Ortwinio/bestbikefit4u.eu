import { type Locale, SUPPORTED_LOCALES, isLocale } from "./config";

const localePrefixRegex = new RegExp(
  `^/(${SUPPORTED_LOCALES.join("|")})(?=/|$)`,
  "i"
);

function ensureLeadingSlash(pathname: string): string {
  if (!pathname.startsWith("/")) {
    return `/${pathname}`;
  }

  return pathname;
}

export function extractLocaleFromPathname(pathname: string): Locale | null {
  const match = ensureLeadingSlash(pathname).match(localePrefixRegex);
  if (!match) {
    return null;
  }

  const maybeLocale = match[1].toLowerCase();
  return isLocale(maybeLocale) ? maybeLocale : null;
}

export function stripLocalePrefix(pathname: string): string {
  const normalizedPathname = ensureLeadingSlash(pathname);
  const locale = extractLocaleFromPathname(normalizedPathname);
  if (!locale) {
    return normalizedPathname;
  }

  const stripped = normalizedPathname.replace(new RegExp(`^/${locale}`), "");
  return stripped.length === 0 ? "/" : stripped;
}

export function withLocalePrefix(pathname: string, locale: Locale): string {
  const stripped = stripLocalePrefix(pathname);
  if (stripped === "/") {
    return `/${locale}`;
  }

  return `/${locale}${stripped}`;
}

export function switchLocalePathname(pathname: string, locale: Locale): string {
  return withLocalePrefix(pathname, locale);
}

export function isBypassedPathname(pathname: string): boolean {
  const normalizedPathname = ensureLeadingSlash(pathname);

  if (normalizedPathname.startsWith("/api")) {
    return true;
  }

  if (normalizedPathname.startsWith("/trpc")) {
    return true;
  }

  if (normalizedPathname.startsWith("/_next")) {
    return true;
  }

  return /\.[^/]+$/.test(normalizedPathname);
}

export function isProtectedDashboardPath(pathname: string): boolean {
  const internalPathname = stripLocalePrefix(pathname);
  return (
    internalPathname === "/dashboard" ||
    internalPathname.startsWith("/dashboard/")
  );
}
