import { describe, expect, it, vi } from "vitest";
import type { Locale } from "@/i18n/config";
import { getAccountMetadata } from "@/i18n/account/metadata";
import { SEO_ROBOTS_DISALLOW_PATHS } from "@/lib/seo/routePolicy";
import { getSitemapNodes } from "@/lib/seo/sitemap/sources";
import { generateMetadata } from "./page";

const request = vi.hoisted(() => ({ locale: "en" as Locale }));
vi.mock("@/i18n/request", () => ({ getRequestLocale: async () => request.locale }));
vi.mock("./EmailPreferencesClient", () => ({ EmailPreferencesClient: () => null }));

describe("non-indexable route metadata", () => {
  it.each(["en", "nl"] as const)("keeps %s preferences noindex with a clean canonical only", async (locale) => {
    request.locale = locale;
    const metadata = await generateMetadata();
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.referrer).toBe("no-referrer");
    expect(metadata.alternates).toEqual({
      canonical: `https://bikefitboost.com/${locale}/email-preferences`,
    });
    expect(metadata.alternates?.languages).toBeUndefined();
  });

  it.each(["en", "nl"] as const)("does not advertise %s account language alternates", (locale) => {
    for (const page of ["dashboard", "profile", "fit", "fit-history", "settings", "feedback"] as const) {
      expect(getAccountMetadata(locale, page).alternates?.languages).toBeUndefined();
    }
  });

  it.each(["", "/en", "/nl"])("blocks crawling of private %s routes", (prefix) => {
    for (const path of ["/dashboard", "/profile", "/fit/session-id/results", "/bikes/bike-id"]) {
      expect(SEO_ROBOTS_DISALLOW_PATHS.some((rule) =>
        `${prefix}${path}` === rule || `${prefix}${path}`.startsWith(`${rule}/`)
      )).toBe(true);
    }
    expect(SEO_ROBOTS_DISALLOW_PATHS).toContain("/api");
    expect("/api/reports/session-id/pdf".startsWith("/api/")).toBe(true);
  });

  it("keeps login, preferences and private paths out of sitemap URLs and alternates", () => {
    const nodes = ["pages", "calculators", "guides", "blog"].flatMap((section) =>
      getSitemapNodes(section as "pages" | "calculators" | "guides" | "blog")
    );
    const urls = nodes.flatMap((node) => [node.loc, ...node.alternates.map((alternate) => alternate.href)]);
    for (const url of urls) {
      const parsed = new URL(url);
      const path = parsed.pathname.replace(/^\/(en|nl)(?=\/|$)/, "");
      expect(path).not.toMatch(/^\/(login|email-preferences|dashboard|profile|fit|bikes|tools|api)(\/|$)/);
      expect(parsed.search).toBe("");
    }
  });
});
