import { describe, expect, it } from "vitest";
import { calculatorDefaults, resolveCalculatorValues, validCalculatorState } from "./accountState";
import { TOOL_RANGES } from "@/lib/public-calculators/performance";
const tools = ["power-speed", "climb-planner", "ftp-wkg", "fuel-hydration"] as const;
const profile = { weightKg: 68, ftpWatts: 245, sex: "female" };
describe("performance account values", () => {
  it.each(tools)(
    "restores %s before profile and defaults without inferring comparison table",
    (calculator) => {
      const defaults = calculatorDefaults[calculator];
      const saved = {
        ...defaults,
        values: { ...defaults.values, riderMass: 91, ftp: 310 },
        comparison: "men" as const,
      };
      expect(resolveCalculatorValues(calculator, saved, profile)).toEqual({
        values: saved,
        fromProfile: false,
      });
      const prefilled = resolveCalculatorValues(calculator, null, profile);
      expect(prefilled.values.comparison).toBe("both");
      expect(prefilled.values.values.riderMass).toBe(calculator === "fuel-hydration" ? 75 : 68);
      expect(prefilled.values.values.ftp).toBe(calculator === "fuel-hydration" ? 200 : 245);
      expect(prefilled.fromProfile).toBe(calculator !== "fuel-hydration");
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
