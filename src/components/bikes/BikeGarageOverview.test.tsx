/* @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { BikeGarageRow, type BikeSessionEntry, type BikeSummaryRow } from "./BikeGarageOverview";

vi.mock("@/hooks/useResolvedImageUrl", () => ({ useResolvedImageUrl: () => null }));
vi.mock("@/components/reports", () => ({ FitReportActionGroup: () => null }));
afterEach(cleanup);

it("keeps measurement units and their values on one line in narrow garage tiles", () => {
  const bike: BikeSummaryRow = {
    _id: "bike", name: "Road bike", bikeType: "road", advisedPressureSummary: null,
    pressureStateSummary: { isStale: false, hasCurrentPressure: false },
  };
  const latestFit = {
    session: { _id: "session" }, responses: {},
    recommendation: { calculatedFit: { saddleHeightMm: 733, handlebarDropMm: 55, handlebarReachMm: 480 } },
  } as BikeSessionEntry;
  render(<BikeGarageRow bike={bike} latestFit={latestFit} locale="en" messages={getDashboardMessages("en")} />);
  const units = screen.getAllByText("mm", { selector: "dd > span" });
  expect(units).toHaveLength(3);
  for (const unit of units) {
    expect(unit.classList.contains("whitespace-nowrap")).toBe(true);
    expect(unit.parentElement?.classList.contains("whitespace-nowrap")).toBe(true);
  }
});
vi.mock("./DeleteBikeAction", () => ({ DeleteBikeAction: () => null }));
