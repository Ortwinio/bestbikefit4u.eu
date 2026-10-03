import { describe, expect, it } from "vitest";
import { isStale } from "./staleness";
import type { InputDependency, InputProvenance } from "./types";

const dependency: InputDependency = { field: "weightKg", value: 70, observationId: "observation1" };
const snapshot = (dependencies = [dependency]): InputProvenance => ({ version: 1, capturedAt: 1, dependencies });
describe("advice staleness", () => {
  it("does not call legacy outcomes fresh", () => expect(isStale(undefined, []).status).toBe("unknown"));
  it("accepts explicitly independent calculations", () => expect(isStale(snapshot([]), []).status).toBe("current"));
  it("compares only consumed fields", () => expect(isStale(snapshot(), [dependency,
    { field: "heightCm", value: 190 }]).stale).toBe(false));
  it.each([
    [[], "missing_input"],
    [[{ ...dependency, value: 71 }], "value_changed"],
    [[{ ...dependency, observationId: "observation2" }], "observation_changed"],
    [[{ field: "weightKg", value: 70 }], "observation_changed"],
  ])("detects changes %j", (current, reason) => {
    expect(isStale(snapshot(), current as InputDependency[]).reasons[0].reason).toBe(reason);
  });
  it("never matches rider and bike scope or different bikes", () => {
    expect(isStale(snapshot([{ ...dependency, bikeId: "bike1" }]), [dependency,
      { ...dependency, bikeId: "bike2" }]).reasons[0].reason).toBe("missing_input");
  });
  it("compares array contents and ordering instead of reference", () => {
    const original = snapshot([{ field: "gearing.chainrings", bikeId: "bike1", value: [50, 34] }]);
    expect(isStale(original, [{ ...original.dependencies[0], value: [50, 34] }]).stale).toBe(false);
    expect(isStale(original, [{ ...original.dependencies[0], value: [34, 50] }]).stale).toBe(true);
  });
  it("keeps tire and wheel record identities separate", () => {
    const used: InputDependency = { field: "widthFrontMm", value: 28, bikeId: "bike", record: { table: "tireSetups", id: "tire1" } };
    expect(isStale(snapshot([used]), [{ ...used, record: { table: "tireSetups", id: "tire2" } }]).stale).toBe(true);
    expect(isStale(snapshot([used]), [{ ...used, record: { table: "wheelsets", id: "tire1" } }]).stale).toBe(true);
    expect(isStale(snapshot([used]), [used, { ...used, value: 40, record: { table: "tireSetups", id: "tire2" } }]).stale).toBe(false);
  });
  it("does not coerce types, null or zero", () => {
    expect(isStale(snapshot([{ field: "offset", value: 0 }]), [{ field: "offset", value: null }]).stale).toBe(true);
    expect(isStale(snapshot([{ field: "offset", value: 0 }]), [{ field: "offset", value: "0" }]).stale).toBe(true);
  });
});
