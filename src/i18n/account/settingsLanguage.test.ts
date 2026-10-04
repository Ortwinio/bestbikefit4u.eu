import { describe, expect, it } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { getSettingsLanguage } from "./settingsLanguage";
import { toolsSettings } from "./toolsSettings";

describe("settings copy", () => {
  it("preserves the Dutch billing explanation", () => {
    const copy = getSettingsLanguage(getDashboardMessages("nl"), "nl").settings;
    expect(copy.billing.description).toContain("Beheer je betaalmethode");
    expect(copy.billing.description).not.toContain("webhooks");
  });
  it("keeps the English dictionary unchanged", () => {
    const english = getDashboardMessages("en");
    expect(getSettingsLanguage(english, "en")).toBe(english);
  });
  it.each(["nl", "en"] as const)("has no Strava copy or integration placeholder in %s", (locale) => {
    const messages = getSettingsLanguage(getDashboardMessages(locale), locale);
    expect(JSON.stringify(messages)).not.toMatch(/strava/i);
    expect(messages.settings).not.toHaveProperty("integrations");
    expect(JSON.stringify(toolsSettings[locale])).not.toMatch(/strava/i);
  });
});
