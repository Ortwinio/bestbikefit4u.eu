import { describe, expect, it } from "vitest";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { isRiderProfileComplete as frontendComplete } from "../profile";
import { isRiderProfileComplete as backendComplete } from "../../../convex/profiles/queries";
import { wizardSchema } from "./measurementWizard";
import { comfortScoreToFields } from "./profile";

const complete = {
  heightCm: 175, inseamCm: 81, flexibilityScore: "average", coreStabilityScore: 3,
  comfortScore: 5, experienceLevel: "intermediate", weeklyHours: "3-6",
  typicalRideLength: "medium", positionPriority: "balanced",
};

describe("onboarding produces a profile that can start a fit", () => {
  it("requires real pain locations when discomfort is reported, even before riding style is answered", () => {
    for (const experienceLevel of [undefined, "intermediate"]) {
      const result = wizardSchema.safeParse({ ...complete, experienceLevel, comfortScore: 3, painAreas: [] });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues.some(issue => issue.path[0] === "painAreas")).toBe(true);
    }
  });

  it("persists selected locations and satisfies frontend and backend completeness gates", () => {
    const data = wizardSchema.parse({ ...complete, comfortScore: 3, painAreas: ["lower_back", "hands"] });
    const profile = {
      ...data, ...comfortScoreToFields(data.comfortScore, data.painAreas ?? []),
      _id: "profile-test" as Id<"profiles">, _creationTime: 0, userId: "user-test" as Id<"users">, updatedAt: 0,
    } as Doc<"profiles">;
    expect(profile.painAreas).toEqual(["lower_back", "hands"]);
    expect(profile.hasPain).toBe("yes");
    expect(frontendComplete(profile)).toBe(true);
    expect(backendComplete(profile)).toBe(true);
  });

  it("does not invent pain locations for comfortable riders and clears stale selections", () => {
    expect(wizardSchema.safeParse(complete).success).toBe(true);
    expect(comfortScoreToFields(5, ["hands"])).toEqual({ hasPain: "no", painAreas: [] });
  });

  it.each(["experienceLevel", "weeklyHours", "typicalRideLength", "positionPriority"])("requires %s before declaring onboarding complete", (field) => {
    const result = wizardSchema.safeParse({ ...complete, [field]: undefined });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some(issue => issue.path[0] === field)).toBe(true);
  });
});
