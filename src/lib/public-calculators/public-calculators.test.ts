import { describe, expect, it } from "vitest";
import {
  createPublicCalculatorRange,
  createPublicCalculatorResultEnvelope,
  createPublicFitBaseline,
  derivePublicCalculatorConfidence,
  getLocalizedPublicCalculatorPath,
  getPublicCalculatorRouteEntry,
  PUBLIC_FIT_REQUIREMENTS,
  validatePublicFitBaseline,
} from "./index";

describe("public calculator barrel exports", () => {
  it("exports the shared baseline and validation contract", () => {
    const baseline = createPublicFitBaseline({
      heightCm: 178,
      inseamCm: 84.6,
      bikeCategory: "road",
      ridingGoal: "balanced",
      flexibilityScore: 3.4,
      coreStabilityScore: 4.2,
    });

    expect(baseline.category).toBe("road");
    expect(baseline.flexibility).toBe(3);
    expect(baseline.coreStability).toBe(4);
    expect(baseline.inseamSource).toBe("measured");
    expect(
      validatePublicFitBaseline(baseline, PUBLIC_FIT_REQUIREMENTS.bikeFit)
    ).toEqual([]);
  });

  it("exports the confidence and result-envelope contract", () => {
    const confidence = derivePublicCalculatorConfidence({
      baseline: createPublicFitBaseline({
        inseamCm: 84,
        bikeCategory: "road",
      }),
      requirements: PUBLIC_FIT_REQUIREMENTS.crankLength,
    });

    const result = createPublicCalculatorResultEnvelope({
      calculatorKey: "saddle-height",
      recommended: { value: 745, unit: "mm", label: "Recommended start" },
      range: createPublicCalculatorRange(742, 748, 745),
      confidence,
      primaryDrivers: ["Inseam"],
      secondaryModifiers: ["Riding goal"],
      notCovered: ["Cleat stack"],
      nextAction: "Validate on the next ride.",
    });

    expect(result.calculatorKey).toBe("saddle-height");
    expect(result.range?.center).toBe(745);
    expect(result.primaryDrivers).toContain("Inseam");
    expect(result.nextAction).toBe("Validate on the next ride.");
  });
});

describe("public calculator routes", () => {
  it("registers tire-pressure public routes and dashboard legacy alias", () => {
    const entry = getPublicCalculatorRouteEntry("tire-pressure");

    expect(entry.canonicalPath).toBe("/tire-pressure-calculator");
    expect(entry.localizedPaths.en).toBe("/tire-pressure-calculator");
    expect(entry.localizedPaths.nl).toBe("/bandenspanning-calculator");
    expect(entry.legacyAliases).toContain("/pressure-calculator");
    expect(entry.legacyAliases).toContain("/bandenspanning-calculator");
    expect(getLocalizedPublicCalculatorPath("tire-pressure", "en")).toBe(
      "/tire-pressure-calculator"
    );
  });
});
