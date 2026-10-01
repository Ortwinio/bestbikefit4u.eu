import { describe, expect, it } from "vitest";
import { buildPressurePrefill } from "./pressurePrefill";

describe("pressure prefill priority", () => {
  it("uses the public defaults when no saved or profile data exists", () => {
    expect(buildPressurePrefill({})).toEqual({
      discipline: "road", bodyWeightKg: 75, widthFrontMm: 28, widthRearMm: 28,
      tubeType: "tubeless", surface: "average_asphalt", bikeWeightKg: undefined, ridingGoal: undefined,
    });
  });
  it("uses bike discipline and weight, profile weight and active tire values", () => {
    expect(buildPressurePrefill({
      bike: { bikeType: "mountain", bikeWeightKg: 13 }, profile: { weightKg: 82 },
      tires: { widthFrontMm: 60, widthRearMm: 62, tubeType: "inner_tube" },
    })).toMatchObject({ discipline: "mtb", bikeWeightKg: 13, bodyWeightKg: 82,
      widthFrontMm: 60, widthRearMm: 62, tubeType: "inner_tube" });
  });
  it("keeps saved optional weight absent and all saved inputs ahead of changed source data", () => {
    const inputSnapshot = { discipline: "gravel" as const, bodyWeightKg: 90, widthFrontMm: 40, widthRearMm: 42,
      tubeType: "latex_tube" as const, surface: "loose_gravel" as const, ridingGoal: "comfort" as const };
    expect(buildPressurePrefill({ saved: { inputSnapshot }, profile: { weightKg: 70 },
      bike: { bikeType: "road", bikeWeightKg: 8 },
      tires: { widthFrontMm: 28, widthRearMm: 28, tubeType: "tubeless" },
    })).toEqual({ ...inputSnapshot, bikeWeightKg: undefined });
  });
  it("maps time-trial bikes to the public road discipline without changing saved measurements", () => {
    expect(buildPressurePrefill({ bike: { bikeType: "tt_triathlon", discipline: "tt" }, profile: { weightKg: 180 } }))
      .toMatchObject({ discipline: "road", bodyWeightKg: 180 });
  });
});
