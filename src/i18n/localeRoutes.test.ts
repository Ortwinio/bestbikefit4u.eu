import { describe, expect, it } from "vitest";
import { buildLocaleSwitchHref } from "./switchHref";
import { buildLocaleAlternates } from "./metadata";
import { decideProxyAction } from "./proxyDecision";
import { buildSelectiveLocaleAlternates } from "@/lib/seo/pageAlternates";
import { getSitemapNodes } from "@/lib/seo/sitemap/sources";
import { getProgrammaticCalculatorEntries } from "@/lib/seo/programmatic/tirePressure";

const languages = {
  en: "https://www.bikefitboost.com/en/bike-fitting",
  nl: "https://www.bikefitboost.com/nl/bikefitting",
  "x-default": "https://www.bikefitboost.com/en/bike-fitting",
};

describe("central locale routes", () => {
  it.each([
    ["/nl/bikefitting", "en", "/en/bike-fitting"],
    ["/en/bike-fitting", "nl", "/nl/bikefitting"],
    ["/nl/bandenspanning-calculator", "en", "/en/tire-pressure-calculator"],
    ["/en/tire-pressure-calculator", "nl", "/nl/bandenspanning-calculator"],
    ["/nl/guides/fit-science", "en", "/en/guides/fit-science"],
    ["/nl/bandenspanning/racefiets", "en", "/en/tire-pressure/road-bike"],
    ["/nl/fiets-afstellen", "en", "/en/bike-fitting"],
  ] as const)("switches %s to %s without losing the query", (pathname, locale, destination) => {
    expect(buildLocaleSwitchHref({ pathname, locale, queryString: "src=header&test=1" }))
      .toBe(`${destination}?src=header&test=1`);
  });

  it("keeps every generated pressure pair reciprocal across switches and metadata", () => {
    for (const { localizedPaths } of getProgrammaticCalculatorEntries()) {
      for (const locale of ["nl", "en"] as const) {
        const opposite = locale === "nl" ? "en" : "nl";
        const source = `/${opposite}${localizedPaths[opposite]}`;
        const target = `/${locale}${localizedPaths[locale]}`;
        expect(buildLocaleSwitchHref({ pathname: source, locale, queryString: "" })).toBe(target);
        expect(buildLocaleAlternates(source, locale).canonical).toBe(`https://www.bikefitboost.com${target}`);
      }
    }
  });

  it.each(["nl", "en"] as const)("emits the same complete landing hreflang set in %s", (locale) => {
    const path = locale === "nl" ? "/bikefitting" : "/bike-fitting";
    expect(buildLocaleAlternates(path, locale)).toEqual({ canonical: languages[locale], languages });
    expect(buildSelectiveLocaleAlternates({ [locale]: path }, locale))
      .toEqual({ canonical: languages[locale], languages });
    const nodes = getSitemapNodes("pages").filter(node => node.loc === languages[locale]);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].alternates).toEqual(Object.entries(languages).map(([hreflang, href]) => ({ hreflang, href })));
  });

  it.each([
    ["/en/bikefitting", "/en/bike-fitting", "en"],
    ["/nl/bike-fitting", "/nl/bikefitting", "nl"],
    ["/nl/fiets-afstellen", "/nl/bikefitting", "nl"],
    ["/en/fiets-afstellen", "/en/bike-fitting", "en"],
  ] as const)("permanently redirects %s without looping", (pathname, destination, locale) => {
    const input = { cookieLocale: "en", acceptLanguageHeader: "nl", isAuthenticated: false };
    expect(decideProxyAction({ ...input, pathname })).toEqual({
      type: "redirect", pathname: destination, locale, permanent: true, statusCode: 301,
    });
    expect(decideProxyAction({ ...input, pathname: destination }).type).toBe("rewrite");
  });
});
