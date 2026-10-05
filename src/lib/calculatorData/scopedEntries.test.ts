import { describe, expect, it } from "vitest";
import type { HandoffEntry } from "@/lib/handoff/store";
import { mergeProfileCalculatorEntries } from "./scopedEntries";

const measured: HandoffEntry = {
  field: "heightCm", value: 180, unit: "cm", calculator: "frame-size", method: "measured", touchedAt: 100,
};
describe("authenticated scoped calculator inputs", () => {
  it("shares rider fields across calculators without degrading measured evidence", () => {
    expect(mergeProfileCalculatorEntries([measured], [{ ...measured, calculator: "bike-fit",
      value: 175, method: "declared", touchedAt: 200 }])).toEqual([measured]);
  });
  it("keeps distinct last-used scenarios even when the field names match", () => {
    const speed: HandoffEntry = { ...measured, field: "powerWatts", value: 250, unit: "W", calculator: "power-speed" };
    const climb: HandoffEntry = { ...speed, calculator: "climb-planner", value: 300, touchedAt: 200 };
    expect(mergeProfileCalculatorEntries([speed], [climb])).toEqual([speed, climb]);
  });
  it("uses the last scenario edit rather than treating a power target as a body measurement", () => {
    const scenario: HandoffEntry = { ...measured, field: "powerWatts", value: 250, unit: "W", calculator: "power-speed" };
    const newer: HandoffEntry = { ...scenario, value: 300, method: "declared", touchedAt: 200 };
    expect(mergeProfileCalculatorEntries([scenario], [newer])).toEqual([newer]);
  });
});
