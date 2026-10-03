import { describe, expect, it } from "vitest";
import { decideProxyAction } from "./proxyDecision";
import { getConsolidatedPressureRedirect, PRESSURE_BIKE_SLUGS } from "./localeRoutes";
import { WEIGHT_STEPS } from "@/lib/seo/programmatic/tirePressure";
const input = { cookieLocale: "en", acceptLanguageHeader: "nl", isAuthenticated: false };
describe("pressure consolidation redirects", () => {
  it("redirects every old weight and cross-locale alias with one explicit 301", () => {
    for (const locale of ["nl", "en"] as const) for (const [nl, en] of Object.entries(PRESSURE_BIKE_SLUGS)) {
      const destination = locale === "nl" ? `/nl/bandenspanning/${nl}` : `/en/tire-pressure/${en}`;
      for (const prefix of ["bandenspanning", "tire-pressure"]) for (const slug of [nl, en]) {
        for (const weight of WEIGHT_STEPS) {
          expect(decideProxyAction({ ...input, pathname: `/${locale}/${prefix}/${weight}kg-${slug}` }))
            .toEqual({ type: "redirect", pathname: destination, locale, permanent: true, statusCode: 301 });
        }
      }
      expect(decideProxyAction({ ...input, pathname: destination }).type).toBe("rewrite");
    }
  });
  it("uses preferred locale for an unprefixed old URL without an intermediate locale redirect", () => {
    expect(getConsolidatedPressureRedirect("/tire-pressure/70kg-road-bike", "nl"))
      .toBe("/nl/bandenspanning/racefiets");
  });
  it("normalizes the old MTB page and leaves unknown bikes to the 404 route", () => {
    expect(getConsolidatedPressureRedirect("/nl/bandenspanning/mtb", "en"))
      .toBe("/nl/bandenspanning/mountainbike");
    expect(getConsolidatedPressureRedirect("/en/tire-pressure/70kg-unicycle", "en")).toBeUndefined();
  });
});
