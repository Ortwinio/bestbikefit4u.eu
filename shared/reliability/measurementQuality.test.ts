import { describe, expect, it } from "vitest";
import { getInseamObservationQuality } from "./measurementQuality";
import { checkInseamPlausibility } from "./saddleHeight";
import { validatePublicFitBaseline } from "../../src/lib/publicCalculatorLogic";
import { profileMeasurementWarning } from "../../src/i18n/account/profileAutosave";
import { validateInputs } from "../../convex/lib/fitAlgorithm/validation";
import type { FitInputs } from "../../convex/lib/fitAlgorithm/types";

const engineInput = (inseamCm: number): FitInputs => ({ heightMm: 1900, inseamMm: inseamCm * 10,
  flexibilityScore: 5, coreScore: 5, category: "road", ambition: "balanced" } as FitInputs);

describe("shared plausibility adapters", () => {
  it.each([89, 96, 75, 54, 106, 190])("agrees across public, profile and engine for %s cm", inseamCm => {
    const shared = checkInseamPlausibility(190, inseamCm);
    const publicIssues = validatePublicFitBaseline({ heightCm: 190, inseamCm, inseamSource: "measured" });
    const engine = validateInputs(engineInput(inseamCm));
    expect(publicIssues.some(issue => issue.severity === "error")).toBe(shared.status === "error");
    expect(engine.isValid).toBe(shared.status !== "error");
    expect(profileMeasurementWarning("nl", "inseam", 190, inseamCm) === null).toBe(shared.status === "ok");
    if (shared.status === "check" || shared.status === "large") {
      expect(publicIssues.some(issue => issue.severity === "warning")).toBe(true);
      expect(engine.warnings.some(issue => issue.type === "measurement_warning")).toBe(true);
    }
  });
  it("clears a confirmed check but never a large warning", () => {
    expect(getInseamObservationQuality({ heightCm: 190, inseamCm: 96 }).unresolvedWarning).toBe(true);
    expect(getInseamObservationQuality({ heightCm: 190, inseamCm: 96, confirmed: true }).unresolvedWarning).toBe(false);
    expect(getInseamObservationQuality({ heightCm: 190, inseamCm: 75, confirmed: true }).unresolvedWarning).toBe(true);
  });
  it("keeps inconsistent repeats broad and limits precision to three measurements", () => {
    expect(getInseamObservationQuality({ inseamCm: 89, repeatCount: 4, withinTolerance: false }))
      .toMatchObject({ repeatCount: 3, withinTolerance: false });
    expect(getInseamObservationQuality({ inseamCm: 89, repeatCount: 1, withinTolerance: true }))
      .toMatchObject({ repeatCount: 1, withinTolerance: false });
  });
  it.each([NaN, Infinity, 54.9, 105.1])("rejects invalid saved value %s without height", inseamCm => {
    expect(() => getInseamObservationQuality({ inseamCm })).toThrow(RangeError);
  });
  it("keeps the unrelated weight warning unchanged and localizes inseam warnings", () => {
    expect(profileMeasurementWarning("nl", "weight", 190, 80)).toBeNull();
    expect(profileMeasurementWarning("nl", "inseam", 190, 75)).toContain("Meet opnieuw");
    expect(profileMeasurementWarning("en", "inseam", 190, 75)).toContain("Measure again");
  });
});
