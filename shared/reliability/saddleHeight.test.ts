import { describe, expect, it } from "vitest";
import {
  calculatePublicSaddleHeight,
  calculateSaddleHeight,
  checkInseamPlausibility,
  getPublicSaddleHeightNextStep,
  SADDLE_HEIGHT_BIKE_FACTORS,
  type SaddleHeightInput,
  type SaddleHeightProvenance,
} from "./saddleHeight";

describe("saddle-height uncertainty model", () => {
  it("matches the height-only worked example with whole-mm presentation bounds", () => {
    expect(calculateSaddleHeight({ heightCm: 190 })).toMatchObject({
      adviceMm: 789, halfWidthMm: 49, lowerMm: 740, upperMm: 840,
      inseamMm: 893, sigmaInseamMm: 26.79, scaleMinMm: 729, scaleMaxMm: 849,
    });
  });

  it("matches the single measurement and repeated profile worked examples", () => {
    expect(calculateSaddleHeight({ heightCm: 190, inseamCm: 89 })).toMatchObject({
      adviceMm: 786, halfWidthMm: 23, lowerMm: 765, upperMm: 810,
      sigmaInseamMm: 10,
    });
    expect(calculateSaddleHeight({
      inseamCm: 89,
      provenance: { kind: "measured", repeatCount: 3, withinTolerance: true },
      adjustmentsMm: { flexibility: -1.5, goal: 3 },
    })).toMatchObject({ adviceMm: 787, halfWidthMm: 18, lowerMm: 770, upperMm: 805 });
  });

  it.each(["derived", "estimated", "declared"] as const)("uses 3 percent for %s before other metadata", (kind) => {
    const result = calculateSaddleHeight({
      inseamCm: 89, provenance: { kind, method: "fitter", repeatCount: 3, withinTolerance: true },
    });
    expect(result.sigmaInseamMm).toBeCloseTo(26.7);
  });

  it.each(["fitter", "video"])("uses 5 mm for %s before repetition metadata", (method) => {
    expect(calculateSaddleHeight({
      inseamCm: 89, provenance: { kind: "measured", method, repeatCount: 3, withinTolerance: true },
    }).sigmaInseamMm).toBe(5);
  });

  it.each([1, 2, 3, 4, 100])("caps good repeated measurements at three (%i supplied)", (repeatCount) => {
    expect(calculateSaddleHeight({
      inseamCm: 89, provenance: { kind: "measured", repeatCount, withinTolerance: true },
    }).sigmaInseamMm).toBeCloseTo(10 / Math.sqrt(Math.min(repeatCount, 3)));
  });

  it.each([false, undefined])("does not narrow repeated measurements without tolerance confirmation (%s)", (withinTolerance) => {
    expect(calculateSaddleHeight({
      inseamCm: 89, provenance: { kind: "measured", repeatCount: 3, withinTolerance },
    }).sigmaInseamMm).toBe(10);
  });

  it.each([
    { kind: "measured" },
    { kind: "measured", method: "video" },
    { kind: "measured", method: "fitter" },
    { kind: "measured", repeatCount: 3, withinTolerance: true },
    { kind: "estimated" },
  ] satisfies SaddleHeightProvenance[])("open warning overrides every provenance rule: %j", (provenance) => {
    expect(calculateSaddleHeight({
      inseamCm: 89, provenance: { ...provenance, unresolvedWarning: true },
    }).sigmaInseamMm).toBeCloseTo(26.7);
  });

  it("does not label a height-derived value as measured", () => {
    expect(calculateSaddleHeight({ heightCm: 190, provenance: { kind: "measured", method: "fitter" } })
      .sigmaInseamMm).toBeCloseTo(26.79);
  });

  it.each(Object.entries(SADDLE_HEIGHT_BIKE_FACTORS))("uses %s factor but always propagates sigma with 0.883", (_, bikeFactor) => {
    const result = calculateSaddleHeight({ inseamCm: 89, bikeFactor });
    const rawAdvice = 890 * bikeFactor;
    expect(result.adviceMm).toBe(Math.round(rawAdvice));
    expect(result.sigmaModelMm).toBeCloseTo(rawAdvice / 100);
    expect(result.halfWidthMm).toBe(Math.round(1.96 * Math.hypot(8.83, rawAdvice / 100)));
  });

  it.each([[-1000, 0.86], [1000, 0.91]])("clamps advice internally for adjustment %i", (goal, clamp) => {
    const result = calculateSaddleHeight({ inseamCm: 89, adjustmentsMm: { goal } });
    expect(result.adviceMm).toBe(Math.round(890 * clamp));
    expect(result.sigmaModelMm).toBeCloseTo(8.9 * clamp);
    expect(result.lowerMm).toBeLessThan(result.adviceMm);
    expect(result.upperMm).toBeGreaterThan(result.adviceMm);
  });

  it("rounds only the final presentation values across supported inseams", () => {
    for (let tenth = 550; tenth <= 1050; tenth++) {
      const result = calculateSaddleHeight({ inseamCm: tenth / 10 });
      const advice = tenth * 0.883;
      const width = 1.96 * Math.hypot(8.83, advice * 0.01);
      expect(result.adviceMm).toBe(Math.round(advice));
      expect(result.lowerMm).toBe(Math.round((Math.round(advice) - Math.round(width)) / 5) * 5);
      expect(result.upperMm).toBe(Math.round((Math.round(advice) + Math.round(width)) / 5) * 5);
      expect(result.halfWidthMm).toBe(Math.round(width));
    }
  });

  it.each([
    {}, { heightCm: NaN }, { heightCm: Infinity }, { heightCm: 0 }, { heightCm: -190 },
    { inseamCm: NaN }, { inseamCm: Infinity }, { inseamCm: 54.99 }, { inseamCm: 105.01 },
    { heightCm: 80, inseamCm: 80 }, { heightCm: 79, inseamCm: 80 },
    { inseamCm: 89, bikeFactor: NaN }, { inseamCm: 89, bikeFactor: 0 },
    { inseamCm: 89, adjustmentsMm: { flexibility: Infinity } },
    { inseamCm: 89, adjustmentsMm: { core: NaN } },
    { inseamCm: 89, adjustmentsMm: { goal: Number.MAX_VALUE, climbing: Number.MAX_VALUE } },
    { inseamCm: 89, provenance: { kind: "measured", repeatCount: NaN } },
    { inseamCm: 89, provenance: { kind: "measured", repeatCount: 0 } },
    { inseamCm: 89, provenance: { kind: "measured", repeatCount: 2.5 } },
  ] satisfies SaddleHeightInput[])("rejects invalid low-level input %j", (input) => {
    expect(() => calculateSaddleHeight(input)).toThrow(RangeError);
  });
});

describe("inseam plausibility", () => {
  it.each([-1, 1])("handles signed inclusive boundaries in direction %i", (sign) => {
    const expected = 190 * 0.47;
    expect(checkInseamPlausibility(190, expected * (1 + sign * 0.05)).status).toBe("ok");
    expect(checkInseamPlausibility(190, expected * (1 + sign * 0.050001)).status).toBe("check");
    expect(checkInseamPlausibility(190, expected * (1 + sign * 0.12)).status).toBe("check");
    expect(checkInseamPlausibility(190, expected * (1 + sign * 0.120001)).status).toBe("large");
  });

  it.each([[170, 70, "shorter"], [170, 90, "longer"], [200, 94, "equal"]] as const)(
    "reports direction for %i cm height and %i cm inseam", (height, inseam, direction) => {
      expect(checkInseamPlausibility(height, inseam).direction).toBe(direction);
    },
  );

  it.each([[0, 89], [NaN, 89], [Infinity, 89], [190, NaN], [190, Infinity], [190, 54.9], [190, 105.1], [89, 89]])(
    "returns an error for height %s / inseam %s", (height, inseam) => {
      expect(checkInseamPlausibility(height, inseam).status).toBe("error");
    },
  );

  it("includes both supported inseam endpoints", () => {
    expect(checkInseamPlausibility(150, 55).status).not.toBe("error");
    expect(checkInseamPlausibility(210, 105).status).not.toBe("error");
  });
});

describe("public result state", () => {
  it("has no result or numeric next-step promise without height", () => {
    expect(calculatePublicSaddleHeight({})).toMatchObject({
      status: "none", result: null, canRefine: false, nextStep: { kind: "add-inseam", halfWidthMm: null },
    });
  });

  it("estimates from height then projects one measurement using the same formula", () => {
    expect(calculatePublicSaddleHeight({ heightCm: 190 })).toMatchObject({
      status: "none", basis: "estimated", dashed: false, canRefine: false,
      result: { adviceMm: 789, halfWidthMm: 49 }, nextStep: { kind: "add-inseam", halfWidthMm: 23 },
    });
  });

  it("uses a plausible measurement and projects three good measurements", () => {
    expect(calculatePublicSaddleHeight({ heightCm: 190, inseamCm: 89 })).toMatchObject({
      status: "ok", basis: "measured", dashed: false, canRefine: true,
      result: { adviceMm: 786, halfWidthMm: 23 }, nextStep: { kind: "save-and-repeat", halfWidthMm: 18 },
    });
  });

  it("keeps check-warning uncertainty until confirmation, not override", () => {
    const input = { heightCm: 190, inseamCm: 96 };
    const pending = calculatePublicSaddleHeight(input);
    expect(pending).toMatchObject({ status: "check", basis: "measured", dashed: true, canRefine: false });
    expect(pending.result?.sigmaInseamMm).toBeCloseTo(28.8);
    expect(calculatePublicSaddleHeight({ ...input, override: true })).toEqual(pending);
    expect(calculatePublicSaddleHeight({ ...input, confirmed: true })).toMatchObject({
      status: "check", dashed: false, unresolvedWarning: false, canRefine: true, result: { sigmaInseamMm: 10 },
    });
  });

  it("retains the height estimate on a large warning until explicit override", () => {
    const input = { heightCm: 190, inseamCm: 75 };
    const fallback = calculatePublicSaddleHeight(input);
    expect(fallback).toMatchObject({
      status: "large", basis: "height-until-remeasured", dashed: true, canRefine: false,
      result: { adviceMm: 789, halfWidthMm: 49 }, nextStep: { kind: "remeasure", halfWidthMm: null },
    });
    expect(calculatePublicSaddleHeight({ ...input, confirmed: true })).toEqual(fallback);
    expect(calculatePublicSaddleHeight({ ...input, override: true, confirmed: true })).toMatchObject({
      status: "large", basis: "measured", dashed: true, unresolvedWarning: true, canRefine: false,
      result: { adviceMm: 662, sigmaInseamMm: 22.5 }, nextStep: { kind: "remeasure", halfWidthMm: null },
    });
  });

  it.each([{ heightCm: NaN }, { heightCm: 190, inseamCm: 54 }, { heightCm: 190, inseamCm: Infinity }])(
    "never computes invalid public inputs even with override %j", (input) => {
      expect(calculatePublicSaddleHeight({ ...input, override: true, confirmed: true }))
        .toMatchObject({ status: "error", result: null, canRefine: false });
    },
  );

  it("projects from raw model sigma rather than rounded advice at a rounding boundary", () => {
    const result = calculateSaddleHeight({ inseamCm: 60.714 });
    expect(getPublicSaddleHeightNextStep({ hasInseam: true, unresolvedLargeWarning: false, result }))
      .toEqual({ kind: "save-and-repeat", halfWidthMm: 15 });
    expect(Math.round(1.96 * Math.hypot(0.883 * 10 / Math.sqrt(3), result.adviceMm * 0.01))).toBe(14);
  });

  it("computes next-step widths per body size and preserves raw model sigma", () => {
    const result = calculateSaddleHeight({ inseamCm: 55 });
    const next = getPublicSaddleHeightNextStep({ hasInseam: true, unresolvedLargeWarning: false, result });
    expect(next.halfWidthMm).toBe(Math.round(1.96 * Math.hypot(0.883 * 10 / Math.sqrt(3), result.sigmaModelMm)));
    expect(next.halfWidthMm).not.toBe(18);
  });
});
