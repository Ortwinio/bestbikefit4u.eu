import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CONSUMER_CAMPAIGN_CONFIG,
  FIT_PASS_PRODUCT, getCommercialFaqCopy, getSubscriptionTermsCopy,
  getConsumerCampaignCopy,
  isConsumerCampaignActive,
  isReportAccessOpen,
} from "./commercial";

describe("consumer fundraising campaign config", () => {
  it("stays active before the campaign end date", () => {
    expect(isConsumerCampaignActive(new Date("2026-06-04T12:00:00+02:00"))).toBe(
      true
    );
  });

  it("switches off automatically after the campaign end date", () => {
    expect(isConsumerCampaignActive(new Date("2026-06-05T00:00:00+02:00"))).toBe(
      false
    );
  });

  it("exposes the fundraising URL and date-specific copy", () => {
    const englishCopy = getConsumerCampaignCopy("en");

    expect(CONSUMER_CAMPAIGN_CONFIG.donationUrl).toContain(
      "inschrijving.opgevenisgeenoptie.nl"
    );
    expect(englishCopy.announcement).toContain("June 4, 2026");
    expect(englishCopy.optionalNote).toContain("optional");
  });
});

describe("report access while billing is paused", () => {
  afterEach(() => vi.unstubAllEnvs());

  it.each(["true", "false", undefined].flatMap((server) =>
    ["true", "false", undefined].flatMap((client) =>
      [true, false].map((campaign) => ({ server, client, campaign }))
    )
  ))("server=$server public=$client campaign=$campaign", ({ server, client, campaign }) => {
    vi.stubEnv("STRIPE_BILLING_ENABLED", server);
    vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", client);
    const now = new Date(campaign ? "2026-06-04T12:00:00Z" : "2026-09-30T12:00:00Z");
    expect(isReportAccessOpen(now)).toBe(campaign || server === "false" || client === "false");
  });
});


describe("release 2.0 commercial copy", () => {
  afterEach(() => { vi.useRealTimers(); });
  it("maps the legacy Fit Pass wrapper to one single-bike purchase", () => {
    expect(FIT_PASS_PRODUCT.priceCents).toBe(1350);
    expect(FIT_PASS_PRODUCT.copy.nl.description).toContain("één fiets");
    expect(FIT_PASS_PRODUCT.copy.nl.description).toContain("drie maanden");
    expect(FIT_PASS_PRODUCT.copy.en.description).toContain("one bike");
    expect(FIT_PASS_PRODUCT.copy.en.description).toContain("three months");
    expect(FIT_PASS_PRODUCT.copy.nl.priceSuffix).toContain("inclusief btw");
    expect(FIT_PASS_PRODUCT.copy.en.priceSuffix).toContain("VAT included");
  });
  it.each(["nl", "en"] as const)("describes one-off and yearly prices consistently in %s", locale => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-03T12:00:00Z"));
    const faq = getCommercialFaqCopy(locale);
    const terms = getSubscriptionTermsCopy(locale);
    for (const price of locale === "nl" ? ["13,50", "24,50", "19,50", "234,50"]
      : ["13.50", "24.50", "19.50", "234.50"]) {
      expect(faq.pricing).toContain(price);
      expect(terms).toContain(price);
    }
    expect(faq.pdfReport).toContain(locale === "nl" ? "laatste rapport" : "latest report");
    expect(terms).toContain(locale === "nl" ? "nog niet geïmplementeerd" : "not been implemented yet");
  });
});
