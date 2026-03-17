import { describe, expect, it } from "vitest";
import {
  calculateAdvancedPressure,
  calculateBasicPressure,
  validatePressureInput,
} from "../pressure-engine";

describe("pressure-engine", () => {
  it("calculates the reference road setup", () => {
    const result = calculateBasicPressure({
      discipline: "road",
      bodyWeightKg: 75,
      widthFrontMm: 28,
      widthRearMm: 28,
      tubeType: "tubeless",
      surface: "average_asphalt",
      ridingGoal: "balance",
    });

    expect(result.frontBar).toBe(5.2);
    expect(result.rearBar).toBe(5.6);
    expect(result.frontPsi).toBe(75);
    expect(result.rearPsi).toBe(81);
  });

  it("enforces rear pressure at or above front pressure", () => {
    const result = calculateBasicPressure({
      discipline: "road",
      bodyWeightKg: 35,
      widthFrontMm: 18,
      widthRearMm: 80,
      tubeType: "inner_tube",
      surface: "rough_asphalt",
    });

    expect(result.rearBar).toBeGreaterThanOrEqual(result.frontBar);
  });

  it("applies advanced corrections and scores", () => {
    const result = calculateAdvancedPressure({
      discipline: "gravel",
      bodyWeightKg: 90,
      bikeWeightKg: 9,
      widthFrontMm: 40,
      widthRearMm: 40,
      tubeType: "tubeless",
      casingType: "reinforced",
      surface: "hardpack_gravel",
      ridingGoal: "comfort",
      isWet: true,
      extraLuggageKg: 10,
      routeElevationM: 2000,
      internalRimWidthFrontMm: 25,
      internalRimWidthRearMm: 25,
      currentFrontBar: 2.6,
      currentRearBar: 2.8,
    });

    expect(result.frontBar).toBeGreaterThanOrEqual(1.5);
    expect(result.rearBar).toBeLessThanOrEqual(5);
    expect(result.comfortScore).toBeTypeOf("number");
    expect(result.gripScore).toBeTypeOf("number");
    expect(result.efficiencyScore).toBeTypeOf("number");
  });

  it("generates warnings for hookless and unusual setups", () => {
    const result = calculateAdvancedPressure({
      discipline: "road",
      bodyWeightKg: 95,
      widthFrontMm: 18,
      widthRearMm: 18,
      tubeType: "inner_tube",
      surface: "smooth_asphalt",
      rimType: "hookless",
      maxPressureBar: 3,
    });

    expect(result.warnings).toContain("max_rim_pressure_exceeded");
    expect(result.warnings).toContain("hookless_limit_exceeded");
    expect(result.warnings).toContain("road_tire_width_unusual");
  });

  it("validates supported input ranges", () => {
    const errors = validatePressureInput({
      bodyWeightKg: 20,
      widthFrontMm: 10,
      widthRearMm: 28,
      bikeWeightKg: 25,
      currentFrontBar: 0.5,
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "bodyWeightKg" }),
        expect.objectContaining({ field: "widthFrontMm" }),
        expect.objectContaining({ field: "bikeWeightKg" }),
        expect.objectContaining({ field: "currentFrontBar" }),
      ])
    );
  });
});
