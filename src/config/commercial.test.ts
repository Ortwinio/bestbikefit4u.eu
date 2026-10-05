import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FIT_PASS_PRODUCT,
  getCommercialFaqCopy,
  getSubscriptionTermsCopy,
  isReportAccessOpen,
} from "./commercial";

const billing = vi.hoisted(() => ({ enabled: false }));
vi.mock("./billing", () => ({ isStripeBillingEnabled: () => billing.enabled }));

afterEach(() => {
  billing.enabled = false;
  vi.useRealTimers();
});

describe("report access without a campaign", () => {
  it.each([false, true])("billing enabled=%s controls open report access at any date", enabled => {
    billing.enabled = enabled;
    vi.useFakeTimers();
    for (const date of ["2026-05-01", "2026-06-04", "2026-10-04", "2027-01-01"]) {
      vi.setSystemTime(new Date(date));
      expect(isReportAccessOpen()).toBe(!enabled);
    }
  });
});

describe("commercial pricing copy", () => {
  it("maps the legacy Fit Pass wrapper to one single-bike purchase", () => {
    expect(FIT_PASS_PRODUCT.priceCents).toBe(1350);
    expect(FIT_PASS_PRODUCT.copy.nl.description).toContain("één fiets");
    expect(FIT_PASS_PRODUCT.copy.nl.description).toContain("drie maanden");
    expect(FIT_PASS_PRODUCT.copy.en.description).toContain("one bike");
    expect(FIT_PASS_PRODUCT.copy.en.description).toContain("three months");
    expect(FIT_PASS_PRODUCT.copy.nl.priceSuffix).toContain("inclusief btw");
    expect(FIT_PASS_PRODUCT.copy.en.priceSuffix).toContain("VAT included");
  });

  it.each(["nl", "en"] as const)("describes the current products and upgrade eligibility in %s", locale => {
    const faq = getCommercialFaqCopy(locale);
    const terms = getSubscriptionTermsCopy(locale);
    for (const price of locale === "nl" ? ["13,50", "21,50", "9,50", "209,50", "234,50"]
      : ["13.50", "21.50", "9.50", "209.50", "234.50"]) {
      expect(faq.pricing).toContain(price);
      expect(terms).toContain(price);
    }
    for (const copy of [faq.pricing, terms]) {
      expect(copy).toContain(locale === "nl" ? "zes maanden" : "six months");
      expect(copy).toContain(locale === "nl" ? "cadeaumeting" : "gift measurement");
      expect(copy).toContain(locale === "nl" ? "2 cadeaumetingen" : "2 gift measurements");
      expect(copy).not.toMatch(/24[,.]50|19[,.]50|annual_entry|Alpe|donat|juni 2026|June 4|campagne|campaign/i);
    }
    expect(faq.pdfReport).toContain(locale === "nl" ? "laatste rapport" : "latest report");
  });

  it.each(["nl", "en"] as const)("never restores expired campaign copy in %s", locale => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-01"));
    expect(JSON.stringify(getCommercialFaqCopy(locale))).not.toMatch(/Alpe|donat|campagne|campaign/i);
    expect(getSubscriptionTermsCopy(locale)).not.toMatch(/Alpe|donat|campagne|campaign/i);
  });
});
