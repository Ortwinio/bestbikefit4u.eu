import { describe, expect, it } from "vitest";
import { dedupeAndSortNodes } from "./filters";
import type { SitemapUrlNode } from "./types";

describe("sitemap date-aware deduplication", () => {
  const node = (lastmod?: string): SitemapUrlNode => ({ loc: "https://www.bikefitboost.com/en", alternates: [], lastmod });
  it("keeps a real date over an undated duplicate in either order", () => {
    expect(dedupeAndSortNodes([node(), node("2026-10-01")])[0].lastmod).toBe("2026-10-01");
    expect(dedupeAndSortNodes([node("2026-10-01"), node()])[0].lastmod).toBe("2026-10-01");
  });
  it("keeps newest evidenced date and leaves unknown dates absent", () => {
    expect(dedupeAndSortNodes([node("2026-10-01"), node("2026-10-03"), node("2026-09-01")])[0].lastmod)
      .toBe("2026-10-03");
    expect(dedupeAndSortNodes([node(), node()])[0].lastmod).toBeUndefined();
  });
});
