import { describe, expect, it } from "vitest";
import { calculatorDefaults, resolveCalculatorValues, validCalculatorState } from "./accountState";
import { TOOL_RANGES } from "@/lib/public-calculators/performance";
const tools = ["power-speed", "climb-planner", "ftp-wkg", "fuel-hydration"] as const;
const profile = { weightKg: 68, ftpWatts: 245, sex: "female" };
describe("performance account values", () => {
  it.each(tools)(
    "uses live profile for %s and retains only saved preferences",
    (calculator) => {
      const defaults = calculatorDefaults[calculator];
      const saved = {
        ...defaults,
        values: { ...defaults.values, riderMass: 91, ftp: 310 },
        comparison: "men" as const,
      };
      expect(resolveCalculatorValues(calculator, saved, profile)).toEqual({
        values: { ...saved, values: { ...saved.values, riderMass: 68, ftp: 245 } },
        fromProfile: true,
      });
      const prefilled = resolveCalculatorValues(calculator, null, profile);
      expect(prefilled.values.comparison).toBe("both");
      expect(prefilled.values.values.riderMass).toBe(68);
      expect(prefilled.values.values.ftp).toBe(245);
      expect(prefilled.fromProfile).toBe(true);
      expect(resolveCalculatorValues(calculator, null, null).values).toEqual(defaults);
      expect(resolveCalculatorValues(calculator, null, { weightKg: 500, ftpWatts: NaN }).fromProfile).toBe(
        false,
      );
      expect(profile).toEqual({ weightKg: 68, ftpWatts: 245, sex: "female" });
    },
  );
  it.each(tools)("enforces all real engine domains for %s", (calculator) => {
    const values = calculatorDefaults[calculator];
    expect(validCalculatorState({ calculator, values })).toBe(true);
    for (const [key, range] of Object.entries(TOOL_RANGES)) {
      for (const invalid of [range.min - 1, range.max + 1, Infinity, NaN]) {
        expect(
          validCalculatorState({
            calculator,
            values: { ...values, values: { ...values.values, [key]: invalid } },
          }),
        ).toBe(false);
      }
    }
  });
});
