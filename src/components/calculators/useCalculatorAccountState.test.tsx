/* @vitest-environment jsdom */
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import { calculatorDefaults } from "@/lib/calculators/accountState";
import { useCalculatorAccountState } from "./useCalculatorAccountState";
const fixture = vi.hoisted(() => ({
  profile: { inseamCm: 83, heightCm: 178 }, save: vi.fn(),
  apply: vi.fn().mockResolvedValue({ status: "saved", fields: ["inseamCm"] }),
}));
vi.mock("@/i18n/useDashboardMessages", () => ({ useDashboardMessages: () => ({ locale: "en" }) }));
vi.mock("convex/react", () => ({
  useQuery: (ref: Parameters<typeof getFunctionName>[0]) => {
    const name = getFunctionName(ref);
    if (name === "calculatorChain/queries:getContext") return {
      profile: fixture.profile, bikes: [], observations: [], bikeObservations: [], recentCalculators: [],
    };
    if (name === "calculatorStates/queries:get") return {
      state: { calculator: "frame-size", values: { ...calculatorDefaults["frame-size"], inseamCm: 90 } },
    };
    throw new Error(name);
  },
  useMutation: (ref: Parameters<typeof getFunctionName>[0]) =>
    getFunctionName(ref) === "calculatorChain/mutations:applyChanges" ? fixture.apply : fixture.save,
}));
afterEach(() => { cleanup(); fixture.profile = { inseamCm: 83, heightCm: 178 }; vi.clearAllMocks(); });
describe("live account calculator state", () => {
  it("overrides old calculator measurements with live profile inputs and rebases external changes", () => {
    const { result, rerender } = renderHook(() => useCalculatorAccountState("frame-size"));
    expect(result.current.values.inseamCm).toBe(83);
    const formKey = result.current.formKey;
    fixture.profile = { inseamCm: 85, heightCm: 178 };
    rerender();
    expect(result.current.values.inseamCm).toBe(85);
    expect(result.current.formKey).not.toBe(formKey);
    expect(fixture.apply).not.toHaveBeenCalled();
    expect(fixture.save).not.toHaveBeenCalled();
  });
  it("does not autosave a profile difference until the rider makes an explicit choice", async () => {
    const { result } = renderHook(() => useCalculatorAccountState("frame-size"));
    const key = result.current.formKey;
    act(() => result.current.setValues({ ...result.current.values, inseamCm: 86 }));
    expect(result.current.formKey).toBe(key);
    expect(result.current.chain.canAutosave).toBe(false);
    await act(() => result.current.autosave.flush());
    expect(fixture.save).not.toHaveBeenCalled();
    await act(() => result.current.chain.saveToProfile());
    expect(fixture.apply).toHaveBeenCalledWith({ calculator: "frame-size", bikeId: undefined,
      changes: [{ field: "inseamCm", source: "profile", value: 86, expectedCurrentValue: 83, kind: "declared" }],
    });
  });
});
