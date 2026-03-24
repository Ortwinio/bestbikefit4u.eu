import { describe, expect, it } from "vitest";
import {
  buildFeedbackValidation,
  createEmptyFeedbackState,
  getFeedbackGuidedPrompts,
  getFeedbackStatusDescription,
} from "./feedback-flow";

const copy = {
  dialog: {
    typePrompt: "Select one",
    typeDescription: "Pick a type first",
    errorGeneric: "Please fix the highlighted fields before sending.",
    titleLabel: "Title",
    descriptionLabel: "Description",
    expectedResultLabel: "Expected result",
    actualResultLabel: "Actual result",
  },
};

describe("feedback-flow", () => {
  it("creates bug state with browser metadata prefilled", () => {
    expect(
      createEmptyFeedbackState("/dashboard", "bug", () => '{"userAgent":"test"}')
    ).toMatchObject({
      pagePath: "/dashboard",
      browserInfoJson: '{"userAgent":"test"}',
    });
  });

  it("keeps review state lighter than issue-reporting types", () => {
    expect(getFeedbackGuidedPrompts("review", "en")).toEqual([
      "What were you trying to do?",
      "What would have made this better?",
    ]);
    expect(getFeedbackGuidedPrompts("bug", "en")).toEqual([
      "What were you trying to do?",
      "What happened instead?",
    ]);
  });

  it("requires expected and actual result only for bug reports", () => {
    const reviewErrors = buildFeedbackValidation(
      "review",
      {
        title: "",
        description: "",
        category: "",
        expectedResult: "",
        actualResult: "",
        pagePath: "",
        browserInfoJson: "",
      },
      copy
    );
    const bugErrors = buildFeedbackValidation(
      "bug",
      {
        title: "",
        description: "",
        category: "",
        expectedResult: "",
        actualResult: "",
        pagePath: "",
        browserInfoJson: "",
      },
      copy
    );

    expect(reviewErrors).toEqual({
      title: "Title",
      description: "Description",
    });
    expect(bugErrors).toEqual({
      title: "Title",
      description: "Description",
      expectedResult: "Expected result",
      actualResult: "Actual result",
    });
  });

  it("returns user-facing lifecycle guidance for feedback statuses", () => {
    expect(getFeedbackStatusDescription("planned", "en")).toContain("planned");
    expect(getFeedbackStatusDescription("released", "nl")).toContain("release");
  });
});
