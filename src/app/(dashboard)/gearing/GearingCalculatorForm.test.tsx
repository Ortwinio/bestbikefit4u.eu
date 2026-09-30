/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { getFunctionName } from "convex/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toolsGearingMessages } from "@/i18n/account/toolsGearing";
import { calculateGearingAnalysis } from "@/lib/gearing-engine";
import { GearingCalculatorForm } from "./GearingCalculatorForm";
import { computeGearingMetrics } from "./gearingMath";

const state = vi.hoisted(() => ({
  locale: "en",
  bikeId: "bike1",
  loading: false,
  empty: false,
  missingBike: false,
  history: false,
  save: vi.fn(),
}));
const bike = {
  _id: "bike1",
  name: "Canyon",
  brand: "Endurace",
  model: "CF7",
  bikeType: "road",
  bikeWeightKg: 8.5,
  currentSetup: { crankLengthMm: 172.5 },
  gearing: {
    drivetrainType: "2x" as const,
    chainrings: [50, 34],
    cassetteTeeth: [11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30],
    wheelCircumferenceMm: 2105,
  },
};
vi.mock("@/i18n/useDashboardMessages", () => ({ useDashboardMessages: () => ({ locale: state.locale }) }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(state.bikeId ? `bikeId=${state.bikeId}` : ""),
}));
vi.mock("convex/react", () => ({
  useMutation: () => state.save,
  useQuery: (reference: Parameters<typeof getFunctionName>[0], args: unknown) => {
    if (state.loading || args === "skip") return undefined;
    const name = getFunctionName(reference);
    if (name === "bikes/queries:list") return state.empty ? [] : [bike];
    if (name === "bikes/queries:get") return state.missingBike ? null : bike;
    if (name === "profiles/queries:getMyProfile") return { weightKg: 75 };
    if (name === "gearing/queries:listGearingSessions")
      return state.history
        ? [
            {
              createdAt: 1735689600000,
              bikeId: "bike1",
              suitability: { publicVerdict: "challenging", confidence: { level: "medium" } },
            },
          ]
        : [];
    throw new Error(`Unexpected query: ${name}`);
  },
}));
const en = toolsGearingMessages.en;
function output(label: string) {
  return screen.getByText(label).closest("dl")?.querySelector("dd")?.textContent;
}
function key(label: string, value = "ArrowRight") {
  fireEvent.keyDown(screen.getByRole("slider", { name: label }), { key: value });
}
beforeEach(() => {
  state.locale = "en";
  state.bikeId = "bike1";
  state.loading = false;
  state.empty = false;
  state.missingBike = false;
  state.history = false;
  state.save.mockReset().mockResolvedValue("session1");
});
afterEach(cleanup);

describe("account gearing", () => {
  it("prefills exact saved teeth, leaves FTP missing and saves the real engine analysis", async () => {
    render(<GearingCalculatorForm />);
    expect(screen.getByRole("slider", { name: en.ftp }).getAttribute("aria-valuetext")).toBe(en.unset);
    const metrics = computeGearingMetrics(bike.gearing, 85);
    expect(output(en.low)).toBe(metrics.lowestGearRatio?.toFixed(2));
    expect(output(en.lowSpeed)).toBe(`${metrics.lowestGearSpeedAtCadenceKmh?.toFixed(1)}km/h`);
    expect(screen.getByText(en.missingPower)).toBeTruthy();
    await waitFor(() => expect(state.save).toHaveBeenCalled());
    const payload = state.save.mock.calls.at(-1)?.[0];
    expect(payload.bikeId).toBe("bike1");
    expect(payload.input.cassetteTeeth).toEqual(bike.gearing.cassetteTeeth);
    expect(payload.input.ftpWatts).toBeUndefined();
    expect(payload.math).toEqual(calculateGearingAnalysis(payload.input).math);
    expect(payload.suitability).toEqual(calculateGearingAnalysis(payload.input).suitability);
    key(`${en.cassette} · ${en.largest}`);
    await waitFor(() =>
      expect(state.save.mock.calls.at(-1)?.[0].input.cassetteTeeth).toEqual([
        ...bike.gearing.cassetteTeeth.slice(0, -1),
        31,
      ]),
    );
    key(`${en.cassette} · ${en.largest}`, "ArrowLeft");
    key(en.cadence);
    expect(output(en.lowSpeed)).toBe(
      `${computeGearingMetrics(bike.gearing, 86).lowestGearSpeedAtCadenceKmh?.toFixed(1)}km/h`,
    );
    key(en.ftp, "End");
    await waitFor(() => expect(state.save.mock.calls.at(-1)?.[0].input.ftpWatts).toBe(500));
    expect(screen.queryByText(en.missingPower)).toBeNull();
  }, 15000);

  it("supports manual input despite bikeId URL, 1x and actual cassette comparison", async () => {
    render(<GearingCalculatorForm />);
    await waitFor(() => expect(state.save).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: en.manual }));
    await waitFor(() => expect(state.save.mock.calls.at(-1)?.[0].bikeId).toBeUndefined());
    expect(screen.getByRole("button", { name: en.manual }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("radio", { name: "1×" }));
    expect(screen.queryByRole("slider", { name: en.inner })).toBeNull();
    expect(output(en.low)).toBe((50 / 30).toFixed(2));
    const details = screen.getByText(en.refine).closest("details")!;
    details.open = true;
    const ranges = within(details).getByRole("group", { name: `${en.alternative} · ${en.presets}` });
    fireEvent.click(within(ranges).getByRole("button", { name: "11–34" }));
    expect(output(en.alternativeRatio)).toBe((50 / 34).toFixed(2));
    expect(output(en.low)).toBe((50 / 30).toFixed(2));
    key(en.maxCog, "Home");
    expect(screen.getByText(en.compatibility)).toBeTruthy();
    await waitFor(() => expect(state.save.mock.calls.at(-1)?.[0].scenarioName).toBe("comparison-cassette"));
    expect(state.save.mock.calls.at(-1)?.[0].input.chainrings).toEqual([50]);
  });

  it("keeps data intact when save fails and retries the same real analysis", async () => {
    state.save.mockRejectedValueOnce(new Error("offline"));
    render(<GearingCalculatorForm />);
    await screen.findByText(en.saveError);
    expect(screen.getByRole("slider", { name: en.outer }).getAttribute("aria-valuetext")).toBe("50 teeth");
    fireEvent.click(screen.getByRole("button", { name: en.retry }));
    await screen.findByText(en.saved);
    expect(state.save).toHaveBeenCalledTimes(2);
    expect(state.save.mock.calls[1][0]).toEqual(state.save.mock.calls[0][0]);
  });

  it("renders genuine loading, empty and unavailable states without saving missing data", () => {
    state.loading = true;
    const view = render(<GearingCalculatorForm />);
    expect(screen.getAllByText(en.loading).length).toBeGreaterThan(0);
    expect(state.save).not.toHaveBeenCalled();
    state.loading = false;
    state.empty = true;
    state.missingBike = true;
    view.rerender(<GearingCalculatorForm />);
    expect(screen.getByText(en.emptyBikes)).toBeTruthy();
    expect(screen.getByText(en.unavailable)).toBeTruthy();
    expect(screen.getByText(en.emptyHistory)).toBeTruthy();
    expect(state.save).not.toHaveBeenCalled();
  });

  it("localizes live numbers, missing context and controls in Dutch", async () => {
    state.locale = "nl";
    state.history = true;
    const nl = toolsGearingMessages.nl;
    render(<GearingCalculatorForm />);
    expect(output(nl.low)).toBe("1,13");
    expect(screen.getByText(nl.missingPower)).toBeTruthy();
    expect(screen.getByRole("slider", { name: nl.outer })).toBeTruthy();
    expect(screen.queryByText(en.missingPower)).toBeNull();
    const history = screen.getByRole("region", { name: nl.history });
    expect(within(history).getByText(`${nl.historyVerdicts.challenging} · ${nl.confidence.medium}`)).toBeTruthy();
    expect(history.querySelector("time")?.getAttribute("datetime")).toBe("2025-01-01T00:00:00.000Z");
    await screen.findByText(nl.saved);
  });
});
