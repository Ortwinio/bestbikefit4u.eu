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

const state = vi.hoisted(() => ({
  loading: false, locale: "en" as "en" | "nl", userId: "user-1", weightKg: 75, stale: false,
  bikes: [] as Array<Record<string, unknown>>,
  latest: [] as Array<{ bikeId: string; latestCalculation: Record<string, unknown> }>,
  noBike: null as Record<string, unknown> | null,
  tires: null as Record<string, unknown> | null,
  mutate: vi.fn(), notes: vi.fn(),
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
    if (name.includes("getMyProfile")) return { weightKg: state.weightKg };
    throw new Error(`Unexpected query: ${name}`);
  },
  useMutation: (mutation: Parameters<typeof getFunctionName>[0]) =>
    getFunctionName(mutation).includes("upsertBasic") ? state.mutate : state.notes,
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
  return render(<ToastProvider><PressureDashboardClient initialBikeId={initialBikeId} /></ToastProvider>);
}
function weightSlider() {
  return screen.getByRole("slider", { name: (state.locale === "nl" ? nl : en).pressure.form.bodyWeightLabel });
}
function incrementWeight() {
  fireEvent.keyDown(weightSlider(), { key: "ArrowRight" });
  fireEvent.keyUp(weightSlider(), { key: "ArrowRight" });
}

describe("account pressure route", () => {
  it("distinguishes loading from an empty garage and keeps the public form available without a bike", () => {
    state.loading = true;
    const view = mount();
    expect(screen.getByRole("region", { name: "Loading your bikes" }).getAttribute("aria-busy")).toBe("true");
    state.loading = false;
    view.rerender(<ToastProvider><PressureDashboardClient /></ToastProvider>);
    expect(screen.getByRole("heading", { name: "Add your first bike" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Add a bike" }).getAttribute("href")).toBe("/en/bikes/new");
    expect(weightSlider().getAttribute("aria-valuenow")).toBe("75");
    expect(screen.getByRole("region", { name: "Your starting pressure" })).toBeTruthy();
    expect(state.mutate).not.toHaveBeenCalled();
  });

  it("prefers a bike's saved values over profile and tires, preserving cards and note editing", async () => {
    state.bikes = [{ _id: "bike-1", name: "My road bike", discipline: "road", bikeType: "road" }];
    state.weightKg = 91;
    state.tires = { widthFrontMm: 42, widthRearMm: 45, tubeType: "inner_tube" };
    state.latest = [{ bikeId: "bike-1", latestCalculation: { ...calculation({ ...basic, bodyWeightKg: 82 }), userNotes: "Old note" } }];
    state.stale = true;
    mount("bike-1");
    expect(weightSlider().getAttribute("aria-valuenow")).toBe("82");
    expect(screen.getByRole("slider", { name: en.pressure.form.widthFrontLabel }).getAttribute("aria-valuenow")).toBe("28");
    expect(screen.getByRole("note").textContent).toContain("Your weight or tires have changed");
    const chooser = screen.getByRole("region", { name: "Choose your bike" });
    expect(within(chooser).getByRole("button", { name: "My road bike" }).getAttribute("aria-pressed")).toBe("true");
    const labels = getDashboardMessages("en").pressure.overview.userNotes;
    fireEvent.click(screen.getByRole("button", { name: labels.editButton }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "New note" } });
    fireEvent.click(screen.getByRole("button", { name: labels.saveButton }));
    await waitFor(() => expect(state.notes).toHaveBeenCalledWith({ calculationId: "calc-1", userNotes: "New note" }));
    expect(state.mutate).not.toHaveBeenCalled();
  });

  it("prefills profile and active tires, flushes the old bike before switching and restores each saved selection", async () => {
    state.bikes = [
      { _id: "bike-1", name: "Road", bikeType: "road", bikeWeightKg: 9 },
      { _id: "bike-2", name: "Gravel", bikeType: "gravel" },
    ];
    state.weightKg = 80;
    state.tires = { widthFrontMm: 35, widthRearMm: 38, tubeType: "inner_tube" };
    mount("bike-1");
    expect(weightSlider().getAttribute("aria-valuenow")).toBe("80");
    expect(screen.getByRole("slider", { name: en.pressure.form.widthRearLabel }).getAttribute("aria-valuenow")).toBe("38");
    fireEvent.keyDown(weightSlider(), { key: "ArrowRight" });
    fireEvent.click(within(screen.getByRole("region", { name: "Choose your bike" })).getByRole("button", { name: "Gravel" }));
    await waitFor(() => expect(state.mutate).toHaveBeenCalledWith({ bikeId: "bike-1", expectedUserId: "user-1", inputSnapshot: {
      ...basic, bodyWeightKg: 81, widthFrontMm: 35, widthRearMm: 38, tubeType: "inner_tube", bikeWeightKg: 9,
    } }));
    await waitFor(() => expect(weightSlider().getAttribute("aria-valuenow")).toBe("80"));
    incrementWeight();
    await waitFor(() => expect(state.mutate.mock.calls[1][0]).toMatchObject({ bikeId: "bike-2", inputSnapshot: { discipline: "gravel" } }));
    fireEvent.click(within(screen.getByRole("region", { name: "Choose your bike" })).getByRole("button", { name: "Road" }));
    await waitFor(() => expect(weightSlider().getAttribute("aria-valuenow")).toBe("81"));
    expect(state.mutate).toHaveBeenCalledTimes(2);
  });

  it.each(["nl", "en"] as const)("saves and restores no-bike values on reload in %s without changing profile weight", async (locale) => {
    state.locale = locale;
    state.weightKg = 79;
    const view = mount();
    incrementWeight();
    await waitFor(() => expect(state.mutate).toHaveBeenCalledWith({ bikeId: undefined, expectedUserId: "user-1", inputSnapshot: {
      ...basic, bodyWeightKg: 80,
    } }));
    expect(await screen.findByText(locale === "nl" ? /^Opgeslagen ·/ : /^Saved ·/)).toBeTruthy();
    expect(state.weightKg).toBe(79);
    expect(screen.queryByText(locale === "nl"
      ? /Gebruik je account voor een uitgebreidere instelling/
      : /Use your account for a more detailed setup/)).toBeNull();
    view.unmount();
    mount();
    expect(weightSlider().getAttribute("aria-valuenow")).toBe("80");
    expect(state.mutate).toHaveBeenCalledTimes(1);
    expect(screen.getByText(locale === "nl"
      ? "Je invoer en advies worden automatisch bewaard. Je profielgewicht verandert niet."
      : "Your inputs and advice are saved automatically. Your profile weight stays unchanged.")).toBeTruthy();
  });

  it("keeps failed edits and bike selection available for retry instead of silently discarding them", async () => {
    state.bikes = [{ _id: "bike-1", name: "Road", bikeType: "road" }];
    state.mutate.mockRejectedValueOnce(new Error("offline"));
    mount("bike-1");
    incrementWeight();
    await screen.findByText("Not saved");
    fireEvent.click(screen.getByRole("button", { name: "Calculate without a bike" }));
    await act(async () => {});
    expect(screen.getByRole("button", { name: "Road" }).getAttribute("aria-pressed")).toBe("true");
    expect(weightSlider().getAttribute("aria-valuenow")).toBe("76");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await screen.findByText(/^Saved ·/);
    expect(state.mutate).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole("button", { name: "Calculate without a bike" }));
    await waitFor(() => expect(weightSlider().getAttribute("aria-valuenow")).toBe("75"));
  });

  it("does not overwrite dirty same-user edits and binds late writes to the original user", async () => {
    const view = mount();
    incrementWeight();
    state.noBike = calculation({ ...basic, bodyWeightKg: 90 });
    view.rerender(<ToastProvider><PressureDashboardClient /></ToastProvider>);
    expect(weightSlider().getAttribute("aria-valuenow")).toBe("76");
    state.userId = "user-2";
    view.rerender(<ToastProvider><PressureDashboardClient /></ToastProvider>);
    expect(weightSlider().getAttribute("aria-valuenow")).toBe("90");
    await act(async () => {});
    expect(state.mutate).toHaveBeenCalledWith({ bikeId: undefined, expectedUserId: "user-1",
      inputSnapshot: { ...basic, bodyWeightKg: 76 } });
    expect(state.noBike?.inputSnapshot).toMatchObject({ bodyWeightKg: 90 });
  });

  it("shows invalid prefilled data without saving or silently clamping it and recovers after a valid edit", async () => {
    state.locale = "nl";
    state.weightKg = 200;
    mount();
    expect(screen.getByText("Controleer je invoer voordat je verdergaat.")).toBeTruthy();
    expect(screen.getByText("Ingevuld vanuit je profiel")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Bekijk je profiel" }).getAttribute("href")).toBe("/nl/profile");
    expect(state.mutate).not.toHaveBeenCalled();
    fireEvent.keyDown(weightSlider(), { key: "Home" });
    fireEvent.keyUp(weightSlider(), { key: "Home" });
    await waitFor(() => expect(state.mutate).toHaveBeenCalledWith({ bikeId: undefined, expectedUserId: "user-1", inputSnapshot: {
      ...basic, bodyWeightKg: 35,
    } }));
    expect(screen.queryByText("Controleer je invoer voordat je verdergaat.")).toBeNull();
    expect(state.weightKg).toBe(200);
  });

  it("coalesces quick edits with a 500 ms debounce", async () => {
    vi.useFakeTimers();
    try {
      mount();
      fireEvent.keyDown(weightSlider(), { key: "ArrowRight" });
      fireEvent.keyDown(weightSlider(), { key: "ArrowRight" });
      await act(async () => { await vi.advanceTimersByTimeAsync(499); });
      expect(state.mutate).not.toHaveBeenCalled();
      await act(async () => { await vi.advanceTimersByTimeAsync(1); });
      expect(state.mutate).toHaveBeenCalledExactlyOnceWith({ bikeId: undefined, expectedUserId: "user-1", inputSnapshot: {
        ...basic, bodyWeightKg: 77,
      } });
    } finally {
      cleanup();
      vi.useRealTimers();
    }
  });

  it("provides a working retry action for query errors", () => {
    const reset = vi.fn();
    render(<PressureError error={new Error("fixture")} reset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
