// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { ToastProvider } from "@/components/ui";
import { calculateBasicPressure } from "@/lib/pressure-engine";
import en from "@/i18n/messages/en";
import nl from "@/i18n/messages/nl";
import type { PressureCalculatorValues } from "@/components/features/pressure/PressureCalculatorForm";
import { PressureDashboardClient } from "./PressureDashboardClient";
import PressureError from "./error";
import { calculatorChainMessages } from "@/i18n/account/calculatorChain";

const state = vi.hoisted(() => ({
  loading: false, locale: "en" as "en" | "nl", userId: "user-1", weightKg: 75, stale: false,
  bikes: [] as Array<Record<string, unknown>>,
  latest: [] as Array<{ bikeId: string; latestCalculation: Record<string, unknown> }>,
  noBike: null as Record<string, unknown> | null,
  tires: null as Record<string, unknown> | null,
  mutate: vi.fn(), notes: vi.fn(), apply: vi.fn(),
}));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale: state.locale, messages: getDashboardMessages(state.locale) }),
}));
vi.mock("convex/react", () => ({
  useQuery: (query: Parameters<typeof getFunctionName>[0], args: unknown) => {
    if (args === "skip") return undefined;
    if (state.loading) return undefined;
    const name = getFunctionName(query);
    if (name.includes("getCurrentUser")) return { _id: state.userId };
    if (name === "bikes/queries:listByUser") return state.bikes;
    if (name === "bikes/queries:getDetail") return { activeTireSetup: state.tires };
    if (name.includes("getLatestByBikeForUser")) return state.latest;
    if (name.includes("getLatestWithoutBikeForUser")) return state.noBike;
    if (name.includes("isBikePressureStale")) return { isStale: state.stale };
    if (name === "calculatorChain/queries:getContext") return { profile: { weightKg: state.weightKg },
      bikes: state.bikes, activeTireSetup: state.tires, observations: [], bikeObservations: [], advice: [] };
    throw new Error(`Unexpected query: ${name}`);
  },
  useMutation: (mutation: Parameters<typeof getFunctionName>[0]) =>
    getFunctionName(mutation).includes("calculatorChain") ? state.apply
      : getFunctionName(mutation).includes("upsertBasic") ? state.mutate : state.notes,
}));

const basic: PressureCalculatorValues = {
  discipline: "road", bodyWeightKg: 75, widthFrontMm: 28, widthRearMm: 28,
  tubeType: "tubeless", surface: "average_asphalt",
};
function calculation(inputSnapshot: PressureCalculatorValues) {
  const result = calculateBasicPressure(inputSnapshot);
  return { _id: "calc-1", inputSnapshot, createdAt: 1,
    recommendedFrontBar: result.frontBar, recommendedRearBar: result.rearBar,
    recommendedFrontPsi: result.frontPsi, recommendedRearPsi: result.rearPsi, warnings: result.warnings };
}
beforeEach(() => {
  Object.assign(state, { loading: false, locale: "en", userId: "user-1", weightKg: 75, stale: false,
    bikes: [], latest: [], noBike: null, tires: null });
  state.notes.mockReset().mockResolvedValue(undefined);
  state.apply.mockReset().mockResolvedValue({ status: "saved", fields: ["weightKg"] });
  state.mutate.mockReset().mockImplementation(async ({ bikeId, expectedUserId, inputSnapshot }) => {
    if (expectedUserId !== state.userId) throw new Error("Account changed");
    const saved = calculation(inputSnapshot);
    if (bikeId) state.latest = [
      ...state.latest.filter((entry) => entry.bikeId !== bikeId), { bikeId, latestCalculation: saved },
    ];
    else state.noBike = saved;
    return "calc-1";
  });
});
afterEach(cleanup);
function mount(initialBikeId?: string) {
  const view = render(<ToastProvider><PressureDashboardClient initialBikeId={initialBikeId} /></ToastProvider>);
  openInputs();
  return view;
}
function openInputs() {
  const details = document.querySelector("details");
  if (details && !details.open) fireEvent.click(screen.getByText(calculatorChainMessages[state.locale].edit));
}
function weightSlider() {
  return screen.getByRole("slider", { name: (state.locale === "nl" ? nl : en).pressure.form.bodyWeightLabel });
}
function incrementWeight() {
  fireEvent.keyDown(weightSlider(), { key: "ArrowRight" });
  fireEvent.keyUp(weightSlider(), { key: "ArrowRight" });
}

describe("account pressure rider-profile chain", () => {
  it("waits for context then allows calculation without a bike", () => {
    state.loading = true; const view = mount();
    expect(screen.getByRole("region", { name: "Loading your bikes" }).getAttribute("aria-busy")).toBe("true");
    state.loading = false; view.rerender(<ToastProvider><PressureDashboardClient /></ToastProvider>); openInputs();
    expect(weightSlider().getAttribute("aria-valuenow")).toBe("75");
    expect(screen.getByRole("link", { name: "Add a bike" }).getAttribute("href")).toBe("/en/bikes/new");
    expect(state.mutate).not.toHaveBeenCalled(); expect(state.apply).not.toHaveBeenCalled();
  });
  it("uses current rider and active tire setup instead of history and retains saved-card notes", async () => {
    state.bikes = [{ _id: "bike-1", name: "Road", discipline: "road", bikeType: "road" }];
    state.weightKg = 91;
    state.tires = { _id: "tires-1", widthFrontMm: 42, widthRearMm: 45, tubeType: "inner_tube" };
    state.latest = [{ bikeId: "bike-1", latestCalculation: { ...calculation({ ...basic, bodyWeightKg: 82 }), userNotes: "Old note" } }];
    mount("bike-1");
    expect(weightSlider().getAttribute("aria-valuenow")).toBe("91");
    expect(screen.getByRole("slider", { name: en.pressure.form.widthFrontLabel }).getAttribute("aria-valuenow")).toBe("42");
    const labels = getDashboardMessages("en").pressure.overview.userNotes;
    fireEvent.click(screen.getByRole("button", { name: labels.editButton }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "New note" } });
    fireEvent.click(screen.getByRole("button", { name: labels.saveButton }));
    await waitFor(() => expect(state.notes).toHaveBeenCalledWith({ calculationId: "calc-1", userNotes: "New note" }));
    expect(state.apply).not.toHaveBeenCalled();
  });
  it.each(["nl", "en"] as const)("asks before changing shared profile weight in %s", async (locale) => {
    state.locale = locale; mount(); incrementWeight();
    expect(state.mutate).not.toHaveBeenCalled(); expect(state.apply).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: calculatorChainMessages[locale].save }));
    await waitFor(() => expect(state.apply).toHaveBeenCalledWith(expect.objectContaining({ calculator: "tire-pressure",
      bikeId: undefined, changes: [expect.objectContaining({ field: "weightKg", value: 76, expectedCurrentValue: 75 })],
    })));
  });
  it("automatically stores declared profile edits without a calculation-only option", async () => {
    mount(); incrementWeight();
    expect(screen.queryByRole("button", { name: calculatorChainMessages.en.trial })).toBeNull();
    await waitFor(() => expect(state.apply).toHaveBeenCalledWith(expect.objectContaining({
      changes: [expect.objectContaining({ field: "weightKg", value: 76, kind: "declared" })],
    })));
  });
  it("submits changed width to the selected bike active tire setup after an explicit choice", async () => {
    state.bikes = [{ _id: "bike-1", name: "Road", bikeType: "road" }];
    state.tires = { _id: "tires-1", widthFrontMm: 28, widthRearMm: 32, tubeType: "tubeless" };
    mount("bike-1");
    fireEvent.keyDown(screen.getByRole("slider", { name: en.pressure.form.widthFrontLabel }), { key: "ArrowRight" });
    fireEvent.click(screen.getByRole("button", { name: calculatorChainMessages.en.save }));
    await waitFor(() => expect(state.apply).toHaveBeenCalledWith(expect.objectContaining({ bikeId: "bike-1",
      changes: [expect.objectContaining({ field: "tires.widthFrontMm", value: 29, expectedCurrentValue: 28 })],
    })));
  });
  it("follows live profile changes without autosaving hydration", () => {
    const view = mount(); state.weightKg = 83;
    view.rerender(<ToastProvider><PressureDashboardClient /></ToastProvider>); openInputs();
    expect(weightSlider().getAttribute("aria-valuenow")).toBe("83");
    expect(state.mutate).not.toHaveBeenCalled(); expect(state.apply).not.toHaveBeenCalled();
  });
  it("autosaves contextual surface preferences while leaving profile fields alone", async () => {
    mount();
    fireEvent.click(screen.getByRole("button", { name: en.pressure.form.surfaceRoughAsphalt }));
    await waitFor(() => expect(state.mutate).toHaveBeenCalledWith(expect.objectContaining({ expectedUserId: "user-1",
      inputSnapshot: expect.objectContaining({ bodyWeightKg: 75, surface: "rough_asphalt" }),
    })));
    expect(state.apply).not.toHaveBeenCalled();
  });
  it("stores last-used inputs but does not switch bikes while profile edits remain pending", async () => {
    state.bikes = [{ _id: "bike-1", name: "Road", bikeType: "road" }];
    mount("bike-1"); incrementWeight();
    fireEvent.click(screen.getByRole("button", { name: "Calculate without a bike" }));
    await act(async () => {});
    expect(within(screen.getByRole("region", { name: "Choose your bike" })).getByRole("button", { name: "Road" })
      .getAttribute("aria-pressed")).toBe("true");
    expect(state.mutate).toHaveBeenCalledWith(expect.objectContaining({ bikeId: "bike-1",
      inputSnapshot: expect.objectContaining({ bodyWeightKg: 76 }) }));
  });
  it("retains rejected save inputs and keeps retry available", async () => {
    state.apply.mockRejectedValueOnce(new Error("offline")); mount(); incrementWeight();
    fireEvent.click(screen.getByRole("button", { name: calculatorChainMessages.en.save }));
    await screen.findByText(calculatorChainMessages.en.error);
    expect(weightSlider().getAttribute("aria-valuenow")).toBe("76");
    const reset = vi.fn(); cleanup();
    render(<PressureError error={new Error("fixture")} reset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" })); expect(reset).toHaveBeenCalledOnce();
  });
});
