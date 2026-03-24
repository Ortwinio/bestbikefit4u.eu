import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getFeedbackActivityTrail,
  inferFeedbackRouteFamily,
  summarizeFeedbackActivity,
  trackFeedbackSignal,
  trackFeedbackPanelOpen,
  trackFeedbackRouteVisit,
} from "./feedback-activity";

describe("feedback activity", () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
      },
    });
  });

  it("stores route visits and panel opens in a bounded trail", () => {
    trackFeedbackRouteVisit("/en/dashboard");
    trackFeedbackPanelOpen("/en/dashboard");

    expect(getFeedbackActivityTrail()).toEqual([
      expect.objectContaining({ action: "route_view", pathname: "/dashboard" }),
      expect.objectContaining({
        action: "open_feedback_panel",
        pathname: "/dashboard",
        label: "Opened the feedback panel",
      }),
    ]);
  });

  it("infers route family and summarizes recent activity", () => {
    expect(inferFeedbackRouteFamily("/fit/abc/results")).toBe("fit_results");
    expect(
      summarizeFeedbackActivity(
        "bug",
        [
          { action: "route_view", pathname: "/dashboard", timestamp: 1 },
          { action: "route_view", pathname: "/fit/abc/results", timestamp: 2 },
        ],
        "/fit/abc/results"
      )
    ).toContain("/dashboard -> /fit/abc/results");
  });

  it("captures labeled high-signal actions without turning the trail into raw telemetry", () => {
    trackFeedbackRouteVisit("/en/fit/abc/results");
    trackFeedbackSignal(
      "/en/fit/abc/results",
      "view_fit_results",
      "Viewed fit results"
    );
    trackFeedbackSignal(
      "/en/fit/abc/results",
      "open_email_report",
      "Opened the fit report email dialog"
    );
    trackFeedbackPanelOpen("/en/fit/abc/results");

    expect(getFeedbackActivityTrail()).toEqual([
      expect.objectContaining({ action: "route_view", pathname: "/fit/abc/results" }),
      expect.objectContaining({
        action: "view_fit_results",
        pathname: "/fit/abc/results",
        label: "Viewed fit results",
      }),
      expect.objectContaining({
        action: "open_email_report",
        pathname: "/fit/abc/results",
        label: "Opened the fit report email dialog",
      }),
      expect.objectContaining({
        action: "open_feedback_panel",
        pathname: "/fit/abc/results",
        label: "Opened the feedback panel",
      }),
    ]);

    expect(
      summarizeFeedbackActivity("bug", getFeedbackActivityTrail(), "/fit/abc/results")
    ).toBe(
      "User viewed fit results and opened the fit report email dialog before opening the feedback panel from /fit/abc/results."
    );
  });
});
