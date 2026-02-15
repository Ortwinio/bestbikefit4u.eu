import { describe, expect, it } from "vitest";
import { mapCoreScore, mapFlexibilityScore, validateInputs } from "../validation";
import type { FitInputs } from "../types";

function makeValidInputs(overrides: Partial<FitInputs> = {}): FitInputs {
  return {
    category: "road",
    ambition: "balanced",
    heightMm: 1750,
    inseamMm: 800,
    flexibilityScore: 5,
    coreScore: 5,
    ...overrides,
  };
}

describe("score mapping", () => {
  it("maps flexibility score from 1-5 to algorithm scale", () => {
    expect(mapFlexibilityScore(1)).toBe(2);
    expect(mapFlexibilityScore(2)).toBe(4);
    expect(mapFlexibilityScore(3)).toBe(5);
    expect(mapFlexibilityScore(4)).toBe(7);
    expect(mapFlexibilityScore(5)).toBe(9);
  });

  it("maps core score from 1-5 to algorithm scale", () => {
    expect(mapCoreScore(1)).toBe(2);
    expect(mapCoreScore(2)).toBe(4);
    expect(mapCoreScore(3)).toBe(5);
    expect(mapCoreScore(4)).toBe(7);
    expect(mapCoreScore(5)).toBe(9);
  });
});

describe("validateInputs", () => {
  it("accepts valid input set", () => {
    const result = validateInputs(makeValidInputs());

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it("rejects out-of-range height", () => {
    const result = validateInputs(makeValidInputs({ heightMm: 1200 }));

    expect(result.isValid).toBe(false);
    expect(result.errors.some((err) => err.includes("Height must be between"))).toBe(
      true
    );
  });

  it("rejects impossible inseam >= height", () => {
    const result = validateInputs(
      makeValidInputs({
        heightMm: 1700,
        inseamMm: 1700,
      })
    );

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Inseam cannot be greater than or equal to height");
  });

  it("warns when inseam ratio is outside normal range", () => {
    const result = validateInputs(
      makeValidInputs({
        heightMm: 1700,
        inseamMm: 600,
      })
    );

    expect(result.isValid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]?.type).toBe("measurement_warning");
    expect(result.warnings[0]?.message).toContain("Inseam ratio");
  });
});
