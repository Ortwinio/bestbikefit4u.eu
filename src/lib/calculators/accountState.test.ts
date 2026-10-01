import { describe, expect, it } from "vitest";
import { calculatorDefaults, resolveCalculatorValues, validCalculatorState } from "./accountState";
import { isProtectedAppPath } from "@/i18n/navigation";

const profile = { heightCm: 178, inseamCm: 83, flexibilityScore: "good", coreStabilityScore: 4 };
describe("account calculator precedence", () => {
  it.each(["saddle-height", "frame-size", "crank-length"] as const)(
    "restores %s before profile and defaults", (tool) => {
    const saved = { ...calculatorDefaults[tool], inseamCm: 89 };
    expect(resolveCalculatorValues(tool, saved, profile)).toEqual({ values: saved, fromProfile: false });
    expect(resolveCalculatorValues(tool, null, profile).values.inseamCm).toBe(83);
    expect(resolveCalculatorValues(tool, null, null).values.inseamCm).toBe(84);
    expect(resolveCalculatorValues(tool, null, { inseamCm: 500 }).fromProfile).toBe(false);
    expect(isProtectedAppPath(`/nl/tools/${tool}`)).toBe(true);
  });
  it("maps assessed profile values and keeps untouched defaults as examples", () => {
    const saddle = resolveCalculatorValues("saddle-height", null, profile);
    expect(saddle.values).toMatchObject({ source: "measured", flexibility: 4, core: 4 });
    expect(resolveCalculatorValues("frame-size", null, profile).values).toMatchObject({
      heightCm: 178, heightConfirmed: true, inseamConfirmed: true,
    });
    expect(resolveCalculatorValues("crank-length", null, null).values.confirmed).toBe(false);
  });
  it("rejects out-of-range and non-finite data", () => {
    expect(validCalculatorState({ calculator: "frame-size", values: {
      ...calculatorDefaults["frame-size"], heightCm: 250,
    } })).toBe(false);
    expect(validCalculatorState({ calculator: "saddle-height", values: {
      ...calculatorDefaults["saddle-height"], core: 2.5,
    } })).toBe(false);
    expect(validCalculatorState({ calculator: "crank-length", values: {
      ...calculatorDefaults["crank-length"], inseamCm: NaN,
    } })).toBe(false);
  });
});
