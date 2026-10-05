// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { readHandoff, writeHandoffEntry } from "@/lib/handoff/store";
import { usePerformanceInputs } from "./usePerformanceInputs";
import { reliabilityPerformance } from "@/i18n/calculators/reliabilityPerformance";

afterEach(() => { cleanup(); sessionStorage.clear(); localStorage.clear(); });

describe("public performance input reuse", () => {
  it("does not persist examples and preserves cross-calculator provenance", () => {
    writeHandoffEntry({ field: "weightKg", value: 82.5, unit: "kg", calculator: "saddle-width", method: "measured", touchedAt: Date.now() });
    const before = readHandoff();
    const { result } = renderHook(() => usePerformanceInputs("power-speed"));
    expect(result.current.number("weightKg")).toBe(82.5);
    expect(result.current.has("weightKg")).toBe(true);
    expect(result.current.has("powerWatts")).toBe(false);
    expect(readHandoff()).toEqual(before);
    act(() => result.current.change("powerWatts", 240));
    expect(readHandoff().entries.find((entry) => entry.field === "weightKg")).toEqual(before.entries[0]);
    expect(readHandoff().entries.find((entry) => entry.field === "powerWatts")?.value).toBe(240);
  });

  it("rejects out-of-range prefill instead of calculating with corrupted data", () => {
    writeHandoffEntry({ field: "weightKg", value: -1, unit: "kg", calculator: "power-speed", method: "declared", touchedAt: Date.now() });
    writeHandoffEntry({ field: "ftpMethod", value: "unsupported", unit: "none", calculator: "ftp-wkg", method: "declared", touchedAt: Date.now() });
    const { result } = renderHook(() => usePerformanceInputs("climb-planner"));
    expect(result.current.has("weightKg")).toBe(false);
    expect(result.current.number("weightKg")).toBe(75);
    expect(result.current.choice("ftpMethod", "twentyMinute")).toBe("twentyMinute");
  });

  it("keeps protocol power separate from known FTP", () => {
    const { result } = renderHook(() => usePerformanceInputs("ftp-wkg"));
    act(() => result.current.change("rampWatts", 380));
    expect(readHandoff().entries).toEqual([expect.objectContaining({ field: "rampWatts", value: 380, method: "declared" })]);
    expect(result.current.has("ftpWatts")).toBe(false);
  });

  it("rejects fractional gear teeth before passing prefill to the cadence model", () => {
    writeHandoffEntry({ field: "innerChainringTeeth", value: 34.5, unit: "teeth", calculator: "gearing", method: "bike", touchedAt: Date.now() });
    writeHandoffEntry({ field: "cassetteLargestCogTeeth", value: 32.5, unit: "teeth", calculator: "gearing", method: "bike", touchedAt: Date.now() });
    const { result } = renderHook(() => usePerformanceInputs("gearing"));
    expect(result.current.has("innerChainringTeeth")).toBe(false);
    expect(result.current.has("cassetteLargestCogTeeth")).toBe(false);
    expect(result.current.number("innerChainringTeeth")).toBe(34);
    expect(result.current.number("cassetteLargestCogTeeth")).toBe(32);
  });

  it("retains matching NL/EN copy keys", () => {
    function keys(value: object, prefix = ""): string[] {
      return Object.entries(value).flatMap(([key, child]) => typeof child === "object"
        ? keys(child, `${prefix}${key}.`) : `${prefix}${key}`);
    }
    expect(keys(reliabilityPerformance.nl)).toEqual(keys(reliabilityPerformance.en));
  });
});
