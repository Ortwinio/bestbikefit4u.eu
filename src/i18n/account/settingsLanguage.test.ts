import { describe, expect, it } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { getSettingsLanguage, localizeStravaUsage } from "./settingsLanguage";
import { formatBikeDate, formatBikeSpeedKph } from "@/components/settings/stravaBikeImport";

describe("Dutch settings copy", () => {
  it("translates readiness, empty state and technical fallback copy", () => {
    const copy = getSettingsLanguage(getDashboardMessages("nl"), "nl").settings;
    expect(copy.integrations.bikeImport.fitReady).toBe("Klaar voor afstelling");
    expect(copy.integrations.bikeImport.needsFitSetup).toBe("Afstelling nodig");
    expect(copy.integrations.bikeImport.blockedDescription).toBe("Fietsen importeren uit Strava is nu niet beschikbaar.");
    expect(copy.billing.description).not.toContain("webhooks");
  });
  it("keeps the English dictionary unchanged", () => {
    const english = getDashboardMessages("en");
    expect(getSettingsLanguage(english, "en")).toBe(english);
  });
  it("translates generated Strava usage without changing its count", () => {
    expect(localizeStravaUsage("12 rides in the last 90 days", "nl")).toBe("12 ritten in de afgelopen 90 dagen");
    expect(localizeStravaUsage("12 rides in the last 90 days", "en")).toBe("12 rides in the last 90 days");
  });
  it("localizes speed units and empty dates, preserving English", () => {
    expect(formatBikeSpeedKph(31.4, "nl")).toBe("31,4 km/u");
    expect(formatBikeSpeedKph(31.4, "en")).toBe("31.4 kph");
    expect(formatBikeDate(undefined, "nl")).toBe("Geen recente ritten");
    expect(formatBikeDate(undefined, "en")).toBe("No recent rides");
  });
});
