/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { calculateSaddleHeight } from "../../../shared/reliability/saddleHeight";
import { homeSaddleWidget } from "@/i18n/marketing/homeSaddleWidget";
import { readHandoff, writeHandoffEntry } from "@/lib/handoff/store";
import { CalculatorDataContext } from "@/lib/calculatorData/context";
import { hasFreshHomeSaddleStart } from "@/lib/handoff/homeStart";
import { SaddleHeightTeaser } from "./SaddleHeightTeaser";

const { trackUsed } = vi.hoisted(() => ({ trackUsed: vi.fn() }));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({ useMarketingEventLogger: () => vi.fn() }));
vi.mock("@/lib/analytics/useHomeSaddleWidgetAnalytics", () => ({
  useHomeSaddleWidgetAnalytics: () => ({ trackHomeSaddleWidgetUsed: trackUsed }),
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); });
beforeEach(() => { sessionStorage.clear(); localStorage.clear(); });

describe("home saddle-height widget", () => {
  it.each(["nl", "en"] as const)("renders the shared default estimate and localized %s refinement", (locale) => {
    render(<SaddleHeightTeaser locale={locale} />);
    const copy = homeSaddleWidget[locale];
    expect(screen.getByRole("slider", { name: copy.height }).getAttribute("aria-valuenow")).toBe("175");
    expect(screen.getByRole("status", { name: copy.title }).textContent).toBe("726 mm · ±45 mm");
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("680");
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("770");
    expect(screen.getByRole("link", { name: copy.refine }).getAttribute("href")).toBe(`/${locale}/calculators/saddle-height#inseam`);
    expect(readHandoff().entries).toEqual([]);
    expect(trackUsed).not.toHaveBeenCalled();
  });

  it("updates advice, uncertainty and range and saves each actual height edit", () => {
    render(<SaddleHeightTeaser locale="en" />);
    const slider = screen.getByRole("slider", { name: "Height" });
    for (let height = 130; height <= 220; height += 1) {
      fireEvent.change(slider, { target: { value: String(height) } });
      const result = calculateSaddleHeight({ heightCm: height });
      expect(screen.getByRole("status", { name: homeSaddleWidget.en.title }).textContent).toBe(`${result.adviceMm} mm · ±${result.halfWidthMm} mm`);
      expect(screen.getByRole("img").getAttribute("aria-label")).toBe(`Saddle height ${result.adviceMm} mm, range ${result.lowerMm} to ${result.upperMm} mm`);
      expect(readHandoff().entries[0]?.value).toBe(height);
    }
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
    expect(readHandoff().entries).toEqual([{ field: "heightCm", value: 190, unit: "cm", method: "declared", calculator: "saddle-height", touchedAt: expect.any(Number) }]);
    expect(hasFreshHomeSaddleStart()).toBe(true);
    expect(onUsed).toHaveBeenCalledTimes(2);
    expect(trackUsed).toHaveBeenCalledTimes(2);
    expect(Object.keys(homeSaddleWidget.en)).toEqual(Object.keys(homeSaddleWidget.nl));
  });

  it("prefills a same-calculator session height without replacing measured provenance", () => {
    const entry = { field: "heightCm", value: 181, unit: "cm", method: "measured", calculator: "saddle-height", touchedAt: Date.now() } as const;
    writeHandoffEntry(entry);
    render(<SaddleHeightTeaser locale="nl" />);
    expect(screen.getByRole("slider").getAttribute("aria-valuenow")).toBe("181");
    expect(screen.getByText(/Uit je eerdere invoer/)).toBeTruthy();
    const link = screen.getByRole("link");
    link.addEventListener("click", event => event.preventDefault());
    fireEvent.click(link);
    expect(readHandoff().entries).toEqual([entry]);
    expect(hasFreshHomeSaddleStart()).toBe(true);
  });

  it("prefills profile height and routes edits to profile persistence, not session storage", () => {
    const save = vi.fn();
    render(<CalculatorDataContext.Provider value={{ source: "profile", ready: true, identity: "rider",
      entries: [{ field: "heightCm", value: 183, unit: "cm", method: "measured", calculator: "frame-size", touchedAt: Date.now() }],
      save, remove: vi.fn(),
    }}><SaddleHeightTeaser locale="en" /></CalculatorDataContext.Provider>);
    expect(screen.getByRole("slider").getAttribute("aria-valuenow")).toBe("183");
    expect(screen.getByText(/From your profile/)).toBeTruthy();
    expect(save).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("slider"), { target: { value: "185" } });
    expect(save).toHaveBeenCalledExactlyOnceWith({ field: "heightCm", value: 185, unit: "cm", method: "declared", calculator: "saddle-height", touchedAt: expect.any(Number) }, undefined);
    expect(readHandoff().entries).toEqual([]);
  });

  it("stores the default only when explicitly confirmed", () => {
    render(<SaddleHeightTeaser locale="en" />);
    expect(readHandoff().entries).toEqual([]);
    const link = screen.getByRole("link");
    link.addEventListener("click", event => event.preventDefault());
    fireEvent.click(link);
    expect(readHandoff().entries[0]?.value).toBe(175);
  });
});
