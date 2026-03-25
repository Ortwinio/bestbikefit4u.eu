import { describe, expect, it } from "vitest";
import {
  getFeedbackActivitySummary,
  getFeedbackActivityTrail,
  getFeedbackContactSummary,
  getFeedbackContextCompleteness,
  getFeedbackContextCompletenessLabel,
  getFeedbackReporterKind,
  getFeedbackReporterKindLabel,
  getFeedbackReporterName,
  getFeedbackRouteFamily,
  getFeedbackRouteFamilyLabel,
} from "./feedback-context";

type FeedbackRecord = {
  userId?: string;
  description: string;
  pagePath?: string;
  linkedBikeId?: string;
  linkedSessionId?: string;
  browserInfoJson?: string;
  pageUrl?: string;
  pathname?: string;
  queryString?: string;
  locale?: string;
  routeFamily?: string;
  activitySummary?: string;
  contextCompleteness?: string;
  activityTrailJson?: string;
  contactEmail?: string;
  contactName?: string;
};

function makeItem(overrides: Partial<FeedbackRecord> = {}) {
  return {
    description: "The reported issue",
    ...overrides,
  } as never;
}

describe("feedback context helpers", () => {
  it("normalizes route family values", () => {
    expect(getFeedbackRouteFamily(makeItem({ routeFamily: "fit_results" }))).toBe("fit_results");
    expect(getFeedbackRouteFamily(makeItem({ routeFamily: "unknown" }))).toBe("other");
    expect(getFeedbackRouteFamilyLabel("fit_results")).toBe("Fit results");
  });

  it("derives context completeness when explicit value is missing", () => {
    const high = makeItem({
      pageUrl: "https://bestbikefit4u.eu/en/dashboard",
      routeFamily: "dashboard",
      linkedBikeId: "bike_1",
      activitySummary: "Opened the dashboard and started a report.",
    });
    const medium = makeItem({
      pagePath: "/dashboard",
      browserInfoJson: "{\"ua\":\"test\"}",
    });
    const low = makeItem({
      description: "Sparse",
    });

    expect(getFeedbackContextCompleteness(high)).toBe("high");
    expect(getFeedbackContextCompleteness(medium)).toBe("medium");
    expect(getFeedbackContextCompleteness(low)).toBe("low");
    expect(getFeedbackContextCompletenessLabel("high")).toBe("High context");
  });

  it("detects anonymous versus authenticated reporters", () => {
    const authenticated = makeItem({ userId: "user_1" });
    const anonymous = makeItem({ contactEmail: "anon@example.com" });

    expect(getFeedbackReporterKind(authenticated)).toBe("authenticated");
    expect(getFeedbackReporterKind(anonymous)).toBe("anonymous");
    expect(getFeedbackReporterKindLabel("anonymous")).toBe("Anonymous");
  });

  it("prefers anonymous contact details when no user exists", () => {
    const item = makeItem({
      contactName: "Pat Rider",
      contactEmail: "pat@example.com",
    });

    expect(getFeedbackReporterName(item, "Unknown")).toBe("Pat Rider");
    expect(getFeedbackContactSummary(item)).toBe("Pat Rider · pat@example.com");
  });

  it("parses activity summary and trail safely", () => {
    const item = makeItem({
      activitySummary: "User opened fit results and reported a mismatch.",
      activityTrailJson: JSON.stringify([
        { action: "Open results", pathname: "/dashboard/results" },
        { label: "Changed bike" },
        "Opened feedback panel",
      ]),
    });

    expect(getFeedbackActivitySummary(item)).toBe(
      "User opened fit results and reported a mismatch."
    );
    expect(getFeedbackActivityTrail(item)).toEqual([
      "Open results · /dashboard/results",
      "Changed bike",
      "Opened feedback panel",
    ]);
  });
});
