/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { calculateSaddleHeight } from "../../../shared/reliability/saddleHeight";
import { homeSaddleWidget } from "@/i18n/marketing/homeSaddleWidget";
import { writeHandoffEntry } from "@/lib/handoff/store";
import { SaddleHeightTeaser } from "./SaddleHeightTeaser";

vi.mock("@/lib/handoff/store", () => ({ writeHandoffEntry: vi.fn() }));
const { trackUsed } = vi.hoisted(() => ({ trackUsed: vi.fn() }));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({ useMarketingEventLogger: () => vi.fn() }));
vi.mock("@/lib/analytics/useHomeSaddleWidgetAnalytics", () => ({
  useHomeSaddleWidgetAnalytics: () => ({ trackHomeSaddleWidgetUsed: trackUsed }),
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("home saddle-height widget", () => {
  it.each(["nl", "en"] as const)("renders the shared default estimate and localized %s refinement", (locale) => {
    render(<SaddleHeightTeaser locale={locale} />);
    const copy = homeSaddleWidget[locale];
    expect(screen.getByRole("slider", { name: copy.height }).getAttribute("aria-valuenow")).toBe("175");
    expect(screen.getByRole("status", { name: copy.title }).textContent).toBe("726 mm · ±45 mm");
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("680");
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("770");
    expect(screen.getByRole("link", { name: copy.refine }).getAttribute("href")).toBe(`/${locale}/calculators/saddle-height#inseam`);
    expect(writeHandoffEntry).not.toHaveBeenCalled();
    expect(trackUsed).not.toHaveBeenCalled();
  });

  it("updates advice, uncertainty and range for every height without saving on change", () => {
    render(<SaddleHeightTeaser locale="en" />);
    const slider = screen.getByRole("slider", { name: "Height" });
    for (let height = 130; height <= 220; height += 1) {
      fireEvent.change(slider, { target: { value: String(height) } });
      const result = calculateSaddleHeight({ heightCm: height });
      expect(screen.getByRole("status", { name: homeSaddleWidget.en.title }).textContent).toBe(`${result.adviceMm} mm · ±${result.halfWidthMm} mm`);
      expect(screen.getByRole("img").getAttribute("aria-label")).toBe(`Saddle height ${result.adviceMm} mm, range ${result.lowerMm} to ${result.upperMm} mm`);
    }
    expect(writeHandoffEntry).not.toHaveBeenCalled();
    expect(trackUsed).toHaveBeenCalledTimes(91);
  });

  it("writes only chosen height on refinement and exposes a body-data-free callback", () => {
    const onUsed = vi.fn();
    render(<SaddleHeightTeaser locale="nl" onUsed={onUsed} />);
    fireEvent.change(screen.getByRole("slider", { name: "Lengte" }), { target: { value: "190" } });
    expect(onUsed).toHaveBeenCalledExactlyOnceWith();
    const link = screen.getByRole("link", { name: homeSaddleWidget.nl.refine });
    link.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(link);
    expect(writeHandoffEntry).toHaveBeenCalledExactlyOnceWith({ field: "heightCm", value: 190, unit: "cm", method: "declared", calculator: "saddle-height", touchedAt: expect.any(Number) });
    expect(onUsed).toHaveBeenCalledTimes(2);
    expect(trackUsed).toHaveBeenCalledTimes(2);
    expect(Object.keys(homeSaddleWidget.en)).toEqual(Object.keys(homeSaddleWidget.nl));
  });
});
