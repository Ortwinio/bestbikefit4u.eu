import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { batchCGuides } from "./content/batch-c";
import { getGuideRewrite, listGuideRewrites, resolveGuideRewrite } from "./rewrites";
import { getDutchGuideTitle } from "@/i18n/marketing/guideTitles";

describe("registered guide integration", () => {
  it("has unique slugs and matching localized link titles", async () => {
    const { guideRewriteTitles } = await import("@/i18n/marketing/guideRewriteTitles");
    const guides = listGuideRewrites();
    expect(new Set(guides.map((guide) => guide.slug)).size).toBe(guides.length);
    for (const guide of guides) {
      expect(guideRewriteTitles[guide.slug]).toEqual({ nl: guide.nl.title, en: guide.en.title });
      expect(getDutchGuideTitle(guide.slug)).toBe(guide.nl.title);
      expect(getGuideRewrite(guide.slug)).toBe(guide);
    }
  });
});

describe("guide rewrite source and CMS review documents", () => {
  it.each(batchCGuides)("keeps $slug code and CMS text identical", (guide) => {
    const cms = JSON.parse(readFileSync(`plans/redesign-canvas/guides-import/${guide.slug}.json`, "utf8"));
    expect(cms.status).toBe("in_review");
    expect(cms.slug).toBe(guide.slug);
    const resolved = resolveGuideRewrite(guide.slug, cms)!;
    expect(resolved.source).toBe("cms-rewrite");
    expect(resolved.updatedAt).toBe(guide.updatedAt);
    expect(resolved.illustration).toBe(guide.illustration);
    for (const locale of ["nl", "en"] as const) {
      expect(resolved[locale]).toEqual(guide[locale]);
      expect(cms.featuredImageAlt[locale]).toBe(guide[locale].alt);
    }
    expect(getDutchGuideTitle(guide.slug)).toBe(guide.nl.title);
  });

  it("uses the rewrite for legacy records and permits later CMS editing", () => {
    const original = batchCGuides[0];
    const cms = JSON.parse(readFileSync(`plans/redesign-canvas/guides-import/${original.slug}.json`, "utf8"));
    expect(resolveGuideRewrite(original.slug, { ...cms, importStatus: "legacy" })).toBe(original);
    cms.h1.nl = "Nieuwe redactionele titel";
    cms.libraryBody.nl = "## Het probleem\n\nBijgewerkte inhoud.";
    cms.lastUpdatedAt = Date.parse("2026-10-02T00:00:00Z");
    expect(resolveGuideRewrite(original.slug, cms)?.nl.title).toBe("Nieuwe redactionele titel");
    expect(resolveGuideRewrite(original.slug, cms)?.nl.markdown).toContain("Bijgewerkte inhoud.");
    expect(resolveGuideRewrite(original.slug, cms)?.updatedAt).toBe("2026-10-02");
    expect(getGuideRewrite("missing-guide")).toBeUndefined();
  });
});
