import { describe, expect, it } from "vitest";
import {
  getFeedbackPanelRouteState,
  resolveFeedbackPanelDefaultType,
  resolveFeedbackPanelOptions,
} from "./FeedbackPanelProvider";

describe("FeedbackPanelProvider helpers", () => {
  it("shows the floating button on non-admin routes and hides it on /feedback and /admin", () => {
    expect(getFeedbackPanelRouteState("/en/dashboard")).toMatchObject({
      isAdminRoute: false,
      showFloatingButton: true,
    });

    expect(getFeedbackPanelRouteState("/en/feedback")).toMatchObject({
      isAdminRoute: false,
      showFloatingButton: false,
    });

    expect(getFeedbackPanelRouteState("/admin/overview")).toMatchObject({
      isAdminRoute: true,
      showFloatingButton: false,
    });
  });

  it("covers the representative non-admin route set for trigger visibility", () => {
    const visibleRoutes = [
      "/en",
      "/en/login",
      "/en/calculators/bike-fit",
      "/en/dashboard",
      "/en/profile",
      "/en/bikes/bike_123",
      "/en/fit/session_456/results",
    ];

    for (const route of visibleRoutes) {
      expect(getFeedbackPanelRouteState(route).showFloatingButton).toBe(true);
    }
  });

  it("derives sensible default types from known routes", () => {
    expect(resolveFeedbackPanelDefaultType("/fit/session_456/results")).toBe("bug");
    expect(resolveFeedbackPanelDefaultType("/pricing")).toBe("support_case");
    expect(resolveFeedbackPanelDefaultType("/settings")).toBe("support_case");
    expect(resolveFeedbackPanelDefaultType("/dashboard")).toBeUndefined();
  });

  it("resolves panel options from route context when no overrides are supplied", () => {
    expect(resolveFeedbackPanelOptions("/en/fit/session_456/results")).toEqual({
      defaultType: "bug",
      linkedBikeId: undefined,
      linkedSessionId: "session_456",
      pagePath: "/en/fit/session_456/results",
    });

    expect(resolveFeedbackPanelOptions("/en/bikes/bike_123/edit")).toEqual({
      defaultType: "support_case",
      linkedBikeId: "bike_123",
      linkedSessionId: undefined,
      pagePath: "/en/bikes/bike_123/edit",
    });
  });

  it("lets explicit options override route-derived defaults", () => {
    expect(
      resolveFeedbackPanelOptions("/en/pricing", {
        defaultType: "feature_request",
        pagePath: "/custom",
      })
    ).toEqual({
      defaultType: "feature_request",
      linkedBikeId: undefined,
      linkedSessionId: undefined,
      pagePath: "/custom",
    });
  });
});
