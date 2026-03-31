import { describe, expect, it } from "vitest";
import { PAIN_PAGE_SLUGS, PAIN_PAGES } from "./painPages";

describe("pain pages content", () => {
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
