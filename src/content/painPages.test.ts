import { describe, expect, it } from "vitest";
import { PAIN_PAGE_SLUGS, PAIN_PAGES } from "./painPages";

describe("pain pages content", () => {
  it("frames knee-pain checks as non-diagnostic without prevalence or quick-win claims", () => {
    const kneePage = PAIN_PAGES.find((page) => page.slug === "knee-pain-cycling");

    expect(kneePage?.en.intro).toContain("can have different causes");
    expect(kneePage?.en.intro).toContain("without treating them as a diagnosis");
    expect(kneePage?.en.intro).not.toMatch(/often a fit problem|fastest wins/i);
    expect(kneePage?.nl.intro).toContain("kan verschillende oorzaken hebben");
    expect(kneePage?.nl.intro).toContain("niet als diagnose");
    expect(kneePage?.nl.intro).not.toMatch(/vaak eerst een fitprobleem|snelste winst/i);
  });

  it("ships the first 5 pain pages", () => {
    expect(PAIN_PAGES).toHaveLength(5);
  });

  it("keeps slugs unique", () => {
    expect(new Set(PAIN_PAGE_SLUGS).size).toBe(PAIN_PAGE_SLUGS.length);
  });

  it("includes a case-study CTA on every pain page", () => {
    expect(
      PAIN_PAGES.every((page) =>
        page.en.relatedLinks.some((link) => link.href === "/case-study")
      )
    ).toBe(true);
  });
});
