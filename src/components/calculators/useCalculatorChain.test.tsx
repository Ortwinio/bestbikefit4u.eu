/* @vitest-environment jsdom */
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCalculatorChain } from "./useCalculatorChain";
import type { ChainBinding } from "@/lib/calculators/chain";

type Values = { inseam: number; distance: number };
afterEach(() => { cleanup(); vi.useRealTimers(); });
const binding = (value = 84): ChainBinding<Values> => ({
  field: "inseamCm", source: "profile", value, unit: "cm", kind: "measured", recordedAt: 100,
  read: values => values.inseam, write: (values, next) => ({ ...values, inseam: Number(next) }),
});
function options(value = 84, key = "profile1") {
  return { initialValues: { inseam: value, distance: 100 }, externalKey: key, bindings: [binding(value)],
    applyChanges: vi.fn().mockResolvedValue({ status: "saved" as const }) };
}
describe("explicit calculator chain", () => {
  it("autosaves actual non-measured profile edits as declared, without saving mount defaults", async () => {
    vi.useFakeTimers();
    const initial = { ...options(), autoSaveProfile: true, bindings: [{ ...binding(), kind: "declared" as const }] };
    const { result } = renderHook(() => useCalculatorChain(initial));
    await act(() => vi.advanceTimersByTimeAsync(600));
    expect(initial.applyChanges).not.toHaveBeenCalled();
    act(() => result.current.setValues({ inseam: 86, distance: 140 }));
    act(() => result.current.useForThisCalculation());
    expect(result.current.trial).toBe(false);
    expect(result.current.canAutosave).toBe(true);
    await act(() => vi.advanceTimersByTimeAsync(600));
    expect(initial.applyChanges).toHaveBeenCalledWith([{ field: "inseamCm", source: "profile", value: 86,
      expectedCurrentValue: 84, kind: "declared" }], true);
    expect(result.current.pendingChanges).toEqual([]);
  });
  it("requires explicit action before a declared edit replaces measured profile data", async () => {
    vi.useFakeTimers();
    const initial = { ...options(), autoSaveProfile: true };
    const { result } = renderHook(() => useCalculatorChain(initial));
    act(() => result.current.setValues({ inseam: 86, distance: 120 }));
    await act(() => vi.advanceTimersByTimeAsync(600));
    expect(initial.applyChanges).not.toHaveBeenCalled();
    expect(result.current.canAutosave).toBe(true);
    await act(() => result.current.saveToProfile());
    expect(initial.applyChanges).toHaveBeenCalledOnce();
  });
  it("autosaves a new measurement only after the rider explicitly identifies it as measured", async () => {
    vi.useFakeTimers();
    const initial = { ...options(), autoSaveProfile: true };
    const { result } = renderHook(() => useCalculatorChain(initial));
    act(() => result.current.setValues({ inseam: 86, distance: 100 }));
    act(() => result.current.setChangeKind("inseamCm", "measured"));
    await act(() => vi.advanceTimersByTimeAsync(600));
    expect(initial.applyChanges).toHaveBeenCalledWith([expect.objectContaining({ value: 86, kind: "measured" })], true);
  });
  it("cancels pending automatic writes when the account scope changes", async () => {
    vi.useFakeTimers();
    const initial = { ...options(), scopeKey: "user-one", autoSaveProfile: true,
      bindings: [{ ...binding(), kind: "declared" as const }] };
    const { result, rerender } = renderHook(useCalculatorChain<Values>, { initialProps: initial });
    act(() => result.current.setValues({ inseam: 86, distance: 100 }));
    rerender({ ...initial, externalKey: "user-two", scopeKey: "user-two" });
    await act(() => vi.advanceTimersByTimeAsync(600));
    expect(initial.applyChanges).not.toHaveBeenCalled();
  });
  it("requires profile-save choice after confirming an unchanged placeholder", async () => {
    const initial = options();
    initial.bindings = [{ ...binding(), value: undefined }];
    const { result } = renderHook(() => useCalculatorChain(initial));
    expect(result.current.pendingChanges).toEqual([]);
    act(() => result.current.setValues(initial.initialValues, ["inseamCm"]));
    expect(result.current.pendingChanges).toEqual([{ field: "inseamCm", source: "profile",
      value: 84, expectedCurrentValue: null, kind: "declared" }]);
    expect(result.current.canAutosave).toBe(false);
    expect(initial.applyChanges).not.toHaveBeenCalled();
    await act(() => result.current.saveToProfile());
    expect(initial.applyChanges).toHaveBeenCalledOnce();
    expect(result.current.savedChanges[0].value).toBe(84);
  });
  it("adopts live profile rebases, preserves focus for local edits and ignores preference autosave echoes", () => {
    const initial = options();
    const { result, rerender } = renderHook(useCalculatorChain<Values>, { initialProps: initial });
    const firstKey = result.current.formKey;
    act(() => result.current.setValues({ inseam: 84, distance: 120 }));
    expect(result.current.formKey).toBe(firstKey);
    expect(result.current.pendingChanges).toEqual([]);
    rerender({ ...initial, initialValues: { inseam: 99, distance: 110 } });
    expect(result.current.values).toEqual({ inseam: 84, distance: 120 });
    rerender(options(85, "profile2"));
    expect(result.current.values.inseam).toBe(85);
    expect(result.current.formKey).not.toBe(firstKey);
    expect(initial.applyChanges).not.toHaveBeenCalled();
  });
  it("creates pending differences only on real edits, and trial mode never saves or autosaves", () => {
    const initial = options();
    const { result } = renderHook(() => useCalculatorChain(initial));
    act(() => result.current.setValues({ inseam: 86, distance: 100 }));
    expect(result.current.pendingChanges).toEqual([{ field: "inseamCm", source: "profile", value: 86,
      expectedCurrentValue: 84, kind: "declared" }]);
    expect(result.current.canAutosave).toBe(false);
    expect(result.current.usedInputs[0]).toMatchObject({ value: 86, storedValue: 84, kind: "declared" });
    act(() => result.current.useForThisCalculation());
    expect(result.current.trial).toBe(true);
    expect(result.current.pendingChanges).toEqual([]);
    expect(result.current.canAutosave).toBe(false);
    expect(initial.applyChanges).not.toHaveBeenCalled();
    act(() => result.current.discardChanges());
    expect(result.current.values.inseam).toBe(84);
    expect(result.current.trial).toBe(false);
  });
  it("saves only after explicit choice, carries explicit provenance, and keeps the saved change list", async () => {
    const initial = options();
    const { result } = renderHook(() => useCalculatorChain(initial));
    act(() => result.current.setValues({ inseam: 86, distance: 100 }));
    act(() => result.current.setChangeKind("inseamCm", "measured"));
    await act(() => result.current.saveToProfile());
    expect(initial.applyChanges).toHaveBeenCalledWith([{ field: "inseamCm", source: "profile",
      value: 86, expectedCurrentValue: 84, kind: "measured" }]);
    expect(result.current.status).toBe("saved");
    expect(result.current.savedChanges).toHaveLength(1);
    expect(result.current.pendingChanges).toEqual([]);
  });
  it("preserves a candidate and expected old value across an external conflict", async () => {
    const applyChanges = vi.fn().mockResolvedValue({ status: "conflict", conflicts: [{ field: "inseamCm" }] });
    const initial = { ...options(), applyChanges };
    const { result, rerender } = renderHook(useCalculatorChain<Values>, { initialProps: initial });
    act(() => result.current.setValues({ inseam: 86, distance: 100 }));
    rerender({ ...options(85, "changed-elsewhere"), applyChanges });
    expect(result.current.values.inseam).toBe(86);
    expect(result.current.pendingChanges[0].expectedCurrentValue).toBe(84);
    await act(() => result.current.saveToProfile());
    expect(result.current.status).toBe("conflict");
    expect(result.current.pendingChanges).toHaveLength(1);
    act(() => result.current.discardChanges());
    expect(result.current.values.inseam).toBe(85);
  });
  it("keeps the candidate after failure and does not report a successful profile update", async () => {
    const initial = { ...options(), applyChanges: vi.fn().mockRejectedValue(new Error("unavailable")) };
    const { result } = renderHook(() => useCalculatorChain(initial));
    act(() => result.current.setValues({ inseam: 86, distance: 100 }));
    await act(() => result.current.saveToProfile());
    expect(result.current.status).toBe("error");
    expect(result.current.pendingChanges).toHaveLength(1);
    expect(result.current.savedChanges).toEqual([]);
  });
  it("clears trial overrides on bike switch and can revert a trial back to the live value", () => {
    const initial = { ...options(), scopeKey: "bike-one" };
    const { result, rerender } = renderHook(useCalculatorChain<Values>, { initialProps: initial });
    act(() => result.current.setValues({ inseam: 86, distance: 100 }));
    act(() => result.current.useForThisCalculation());
    act(() => result.current.setValues({ inseam: 84, distance: 100 }));
    expect(result.current.pendingChanges).toEqual([]);
    expect(result.current.trial).toBe(false);
    act(() => result.current.setValues({ inseam: 87, distance: 100 }));
    rerender({ ...options(85, "bike-two-profile"), scopeKey: "bike-two" });
    expect(result.current.pendingChanges).toEqual([]);
    expect(result.current.values.inseam).toBe(85);
  });

  it("ignores a late save result after switching bikes and clears prior scope status", async () => {
    let finish!: (value: { status: "saved" }) => void;
    const applyChanges = vi.fn(() => new Promise<{ status: "saved" }>((resolve) => { finish = resolve; }));
    const initial = { ...options(), scopeKey: "bike-one", applyChanges };
    const { result, rerender } = renderHook(useCalculatorChain<Values>, { initialProps: initial });
    act(() => result.current.setValues({ inseam: 86, distance: 100 }));
    let saving!: Promise<void>;
    act(() => { saving = result.current.saveToProfile(); });
    expect(result.current.status).toBe("saving");
    rerender({ ...options(85, "bike-two-profile"), scopeKey: "bike-two", applyChanges });
    expect(result.current.status).toBe("idle");
    act(() => result.current.setValues({ inseam: 87, distance: 100 }));
    await act(async () => { finish({ status: "saved" }); await saving; });
    expect(result.current.status).toBe("idle");
    expect(result.current.savedChanges).toEqual([]);
    expect(result.current.pendingChanges[0].value).toBe(87);
  });

  it("does not clear a provenance change made while an earlier save was in flight", async () => {
    let finish!: (value: { status: "saved" }) => void;
    const initial = { ...options(), applyChanges: vi.fn(() => new Promise<{ status: "saved" }>((resolve) => {
      finish = resolve;
    })) };
    const { result } = renderHook(() => useCalculatorChain(initial));
    act(() => result.current.setValues({ inseam: 86, distance: 100 }));
    let saving!: Promise<void>;
    act(() => { saving = result.current.saveToProfile(); });
    act(() => result.current.setChangeKind("inseamCm", "measured"));
    await act(async () => { finish({ status: "saved" }); await saving; });
    expect(result.current.pendingChanges[0].kind).toBe("measured");
    expect(result.current.savedChanges[0].kind).toBe("declared");
  });

});
