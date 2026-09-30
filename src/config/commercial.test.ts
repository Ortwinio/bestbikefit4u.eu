import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CONSUMER_CAMPAIGN_CONFIG,
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
