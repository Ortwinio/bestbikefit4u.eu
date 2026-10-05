/* @vitest-environment jsdom */
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { CalculatorDataContext, type CalculatorDataContextValue } from "@/lib/calculatorData/context";
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
afterEach(async () => {
  cleanup();
  await Promise.resolve();
  fixture.profile = { inseamCm: 83, heightCm: 178 };
  vi.clearAllMocks();
});
describe("live account calculator state", () => {
  it("does not leak scenarios between calculators and shares only actual edits in their own scope", () => {
    const shared: CalculatorDataContextValue = { source: "profile", identity: "rider", ready: true,
      entries: [{ field: "powerWatts", value: 275, unit: "W", calculator: "climb-planner",
        method: "declared", touchedAt: 1000 }], save: vi.fn(), remove: vi.fn() };
    const wrapper = ({ children }: { children: ReactNode }) =>
      <CalculatorDataContext.Provider value={shared}>{children}</CalculatorDataContext.Provider>;
    const { result, rerender } = renderHook(() => useCalculatorAccountState("power-speed"), { wrapper });
    expect(result.current.values.values.power).not.toBe(275);
    expect(result.current.fromProfile).toBe(false);
    expect(shared.save).not.toHaveBeenCalled();
    expect(fixture.save).not.toHaveBeenCalled();
    shared.entries = [{ ...shared.entries[0], value: 280, touchedAt: 2000 }];
    rerender();
    expect(result.current.values.values.power).not.toBe(280);
    act(() => result.current.setValues({ ...result.current.values,
      values: { ...result.current.values.values, power: 290 } }));
    expect(shared.save).toHaveBeenCalledWith(expect.objectContaining({ calculator: "power-speed", field: "powerWatts", value: 290 }));
  });
  it("prefills the same calculator without rebasing later scenario echoes while editing", () => {
    const shared: CalculatorDataContextValue = { source: "profile", identity: "rider", ready: true,
      entries: [{ field: "powerWatts", value: 275, unit: "W", calculator: "power-speed",
        method: "declared", touchedAt: 1000 }], save: vi.fn(), remove: vi.fn() };
    const wrapper = ({ children }: { children: ReactNode }) =>
      <CalculatorDataContext.Provider value={shared}>{children}</CalculatorDataContext.Provider>;
    const { result, rerender } = renderHook(() => useCalculatorAccountState("power-speed"), { wrapper });
    expect(result.current.values.values.power).toBe(275);
    expect(shared.save).not.toHaveBeenCalled();
    act(() => result.current.setValues({ ...result.current.values,
      values: { ...result.current.values.values, power: 290 } }));
    shared.entries = [{ ...shared.entries[0], value: 280, touchedAt: 2000 }];
    rerender();
    expect(result.current.values.values.power).toBe(290);
  });
  it("does not offer a calculation-only exemption for signed-in body edits", () => {
    const shared: CalculatorDataContextValue = { source: "profile", identity: "rider", ready: true,
      entries: [], save: vi.fn(), remove: vi.fn() };
    const wrapper = ({ children }: { children: ReactNode }) =>
      <CalculatorDataContext.Provider value={shared}>{children}</CalculatorDataContext.Provider>;
    const { result } = renderHook(() => useCalculatorAccountState("frame-size"), { wrapper });
    act(() => result.current.setValues({ ...result.current.values, inseamCm: 86 }));
    act(() => result.current.chain.useForThisCalculation());
    expect(result.current.chain.trial).toBe(false);
    expect(result.current.chain.pendingChanges).toHaveLength(1);
    expect(shared.save).not.toHaveBeenCalled();
    expect(fixture.apply).not.toHaveBeenCalled();
  });
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
  it("persists last-used calculator values independently of profile changes", async () => {
    const { result } = renderHook(() => useCalculatorAccountState("frame-size"));
    const key = result.current.formKey;
    act(() => result.current.setValues({ ...result.current.values, inseamCm: 86 }));
    expect(result.current.formKey).toBe(key);
    expect(result.current.chain.canAutosave).toBe(true);
    await act(() => result.current.autosave.flush());
    expect(fixture.save).toHaveBeenCalled();
    await act(() => result.current.chain.saveToProfile());
    expect(fixture.apply).toHaveBeenCalledWith({ calculator: "frame-size", bikeId: undefined,
      changes: [{ field: "inseamCm", source: "profile", value: 86, expectedCurrentValue: 83, kind: "declared" }],
    });
  });
});
