import { describe, expect, it } from "vitest";
import { getFeedbackRouteContext } from "./route-context";

describe("getFeedbackRouteContext", () => {
  it("extracts bike context from localized bike routes", () => {
    expect(getFeedbackRouteContext("/en/bikes/bike_123")).toEqual({
      linkedBikeId: "bike_123",
      linkedSessionId: undefined,
    });
    expect(getFeedbackRouteContext("/nl/bikes/bike_123/edit")).toEqual({
      linkedBikeId: "bike_123",
      linkedSessionId: undefined,
    });
  });

  it("extracts fit session context from localized fit routes", () => {
    expect(getFeedbackRouteContext("/en/fit/session_456/questionnaire")).toEqual({
      linkedBikeId: undefined,
      linkedSessionId: "session_456",
    });
    expect(getFeedbackRouteContext("/nl/fit/session_456/results")).toEqual({
      linkedBikeId: undefined,
      linkedSessionId: "session_456",
    });
  });

  it("returns no context for unrelated routes", () => {
    expect(getFeedbackRouteContext("/en/dashboard")).toEqual({
      linkedBikeId: undefined,
      linkedSessionId: undefined,
    });
  });
});
