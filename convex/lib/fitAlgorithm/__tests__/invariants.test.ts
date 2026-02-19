import { describe, expect, it } from "vitest";
import type { Ambition, FitInputs } from "../types";
import { calculateBikeFit } from "../index";

function makeInputs(overrides: Partial<FitInputs> = {}): FitInputs {
  return {
    category: "road",
    ambition: "balanced",
    heightMm: 1850,
    inseamMm: 820,
    flexibilityScore: 5,
    coreScore: 5,
    torsoMm: 600,
    armMm: 620,
    ...overrides,
  };
}

describe("calculateBikeFit invariants", () => {
  it("does not decrease saddle height as inseam increases", () => {
    const inseams = [650, 700, 750, 800, 850, 900, 950];
    let previousSaddleHeight = -Infinity;

    for (const inseamMm of inseams) {
      const result = calculateBikeFit(
        makeInputs({
          heightMm: 2100,
          inseamMm,
          ambition: "balanced",
          flexibilityScore: 5,
          coreScore: 5,
          torsoMm: undefined,
          armMm: undefined,
        })
      );

      expect(result.saddleHeightMm).toBeGreaterThanOrEqual(previousSaddleHeight);
      previousSaddleHeight = result.saddleHeightMm;
    }
  });

  it("increases road drop and reach as ambition becomes more aggressive", () => {
    const ambitions: Ambition[] = ["comfort", "balanced", "performance", "aero"];
    const results = ambitions.map((ambition) =>
      calculateBikeFit(
        makeInputs({
          category: "road",
          ambition,
          flexibilityScore: 6,
          coreScore: 6,
        })
      )
    );

    for (let i = 1; i < results.length; i += 1) {
      expect(results[i].barDropMm).toBeGreaterThanOrEqual(results[i - 1].barDropMm);
      expect(results[i].saddleToBarReachMm).toBeGreaterThanOrEqual(
        results[i - 1].saddleToBarReachMm
      );
    }
  });

  it("maps MTB aero to performance-equivalent cockpit outputs", () => {
    const performance = calculateBikeFit(
      makeInputs({
        category: "mtb",
        ambition: "performance",
      })
    );
    const aero = calculateBikeFit(
      makeInputs({
        category: "mtb",
        ambition: "aero",
      })
    );

    expect(aero.barDropMm).toBe(performance.barDropMm);
    expect(aero.saddleSetbackMm).toBe(performance.saddleSetbackMm);
    expect(aero.cleatOffsetMm).toBe(performance.cleatOffsetMm);
    expect(aero.saddleToBarReachMm).toBe(performance.saddleToBarReachMm);
  });

  it("keeps outputs in configured clamp ranges for boundary-but-valid inputs", () => {
    const result = calculateBikeFit(
      makeInputs({
        category: "city",
        ambition: "comfort",
        heightMm: 1300,
        inseamMm: 550,
        flexibilityScore: 0,
        coreScore: 0,
        torsoMm: undefined,
        armMm: undefined,
      })
    );

    expect(result.saddleHeightMm).toBeGreaterThanOrEqual(result.saddleHeightRange.min);
    expect(result.saddleHeightMm).toBeLessThanOrEqual(result.saddleHeightRange.max);
    expect(result.barDropMm).toBeGreaterThanOrEqual(result.barDropRange.min);
    expect(result.barDropMm).toBeLessThanOrEqual(result.barDropRange.max);
    expect(result.saddleToBarReachMm).toBeGreaterThanOrEqual(result.reachRange.min);
    expect(result.saddleToBarReachMm).toBeLessThanOrEqual(result.reachRange.max);
  });

  it("rejects inconsistent anthropometrics where inseam is not less than height", () => {
    expect(() =>
      calculateBikeFit(
        makeInputs({
          heightMm: 1700,
          inseamMm: 1700,
        })
      )
    ).toThrow(/Inseam cannot be greater than or equal to height/);
  });
});
