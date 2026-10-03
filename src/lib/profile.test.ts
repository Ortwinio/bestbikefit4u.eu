import { describe, expect, it } from "vitest";
import type { Doc } from "../../convex/_generated/dataModel";
import { hasFitMeasurements } from "../../shared/profileFitReadiness";
import { isRiderProfileComplete } from "./profile";

const complete = {
  heightCm: 178, inseamCm: 83, flexibilityScore: "good", coreStabilityScore: 4,
  experienceLevel: "beginner", weeklyHours: "0-3", typicalRideLength: "short",
  hasPain: "no", positionPriority: "comfort",
} as Doc<"profiles">;

describe("partial profile readiness", () => {
  it("keeps inseam-only handoffs incomplete and allows engine estimates for optional lengths", () => {
    expect(hasFitMeasurements({ inseamCm: 83 })).toBe(false);
    expect(isRiderProfileComplete({ inseamCm: 83 } as Doc<"profiles">)).toBe(false);
    expect(hasFitMeasurements(complete)).toBe(true);
    expect(isRiderProfileComplete(complete)).toBe(true);
  });

  it.each(["heightCm", "inseamCm", "flexibilityScore", "coreStabilityScore"] as const)(
    "requires %s even when riding questions are answered", (field) => {
      const partial = { ...complete, [field]: undefined };
      expect(hasFitMeasurements(partial)).toBe(false);
      expect(isRiderProfileComplete(partial)).toBe(false);
    },
  );

  it("still requires riding preferences and pain locations", () => {
    expect(isRiderProfileComplete({ ...complete, weeklyHours: undefined })).toBe(false);
    expect(isRiderProfileComplete({ ...complete, hasPain: "yes", painAreas: [] })).toBe(false);
  });
});
