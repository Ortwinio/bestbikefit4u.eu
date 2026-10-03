import {
  resolvePreferredLocale,
  type Locale,
} from "./config";
import { getConsolidatedPressureRedirect, getLegacyLocaleRedirect } from "./localeRoutes";
import {
  extractLocaleFromPathname,
  isBypassedPathname,
  isProtectedAppPath,
  stripLocalePrefix,
  withLocalePrefix,
} from "./navigation";

export type ProxyDecision =
  | { type: "bypass" }
  | { type: "redirect"; pathname: string; locale: Locale; permanent?: boolean; statusCode?: 301 }
  | { type: "auth_redirect"; pathname: string; locale: Locale }
  | { type: "rewrite"; pathname: string; locale: Locale };

type DecideProxyActionInput = {
  pathname: string;
  cookieLocale: string | null | undefined;
  acceptLanguageHeader: string | null | undefined;
  isAuthenticated: boolean;
};

export function decideProxyAction({
  pathname,
  cookieLocale,
  acceptLanguageHeader,
  isAuthenticated,
}: DecideProxyActionInput): ProxyDecision {
  if (isBypassedPathname(pathname)) {
    return { type: "bypass" };
  }

  const preferredLocale = resolvePreferredLocale({
    cookieLocale,
    acceptLanguageHeader,
  });
  const pathLocale = extractLocaleFromPathname(pathname);
  const pressureRedirect = getConsolidatedPressureRedirect(pathname, preferredLocale);
  if (pressureRedirect) {
    return { type: "redirect", pathname: pressureRedirect, locale: pathLocale ?? preferredLocale,
      permanent: true, statusCode: 301 };
  }

  if (!pathLocale && pathname === "/fiets-afstellen") {
    return { type: "redirect", pathname: preferredLocale === "nl" ? "/nl/bikefitting" : "/en/bike-fitting",
      locale: preferredLocale, permanent: true, statusCode: 301 };
  }

  if (!pathLocale) {
    return {
      type: "redirect",
      pathname: withLocalePrefix(pathname, preferredLocale),
      locale: preferredLocale,
    };
  }

  const internalPathname = stripLocalePrefix(pathname);
  const legacyRedirect = getLegacyLocaleRedirect(pathname);
  if (legacyRedirect) {
    return { type: "redirect", pathname: legacyRedirect, locale: pathLocale, permanent: true, statusCode: 301 };
  }

  if (isBypassedPathname(internalPathname)) {
    return {
      type: "redirect",
      pathname: internalPathname,
      locale: pathLocale,
    };
  }

  if (isProtectedAppPath(pathname) && !isAuthenticated) {
    return {
      type: "auth_redirect",
      pathname: withLocalePrefix("/login", pathLocale),
      locale: pathLocale,
    };
  }

  return {
    type: "rewrite",
    pathname: internalPathname,
    locale: pathLocale,
  };
}
