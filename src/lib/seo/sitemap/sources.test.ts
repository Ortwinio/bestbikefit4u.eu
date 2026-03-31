import { describe, expect, it } from "vitest";
import { PAIN_PAGE_SLUGS } from "@/content/painPages";
import { getSitemapEntries } from "./sources";

describe("sitemap sources", () => {
  it("includes the pain page cluster and case-study route in the pages section", () => {
    const pageEntries = getSitemapEntries("pages");
    const localizedPaths = pageEntries.flatMap((entry) => Object.values(entry.localizedPaths));

    expect(localizedPaths).toContain("/en/pain");
    expect(localizedPaths).toContain("/nl/pain");
    expect(localizedPaths).toContain("/en/case-study");
    expect(localizedPaths).toContain("/nl/case-study");

    for (const slug of PAIN_PAGE_SLUGS) {
      expect(localizedPaths).toContain(`/en/pain/${slug}`);
      expect(localizedPaths).toContain(`/nl/pain/${slug}`);
    }
  });
});
