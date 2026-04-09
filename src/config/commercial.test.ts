import { describe, expect, it } from "vitest";
import {
  CONSUMER_CAMPAIGN_CONFIG,
  getConsumerCampaignCopy,
  isConsumerCampaignActive,
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
