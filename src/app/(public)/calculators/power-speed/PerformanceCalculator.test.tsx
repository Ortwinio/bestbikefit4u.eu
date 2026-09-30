// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PerformanceCalculator } from "./PerformanceCalculator";
import { performanceMessages } from "@/i18n/calculators/performance";
import { gearingMessages } from "@/i18n/calculators/gearing";

afterEach(cleanup);
function keys(value: object, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, item]) =>
    typeof item === "object" ? keys(item, `${prefix}${key}.`) : `${prefix}${key}`,
  );
}
describe("performance calculator interactions", () => {
  it("updates power/speed live using accessible keyboard sliders in both modes", () => {
    render(<PerformanceCalculator tool="power-speed" locale="nl" />);
    expect(
      screen.getByRole("status", { name: /Geschatte snelheid|Benodigd vermogen|Vermogen per kilogram/ })
        .textContent,
    ).toContain("33,6 km/u");
    const power = screen.getByRole("slider", { name: "Vermogen" });
    fireEvent.keyDown(power, { key: "End" });
    expect(power.getAttribute("aria-valuetext")).toBe("600 W");
    expect(
      screen.getByRole("status", { name: /Geschatte snelheid|Benodigd vermogen|Vermogen per kilogram/ })
        .textContent,
    ).not.toContain("33,6 km/u");
    fireEvent.click(screen.getByRole("button", { name: "Snelheid → vermogen" }));
    const speed = screen.getByRole("slider", { name: "Snelheid" });
    fireEvent.keyDown(speed, { key: "Home" });
    expect(speed.getAttribute("aria-valuetext")).toBe("10 km/u");
    expect(
      screen.getByRole("status", { name: /Geschatte snelheid|Benodigd vermogen|Vermogen per kilogram/ })
        .textContent,
    ).toContain("Benodigd vermogen");
    expect(screen.queryByRole("spinbutton")).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
  });
  it("updates default bike mass and surface and preserves independent mode inputs", () => {
    render(<PerformanceCalculator tool="power-speed" locale="en" />);
    fireEvent.click(
      within(screen.getByRole("group", { name: "Bike type" })).getByRole("button", { name: "MTB" }),
    );
    expect(screen.getByRole("slider", { name: "Bike weight" }).getAttribute("aria-valuetext")).toBe(
      "12.5 kg",
    );
  });
  it("discloses the solver boundary for a high-power time-trial setup", () => {
    render(<PerformanceCalculator tool="power-speed" locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Time trial" }));
    fireEvent.keyDown(screen.getByRole("slider", { name: "Body weight" }), { key: "Home" });
    fireEvent.keyDown(screen.getByRole("slider", { name: "Power" }), { key: "End" });
    expect(screen.getByText(performanceMessages.en.capped)).toBeTruthy();
    expect(screen.getByRole("link", { name: /View result/ }).textContent).toContain("≥ 54");
  });

  it("changes the climbing profile and pacing when length and gradient change", () => {
    render(<PerformanceCalculator tool="climb-planner" locale="en" />);
    const initial = screen.getByTestId("climb-profile").getAttribute("d");
    fireEvent.keyDown(screen.getByRole("slider", { name: "Average gradient" }), { key: "End" });
    expect(screen.getByTestId("climb-profile").getAttribute("d")).not.toBe(initial);
    fireEvent.keyDown(screen.getByRole("slider", { name: "Climb length" }), { key: "End" });
    expect(screen.getByText("164")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Check your gearing" }).getAttribute("href")).toBe(
      "/en/calculators/gearing",
    );
  });
  it("handles FTP test modes and uses Dutch decimal formatting", () => {
    render(<PerformanceCalculator tool="ftp-wkg" locale="nl" />);
    fireEvent.click(screen.getByRole("button", { name: "Twintigminutentest" }));
    expect(screen.getByText("237,5")).toBeTruthy();
    expect(
      screen.getByRole("status", { name: /Geschatte snelheid|Benodigd vermogen|Vermogen per kilogram/ })
        .textContent,
    ).toContain("3,17 W/kg");
    fireEvent.click(screen.getByRole("button", { name: "Ramptest" }));
    expect(screen.getByText("240")).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("slider", { name: "Lichaamsgewicht" }), { key: "Home" });
    expect(
      screen.getByRole("status", { name: /Geschatte snelheid|Benodigd vermogen|Vermogen per kilogram/ })
        .textContent,
    ).toContain("6 W/kg");
  });
  it("shows only ride progress, never unsourced intake advice", () => {
    render(<PerformanceCalculator tool="fuel-hydration" locale="nl" />);
    fireEvent.keyDown(screen.getByRole("slider", { name: "Duur van je rit" }), { key: "End" });
    expect(screen.getByText("480 min")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Wedstrijd" }));
    expect(screen.getByRole("heading", { name: "Advies volgt" })).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/\d+\s*(g\/|ml\/|bidons)/);
    expect(screen.queryByRole("combobox")).toBeNull();
  });
  it("keeps matching keys in the directly loaded NL/EN calculator dictionaries", () => {
    expect(keys(performanceMessages.nl)).toEqual(keys(performanceMessages.en));
    expect(keys(gearingMessages.nl)).toEqual(keys(gearingMessages.en));
  });
});
