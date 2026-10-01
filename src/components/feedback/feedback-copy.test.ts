import { describe, expect, it } from "vitest";
import { getFeedbackCopy } from "./feedback-copy";
import { validationMessageForField } from "./feedback-flow";
import { getFeedbackSubmitError } from "@/i18n/account/feedbackLanguage";

describe("feedback copy contract", () => {
  it("does not expose an English backend exception in Dutch", () => {
    const error = new Error("Not authenticated");
    expect(getFeedbackSubmitError(error, "nl", "fallback")).toBe("Je feedback is niet verstuurd. Probeer het opnieuw.");
    expect(getFeedbackSubmitError(error, "en", "fallback")).toBe("Not authenticated");
  });
  it.each([
    ["title", "Vul Titel in.", "Title is required."],
    ["description", "Vul Beschrijving in.", "Description is required."],
    ["expectedResult", "Vul Verwacht resultaat in.", "Expected result is required."],
    ["actualResult", "Vul Werkelijk resultaat in.", "Actual result is required."],
  ])("localizes the %s validation message without changing English", (field, dutch, english) => {
    expect(validationMessageForField(field, getFeedbackCopy("nl"))).toBe(dutch);
    expect(validationMessageForField(field, getFeedbackCopy("en"))).toBe(english);
  });
  it("includes the required welcome and success messaging in English", () => {
    const copy = getFeedbackCopy("en");

    expect(copy.dialog.mission).toContain("Together we create the BestBikeFit experience");
    expect(copy.dialog.successTitle).toBe("Thank you for your feedback.");
    expect(copy.dialog.nextSteps.length).toBeGreaterThan(0);
  });

  it("includes the review type and follow-up messaging in Dutch", () => {
    const copy = getFeedbackCopy("nl");

    expect(copy.types.review.label).toBe("Beoordeling");
    expect(copy.types.bug.label).toBe("Foutmelding");
    expect(copy.types.support_case.label).toBe("Hulpvraag");
    expect(copy.states.emptyBoardTitle).toBe("Geen open functieverzoeken");
    expect(copy.states.releaseNotes).toBe("Wijzigingen");
    expect(copy.dialog.placeholders.category).toBe("Dashboard, fietsafstelling, gegevens…");
    expect(getFeedbackCopy("en").types.review.label).toBe("Review");
    expect(getFeedbackCopy("en").states.emptyBoardTitle).toBe("No open feature requests");
    expect(copy.dialog.successTitle).toBe("Dank je wel voor je feedback.");
    expect(copy.dialog.nextStepsTitle).toBe("Wat gebeurt er nu");
    expect(copy.dialog.technicalDetailsLabel).toBe("Technische details");
  });
});
