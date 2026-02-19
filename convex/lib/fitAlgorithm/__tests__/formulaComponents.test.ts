import { describe, expect, it } from "vitest";
import type { FitInputs, CalculationContext } from "../types";
import {
  calculateBarDrop,
  calculateCleatOffset,
  calculateDeltas,
  calculateFrameTargets,
  calculateHandlebarWidth,
  calculateReach,
  calculateSaddleHeight,
  calculateSaddleSetback,
  calculateSaddleTilt,
  generateWarnings,
  solveStemAndSpacers,
} from "../calculations";
import { TOP_CAP_MM } from "../constants";

function makeInputs(overrides: Partial<FitInputs> = {}): FitInputs {
  return {
    category: "road",
    ambition: "balanced",
    heightMm: 1750,
    inseamMm: 810,
    flexibilityScore: 5,
    coreScore: 5,
    ...overrides,
  };
}

function makeContext(overrides: Partial<FitInputs> = {}): CalculationContext {
  const inputs = makeInputs(overrides);
  return {
    inputs,
    flexIndex: inputs.flexibilityScore - 5,
    coreIndex: inputs.coreScore - 5,
  };
}

describe("fit algorithm formula components", () => {
  it("calculates saddle height with deterministic output and low clamp behavior", () => {
    const nominal = calculateSaddleHeight(makeContext());
    expect(nominal).toEqual({
      height: 715,
      range: { min: 697, max: 737 },
    });

    const clampedLow = calculateSaddleHeight(
      makeContext({
        category: "city",
        ambition: "comfort",
        inseamMm: 800,
        flexibilityScore: 0,
        coreScore: 0,
      })
    );
    expect(clampedLow).toEqual({
      height: 688,
      range: { min: 688, max: 728 },
    });
  });

  it("calculates setback with category/ambition offsets and aero remapping for city", () => {
    const roadComfort = calculateSaddleSetback(
      makeContext({ category: "road", ambition: "comfort", inseamMm: 810 })
    );
    expect(roadComfort).toBe(58);

    const cityAero = calculateSaddleSetback(
      makeContext({ category: "city", ambition: "aero", inseamMm: 810 })
    );
    expect(cityAero).toBe(56);
  });

  it("calculates bar drop with clamp ranges and experience modifier", () => {
    const clampedLow = calculateBarDrop(
      makeContext({
        category: "road",
        ambition: "comfort",
        flexibilityScore: 0,
        coreScore: 0,
        experienceLevel: "beginner",
      }),
      600
    );
    expect(clampedLow).toEqual({
      drop: 40,
      range: { min: 40, max: 150 },
    });

    const clampedHigh = calculateBarDrop(
      makeContext({
        category: "road",
        ambition: "aero",
        flexibilityScore: 10,
        coreScore: 10,
        experienceLevel: "advanced",
      }),
      800
    );
    expect(clampedHigh).toEqual({
      drop: 150,
      range: { min: 40, max: 150 },
    });
  });

  it("calculates reach for measured torso/arm and fallback path with clamps", () => {
    const measured = calculateReach(
      makeContext({
        category: "gravel",
        ambition: "balanced",
        torsoMm: 580,
        armMm: 620,
      })
    );
    expect(measured).toEqual({
      reach: 492,
      range: { min: 450, max: 610 },
    });

    const fallbackClampedLow = calculateReach(
      makeContext({
        category: "city",
        ambition: "comfort",
        heightMm: 1300,
        torsoMm: undefined,
        armMm: undefined,
        flexibilityScore: 0,
        coreScore: 0,
      })
    );
    expect(fallbackClampedLow).toEqual({
      reach: 300,
      range: { min: 300, max: 480 },
    });

    const clampedHigh = calculateReach(
      makeContext({
        category: "road",
        ambition: "aero",
        torsoMm: 750,
        armMm: 750,
        flexibilityScore: 10,
        coreScore: 10,
      })
    );
    expect(clampedHigh).toEqual({
      reach: 630,
      range: { min: 470, max: 630 },
    });
  });

  it("calculates saddle tilt based on drop thresholds", () => {
    expect(calculateSaddleTilt("road", 80)).toBe(-1);
    expect(calculateSaddleTilt("road", 100)).toBe(-1.5);
    expect(calculateSaddleTilt("road", 130)).toBe(-2);
  });

  it("maps cleat offsets with aero remapped to performance for MTB/city", () => {
    expect(calculateCleatOffset("road", "aero")).toBe(5);
    expect(calculateCleatOffset("mtb", "aero")).toBe(10);
    expect(calculateCleatOffset("city", "aero")).toBe(12);
  });

  it("calculates handlebar width by category with rounding and clamps", () => {
    expect(calculateHandlebarWidth("road", "balanced", 413)).toBe(420);
    expect(calculateHandlebarWidth("gravel", "performance", 413)).toBe(440);
    expect(calculateHandlebarWidth("mtb", "balanced", 350)).toBe(720);
    expect(calculateHandlebarWidth("mtb", "balanced", 470)).toBe(820);
    expect(calculateHandlebarWidth("city", "balanced", 340)).toBe(600);
    expect(calculateHandlebarWidth("city", "balanced", 470)).toBe(740);
  });

  it("calculates frame stack/reach targets with and without seat tube angle", () => {
    expect(calculateFrameTargets(720, 60, 80, 500)).toEqual({
      stackTarget: 611,
      reachTarget: 440,
    });

    expect(calculateFrameTargets(720, 60, 80, 500, 74)).toEqual({
      stackTarget: 612,
      reachTarget: 440,
    });
  });

  it("solves stem/spacers and returns defaults when no geometry is available", () => {
    expect(solveStemAndSpacers("road", 600, 430)).toEqual({
      stemLength: 100,
      stemAngle: -6,
      spacerStack: 15,
    });

    const frameStack = 560;
    const frameReach = 390;
    const targetStem = 110;
    const targetAngle = 6;
    const targetSpacer = 0;
    const angleRad = (targetAngle * Math.PI) / 180;
    const reachTarget = frameReach + targetStem * Math.cos(angleRad);
    const stackTarget =
      frameStack +
      TOP_CAP_MM +
      targetSpacer +
      targetStem * Math.sin(angleRad);

    expect(
      solveStemAndSpacers(
        "road",
        stackTarget,
        reachTarget,
        frameStack,
        frameReach
      )
    ).toEqual({
      stemLength: targetStem,
      stemAngle: targetAngle,
      spacerStack: targetSpacer,
    });
  });

  it("generates warnings for risk thresholds", () => {
    const warnings = generateWarnings(
      makeInputs({
        category: "road",
        inseamMm: 800,
        flexibilityScore: 4,
        coreScore: 4,
      }),
      {
        saddleHeightMm: 713,
        barDropMm: 100,
        saddleToBarReachMm: 625,
      }
    );

    expect(warnings.map((w) => w.type).sort()).toEqual(
      ["core_warning", "flexibility_warning", "reach_risk", "saddle_too_high"].sort()
    );
  });

  it("calculates deltas only when current setup values are present", () => {
    const noDeltas = calculateDeltas(
      makeInputs(),
      {
        saddleHeightMm: 715,
        saddleSetbackMm: 52,
        saddleTiltDeg: -1,
        barDropMm: 72,
        saddleToBarReachMm: 578,
        crankLengthMm: 170,
        handlebarWidthMm: 420,
        cleatOffsetMm: 6,
        frameStackTargetMm: 615,
        frameReachTargetMm: 526,
        stemLengthMm: 100,
        stemAngleDeg: -6,
        spacerStackMm: 15,
        saddleHeightRange: { min: 697, max: 737 },
        barDropRange: { min: 40, max: 150 },
        reachRange: { min: 470, max: 630 },
        confidenceScore: 60,
        algorithmVersion: "test",
        warnings: [],
      }
    );
    expect(noDeltas).toBeUndefined();

    const withDeltas = calculateDeltas(
      makeInputs({
        currentSaddleHeightMm: 705,
        currentSetbackMm: 48,
        currentDropMm: 65,
        currentReachMm: 560,
      }),
      {
        saddleHeightMm: 715,
        saddleSetbackMm: 52,
        saddleTiltDeg: -1,
        barDropMm: 72,
        saddleToBarReachMm: 578,
        crankLengthMm: 170,
        handlebarWidthMm: 420,
        cleatOffsetMm: 6,
        frameStackTargetMm: 615,
        frameReachTargetMm: 526,
        stemLengthMm: 100,
        stemAngleDeg: -6,
        spacerStackMm: 15,
        saddleHeightRange: { min: 697, max: 737 },
        barDropRange: { min: 40, max: 150 },
        reachRange: { min: 470, max: 630 },
        confidenceScore: 60,
        algorithmVersion: "test",
        warnings: [],
      }
    );

    expect(withDeltas).toEqual({
      saddleHeightDelta: 10,
      saddleSetbackDelta: 4,
      barDropDelta: 7,
      reachDelta: 18,
    });
  });
});
