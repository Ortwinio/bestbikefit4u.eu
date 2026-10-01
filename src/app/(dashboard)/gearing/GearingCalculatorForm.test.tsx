/* @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { getFunctionName } from "convex/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GearingCalculatorForm } from "./GearingCalculatorForm";
import { gearingMessages } from "@/i18n/calculators/gearing";
import { autosaveMessages } from "@/i18n/account/autosave";
import { toolsGearingMessages } from "@/i18n/account/toolsGearing";

const state = vi.hoisted(() => ({
  locale: "en" as "en" | "nl", userId: "user1", bikeId: "bike1", loading: false, empty: false,
  saved: {} as Record<string, Record<string, unknown>>,
  save: vi.fn(), anonymous: vi.fn(),
}));
const bike = {
  _id: "bike1", name: "Canyon", bikeType: "road", bikeWeightKg: 8.5,
  gearing: { drivetrainType: "2x", chainrings: [34, 50], cassetteTeeth: [11, 13, 17, 21, 30], wheelCircumferenceMm: 2105 },
};
vi.mock("@/i18n/useDashboardMessages", () => ({ useDashboardMessages: () => ({ locale: state.locale }) }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(state.bikeId ? "bikeId=" + state.bikeId : ""),
}));
vi.mock("convex/react", () => ({
  useMutation: (reference: Parameters<typeof getFunctionName>[0]) =>
    getFunctionName(reference).endsWith("createPublicGearingSession") ? state.anonymous : state.save,
  useQuery: (reference: Parameters<typeof getFunctionName>[0], args: unknown) => {
    if (state.loading || args === "skip") return undefined;
    const name = getFunctionName(reference);
    if (name === "users/queries:getCurrentUser") return { _id: state.userId };
    if (name === "bikes/queries:list") return state.empty ? [] : [bike];
    if (name === "profiles/queries:getMyProfile") return { weightKg: 75 };
    if (name === "gearing/queries:getLatestGearingSession") {
      const key = (args as { bikeId?: string }).bikeId ?? "manual";
      return state.saved[key] ? { input: state.saved[key] } : null;
    }
    if (name === "gearing/queries:listGearingSessions") return [];
    throw new Error("Unexpected query " + name);
  },
}));
beforeEach(() => {
  state.locale = "en"; state.userId = "user1"; state.bikeId = "bike1";
  state.loading = false; state.empty = false; state.saved = {};
  state.save.mockReset().mockImplementation(async ({ bikeId, input }) => {
    state.saved[bikeId ?? "manual"] = input;
    return "session1";
  });
  state.anonymous.mockReset();
});
afterEach(() => { cleanup(); vi.useRealTimers(); });
function editOuter() {
  fireEvent.keyDown(screen.getByRole("slider", { name: gearingMessages[state.locale].outer }), { key: "ArrowRight" });
}

describe("shared account gearing", () => {
  it("does not save when a quick edit returns to the hydrated values", async () => {
    vi.useFakeTimers();
    render(<GearingCalculatorForm />);
    editOuter();
    fireEvent.keyDown(screen.getByRole("slider", { name: gearingMessages.en.outer }), { key: "ArrowLeft" });
    await act(async () => { await vi.advanceTimersByTimeAsync(600); });
    expect(state.save).not.toHaveBeenCalled();
  });
  it.each(["en", "nl"] as const)("uses the public form and localized account copy without initial saves (%s)", (locale) => {
    state.locale = locale;
    render(<GearingCalculatorForm />);
    expect(screen.getByRole("heading", { level: 1, name: gearingMessages[locale].title })).toBeTruthy();
    expect(screen.getByRole("slider", { name: gearingMessages[locale].outer }).getAttribute("aria-valuenow")).toBe("50");
    expect(screen.getByRole("region", { name: toolsGearingMessages[locale].history })).toBeTruthy();
    expect(state.save).not.toHaveBeenCalled();
    expect(state.anonymous).not.toHaveBeenCalled();
  });
  it("debounces changes, preserves legacy cassette and restores after remount", async () => {
    vi.useFakeTimers();
    const view = render(<GearingCalculatorForm />);
    editOuter();
    expect(state.save).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(499));
    expect(state.save).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(state.save).toHaveBeenCalledTimes(1);
    expect(state.save).toHaveBeenCalledWith(expect.objectContaining({
      bikeId: "bike1", expectedUserId: "user1",
      input: expect.objectContaining({ chainrings: [51, 34], cassetteTeeth: [11, 13, 17, 21, 30] }),
    }));
    expect(screen.getByText(autosaveMessages.en.saved + " · " + autosaveMessages.en.updated)).toBeTruthy();
    view.unmount();
    render(<GearingCalculatorForm />);
    expect(screen.getByRole("slider", { name: gearingMessages.en.outer }).getAttribute("aria-valuenow")).toBe("51");
    expect(state.save).toHaveBeenCalledTimes(1);
    expect(state.anonymous).not.toHaveBeenCalled();
  });
  it("flushes pending values before switching to unbound values", async () => {
    render(<GearingCalculatorForm />);
    editOuter();
    fireEvent.click(screen.getByRole("button", { name: toolsGearingMessages.en.manual }));
    await waitFor(() => expect(screen.getByRole("slider", { name: gearingMessages.en.outer }).getAttribute("aria-valuenow")).toBe("50"));
    expect(state.save).toHaveBeenCalledWith(expect.objectContaining({ bikeId: "bike1" }));
    editOuter();
    await waitFor(() => expect(state.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ bikeId: undefined, expectedUserId: "user1" }),
    ));
  });
  it("keeps edits and offers retry after failure", async () => {
    state.locale = "nl";
    state.save.mockRejectedValueOnce(new Error("Offline"));
    render(<GearingCalculatorForm />);
    editOuter();
    await waitFor(() => expect(screen.getByRole("button", { name: autosaveMessages.nl.retry })).toBeTruthy());
    expect(screen.getByRole("slider", { name: gearingMessages.nl.outer }).getAttribute("aria-valuenow")).toBe("51");
    fireEvent.click(screen.getByRole("button", { name: autosaveMessages.nl.retry }));
    await waitFor(() => expect(screen.getByText(autosaveMessages.nl.saved + " · " + autosaveMessages.nl.updated)).toBeTruthy());
  });
  it("blocks invalid values instead of writing or switching", async () => {
    vi.useFakeTimers();
    render(<GearingCalculatorForm />);
    fireEvent.keyDown(screen.getByRole("slider", { name: gearingMessages.en.inner }), { key: "End" });
    await act(() => vi.advanceTimersByTimeAsync(600));
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(state.save).not.toHaveBeenCalled();
  });
  it("keeps the selected bike and edits when the switch flush fails", async () => {
    state.save.mockRejectedValueOnce(new Error("Offline"));
    render(<GearingCalculatorForm />);
    editOuter();
    fireEvent.click(screen.getByRole("button", { name: toolsGearingMessages.en.manual }));
    await waitFor(() => expect(screen.getByRole("button", { name: autosaveMessages.en.retry })).toBeTruthy());
    expect(screen.getByRole("button", { name: "Canyon" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("slider", { name: gearingMessages.en.outer }).getAttribute("aria-valuenow")).toBe("51");
  });
  it("uses public defaults and still saves with no bikes", async () => {
    state.empty = true;
    render(<GearingCalculatorForm />);
    expect(screen.getByText(toolsGearingMessages.en.emptyBikes)).toBeTruthy();
    editOuter();
    await waitFor(() => expect(state.save).toHaveBeenCalledWith(expect.objectContaining({ bikeId: undefined })));
  });
  it("does not flush a previous user's pending values into the next account", async () => {
    vi.useFakeTimers();
    const view = render(<GearingCalculatorForm />);
    editOuter();
    state.userId = "user2";
    view.rerender(<GearingCalculatorForm />);
    await act(() => vi.advanceTimersByTimeAsync(600));
    expect(state.save).not.toHaveBeenCalled();
  });
});
