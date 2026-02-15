import {
  resolvePreferredLocale,
  type Locale,
} from "./config";
import {
  extractLocaleFromPathname,
  isBypassedPathname,
  isProtectedDashboardPath,
  stripLocalePrefix,
  withLocalePrefix,
} from "./navigation";

export type ProxyDecision =
  | { type: "bypass" }
  | { type: "redirect"; pathname: string; locale: Locale }
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

  if (!pathLocale) {
    return {
      type: "redirect",
      pathname: withLocalePrefix(pathname, preferredLocale),
      locale: preferredLocale,
    };
  }

  const internalPathname = stripLocalePrefix(pathname);

  if (isBypassedPathname(internalPathname)) {
    return {
      type: "redirect",
      pathname: internalPathname,
      locale: pathLocale,
    };
  }

  if (isProtectedDashboardPath(pathname) && !isAuthenticated) {
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
