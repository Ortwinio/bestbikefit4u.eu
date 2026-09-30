// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { ToastProvider } from "@/components/ui";
import { calculateAdvancedPressure } from "@/lib/pressure-engine";
import { PressureDashboardClient } from "./PressureDashboardClient";
import PressureError from "./error";

const state = vi.hoisted(() => ({
  loading: false,
  bikes: [] as Array<Record<string, unknown>>,
  latest: [] as Array<Record<string, unknown>>,
  mutate: vi.fn().mockResolvedValue("saved-id"),
}));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale: "en", messages: getDashboardMessages("en") }),
}));
vi.mock("convex/react", () => ({
  useQuery: (query: Parameters<typeof getFunctionName>[0], args: unknown) => {
    if (args === "skip") return undefined;
    const name = getFunctionName(query);
    if (name.startsWith("bikes/queries:")) return state.loading ? undefined : state.bikes;
    if (name.includes("getLatestByBikeForUser")) return state.loading ? undefined : state.latest;
    if (name.includes("getMyProfile")) return { weightKg: 75 };
    return [];
  },
  useMutation: () => state.mutate,
}));

beforeEach(() => {
  state.loading = false;
  state.bikes = [];
  state.latest = [];
  state.mutate.mockClear();
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(cleanup);
function mount(initialBikeId?: string) {
  return render(
    <ToastProvider>
      <PressureDashboardClient initialBikeId={initialBikeId} />
    </ToastProvider>,
  );
}

describe("account pressure route", () => {
  it("distinguishes loading from a real empty bike list", () => {
    state.loading = true;
    const view = mount();
    expect(screen.getByRole("region", { name: "Loading your bikes" }).getAttribute("aria-busy")).toBe("true");
    expect(screen.queryByRole("heading", { name: "Add your first bike" })).toBeNull();
    state.loading = false;
    view.rerender(
      <ToastProvider>
        <PressureDashboardClient />
      </ToastProvider>,
    );
    expect(screen.getByRole("heading", { name: "Add your first bike" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Add a bike" }).getAttribute("href")).toBe("/en/bikes/new");
    expect(screen.getByRole("button", { name: "Calculate without a bike" })).toBeTruthy();
  });

  it("preselects a linked bike, preserves saved-note editing and sends the original mutation payload", async () => {
    state.bikes = [{ _id: "bike-1", name: "My road bike", discipline: "road", bikeType: "road" }];
    state.latest = [
      {
        bikeId: "bike-1",
        latestCalculation: {
          _id: "calc-1",
          recommendedFrontBar: 5.2,
          recommendedRearBar: 5.6,
          createdAt: Date.now(),
          userNotes: "Old note",
        },
      },
    ];
    mount("bike-1");
    const chooser = screen.getByRole("region", { name: "Choose your bike" });
    expect(within(chooser).getByRole("button", { name: "My road bike" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(screen.getByRole("meter", { name: "Front" }).getAttribute("aria-valuenow")).toBe("5.2");
    expect(screen.getByRole("meter", { name: "Rear" }).getAttribute("aria-valuenow")).toBe("5.6");
    const labels = getDashboardMessages("en").pressure.overview.userNotes;
    fireEvent.click(screen.getByRole("button", { name: labels.editButton }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "New note" } });
    fireEvent.click(screen.getByRole("button", { name: labels.saveButton }));
    await waitFor(() =>
      expect(state.mutate).toHaveBeenCalledWith({ calculationId: "calc-1", userNotes: "New note" }),
    );
  });

  it("runs the real manual wizard through advanced pressure and saves the original calculation", async () => {
    mount();
    const messages = getDashboardMessages("en");
    const next = () =>
      fireEvent.click(screen.getByRole("button", { name: messages.questionnaire.actions.next }));
    next();
    fireEvent.click(screen.getByRole("button", { name: "hooked" }));
    next();
    fireEvent.click(screen.getByRole("button", { name: messages.pressure.wizard.wet }));
    next();
    next();
    const expected = calculateAdvancedPressure({
      discipline: "road",
      bodyWeightKg: 75,
      widthFrontMm: 28,
      widthRearMm: 28,
      tubeType: "tubeless",
      surface: "average_asphalt",
      isWet: true,
      ridingGoal: "balance",
      extraLuggageKg: 0,
    });
    expect(screen.getAllByText(`${expected.frontBar} bar`).length).toBeGreaterThan(0);
    expect(screen.getAllByText(`${expected.rearBar} bar`).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: messages.pressure.wizard.saveCalculation }));
    await waitFor(() => expect(state.mutate).toHaveBeenCalled());
    expect(state.mutate.mock.calls[0][0]).toMatchObject({
      inputSnapshot: {
        bodyWeightKg: 75,
        widthFrontMm: 28,
        widthRearMm: 28,
        isWet: true,
        ridingGoal: "balance",
      },
      recommendedFrontBar: expected.frontBar,
      recommendedRearBar: expected.rearBar,
    });
  });

  it("provides a working retry action for query errors", () => {
    const reset = vi.fn();
    render(<PressureError error={new Error("fixture")} reset={reset} />);
    expect(screen.getByRole("alert")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
