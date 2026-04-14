import { describe, expect, it } from "vitest";
import {
  mapBikeToRidingTypeFromBike,
  mapGoalToPosture,
  normalizeProfileSitBoneWidth,
} from "./SaddleSelectorForm";

describe("SaddleSelectorForm helpers", () => {
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
  });
});
