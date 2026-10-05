// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { getFunctionName } from "convex/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GearingCalculatorForm } from "./GearingCalculatorForm";
import { calculatorChainMessages } from "@/i18n/account/calculatorChain";
import { ftpSliderStartCopy } from "@/i18n/calculators/ftpSliderStart";

const state = vi.hoisted(() => ({
  locale: "en" as "en" | "nl", userId: "user1", bikeId: "bike1", loading: false,
  saved: null as Record<string, unknown> | null, save: vi.fn(), apply: vi.fn(),
  profile: { weightKg: 75, ftpWatts: 250 } as { weightKg?: number; ftpWatts?: number; sex?: "male" | "female" | "prefer_not_to_say" },
  bike: { _id: "bike1", name: "Canyon", bikeType: "road", bikeWeightKg: 8.5,
    gearing: { drivetrainType: "2x", chainrings: [34, 50], cassetteTeeth: [11, 13, 17, 21, 30], wheelCircumferenceMm: 2105 } },
}));
vi.mock("@/i18n/useDashboardMessages", () => ({ useDashboardMessages: () => ({ locale: state.locale }) }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(state.bikeId ? `bikeId=${state.bikeId}` : "") }));
vi.mock("convex/react", () => ({
  useMutation: (reference: Parameters<typeof getFunctionName>[0]) =>
    getFunctionName(reference).includes("calculatorChain") ? state.apply : state.save,
  useQuery: (reference: Parameters<typeof getFunctionName>[0], args: unknown) => {
    if (state.loading || args === "skip") return undefined;
    const name = getFunctionName(reference);
    if (name === "users/queries:getCurrentUser") return { _id: state.userId };
    if (name === "bikes/queries:list") return [state.bike];
    if (name === "calculatorChain/queries:getContext") return { profile: state.profile, bikes: [state.bike],
      observations: [], bikeObservations: [], advice: [], activeTireSetup: null };
    if (name === "gearing/queries:getLatestGearingSession") return state.saved ? { input: state.saved } : null;
    if (name === "gearing/queries:listGearingSessions") return [];
    throw new Error(`Unexpected query ${name}`);
  },
}));
beforeEach(() => {
  state.locale = "en"; state.userId = "user1"; state.bikeId = "bike1"; state.loading = false; state.saved = null;
  state.profile = { weightKg: 75, ftpWatts: 250 };
  state.bike.gearing.chainrings = [34, 50];
  state.save.mockReset().mockResolvedValue("session");
  state.apply.mockReset().mockResolvedValue({ status: "saved", fields: ["gearing.chainrings"] });
});
afterEach(cleanup);
function openInputs() {
  const details = document.querySelector("details");
  if (details && !details.open) fireEvent.click(screen.getByText(calculatorChainMessages[state.locale].edit));
}

describe("gearing rider-profile chain", () => {
  it.each([
    ["en", "male", 75, "167"],
    ["nl", "female", 60, "114"],
  ] as const)("keeps the %s demographic FTP start outside persisted inputs until confirmation", async (locale, sex, weightKg, expected) => {
    state.locale = locale;
    state.profile = { sex, weightKg };
    render(<GearingCalculatorForm />); openInputs();
    expect(screen.getByRole("spinbutton").getAttribute("value")).toBe(expected);
    expect(screen.getByText(ftpSliderStartCopy[locale].hint)).toBeTruthy();
    expect(screen.getByText(ftpSliderStartCopy[locale].pending)).toBeTruthy();
    expect(state.save).not.toHaveBeenCalled();
    expect(state.apply).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole("slider", { name: locale === "nl" ? "Trapfrequentie" : "Cadence" }), { key: "ArrowRight" });
    await waitFor(() => expect(state.save).toHaveBeenCalled());
    expect(state.save.mock.calls[0][0].input.ftpWatts).toBeUndefined();
    state.save.mockClear();
    fireEvent.click(screen.getByRole("button", { name: ftpSliderStartCopy[locale].confirm }));
    expect(screen.queryByText(ftpSliderStartCopy[locale].pending)).toBeNull();
    expect(state.apply).not.toHaveBeenCalled();
    expect(state.save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: calculatorChainMessages[locale].save }));
    await waitFor(() => expect(state.apply).toHaveBeenCalledWith(expect.objectContaining({
      changes: expect.arrayContaining([expect.objectContaining({ field: "ftpWatts", value: Number(expected), expectedCurrentValue: null })]),
    })));
  });
  it("keeps an edited start pending for autosave and never restores the suggestion after clearing", () => {
    state.profile = { sex: "male", weightKg: 75 };
    render(<GearingCalculatorForm />); openInputs();
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "205" } });
    expect(screen.queryByText(ftpSliderStartCopy.en.pending)).toBeNull();
    expect(screen.queryByRole("button", { name: calculatorChainMessages.en.trial })).toBeNull();
    expect(state.apply).not.toHaveBeenCalled();
    expect(state.save).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "" } });
    expect(screen.getByRole("spinbutton").getAttribute("value")).toBe("");
    expect(screen.queryByRole("button", { name: ftpSliderStartCopy.en.confirm })).toBeNull();
  });
  it.each([{ weightKg: 75 }, { sex: "male" as const }, { sex: "prefer_not_to_say" as const, weightKg: 75 }])(
    "leaves the optional FTP blank without supported sex and weight: %j", (profile) => {
      state.profile = profile;
      render(<GearingCalculatorForm />); openInputs();
      expect(screen.getByRole("spinbutton").getAttribute("value")).toBe("");
      expect(screen.queryByText(ftpSliderStartCopy.en.pending)).toBeNull();
    },
  );
  it("preserves known profile and saved-session FTP ahead of a demographic start", () => {
    state.profile = { sex: "female", weightKg: 60, ftpWatts: 230 };
    state.saved = { ftpWatts: 215 };
    const view = render(<GearingCalculatorForm />); openInputs();
    expect(screen.getByRole("spinbutton").getAttribute("value")).toBe("230");
    expect(screen.queryByText(ftpSliderStartCopy.en.pending)).toBeNull();
    view.unmount();
    state.profile = { sex: "female", weightKg: 60 };
    render(<GearingCalculatorForm />); openInputs();
    expect(screen.getByRole("spinbutton").getAttribute("value")).toBe("215");
    expect(screen.queryByText(ftpSliderStartCopy.en.pending)).toBeNull();
  });
  it("updates untouched demographic starts and replaces them with incoming known FTP", () => {
    state.profile = { sex: "male", weightKg: 75 };
    const view = render(<GearingCalculatorForm />); openInputs();
    state.profile = { sex: "male", weightKg: 80 };
    view.rerender(<GearingCalculatorForm />); openInputs();
    expect(screen.getByRole("spinbutton").getAttribute("value")).toBe("178");
    state.profile = { sex: "male", weightKg: 80, ftpWatts: 245 };
    view.rerender(<GearingCalculatorForm />); openInputs();
    expect(screen.getByRole("spinbutton").getAttribute("value")).toBe("245");
    expect(screen.queryByText(ftpSliderStartCopy.en.pending)).toBeNull();
    expect(state.save).not.toHaveBeenCalled();
    expect(state.apply).not.toHaveBeenCalled();
  });
  it("loads live profile/bike measurements ahead of historical sessions and follows reactive updates", () => {
    state.saved = { ftpWatts: 190, chainrings: [36, 52], cadenceRpm: 95 };
    const view = render(<GearingCalculatorForm />); openInputs();
    expect(screen.getByRole("spinbutton").getAttribute("value")).toBe("250");
    expect(screen.getByRole("slider", { name: "Outer chainring" }).getAttribute("aria-valuenow")).toBe("50");
    state.profile = { weightKg: 79, ftpWatts: 270 }; state.bike.gearing.chainrings = [32, 48];
    view.rerender(<GearingCalculatorForm />); openInputs();
    expect(screen.getByRole("spinbutton").getAttribute("value")).toBe("270");
    expect(screen.getByRole("slider", { name: "Outer chainring" }).getAttribute("aria-valuenow")).toBe("48");
    expect(state.save).not.toHaveBeenCalled(); expect(state.apply).not.toHaveBeenCalled();
  });
  it.each(["en", "nl"] as const)("requires a choice before persisting changed bike values in %s", async (locale) => {
    state.locale = locale;
    render(<GearingCalculatorForm />); openInputs();
    fireEvent.keyDown(screen.getByRole("slider", { name: locale === "nl" ? "Buitenblad" : "Outer chainring" }),
      { key: "ArrowRight" });
    expect(screen.getByText(calculatorChainMessages[locale].automaticChoice)).toBeTruthy();
    expect(state.save).not.toHaveBeenCalled(); expect(state.apply).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: calculatorChainMessages[locale].save }));
    await waitFor(() => expect(state.apply).toHaveBeenCalledWith(expect.objectContaining({ calculator: "gearing", bikeId: "bike1",
      changes: [expect.objectContaining({ field: "gearing.chainrings", value: [51, 34], expectedCurrentValue: [34, 50], kind: "declared" })],
    })));
  });
  it("automatically saves changed declared FTP with an account guard", async () => {
    render(<GearingCalculatorForm />); openInputs();
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "290" } });
    expect(screen.queryByRole("button", { name: calculatorChainMessages.en.trial })).toBeNull();
    await waitFor(() => expect(state.apply).toHaveBeenCalledWith(expect.objectContaining({ automatic: true,
      expectedUserId: "user1", changes: expect.arrayContaining([expect.objectContaining({ field: "ftpWatts", value: 290 })]),
    })));
  });
  it("retains a pending edit when live source data changes and submits its original expected value", async () => {
    const view = render(<GearingCalculatorForm />); openInputs();
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "290" } });
    state.profile = { weightKg: 75, ftpWatts: 260 };
    view.rerender(<GearingCalculatorForm />); openInputs();
    expect(screen.getByRole("spinbutton").getAttribute("value")).toBe("290");
    state.apply.mockResolvedValueOnce({ status: "conflict", conflicts: [{ field: "ftpWatts" }] });
    fireEvent.click(screen.getByRole("button", { name: calculatorChainMessages.en.save }));
    await screen.findByText(calculatorChainMessages.en.conflict);
    expect(state.apply).toHaveBeenLastCalledWith(expect.objectContaining({ changes: expect.arrayContaining([expect.objectContaining({
      field: "ftpWatts", value: 290, expectedCurrentValue: 250,
    }), expect.objectContaining({ field: "ftpMethod", value: "known", kind: "declared" })]) }));
  });
  it("still autosaves local cadence preferences and keeps account identity on the write", async () => {
    render(<GearingCalculatorForm />); openInputs();
    fireEvent.keyDown(screen.getByRole("slider", { name: "Cadence" }), { key: "ArrowRight" });
    await waitFor(() => expect(state.save).toHaveBeenCalledWith(expect.objectContaining({ expectedUserId: "user1",
      bikeId: "bike1", input: expect.objectContaining({ cadenceRpm: 81, ftpWatts: 250, riderWeightKg: 75 }) })));
    expect(state.apply).not.toHaveBeenCalled();
  });
  it("keeps validation errors local and shows loading until context is available", async () => {
    state.loading = true; const view = render(<GearingCalculatorForm />);
    expect(screen.queryByRole("slider")).toBeNull(); state.loading = false;
    view.rerender(<GearingCalculatorForm />); openInputs();
    fireEvent.keyDown(screen.getByRole("slider", { name: "Inner chainring" }), { key: "End" });
    await act(async () => {});
    expect(screen.getByRole("alert").textContent).toContain("Check your input");
    expect(state.save).not.toHaveBeenCalled();
  });
});
