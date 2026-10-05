import { describe, expect, it } from "vitest";
import { performanceDefaults } from "@/lib/calculators/accountState";
import { changedAccountSharedInputs, prefillAccountSharedInputs } from "./accountSharedInputs";

describe("account shared inputs", () => {
  it("isolates scenarios by calculator and prefers newer saved account state", () => {
    const input = { field: "powerWatts" as const, value: 275, unit: "W" as const,
      calculator: "power-speed" as const, method: "declared" as const, touchedAt: 2000 };
    expect(prefillAccountSharedInputs("power-speed", performanceDefaults, [input], 1000).values.values.power).toBe(275);
    expect(prefillAccountSharedInputs("power-speed", performanceDefaults, [input], 3000).used).toEqual([]);
    expect(prefillAccountSharedInputs("climb-planner", performanceDefaults, [input]).used).toEqual([]);
  });
  it("converts duration minutes to form hours and back only on edits", () => {
    const current = prefillAccountSharedInputs("fuel-hydration", performanceDefaults, [{
      field: "durationMinutes", value: 180, unit: "min", calculator: "fuel-hydration",
      method: "declared", touchedAt: 1000,
    }]);
    expect(current.values.values.duration).toBe(3);
    expect(changedAccountSharedInputs("fuel-hydration", current.values, current.values)).toEqual([]);
    expect(changedAccountSharedInputs("fuel-hydration", current.values,
      { ...current.values, values: { ...current.values.values, duration: 4 } }))
      .toEqual([expect.objectContaining({ field: "durationMinutes", value: 240, unit: "min" })]);
  });
  it("preserves selected bike and FTP protocol semantics", () => {
    const values = { ...performanceDefaults, method: "ramp" as const,
      values: { ...performanceDefaults.values, bikeMass: 11 } };
    const result = prefillAccountSharedInputs("ftp-wkg", values, [
      { field: "bikeWeightKg", value: 7, unit: "kg", calculator: "power-speed", method: "bike", touchedAt: 1000 },
      { field: "ftpMethod", value: "known", unit: "none", calculator: "ftp-wkg", method: "declared", touchedAt: 1000 },
    ]);
    expect(result.values.values.bikeMass).toBe(11);
    expect(result.values.method).toBe("ramp");
    expect(result.used).toEqual([]);
  });
  it("does not clamp out-of-range shared observations into plausible data", () => {
    const result = prefillAccountSharedInputs("power-speed", performanceDefaults, [{
      field: "powerWatts", value: 900, unit: "W", calculator: "climb-planner", method: "measured", touchedAt: 1000,
    }]);
    expect(result.values.values.power).toBe(performanceDefaults.values.power);
    expect(result.used).toEqual([]);
  });
});
