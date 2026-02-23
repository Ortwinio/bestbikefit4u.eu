import { describe, expect, it } from "vitest";
import { decideProxyAction } from "@/i18n/proxyDecision";
import { buildLocaleSwitchHref } from "@/i18n/switchHref";

describe("locale routing integration", () => {
  it("redirects root to locale using accept-language", () => {
    const decision = decideProxyAction({
      pathname: "/",
      cookieLocale: undefined,
      acceptLanguageHeader: "nl-NL,nl;q=0.9,en;q=0.7",
      isAuthenticated: false,
    });

    expect(decision).toEqual({
      type: "redirect",
      pathname: "/nl",
      locale: "nl",
    });
  });

  it("uses cookie locale over accept-language for redirects", () => {
    const decision = decideProxyAction({
      pathname: "/pricing",
      cookieLocale: "en",
      acceptLanguageHeader: "nl-NL,nl;q=0.9",
      isAuthenticated: false,
    });

    expect(decision).toEqual({
      type: "redirect",
      pathname: "/en/pricing",
      locale: "en",
    });
  });

  it("rewrites localized public route to internal route", () => {
    const decision = decideProxyAction({
      pathname: "/nl/about",
      cookieLocale: "nl",
      acceptLanguageHeader: null,
      isAuthenticated: false,
    });

    expect(decision).toEqual({
      type: "rewrite",
      pathname: "/about",
      locale: "nl",
    });
  });

  it("redirects unauthenticated localized dashboard route to localized login", () => {
    const decision = decideProxyAction({
      pathname: "/nl/dashboard",
      cookieLocale: "nl",
      acceptLanguageHeader: null,
      isAuthenticated: false,
    });

    expect(decision).toEqual({
      type: "auth_redirect",
      pathname: "/nl/login",
      locale: "nl",
    });
  });

  it("redirects unauthenticated protected app routes to localized login", () => {
    const fitDecision = decideProxyAction({
      pathname: "/nl/fit",
      cookieLocale: "nl",
      acceptLanguageHeader: null,
      isAuthenticated: false,
    });
    expect(fitDecision).toEqual({
      type: "auth_redirect",
      pathname: "/nl/login",
      locale: "nl",
    });

    const profileDecision = decideProxyAction({
      pathname: "/en/profile",
      cookieLocale: "en",
      acceptLanguageHeader: null,
      isAuthenticated: false,
    });
    expect(profileDecision).toEqual({
      type: "auth_redirect",
      pathname: "/en/login",
      locale: "en",
    });
  });

  it("preserves pathname and query in language switch href", () => {
    const href = buildLocaleSwitchHref({
      pathname: "/nl/about",
      queryString: "tab=fit&from=hero",
      locale: "en",
    });

    expect(href).toBe("/en/about?tab=fit&from=hero");
  });
});
