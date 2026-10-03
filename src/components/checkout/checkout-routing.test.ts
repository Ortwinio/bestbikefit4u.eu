import { describe, expect, it } from "vitest";
import { decideProxyAction } from "@/i18n/proxyDecision";

describe("checkout localized public routing", () => {
  it.each(["nl", "en"])("allows unauthenticated /%s/checkout and preserves the locale", locale => {
    expect(decideProxyAction({ pathname: `/${locale}/checkout`, cookieLocale: undefined, acceptLanguageHeader: undefined, isAuthenticated: false })).toEqual({ type: "rewrite", pathname: "/checkout", locale });
  });

  it("redirects an unprefixed checkout to the preferred locale without requiring auth", () => {
    expect(decideProxyAction({ pathname: "/checkout", cookieLocale: "nl", acceptLanguageHeader: "en", isAuthenticated: false })).toEqual({ type: "redirect", pathname: "/nl/checkout", locale: "nl" });
  });
});
