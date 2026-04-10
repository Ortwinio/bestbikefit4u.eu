import { describe, expect, it } from "vitest";
import {
  createPublicCalculatorRange,
  createPublicCalculatorResultEnvelope,
  createPublicFitBaseline,
  derivePublicCalculatorConfidence,
  PUBLIC_FIT_REQUIREMENTS,
  validateCrankLengthRecommendation,
  validateFitOutputConsistency,
  validatePublicFitBaseline,
} from "./publicCalculatorLogic";

describe("createPublicFitBaseline", () => {
  it("normalizes baseline input into a shared fit baseline shape", () => {
    const baseline = createPublicFitBaseline({
      heightCm: 178,
      inseamCm: 84.5,
      bikeCategory: "road",
      ridingGoal: "balanced",
      flexibilityScore: 3,
      coreStabilityScore: 4,
    });

    expect(baseline.category).toBe("road");
    expect(baseline.flexibility).toBe(3);
    expect(baseline.coreStability).toBe(4);
    expect(baseline.inseamSource).toBe("measured");
  });
});

describe("validatePublicFitBaseline", () => {
  it("returns an error for impossible inseam-height relationships", () => {
    const issues = validatePublicFitBaseline(
      createPublicFitBaseline({
        heightCm: 170,
        inseamCm: 171,
      }),
      PUBLIC_FIT_REQUIREMENTS.bikeFit
    );

    expect(issues.some((issue) => issue.code === "inseam_not_shorter_than_height")).toBe(true);
  });

  it("returns a warning for unusual inseam ratios", () => {
    const issues = validatePublicFitBaseline(
      createPublicFitBaseline({
        heightCm: 200,
        inseamCm: 75,
      }),
      PUBLIC_FIT_REQUIREMENTS.frameSize
    );

    expect(issues.some((issue) => issue.code === "inseam_height_ratio_low")).toBe(true);
  });
});

describe("derivePublicCalculatorConfidence", () => {
  it("scores measured inseam with more confidence than an incomplete baseline", () => {
    const measured = derivePublicCalculatorConfidence({
      baseline: createPublicFitBaseline({
        heightCm: 178,
        inseamCm: 84.5,
        bikeCategory: "road",
        ridingGoal: "balanced",
        flexibilityScore: 3,
        coreStabilityScore: 3,
      }),
      issues: [],
      requirements: PUBLIC_FIT_REQUIREMENTS.bikeFit,
    });

    const incomplete = derivePublicCalculatorConfidence({
      baseline: createPublicFitBaseline({
        heightCm: 178,
        inseamCm: 84.5,
      }),
      issues: [],
      requirements: PUBLIC_FIT_REQUIREMENTS.bikeFit,
    });

    expect(measured.score).toBeGreaterThan(incomplete.score);
    expect(measured.level).toBe("high");
  });
});

describe("validateFitOutputConsistency", () => {
  it("warns on aggressive drop with low flexibility and core stability", () => {
    const issues = validateFitOutputConsistency({
      ridingGoal: "aero",
      flexibility: 1,
      coreStability: 1,
      barDropMm: 80,
    });

    expect(issues.some((issue) => issue.code === "aggressive_output_with_low_support")).toBe(
      true
    );
  });
});

describe("validateCrankLengthRecommendation", () => {
  it("warns when a city or mtb recommendation gets unusually long", () => {
    const issues = validateCrankLengthRecommendation("mtb", 177.5);

    expect(issues.some((issue) => issue.code === "crank_length_category_warning")).toBe(true);
  });
});

describe("createPublicCalculatorResultEnvelope", () => {
  it("creates a standard result envelope shape with a range", () => {
    const confidence = derivePublicCalculatorConfidence({
      baseline: createPublicFitBaseline({
        inseamCm: 84,
        bikeCategory: "road",
      }),
      requirements: PUBLIC_FIT_REQUIREMENTS.crankLength,
    });

    const envelope = createPublicCalculatorResultEnvelope({
      calculatorKey: "saddle-height",
      recommended: { recommended: 745, unit: "mm" },
      range: createPublicCalculatorRange(742, 748, 745),
      confidence,
      primaryDrivers: ["Inseam and category"],
      secondaryModifiers: ["Riding goal and flexibility"],
      notCovered: ["Cleat stack"],
      nextAction: "Validate on the next ride.",
    });

    expect(envelope.calculatorKey).toBe("saddle-height");
    expect(envelope.range?.center).toBe(745);
    expect(envelope.confidence.level).toBeDefined();
    expect(envelope.primaryDrivers?.[0]).toMatch(/Inseam/);
  });
});
