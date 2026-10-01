import { describe, expect, it } from "vitest";
import {
  mapBikeToRidingTypeFromBike,
  mapGoalToPosture,
  normalizeProfileSitBoneWidth,
} from "./SaddleSelectorForm";
import { getSaddleInitialValues } from "./saddleAccountState";

describe("SaddleSelectorForm helpers", () => {
  it("resolves saved measurements before profile values before public defaults", () => {
    const initial = getSaddleInitialValues(
      { measurementMethod: "estimated", heightCm: 190 },
      { heightCm: 180, weightKg: 82, hipCircumferenceCm: 999 },
      { bikeType: "gravel", primaryGoal: "comfort" },
    );
    expect(initial.values).toMatchObject({
      inputMethod: "estimated", heightCm: 190, weightKg: 82, hipCircumferenceCm: 100,
      ridingType: "gravel", postureCategory: "upright",
    });
    expect(initial.profileFields).toEqual(["weightKg"]);
    expect(getSaddleInitialValues(null, null).values).toMatchObject({
      inputMethod: "measured", sitBoneWidthMm: 125, ridingType: "endurance_road", postureCategory: "balanced",
    });
  });

  it("derives riding type from riding style before falling back to bike type", () => {
    expect(
      mapBikeToRidingTypeFromBike({
        bikeType: "road",
        ridingStyle: "racing",
      })
    ).toBe("road_race");

    expect(
      mapBikeToRidingTypeFromBike({
        bikeType: "mountain",
        ridingStyle: null,
      })
    ).toBe("mtb");
  });

  it("maps bike goals to posture categories", () => {
    expect(mapGoalToPosture("performance")).toBe("aggressive");
    expect(mapGoalToPosture("comfort")).toBe("upright");
    expect(mapGoalToPosture(undefined)).toBe("balanced");
  });

  it("rejects out-of-range profile sit-bone widths for calculator prefill", () => {
    expect(normalizeProfileSitBoneWidth(59)).toBeNull();
    expect(normalizeProfileSitBoneWidth(130)).toBe(130);
    expect(normalizeProfileSitBoneWidth(201)).toBeNull();
    expect(getSaddleInitialValues({ sitBoneWidthMm: 201 }, null).invalidSaved).toBe(true);
    expect(getSaddleInitialValues({ sitBoneWidthMm: 200 }, null).values.sitBoneWidthMm).toBe(200);
  });
});
