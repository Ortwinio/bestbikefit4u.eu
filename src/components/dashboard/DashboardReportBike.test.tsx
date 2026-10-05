// @vitest-environment jsdom
import type { ComponentProps } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { getFunctionName } from "convex/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { getDashboardReportCopy } from "@/i18n/account/dashboardReport";
import { fitResultsSource } from "@/app/(dashboard)/fit/[sessionId]/results/fixture.test-support";
import { DashboardReportBike } from "./DashboardReportBike";

const state = vi.hoisted(() => ({ locale: "nl" as "nl" | "en", source: undefined as unknown,
  reliability: undefined as unknown, query: vi.fn() }));
vi.mock("convex/react", () => ({ useQuery: (...args: unknown[]) => state.query(...args) }));
vi.mock("@/hooks/useResolvedImageUrl", () => ({ useResolvedImageUrl: () => null }));
vi.mock("@/i18n/useDashboardMessages", () => ({ useDashboardMessages: () => ({
  locale: state.locale, messages: getDashboardMessages(state.locale),
}) }));
vi.mock("@/components/reports", () => ({ FitReportActionGroup: () => <span>Report actions</span> }));
vi.mock("../../../shared/pricing/flags", () => ({ isPaidAccessEnforced: () => false }));

type Props = ComponentProps<typeof DashboardReportBike>;
const bike = {
  _id: "bike_1", name: "Canyon Aeroad", bikeType: "road", brand: "Canyon", model: "Aeroad",
  advisedPressureSummary: null, activeTireSetupSummary: null, activeWheelsetSummary: null,
  pressureStateSummary: { isStale: false, hasCurrentPressure: false },
} as unknown as Props["bike"];
const latestFit = {
  session: { ...fitResultsSource.session, bikeId: "bike_1" },
  bike, recommendation: fitResultsSource.recommendation, responses: {},
} as unknown as Props["latestFit"];

afterEach(cleanup);
beforeEach(() => {
  state.source = fitResultsSource;
  state.reliability = undefined;
  state.query.mockReset().mockImplementation((reference, args) => args === "skip" ? undefined
    : getFunctionName(reference) === "recommendations/queries:getReportV2" ? state.source
      : getFunctionName(reference) === "reliability/queries:getDashboardReliability" ? state.reliability : undefined);
});

describe.each(["nl", "en"] as const)("dashboard report integration (%s)", locale => {
  beforeEach(() => { state.locale = locale; });

  it("preserves bike, new-fit and pressure links without a fit or fabricated ranges", () => {
    const { container } = render(<DashboardReportBike bike={bike} latestFit={null} />);
    const links = screen.getAllByRole("link").map(link => link.getAttribute("href"));
    expect(links).toContain(`/${locale}/bikes/bike_1`);
    expect(links).toContain(`/${locale}/fit?bikeId=bike_1`);
    expect(links.some(href => href?.includes("pressure") && href.includes("bike_1"))).toBe(true);
    expect(screen.getAllByText(getDashboardMessages(locale).bikeGarage.noFitYet).length).toBeGreaterThan(0);
    expect(container.querySelector("[data-range-zone]")).toBeNull();
    expect(state.query.mock.calls.every(call => call[1] === "skip")).toBe(true);
  });

  it("keeps the unavailable-report state and navigation", () => {
    state.source = null;
    render(<DashboardReportBike bike={bike} latestFit={latestFit} />);
    expect(screen.getByText(getDashboardReportCopy(locale).reportMissing)).toBeTruthy();
    expect(screen.getByText("Report actions")).toBeTruthy();
    expect(screen.getByRole("link", { name: getDashboardMessages(locale).bikeGarage.recalculateFit })
      .getAttribute("href")).toBe(`/${locale}/fit?bikeId=bike_1`);
  });

  it("keeps the report loading state without displaying placeholder advice", () => {
    state.source = undefined;
    const { container } = render(<DashboardReportBike bike={bike} latestFit={latestFit} />);
    expect(screen.getByText(getDashboardMessages(locale).layout.loading)).toBeTruthy();
    expect(container.querySelector("[data-range-zone]")).toBeNull();
  });

  it("renders the owned query's ranges and one gain instead of legacy test bands/confidence", () => {
    state.reliability = { rows: [{ range: { kind: "continuous", metric: "saddleHeight", value: 748,
      lower: 725, upper: 770, halfWidth: 23, scaleMin: 688, scaleMax: 808,
      widestHalfWidth: 48, basisKey: "measured", nextStepKey: "repeat-inseam" } }],
    largestGain: { metric: "saddleHeight", nextStepKey: "repeat-inseam", halfWidth: 18, reduction: 5 } };
    const { container } = render(<DashboardReportBike bike={bike} latestFit={latestFit} />);
    expect(container.querySelectorAll("[data-range-zone]")).toHaveLength(1);
    expect(container.querySelectorAll("[data-report-range]")).toHaveLength(0);
    expect(screen.getByRole("img", { name: locale === "nl" ? "Zadelhoogte 748 mm, bereik 725 tot 770 mm"
      : "Saddle height 748 mm, range 725 to 770 mm" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Grootste winst|Greatest gain/ }).getAttribute("href"))
      .toBe(`/${locale}/tools/saddle-height`);
    expect(container.textContent).not.toContain("88%");
    expect(state.query.mock.calls.some(call => getFunctionName(call[0]) === "reliability/queries:getDashboardReliability"
      && call[1]?.sessionId === "session_1")).toBe(true);
  });
});
