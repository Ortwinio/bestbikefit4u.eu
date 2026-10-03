/* @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { scoreBike } from "../../../shared/profileScore";
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


it.each(["nl", "en"] as const)("shows real bike rings, setup percentage and one missing input action in %s", (locale) => {
  const profileScore=scoreBike({bike:{currentSetup:{saddleHeightMm:740}}}, Date.now());
  const bike: BikeSummaryRow={_id:"bike",name:"My bike",bikeType:"road",profileScore,
    advisedPressureSummary:null,pressureStateSummary:{isStale:false,hasCurrentPressure:false}};
  render(<BikeGarageRow bike={bike} latestFit={null} locale={locale} messages={getDashboardMessages(locale)} />);
  const meters=screen.getAllByRole("meter");
  expect(meters.map(meter=>meter.getAttribute("aria-valuenow")))
    .toEqual([String(Math.round(profileScore.completeness)),String(Math.round(profileScore.reliability))]);
  expect(screen.getByText(locale==="nl" ? "Afstelling 26%" : "Setup 26%")).toBeTruthy();
  const action=screen.getByRole("link",{name:locale==="nl"?/Vul je fietsprofiel aan/:/Complete your bike profile/});
  expect(action.getAttribute("href")).toMatch(new RegExp(`/${locale}/bikes/bike#bike-profile-`));
});
