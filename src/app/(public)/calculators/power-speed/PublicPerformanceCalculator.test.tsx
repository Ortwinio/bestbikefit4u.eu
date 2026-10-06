// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PerformanceCalculator } from "./PerformanceCalculator";
import { GearingCalculatorForm } from "../gearing/GearingCalculatorForm";
import { reliabilityPerformance } from "@/i18n/calculators/reliabilityPerformance";
import { readHandoff, writeHandoffEntry } from "@/lib/handoff/store";
import { CalculatorDataContext } from "@/lib/calculatorData/context";

afterEach(() => { cleanup(); sessionStorage.clear(); localStorage.clear(); });

describe.each(["nl", "en"] as const)("%s public performance reliability", (locale) => {
  const copy = reliabilityPerformance[locale];
  it.each(["power-speed", "climb-planner", "ftp-wkg", "fuel-hydration", "gearing"] as const)(
    "%s renders two functional cards and one next step without saving examples", (tool) => {
      const { container } = render(tool === "gearing" ? <GearingCalculatorForm isNl={locale === "nl"} />
        : <PerformanceCalculator tool={tool} locale={locale} />);
      expect(container.querySelectorAll("[data-reliability-step]")).toHaveLength(2);
      expect(container.querySelectorAll("[data-reliability-next-step]")).toHaveLength(1);
      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
      expect(screen.getAllByRole("img").length).toBeGreaterThan(0);
      expect(container.querySelector("[data-calculator-example]")).toBeTruthy();
      expect(readHandoff().entries).toEqual([]);
      const initial = container.querySelector(`#${tool}-result`)?.textContent;
      fireEvent.keyDown(screen.getAllByRole("slider")[0], { key: tool === "fuel-hydration" ? "Home" : "End" });
      expect(container.querySelector(`#${tool}-result`)?.textContent).not.toBe(initial);
      expect(readHandoff().entries).toHaveLength(tool === "ftp-wkg" ? 3 : 1);
    },
  );

  it("keeps FTP test uncertainty visible and waits for weight before showing W/kg", () => {
    render(<PerformanceCalculator tool="ftp-wkg" locale={locale} />);
    expect(screen.getByText(copy.weightNeeded)).toBeTruthy();
    const first = screen.getAllByRole("img")[0].getAttribute("aria-label");
    fireEvent.click(screen.getByRole("button", { name: copy.methods.ramp }));
    expect(screen.getAllByRole("img")[0].getAttribute("aria-label")).not.toBe(first);
    fireEvent.click(screen.getByRole("button", { name: copy.confirm }));
    expect(screen.queryByText(copy.weightNeeded)).toBeNull();
    expect(screen.getAllByRole("img")).toHaveLength(2);
    expect(readHandoff().entries.some((entry) => entry.field === "weightKg")).toBe(true);
    expect(readHandoff().entries.some((entry) => entry.field === "rampWatts")).toBe(false);
  });

  it("uses effort and temperature for fluid loss while carbs remain a guideline", () => {
    const { container } = render(<PerformanceCalculator tool="fuel-hydration" locale={locale} />);
    const result = () => container.querySelector("#fuel-hydration-result")?.textContent;
    const initial = result();
    fireEvent.click(screen.getByRole("button", { name: copy.efforts.race }));
    expect(result()).not.toBe(initial);
    const effortResult = result();
    fireEvent.keyDown(screen.getByRole("slider", { name: copy.temperature }), { key: "End" });
    expect(result()).not.toBe(effortResult);
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.getByText(copy.guideline)).toBeTruthy();
    expect(screen.getByText(copy.fuelTool.safety)).toBeTruthy();
  });

  it("moves the next-step focus to an unentered input and keeps it editable", () => {
    render(<PerformanceCalculator tool="climb-planner" locale={locale} />);
    fireEvent.click(screen.getByRole("button", { name: copy.climbTool.next }));
    expect(document.activeElement).toBe(screen.getByRole("slider", { name: copy.ftp }));
    fireEvent.keyDown(screen.getByRole("slider", { name: copy.ftp }), { key: "ArrowRight" });
    fireEvent.click(screen.getByRole("button", { name: copy.climbTool.next }));
    expect(document.activeElement).toBe(screen.getByRole("slider", { name: copy.weight }));
  });

  it("keeps required power separate from speed uncertainty when reversing the tool", () => {
    render(<PerformanceCalculator tool="power-speed" locale={locale} />);
    fireEvent.click(screen.getByRole("button", { name: copy.speedMode }));
    expect(screen.getByRole("slider", { name: copy.speed })).toBeTruthy();
    expect(screen.queryByRole("slider", { name: copy.power })).toBeNull();
    expect(screen.getByText(copy.speedTool.reverseResult)).toBeTruthy();
    expect(screen.getByText(copy.speedTool.safety)).toBeTruthy();
  });

  it("reuses measured weight and known FTP without changing their provenance", () => {
    writeHandoffEntry({ field: "weightKg", value: 85, unit: "kg", calculator: "saddle-width", method: "measured", touchedAt: Date.now() });
    writeHandoffEntry({ field: "ftpWatts", value: 280, unit: "W", calculator: "climb-planner", method: "measured", touchedAt: Date.now() });
    const before = readHandoff();
    render(<PerformanceCalculator tool="ftp-wkg" locale={locale} />);
    expect(screen.getByRole("slider", { name: copy.ftp }).getAttribute("aria-valuenow")).toBe("280");
    expect(screen.getByRole("slider", { name: copy.weight }).getAttribute("aria-valuenow")).toBe("85");
    expect(screen.getByRole("button", { name: copy.methods.known }).getAttribute("aria-pressed")).toBe("true");
    expect(readHandoff()).toEqual(before);
    expect(screen.getAllByRole("status").some((element) => /gewicht|weight/i.test(element.textContent ?? ""))).toBe(true);
  });

  it("uses profile data and keeps declared inputs at public uncertainty", () => {
    const save = vi.fn();
    const { container } = render(<CalculatorDataContext.Provider value={{ source: "profile", ready: true, identity: "fixture-rider",
      entries: [
        { field: "weightKg", value: 85, unit: "kg", calculator: "climb-planner", method: "declared", touchedAt: Date.now() },
        { field: "ftpWatts", value: 280, unit: "W", calculator: "climb-planner", method: "declared", touchedAt: Date.now() },
      ], save, remove: vi.fn() }}><GearingCalculatorForm isNl={locale === "nl"} /></CalculatorDataContext.Provider>);
    expect(screen.getByRole("slider", { name: copy.weight }).getAttribute("aria-valuenow")).toBe("85");
    expect(container.querySelector('[data-reliability-result="cadence"]')?.textContent).toContain("±8");
    expect(container.querySelector("#gearing-result")?.textContent).toContain("280 W");
    expect(save).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole("slider", { name: copy.weight }), { key: "ArrowRight" });
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ field: "weightKg", value: 85.5, method: "declared" }), undefined);
    expect(readHandoff().entries).toEqual([]);
  });
});
