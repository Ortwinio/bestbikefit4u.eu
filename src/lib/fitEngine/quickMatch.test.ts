import { describe, expect, it } from "vitest";
import {
  estimateInseamFromHeight,
  isValidQuickMatchHeight,
  QUICK_MATCH_MAX_HEIGHT_CM,
  QUICK_MATCH_MIN_HEIGHT_CM,
  QUICK_MATCH_SCORE_MAX,
  runQuickMatch,
} from "./quickMatch";

describe("quickMatch engine", () => {
  it("caps scores at 75 and produces a strong but heuristic result band", () => {
    const result = runQuickMatch(178, {
      bikeType: "road",
      sizeLabel: "56",
      stackMm: 553,
      reachMm: 392,
      geometryQuality: "full",
      source: "geometry_record",
    });

    expect(result.score).toBeLessThanOrEqual(QUICK_MATCH_SCORE_MAX);
    expect(result.scoreMax).toBe(75);
    expect(result.scoreBand).toBe("could_fit");
    expect(result.confidence).toBe("high");
    expect(result.calcVersion).toBe("qm_v1");
  });

  it("returns limited confidence when no usable geometry is available", () => {
    const result = runQuickMatch(178, {
      bikeType: "road",
      geometryQuality: "none",
    });

    expect(result.confidence).toBe("limited");
    expect(result.explanationCode).toBe("limited_geometry_data");
    expect(result.dimensionScores).toEqual({
      frameSize: 0,
      cockpit: 0,
      geometryConfidence: 0,
    });
  });

  it("keeps size-only bikes in a cautious medium-confidence band", () => {
    const result = runQuickMatch(182, {
      bikeType: "road",
      sizeLabel: "58",
      geometryQuality: "partial",
    });

    expect(result.dimensionScores.frameSize).toBeGreaterThan(0);
    expect(result.dimensionScores.cockpit).toBe(0);
    expect(result.confidence).toBe("medium");
    expect(result.scoreBand).toBe("weak");
  });

  it("uses deterministic score bands at the defined thresholds", () => {
    expect(
      runQuickMatch(178, {
        bikeType: "road",
        geometryQuality: "none",
      }).scoreBand
    ).toBe("unlikely");

    expect(
      runQuickMatch(182, {
        bikeType: "road",
        sizeLabel: "58",
        geometryQuality: "partial",
      }).scoreBand
    ).toBe("weak");

    expect(
      runQuickMatch(178, {
        bikeType: "road",
        sizeLabel: "56",
        stackMm: 570,
        geometryQuality: "partial",
      }).scoreBand
    ).toBe("borderline");

    expect(
      runQuickMatch(178, {
        bikeType: "road",
        sizeLabel: "56",
        stackMm: 553,
        reachMm: 392,
        geometryQuality: "full",
      }).scoreBand
    ).toBe("could_fit");
  });

  it("validates supported height bounds and inseam estimate", () => {
    expect(isValidQuickMatchHeight(QUICK_MATCH_MIN_HEIGHT_CM)).toBe(true);
    expect(isValidQuickMatchHeight(QUICK_MATCH_MAX_HEIGHT_CM)).toBe(true);
    expect(isValidQuickMatchHeight(QUICK_MATCH_MIN_HEIGHT_CM - 1)).toBe(false);
    expect(isValidQuickMatchHeight(QUICK_MATCH_MAX_HEIGHT_CM + 1)).toBe(false);
    expect(estimateInseamFromHeight(178)).toBe(84);
  });
});
