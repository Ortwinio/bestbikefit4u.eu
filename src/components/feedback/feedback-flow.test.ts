import { describe, expect, it } from "vitest";
import {
  buildFeedbackSubmissionPayload,
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
    contactEmailLabel: "Contact email",
    contactNameLabel: "Name",
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
        contactEmail: "",
        contactName: "",
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
        contactEmail: "",
        contactName: "",
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

  it("builds the rich submission payload for anonymous feedback", () => {
    expect(
      buildFeedbackSubmissionPayload({
        type: "support_case",
        form: {
          title: " Need help ",
          description: " Cannot find the saved result ",
          category: "",
          expectedResult: "",
          actualResult: "",
          pagePath: "/en/calculators/bike-fit",
          browserInfoJson: '{"userAgent":"test"}',
          contactEmail: " rider@example.com ",
          contactName: " Rider ",
        },
        locale: "en",
        pathname: "/calculators/bike-fit",
        pageUrl: "https://bestbikefit4u.eu/en/calculators/bike-fit",
        queryString: "step=results",
        routeFamily: "calculators",
        activityTrail: [
          { action: "route_view", pathname: "/calculators/bike-fit", timestamp: 1 },
        ],
        activitySummary: "User opened the feedback panel from /calculators/bike-fit.",
        isAuthenticated: false,
      })
    ).toEqual({
      type: "support_case",
      title: "Need help",
      description: "Cannot find the saved result",
      category: undefined,
      pageUrl: "https://bestbikefit4u.eu/en/calculators/bike-fit",
      pathname: "/calculators/bike-fit",
      queryString: "step=results",
      locale: "en",
      pagePath: "/en/calculators/bike-fit",
      routeFamily: "calculators",
      activitySummary: "User opened the feedback panel from /calculators/bike-fit.",
      activityTrailJson:
        '[{"action":"route_view","pathname":"/calculators/bike-fit","timestamp":1}]',
      linkedSessionId: undefined,
      linkedBikeId: undefined,
      contactEmail: "rider@example.com",
      contactName: "Rider",
      expectedResult: undefined,
      actualResult: undefined,
      browserInfoJson: '{"userAgent":"test"}',
    });
  });
});
