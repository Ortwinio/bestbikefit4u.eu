import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchQuery } from "convex/nextjs";
import { getFunctionName } from "convex/server";
import { PAIN_PAGE_SLUGS } from "@/content/painPages";
import { listGuideRewrites } from "@/lib/guides/rewrites";
import { SITEMAP_SOURCE_TIMEOUT_MS } from "./config";
import { normalizeLastmod } from "./normalize";
import {
  getBlogSitemapNodes, getGuideSitemapNodes, getSitemapEntries, getSitemapIndexNodes,
  getSitemapIndexNodesWithDynamicBlog, getSitemapNodes, getSitemapSectionLastmod,
} from "./sources";

vi.mock("convex/nextjs", () => ({ fetchQuery: vi.fn() }));

beforeEach(() => {
  vi.mocked(fetchQuery).mockReset().mockResolvedValue([]);
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

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
    expect(localizedPaths).not.toContain("/nl/fiets-afstellen");
    expect(localizedPaths).not.toContain("/en/fiets-afstellen");
    expect(localizedPaths).toContain("/nl/bikefitting");
    expect(localizedPaths).toContain("/en/bike-fitting");

    for (const slug of PAIN_PAGE_SLUGS) {
      expect(localizedPaths).toContain(`/en/pain/${slug}`);
      expect(localizedPaths).toContain(`/nl/pain/${slug}`);
    }
  });

  it("always advertises the blog sitemap even when empty, without an invented date", () => {
    const indexNodes = getSitemapIndexNodes();
    const locs = indexNodes.map((node) => node.loc);

    expect(locs.some((loc) => loc.endsWith("/sitemap-blog.xml"))).toBe(true);
    expect(indexNodes.find((node) => node.loc.endsWith("/sitemap-blog.xml"))?.lastmod).toBeUndefined();
    expect(getSitemapSectionLastmod("blog")).toBeUndefined();
    expect(indexNodes).toHaveLength(4);
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

  it("does not generate duplicate URLs for calculator-gearing", () => {
    const locs = getSitemapNodes("calculators").map((node) => node.loc);
    const gearingLocs = locs.filter((loc) => loc.includes("/calculators/gearing"));
    // exactly one EN and one NL version — no duplicates from the old duplicate seed
    expect(gearingLocs).toHaveLength(2);
    expect(gearingLocs.some((loc) => loc.endsWith("/en/calculators/gearing"))).toBe(true);
    expect(gearingLocs.some((loc) => loc.endsWith("/nl/calculators/gearing"))).toBe(true);
  });

  it("does not include Dutch-only bandenspanning paths under the English locale", () => {
    const locs = getSitemapNodes("calculators").map((node) => node.loc);
    expect(locs.some((loc) => loc.includes("/en/bandenspanning/"))).toBe(false);
    expect(locs.some((loc) => loc.endsWith("/nl/bandenspanning/racefiets"))).toBe(true);
    expect(locs.some((loc) => loc.endsWith("/nl/bandenspanning/gravelbike"))).toBe(true);
    expect(locs.some((loc) => loc.endsWith("/nl/bandenspanning/mountainbike"))).toBe(true);
    expect(locs.some((loc) => loc.endsWith("/nl/bandenspanning/mtb"))).toBe(false);
    expect(locs.some((loc) => /\/(?:tire-pressure|bandenspanning)\/\d+kg-/.test(loc))).toBe(false);
    expect(locs.filter((loc) => loc.includes("/en/tire-pressure/"))).toHaveLength(3);
  });

  it("guide seeds cover every locally rendered rewrite with its actual content date", () => {
    const entries = getSitemapEntries("guides");
    const paths = entries.flatMap((e) => Object.values(e.localizedPaths));
    // Static seeds that must be present
    expect(paths.some((p) => p.includes("/why-bikefit-matters"))).toBe(true);
    expect(paths.some((p) => p.endsWith("/guides"))).toBe(true);
    for (const guide of listGuideRewrites()) {
      const entry = entries.find((item) => item.id === `guide-${guide.slug}`);
      expect(entry?.lastmod).toBe(guide.updatedAt);
      expect(paths).toContain(`/en/guides/${guide.slug}`);
      expect(paths).toContain(`/nl/guides/${guide.slug}`);
    }
    expect(entries).toHaveLength(listGuideRewrites().length + 2);
  });

  it("keeps english x-default alternates for programmatic pressure pages", () => {
    const calculatorNodes = getSitemapNodes("calculators");
    const englishNode = calculatorNodes.find((node) =>
      node.loc.endsWith("/tire-pressure/road-bike")
    );
    const dutchNode = calculatorNodes.find((node) =>
      node.loc.endsWith("/bandenspanning/racefiets")
    );

    expect(englishNode?.alternates.find((item) => item.hreflang === "x-default")?.href).toBe(
      "https://bikefitboost.com/en/tire-pressure/road-bike"
    );
    expect(dutchNode?.alternates.find((item) => item.hreflang === "x-default")?.href).toBe(
      "https://bikefitboost.com/en/tire-pressure/road-bike"
    );
  });
});

describe("sitemap content dates and bounded sources", () => {
  it("returns complete local guides and an empty blog for empty CMS sources", async () => {
    expect(await getGuideSitemapNodes()).toEqual(getSitemapNodes("guides"));
    expect(await getBlogSitemapNodes()).toEqual([]);
  });

  it.each([undefined, null, "", "invalid", "10/03/2026", "2026-02-30", "2025-02-29",
    "2026-13-01", "2026-02-30T12:00:00Z", "2026-01-01T24:00:00Z",
    "2026-01-01T12:00:00", Number.NaN, Infinity, 1e20])(
    "omits unsupported date %s without substituting today", (value) => {
      expect(normalizeLastmod(value)).toBeUndefined();
    },
  );

  it.each([
    ["2024-02-29", "2024-02-29"],
    ["2026-10-03T12:30:00.123Z", "2026-10-03"],
    ["2026-10-03T00:30:00+02:00", "2026-10-02"],
    [Date.UTC(2026, 9, 1), "2026-10-01"],
    [0, "1970-01-01"],
  ] as const)("normalizes evidenced date %s", (value, expected) => {
    expect(normalizeLastmod(value)).toBe(expected);
  });

  it("omits unknown static dates while retaining S12/S13 actual content dates", () => {
    for (const section of ["pages", "calculators"] as const) {
      for (const node of getSitemapNodes(section)) {
        const knownDate = /\/(?:authors\/ortwin-verreck|methods|tire-pressure\/[^/]+|bandenspanning\/[^/]+)$/.test(node.loc);
        expect(node.lastmod).toBe(knownDate ? "2026-10-03" : undefined);
      }
      expect(getSitemapSectionLastmod(section)).toBe("2026-10-03");
    }
  });

  it("uses valid blog timestamps and leaves undated posts undated", async () => {
    vi.mocked(fetchQuery).mockResolvedValue([
      { slug: "updated", updatedAt: Date.UTC(2026, 9, 2), publishedAt: Date.UTC(2026, 8, 1) },
      { slug: "published", updatedAt: Number.NaN, publishedAt: Date.UTC(2026, 8, 1) },
      { slug: "undated" },
    ]);
    const nodes = await getBlogSitemapNodes();
    expect(nodes).toHaveLength(6);
    expect(nodes.find((node) => node.loc.endsWith("/updated"))?.lastmod).toBe("2026-10-02");
    expect(nodes.find((node) => node.loc.endsWith("/published"))?.lastmod).toBe("2026-09-01");
    expect(nodes.find((node) => node.loc.endsWith("/undated"))?.lastmod).toBeUndefined();
  });

  it("merges CMS guides with local content and omits missing dates", async () => {
    const local = listGuideRewrites()[0];
    vi.mocked(fetchQuery).mockResolvedValue([
      { slug: local.slug, path: `/guides/${local.slug}`, updatedAt: Date.UTC(2030, 0, 1) },
      { slug: "cms-only", path: "/guides/cms-only", lastUpdatedAt: Date.UTC(2026, 9, 2) },
      { slug: "cms-undated", path: "/guides/cms-undated" },
    ]);
    const nodes = await getGuideSitemapNodes();
    expect(nodes).toHaveLength(getSitemapNodes("guides").length + 4);
    expect(new Set(nodes.map((node) => node.loc)).size).toBe(nodes.length);
    expect(nodes.find((node) => node.loc.endsWith(`/guides/${local.slug}`))?.lastmod).toBe(local.updatedAt);
    expect(nodes.find((node) => node.loc.endsWith("/cms-only"))?.lastmod).toBe("2026-10-02");
    expect(nodes.find((node) => node.loc.endsWith("/cms-undated"))?.lastmod).toBeUndefined();
  });

  it("uses a real CMS rewrite date only when that rewrite is renderable", async () => {
    const local = listGuideRewrites()[0];
    vi.mocked(fetchQuery).mockResolvedValue([{ slug: local.slug, path: `/guides/${local.slug}`,
      importStatus: "44b", libraryBody: { en: "English content", nl: "Nederlandse inhoud" },
      lastUpdatedAt: Date.UTC(2026, 9, 3) }]);
    const nodes = await getGuideSitemapNodes();
    expect(nodes.find((node) => node.loc.endsWith(`/guides/${local.slug}`))?.lastmod).toBe("2026-10-03");
  });

  it.each([undefined, Number.NaN, 0])("keeps an unknown CMS rewrite date absent instead of borrowing its local date (%s)", async (lastUpdatedAt) => {
    const local = listGuideRewrites()[0];
    vi.mocked(fetchQuery).mockResolvedValue([{ slug: local.slug, path: `/guides/${local.slug}`,
      importStatus: "44b", libraryBody: { en: "English content", nl: "Nederlandse inhoud" },
      lastUpdatedAt }]);
    const nodes = await getGuideSitemapNodes();
    const rewritten = nodes.filter((node) => node.loc.endsWith(`/guides/${local.slug}`));
    expect(rewritten).toHaveLength(2);
    expect(rewritten.every((node) => node.lastmod === undefined)).toBe(true);
  });

  it("keeps static guide coverage and the empty blog section on source failure without logging payloads", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    const warningLog = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.mocked(fetchQuery).mockRejectedValue(new Error("private source detail"));
    expect(await getGuideSitemapNodes()).toEqual(getSitemapNodes("guides"));
    expect(await getBlogSitemapNodes()).toEqual([]);
    const index = await getSitemapIndexNodesWithDynamicBlog();
    expect(index).toHaveLength(4);
    expect(index.find((node) => node.loc.endsWith("/sitemap-blog.xml"))?.lastmod).toBeUndefined();
    expect(errorLog).not.toHaveBeenCalled();
    expect(warningLog).not.toHaveBeenCalled();
  });

  it("falls back within one deadline when both sources hang, and consumes late rejection", async () => {
    vi.useFakeTimers();
    let rejectLate: (reason: Error) => void = () => {};
    vi.mocked(fetchQuery).mockImplementation(() => new Promise((_resolve, reject) => { rejectLate = reject; }));
    let complete = false;
    const result = getSitemapIndexNodesWithDynamicBlog().then((nodes) => { complete = true; return nodes; });
    await vi.advanceTimersByTimeAsync(SITEMAP_SOURCE_TIMEOUT_MS - 1);
    expect(complete).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    const nodes = await result;
    expect(nodes).toHaveLength(4);
    expect(nodes.find((node) => node.loc.endsWith("/sitemap-guides.xml"))?.lastmod)
      .toBe(getSitemapSectionLastmod("guides"));
    expect(nodes.find((node) => node.loc.endsWith("/sitemap-blog.xml"))?.lastmod).toBeUndefined();
    rejectLate(new Error("late failure"));
    await vi.advanceTimersByTimeAsync(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cleans up deadline timers when sources resolve before the timeout", async () => {
    vi.useFakeTimers();
    await getSitemapIndexNodesWithDynamicBlog();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("derives index dates from actual merged nodes while keeping an empty blog", async () => {
    vi.mocked(fetchQuery).mockImplementation(async (...args: Parameters<typeof fetchQuery>) =>
      getFunctionName(args[0]) === "guides/queries:listPublishedGuides"
        ? [{ slug: "recent", path: "/guides/recent", lastUpdatedAt: Date.UTC(2026, 9, 3) }]
        : []);
    const index = await getSitemapIndexNodesWithDynamicBlog();
    expect(index.find((node) => node.loc.endsWith("/sitemap-guides.xml"))?.lastmod).toBe("2026-10-03");
    expect(index.find((node) => node.loc.endsWith("/sitemap-blog.xml"))?.lastmod).toBeUndefined();
    expect(index).toHaveLength(4);
  });

  it("uses the latest valid blog content date rather than undated rows or current time", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2040-01-01T00:00:00Z"));
    vi.mocked(fetchQuery).mockImplementation(async (...args: Parameters<typeof fetchQuery>) =>
      getFunctionName(args[0]) === "blog/queries:listPublishedSlugs"
        ? [{ slug: "old", updatedAt: Date.UTC(2026, 8, 1) },
          { slug: "latest", publishedAt: Date.UTC(2026, 9, 2) },
          { slug: "undated" }]
        : []);
    const index = await getSitemapIndexNodesWithDynamicBlog();
    expect(index.find((node) => node.loc.endsWith("/sitemap-blog.xml"))?.lastmod).toBe("2026-10-02");
  });
});
