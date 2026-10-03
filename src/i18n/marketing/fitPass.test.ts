import { describe, expect, it } from "vitest";
import { FIT_PASS_PRODUCT, formatEuroPriceFromCents } from "@/config/commercial";
import { fitPassCopy, fitPassPresentation } from "./fitPass";

describe("single-measurement marketing copy", () => {
  it.each(["nl", "en"] as const)("shows a one-off bike-scoped product in %s", locale => {
    const copy = fitPassCopy[locale];
    const serialized = JSON.stringify({ copy, presentation: fitPassPresentation[locale] });
    expect(copy.cta).toContain(formatEuroPriceFromCents(FIT_PASS_PRODUCT.priceCents, locale));
    expect(copy.finalCta).toBe(copy.cta);
    expect(copy.metadata.description).toContain(locale === "nl" ? "één fiets" : "one bike");
    expect(copy.metadata.description).toContain(locale === "nl" ? "drie maanden" : "three months");
    expect(copy.metadata.description).toContain(locale === "nl" ? "inclusief btw" : "including VAT");
    expect(serialized).not.toMatch(/(?:€|EUR)\s*9(?:\D|$)|12[,.]50|\/\s*(?:month|maand)|\bPro\b/);
    expect(serialized).not.toMatch(/unlimited (?:sessions|bike)|onbeperkte (?:sessies|fiets)/i);
    expect(copy.faqs[1].a).toContain(locale === "nl" ? "Nee." : "No.");
  });
});
