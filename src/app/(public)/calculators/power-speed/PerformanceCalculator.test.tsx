// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PerformanceCalculator } from "./PerformanceCalculator";
import { FtpRatings, FuelHeadline } from "./SourcedResults";
import { performanceMessages } from "@/i18n/calculators/performance";
import { carbohydrateGuidance } from "@/lib/public-calculators/performance";
import { gearingMessages } from "@/i18n/calculators/gearing";
import { performanceDefaults } from "@/lib/calculators/accountState";
import { ftpSliderStartCopy } from "@/i18n/calculators/ftpSliderStart";
import { readHandoff, writeHandoffEntry } from "@/lib/handoff/store";

afterEach(() => { cleanup(); sessionStorage.clear(); });
function keys(value: object, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, item]) =>
    typeof item === "object" ? keys(item, `${prefix}${key}.`) : `${prefix}${key}`,
  );
}
describe("performance calculator interactions", () => {
  it.each(["en", "nl"] as const)("keeps the %s starter UI-only until confirmation", (locale) => {
    const onValuesChange = vi.fn();
    render(<PerformanceCalculator tool="ftp-wkg" locale={locale} account
      riderProfile={{ sex: "female", weightKg: 70 }} ftpKnown={false}
      onValuesChange={onValuesChange} />);
    const copy = ftpSliderStartCopy[locale];
    expect(screen.getByRole("slider", { name: performanceMessages[locale].ftp })
      .getAttribute("aria-valuenow")).toBe("135");
    expect(screen.getByText(copy.hint)).toBeTruthy();
    expect(screen.getByText(copy.pending)).toBeTruthy();
    expect(screen.queryByTestId("rating-men")).toBeNull();
    expect(document.getElementById("ftp-wkg-result")?.querySelector("dd")).toBeNull();
    expect(onValuesChange).not.toHaveBeenCalled();
    expect(readHandoff().entries).toEqual([]);
    fireEvent.click(screen.getByRole("button", { name: copy.confirm }));
    expect(onValuesChange).toHaveBeenCalledOnce();
    expect(onValuesChange.mock.calls[0][0].values.ftp).toBe(135);
    expect(screen.queryByText(copy.pending)).toBeNull();
    expect(screen.getByTestId("rating-men")).toBeTruthy();
    expect(readHandoff().entries).toEqual([]);
  });

  it("keeps a pending climb starter out of unrelated edits and accepts slider movement", () => {
    const onValuesChange = vi.fn();
    render(<PerformanceCalculator tool="climb-planner" locale="en" account
      riderProfile={{ sex: "male", weightKg: 70 }} ftpKnown={false}
      onValuesChange={onValuesChange} />);
    const slider = screen.getByRole("slider", { name: "Your FTP" });
    expect(slider.getAttribute("aria-valuenow")).toBe("155");
    expect(screen.queryByTestId("climb-profile")).toBeNull();
    fireEvent.keyDown(screen.getByRole("slider", { name: "Climb length" }), { key: "ArrowRight" });
    expect(onValuesChange).not.toHaveBeenCalled();
    expect(screen.getByText(ftpSliderStartCopy.en.pending)).toBeTruthy();
    onValuesChange.mockClear();
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onValuesChange.mock.lastCall?.[0].values.ftp).toBe(160);
    expect(onValuesChange.mock.lastCall?.[0].values.distance).toBeGreaterThan(performanceDefaults.values.distance);
    expect(screen.getByTestId("climb-profile")).toBeTruthy();
  });

  it.each([false, true])("notifies unchanged-default confirmation once (other edits: %s)", (otherEdits) => {
    const onValuesChange = vi.fn();
    render(<PerformanceCalculator tool="climb-planner" locale="en" account
      initialValues={{ ...performanceDefaults, values: { ...performanceDefaults.values, riderMass: 90 } }}
      riderProfile={{ sex: "male", weightKg: 90 }}
      ftpKnown={false} onValuesChange={onValuesChange} />);
    expect(screen.getByRole("slider", { name: "Your FTP" }).getAttribute("aria-valuenow")).toBe("200");
    if (otherEdits) {
      fireEvent.keyDown(screen.getByRole("slider", { name: "Climb length" }), { key: "ArrowRight" });
    }
    expect(onValuesChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: ftpSliderStartCopy.en.confirm }));
    expect(onValuesChange).toHaveBeenCalledOnce();
    expect(onValuesChange.mock.lastCall?.[0].values.ftp).toBe(200);
    expect(onValuesChange.mock.lastCall?.[1]).toEqual(["ftpWatts"]);
    expect(onValuesChange.mock.lastCall?.[0].values.distance).toBe(
      performanceDefaults.values.distance + (otherEdits ? 0.5 : 0),
    );
    expect(screen.queryByText(ftpSliderStartCopy.en.pending)).toBeNull();
  });

  it("preserves explicit initial FTP even when it equals the old default", () => {
    const onValuesChange = vi.fn();
    render(<PerformanceCalculator tool="ftp-wkg" locale="en"
      initialValues={performanceDefaults} riderProfile={{ sex: "male", weightKg: 70 }}
      onValuesChange={onValuesChange} />);
    expect(screen.getByRole("slider", { name: "Your FTP" }).getAttribute("aria-valuenow")).toBe("200");
    expect(screen.queryByText(ftpSliderStartCopy.en.hint)).toBeNull();
    expect(onValuesChange).not.toHaveBeenCalled();
  });

  it("preserves remembered FTP without inferring sex from comparison tables", () => {
    writeHandoffEntry({ calculator: "climb-planner", field: "ftpWatts", value: 275,
      unit: "W", method: "declared", touchedAt: Date.now() });
    const before = readHandoff();
    render(<PerformanceCalculator tool="ftp-wkg" locale="en" />);
    expect(screen.getByRole("slider", { name: "Your FTP" }).getAttribute("aria-valuenow")).toBe("275");
    fireEvent.click(screen.getByRole("button", { name: "Women" }));
    expect(screen.queryByText(ftpSliderStartCopy.en.hint)).toBeNull();
    expect(readHandoff()).toEqual(before);
  });

  it.each(["power-speed", "fuel-hydration"] as const)("does not add FTP controls or starter inputs to %s", (tool) => {
    const onValuesChange = vi.fn();
    render(<PerformanceCalculator tool={tool} locale="en" account
      riderProfile={{ sex: "male", weightKg: 70 }} ftpKnown={false}
      onValuesChange={onValuesChange} />);
    expect(screen.queryByRole("slider", { name: "Your FTP" })).toBeNull();
    expect(screen.queryByText(ftpSliderStartCopy.en.hint)).toBeNull();
    expect(screen.queryByText(ftpSliderStartCopy.en.pending)).toBeNull();
    expect(onValuesChange).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getAllByRole("slider")[0], { key: "ArrowRight" });
    expect(onValuesChange.mock.lastCall?.[0].values.ftp).toBe(performanceDefaults.values.ftp);
  });

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
  it("shows sourced fuel bands, totals and bottle conversion without invented easy-ride values", () => {
    render(<PerformanceCalculator tool="fuel-hydration" locale="nl" />);
    fireEvent.keyDown(screen.getByRole("slider", { name: "Duur van je rit" }), { key: "End" });
    expect(screen.getByText("480 min")).toBeTruthy();
    expect(screen.getByTestId("carbohydrate-band").textContent).toBe("Tot 90 g/h");
    expect(screen.getAllByText(/Totaal voor je rit: tot 720 g/)).toHaveLength(2);
    expect(screen.getAllByText(performanceMessages.nl.multipleCarbs)).toHaveLength(2);
    expect(screen.getByText("0,4–0,8 L/h")).toBeTruthy();
    expect(screen.getByText(performanceMessages.nl.sodiumConcentration)).toBeTruthy();
    expect(screen.getByText("Bidons voor je rit: 6,4–12,8")).toBeTruthy();
    expect(screen.getByText("Natrium per bidon: 230–345 mg")).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("slider", { name: "Inhoud van je bidon" }), { key: "End" });
    expect(screen.getByText("Bidons voor je rit: 4,27–8,53")).toBeTruthy();
    expect(screen.getByText("Natrium per bidon: 345–517,5 mg")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Rustig" }));
    expect(screen.getByText(performanceMessages.nl.easyCarbs)).toBeTruthy();
    expect(screen.getByTestId("carbohydrate-band").textContent).toBe("Tot 90 g/h");
    expect(screen.getByRole("heading", { name: "Bronnen" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Jeukendrup/ }).getAttribute("rel")).toBe("noopener");
  });
  it.each(["nl", "en"] as const)("shows sodium concentration only above one hour in %s", (locale) => {
    render(<PerformanceCalculator tool="fuel-hydration" locale={locale} />);
    const copy = performanceMessages[locale];
    const duration = screen.getByRole("slider", { name: copy.duration });
    fireEvent.keyDown(duration, { key: "Home" });
    fireEvent.keyDown(duration, { key: "ArrowRight" });
    fireEvent.keyDown(duration, { key: "ArrowRight" });
    expect(duration.getAttribute("aria-valuenow")).toBe("1");
    expect(screen.queryByTestId("sodium-guidance")).toBeNull();
    fireEvent.keyDown(duration, { key: "ArrowRight" });
    expect(duration.getAttribute("aria-valuenow")).toBe("1.25");
    expect(screen.getByText(copy.sodiumConcentration)).toBeTruthy();
    expect(screen.getByText(copy.sodiumConversion)).toBeTruthy();
    expect(document.body.textContent).not.toContain("mg/h");
  });
  it("defaults to both FTP comparisons and lets riders select a table without inference", () => {
    render(<PerformanceCalculator tool="ftp-wkg" locale="en" />);
    expect(screen.getAllByText("· Your band")).toHaveLength(2);
    expect(screen.getByTestId("rating-men").textContent).toContain("Fair");
    expect(screen.getByTestId("rating-women").textContent).toContain("Good");
    fireEvent.click(screen.getByRole("button", { name: "Women" }));
    expect(screen.getAllByText("· Your band")).toHaveLength(1);
    expect(screen.getByTestId("rating-men").textContent).toBe("Men");
    expect(screen.getByTestId("rating-women").textContent).toContain("Good");
    expect(screen.getByText(performanceMessages.en.convention)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Allen H, Coggan A/ })).toBeTruthy();
  });
  it("explains the unrounded comparison near a displayed FTP boundary", () => {
    render(<FtpRatings locale="en" wattsPerKg={5.049} />);
    expect(screen.getByTestId("rating-men").textContent).toContain("Excellent");
    expect(screen.getByText(performanceMessages.en.ratingPrecision)).toBeTruthy();
  });
  it.each(["nl", "en"] as const)("leads with carbohydrate advice and fluid in %s", (locale) => {
    render(<PerformanceCalculator tool="fuel-hydration" locale={locale} />);
    const copy = performanceMessages[locale];
    const hero = document.getElementById("fuel-hydration-result")!;
    expect(hero.querySelector("dd")?.textContent).toBe(`${copy.upTo} 60${copy.carbsPerHour}`);
    expect(hero.textContent).toContain(`${copy.rideTotal}: ${copy.upTo.toLowerCase()} 120 g`);
    expect(hero.textContent).toContain(locale === "nl" ? "0,4–0,8 L/h" : "0.4–0.8 L/h");
    expect(hero.querySelector("dd")?.textContent).not.toContain(copy.hour === "uur" ? "2 uur" : "2 hours");
    fireEvent.keyDown(screen.getByRole("slider", { name: copy.duration }), { key: "Home" });
    expect(hero.querySelector("dd")?.textContent).toBe(copy.smallCarbs);
  });
  it.each(["nl", "en"] as const)("uses the no-carbohydrate headline below 30 minutes in %s", (locale) => {
    render(<FuelHeadline locale={locale} carbohydrate={carbohydrateGuidance(0.49)}
      durationHours={0.49} fluid={{ min: 0.4, max: 0.8 }} />);
    expect(document.querySelector("dd")?.textContent).toBe(performanceMessages[locale].noCarbs);
  });
  it("adds an FTP headline rating only after a table is chosen and updates it live", () => {
    render(<PerformanceCalculator tool="ftp-wkg" locale="en" />);
    const hero = document.getElementById("ftp-wkg-result")!;
    expect(hero.textContent).not.toContain("Good");
    expect(hero.textContent).not.toContain("Fair");
    fireEvent.click(screen.getByRole("button", { name: "Women" }));
    expect(hero.querySelector("dd")?.textContent).toContain("W/kg · Women · Good");
    fireEvent.keyDown(screen.getByRole("slider", { name: "Your FTP" }), { key: "End" });
    expect(hero.textContent).toContain("Superior");
    fireEvent.click(screen.getByRole("button", { name: "Both" }));
    expect(hero.textContent).not.toContain("Superior");
  });
  it("keeps matching keys in the directly loaded NL/EN calculator dictionaries", () => {
    expect(keys(performanceMessages.nl)).toEqual(keys(performanceMessages.en));
    expect(keys(gearingMessages.nl)).toEqual(keys(gearingMessages.en));
  });
});
