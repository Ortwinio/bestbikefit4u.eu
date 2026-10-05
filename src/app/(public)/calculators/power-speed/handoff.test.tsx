// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PerformanceCalculator } from "./PerformanceCalculator";
import { GearingCalculatorForm } from "../gearing/GearingCalculatorForm";
import { PressureCalculatorForm } from "@/components/features/pressure/PressureCalculatorForm";
import { readHandoff } from "@/lib/handoff/store";
import nl from "@/i18n/messages/nl";
import en from "@/i18n/messages/en";

afterEach(() => { cleanup(); sessionStorage.clear(); });

describe("performance, pressure and gearing session handoff", () => {
  for (const locale of ["nl", "en"] as const) {
    for (const tool of ["power-speed", "climb-planner", "ftp-wkg", "fuel-hydration"] as const) {
      it(`has one value-free handoff CTA for ${tool} in ${locale}`, () => {
        const { container } = render(<PerformanceCalculator tool={tool} locale={locale} />);
        const links = [...container.querySelectorAll("a")].map((link) => link.getAttribute("href"))
          .filter((href) => href?.includes("handoff=1"));
        expect(links).toEqual([`/${locale}/login?src=${tool}&handoff=1`]);
        expect(container.querySelector(`#${tool}-result`)).toBeTruthy();
      });
    }
    it(`has a handoff block on gearing and pressure in ${locale}`, () => {
      const gearing = render(<GearingCalculatorForm isNl={locale === "nl"} />);
      expect([...gearing.container.querySelectorAll("a")].map((link) => link.getAttribute("href"))
        .filter((href) => href?.includes("handoff=1"))).toEqual([`/${locale}/login?src=gearing&handoff=1`]);
      gearing.unmount();
      const dictionary = locale === "nl" ? nl : en;
      const pressure = render(<PressureCalculatorForm locale={locale}
        labels={dictionary.pressure.form} resultLabels={dictionary.pressure.result} />);
      expect([...pressure.container.querySelectorAll("a")].map((link) => link.getAttribute("href"))
        .filter((href) => href?.includes("handoff=1"))).toEqual([`/${locale}/login?src=tire-pressure&handoff=1`]);
    });
  }

  it("does not store defaults or raw test power as a measured FTP", () => {
    render(<PerformanceCalculator tool="ftp-wkg" locale="en" />);
    expect(readHandoff().entries).toEqual([]);
    fireEvent.click(screen.getByRole("button", { name: "20 minutes" }));
    const slider = screen.getAllByRole("slider")[0];
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(readHandoff().entries.find((entry) => entry.field === "twentyMinuteWatts")?.value).toBe(295);
    expect(readHandoff().entries.find((entry) => entry.field === "ftpWatts")).toMatchObject({ value: 280.25, method: "estimated" });
  });

  it("retains an entered FTP when switching protocols without saving untouched test defaults", () => {
    render(<PerformanceCalculator tool="ftp-wkg" locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Known FTP" }));
    fireEvent.keyDown(screen.getByRole("slider", { name: "Your FTP" }), { key: "ArrowRight" });
    expect(readHandoff().entries.some((entry) => entry.field === "ftpWatts")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Ramp test" }));
    expect(readHandoff().entries.some((entry) => entry.field === "rampWatts")).toBe(false);
    fireEvent.keyDown(screen.getAllByRole("slider")[0], { key: "ArrowRight" });
    expect(readHandoff().entries.find((entry) => entry.field === "rampWatts")?.value).toBe(365);
    expect(readHandoff().entries.find((entry) => entry.field === "ftpWatts")).toMatchObject({ value: 230, method: "declared" });
  });

  it("prefills touched weight on the next calculator without changing its provenance", () => {
    const first = render(<PerformanceCalculator tool="power-speed" locale="en" />);
    fireEvent.keyDown(screen.getByRole("slider", { name: "Your weight" }), { key: "ArrowRight" });
    const before = readHandoff();
    expect(before.entries.map((entry) => entry.field)).toEqual(["weightKg"]);
    first.unmount();
    render(<PressureCalculatorForm locale="en" labels={en.pressure.form} resultLabels={en.pressure.result} />);
    expect(screen.getByRole("slider", { name: en.pressure.form.bodyWeightLabel })
      .getAttribute("aria-valuenow")).toBe("75.5");
    expect(readHandoff()).toEqual(before);
  });

  it("carries only explicitly edited cassette teeth, never untouched chainrings", () => {
    render(<GearingCalculatorForm isNl={false} />);
    expect(readHandoff().entries).toEqual([]);
    fireEvent.keyDown(screen.getByRole("slider", { name: "Largest sprocket" }), { key: "End" });
    expect(readHandoff().entries.map(({ field, value, method }) => ({ field, value, method }))).toEqual([
      { field: "cassetteLargestCogTeeth", value: 52, method: "bike" },
    ]);
  });

  it("records the easiest chainring without inventing a second chainring", () => {
    render(<GearingCalculatorForm isNl={false} />);
    fireEvent.keyDown(screen.getByRole("slider", { name: "Smallest chainring" }), { key: "ArrowRight" });
    expect(readHandoff().entries).toEqual([expect.objectContaining({ field: "innerChainringTeeth", value: 35, method: "bike" })]);
  });

  it("stores a rim only after an explicit optional selection without changing the result", () => {
    render(<PressureCalculatorForm locale="en" labels={en.pressure.form} resultLabels={en.pressure.result} />);
    const initial = screen.getByRole("status", { name: "Pressure recommendation" }).textContent;
    expect(readHandoff().entries).toEqual([]);
    fireEvent.click(screen.getByRole("button", { name: "Hookless" }));
    expect(readHandoff().entries).toEqual([expect.objectContaining({ field: "rimType", value: "hookless", method: "bike" })]);
    expect(screen.getByRole("status", { name: "Pressure recommendation" }).textContent).toBe(initial);
  });

  it("does not store unrelated pressure defaults after a weight edit", () => {
    render(<PressureCalculatorForm locale="en" labels={en.pressure.form} resultLabels={en.pressure.result} />);
    fireEvent.keyDown(screen.getByRole("slider", { name: en.pressure.form.bodyWeightLabel }), { key: "ArrowRight" });
    expect(readHandoff().entries.map((entry) => entry.field)).toEqual(["weightKg"]);
  });

  it("keeps account calculator edits out of the public handoff", () => {
    render(<PerformanceCalculator tool="climb-planner" locale="en" account />);
    fireEvent.keyDown(screen.getByRole("slider", { name: "Your FTP" }), { key: "ArrowRight" });
    expect(readHandoff().entries).toEqual([]);
    expect(screen.queryByRole("link", { name: /free account/i })).toBeNull();
  });
});
