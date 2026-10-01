import { describe, expect, it } from "vitest";
import { calculatorDefaults, resolveCalculatorValues, validCalculatorState } from "./accountState";

describe("bike-fit account precedence", () => {
  const profile = { heightCm: 178, inseamCm: 83, flexibilityScore: "good", coreStabilityScore: 4,
    positionPriority: "comfort" };
  it("uses saved edits before profile measurements and defaults", () => {
    const saved = { ...calculatorDefaults["bike-fit"], heightCm: 186, inseamCm: 88, source: "measured" as const };
    expect(resolveCalculatorValues("bike-fit", saved, profile)).toEqual({ values: saved, fromProfile: false });
    expect(resolveCalculatorValues("bike-fit", null, profile)).toEqual({
      values: { heightCm: 178, inseamCm: 83, source: "estimated", flexibility: 4,
        core: 4, category: "road", ambition: "comfort" }, fromProfile: true,
    });
    expect(resolveCalculatorValues("bike-fit", null, null)).toEqual({
      values: calculatorDefaults["bike-fit"], fromProfile: false,
    });
  });
  it("does not assert measured provenance or silently confirm invalid/missing measurements", () => {
    expect(resolveCalculatorValues("bike-fit", null, profile).values.source).toBe("estimated");
    expect(resolveCalculatorValues("bike-fit", null, { heightCm: 900, inseamCm: 900 }).values)
      .toEqual(calculatorDefaults["bike-fit"]);
    expect(resolveCalculatorValues("bike-fit", null, { heightCm: 178 }).values.source).toBe("missing");
    expect(resolveCalculatorValues("bike-fit", null, { inseamCm: 83 }).values.source).toBe("missing");
  });
  it.each([{ heightCm: 900 }, { inseamCm: NaN }, { flexibility: 2.5 }, { core: 6 }])(
    "rejects invalid saved input %o", (patch) => {
      expect(validCalculatorState({ calculator: "bike-fit", values: { ...calculatorDefaults["bike-fit"], ...patch } }))
        .toBe(false);
    },
  );
});
