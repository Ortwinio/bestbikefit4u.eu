import { describe, expect, it } from "vitest";
import { decideProxyAction } from "@/i18n/proxyDecision";
import { buildLocaleSwitchHref } from "@/i18n/switchHref";

describe("homepage locale e2e smoke", () => {
  it("handles dutch first visit and switches to english while keeping query", () => {
    const firstVisit = decideProxyAction({
      pathname: "/",
      cookieLocale: undefined,
      acceptLanguageHeader: "nl-NL,nl;q=0.9,en;q=0.8",
      isAuthenticated: false,
    });
    expect(firstVisit).toEqual({
      type: "redirect",
      pathname: "/nl",
      locale: "nl",
    });

    const nlHomepage = decideProxyAction({
      pathname: "/nl",
      cookieLocale: "nl",
      acceptLanguageHeader: null,
      isAuthenticated: false,
    });
    expect(nlHomepage).toEqual({
      type: "rewrite",
      pathname: "/",
      locale: "nl",
    });

    const switchedHref = buildLocaleSwitchHref({
      pathname: "/nl",
      queryString: "from=hero",
      locale: "en",
    });
    expect(switchedHref).toBe("/en?from=hero");

    const enHomepage = decideProxyAction({
      pathname: "/en",
      cookieLocale: "en",
      acceptLanguageHeader: null,
      isAuthenticated: false,
    });
    expect(enHomepage).toEqual({
      type: "rewrite",
      pathname: "/",
      locale: "en",
    });
  });

  it("keeps english locale from cookie on subsequent unprefixed visits", () => {
    const revisit = decideProxyAction({
      pathname: "/pricing",
      cookieLocale: "en",
      acceptLanguageHeader: "nl-NL,nl;q=0.9",
      isAuthenticated: false,
    });

    expect(revisit).toEqual({
      type: "redirect",
      pathname: "/en/pricing",
      locale: "en",
    });
  });
});
