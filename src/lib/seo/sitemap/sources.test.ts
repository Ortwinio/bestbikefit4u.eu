import { describe, expect, it } from "vitest";
import { PAIN_PAGE_SLUGS } from "@/content/painPages";
import { getSitemapEntries, getSitemapIndexNodes, getSitemapNodes } from "./sources";

describe("sitemap sources", () => {
  it("includes the pain page cluster and case-study route in the pages section", () => {
    const pageEntries = getSitemapEntries("pages");
    const localizedPaths = pageEntries.flatMap((entry) => Object.values(entry.localizedPaths));

    expect(localizedPaths).toContain("/en/pain");
    expect(localizedPaths).toContain("/nl/pain");
    expect(localizedPaths).toContain("/en/case-study");
    expect(localizedPaths).toContain("/nl/case-study");
    expect(localizedPaths).toContain("/en/how-it-works");
    expect(localizedPaths).toContain("/nl/how-it-works");

    for (const slug of PAIN_PAGE_SLUGS) {
      expect(localizedPaths).toContain(`/en/pain/${slug}`);
      expect(localizedPaths).toContain(`/nl/pain/${slug}`);
    }
  });

  it("does not advertise empty sitemap sections in the sitemap index", () => {
    const indexNodes = getSitemapIndexNodes();
    const locs = indexNodes.map((node) => node.loc);

    expect(locs.some((loc) => loc.endsWith("/sitemap-blog.xml"))).toBe(false);
  });

  it("does not include protected app routes in public sitemap nodes", () => {
    const locs = [
      ...getSitemapNodes("pages").map((node) => node.loc),
      ...getSitemapNodes("calculators").map((node) => node.loc),
      ...getSitemapNodes("guides").map((node) => node.loc),
    ];

    expect(locs.some((loc) => loc.endsWith("/en/calculators/gearing"))).toBe(true);
    expect(locs.some((loc) => loc.endsWith("/nl/calculators/gearing"))).toBe(true);
    expect(locs.some((loc) => loc.includes("/dashboard"))).toBe(false);
    expect(locs.some((loc) => loc.includes("/admin"))).toBe(false);
    expect(locs.some((loc) => loc.includes("/settings"))).toBe(false);
    expect(locs.some((loc) => loc.includes("/fit-history"))).toBe(false);
    expect(locs.some((loc) => loc.includes("/pressure-calculator"))).toBe(false);
    expect(locs.some((loc) => loc.includes("/feedback"))).toBe(false);
    expect(locs.some((loc) => loc.includes("/use-cases"))).toBe(false);
    expect(locs.some((loc) => loc.includes("/science/calculation-engine"))).toBe(false);
  });

  it("includes the new public calculator destinations that guides link to", () => {
    const locs = getSitemapNodes("calculators").map((node) => node.loc);

    expect(locs.some((loc) => loc.endsWith("/en/calculators/fuel-hydration"))).toBe(true);
    expect(locs.some((loc) => loc.endsWith("/nl/calculators/fuel-hydration"))).toBe(true);
    expect(locs.some((loc) => loc.endsWith("/en/calculators/ftp-wkg"))).toBe(true);
    expect(locs.some((loc) => loc.endsWith("/nl/calculators/ftp-wkg"))).toBe(true);
    expect(locs.some((loc) => loc.endsWith("/en/calculators/power-speed"))).toBe(true);
    expect(locs.some((loc) => loc.endsWith("/nl/calculators/power-speed"))).toBe(true);
    expect(locs.some((loc) => loc.endsWith("/en/calculators/climb-planner"))).toBe(true);
    expect(locs.some((loc) => loc.endsWith("/nl/calculators/climb-planner"))).toBe(true);
  });

  it("keeps english x-default alternates for programmatic pressure pages", () => {
    const calculatorNodes = getSitemapNodes("calculators");
    const englishNode = calculatorNodes.find((node) =>
      node.loc.endsWith("/tire-pressure/55kg-road-bike")
    );
    const dutchNode = calculatorNodes.find((node) =>
      node.loc.endsWith("/bandenspanning/55kg-racefiets")
    );

    expect(englishNode?.alternates.find((item) => item.hreflang === "x-default")?.href).toBe(
      "https://bestbikefit4u.eu/en/tire-pressure/55kg-road-bike"
    );
    expect(dutchNode?.alternates.find((item) => item.hreflang === "x-default")?.href).toBe(
      "https://bestbikefit4u.eu/en/tire-pressure/55kg-road-bike"
    );
  });
});
