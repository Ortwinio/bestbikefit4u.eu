import { describe, expect, it } from "vitest";
import { getFeedbackCopy } from "./feedback-copy";

describe("feedback copy contract", () => {
  it("includes the required welcome and success messaging in English", () => {
    const copy = getFeedbackCopy("en");

    expect(copy.dialog.mission).toContain("Together we create the BestBikeFit experience");
    expect(copy.dialog.successTitle).toBe("Thank you for your feedback.");
    expect(copy.dialog.nextSteps.length).toBeGreaterThan(0);
  });

  it("includes the review type and follow-up messaging in Dutch", () => {
    const copy = getFeedbackCopy("nl");

    expect(copy.types.review.label).toBe("Review");
    expect(copy.dialog.successTitle).toBe("Dank je wel voor je feedback.");
    expect(copy.dialog.nextStepsTitle).toBe("Wat gebeurt er nu");
    expect(copy.dialog.technicalDetailsLabel).toBe("Technische details");
  });
});
