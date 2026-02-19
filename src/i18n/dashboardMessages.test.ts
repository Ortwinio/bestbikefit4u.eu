import { describe, expect, it } from "vitest";
import { getDashboardMessages, getLanguageSwitchLabels } from "./dashboardMessages";

describe("dashboard message catalog", () => {
  it("returns english dashboard messages", () => {
    const messages = getDashboardMessages("en");
    expect(messages.nav.newFitSession).toBe("New Fit Session");
    expect(messages.results.actions.downloadPdf).toBe("Download PDF");
  });

  it("returns dutch dashboard messages", () => {
    const messages = getDashboardMessages("nl");
    expect(messages.nav.newFitSession).toBe("Nieuwe fit-sessie");
    expect(messages.results.actions.downloadPdf).toBe("PDF downloaden");
  });

  it("falls back to english when locale is missing", () => {
    const messages = getDashboardMessages(undefined);
    expect(messages.home.title).toBe("Dashboard");
  });

  it("returns language switch labels by locale", () => {
    expect(getLanguageSwitchLabels("en").language).toBe("Language");
    expect(getLanguageSwitchLabels("nl").language).toBe("Taal");
  });

  it("exposes key localized dashboard labels used by shell and core flows", () => {
    const enMessages = getDashboardMessages("en");
    const nlMessages = getDashboardMessages("nl");

    expect(enMessages.layout.mobileMenu.openAria).toBe("Open dashboard menu");
    expect(nlMessages.layout.mobileMenu.openAria).toBe("Dashboardmenu openen");

    expect(enMessages.questionnaire.actions.complete).toBe("Complete");
    expect(nlMessages.questionnaire.actions.complete).toBe("Voltooien");

    expect(enMessages.results.backToDashboard).toBe("Back to Dashboard");
    expect(nlMessages.results.backToDashboard).toBe("Terug naar dashboard");

    expect(enMessages.bikes.empty.title).toBe("No bikes added yet");
    expect(nlMessages.bikes.empty.title).toBe("Nog geen fietsen toegevoegd");
  });
});
