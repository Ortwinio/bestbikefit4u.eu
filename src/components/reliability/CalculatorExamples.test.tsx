/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PublicBodyReliabilityCalculator } from "./PublicBodyReliabilityCalculator";
import { PublicPerformanceCalculator } from "@/app/(public)/calculators/power-speed/PublicPerformanceCalculator";
import { PublicSaddleHeightCalculator } from "@/app/(public)/calculators/saddle-height/PublicSaddleHeightCalculator";
import { calculatorExamples } from "@/i18n/calculators/examples";
import { CalculatorDataContext } from "@/lib/calculatorData/context";
import { readHandoff, writeHandoffEntry, type HandoffEntry } from "@/lib/handoff/store";

afterEach(() => { cleanup(); sessionStorage.clear(); localStorage.clear(); });

describe.each(["nl", "en"] as const)("%s example lifecycle", locale => {
  const forms = [
    ["saddle-height", <PublicSaddleHeightCalculator key="saddle-height" isNl={locale === "nl"} />],
    ...(["bike-fit", "frame-size", "crank-length", "saddle-width"] as const).map(calculator =>
      [calculator, <PublicBodyReliabilityCalculator key={calculator} calculator={calculator} locale={locale} />] as const),
    ...(["power-speed", "climb-planner", "ftp-wkg", "gearing", "fuel-hydration"] as const).map(tool =>
      [tool, <PublicPerformanceCalculator key={tool} tool={tool} locale={locale} />] as const),
  ] as const;

  it.each(forms)("%s clears each default only on intentional edits", (_name, form) => {
    const { container } = render(form);
    const examples = () => container.querySelectorAll('[data-usability="example-label"]');
    expect(examples().length).toBeGreaterThan(0);
    expect(examples()[0].textContent).toBe(calculatorExamples[locale].label);
    expect(container.querySelector("[data-calculator-example]")?.textContent).toMatch(locale === "nl" ? /Voorbeeld/ : /Example/);
    expect(readHandoff().entries).toEqual([]);
    const first = screen.getAllByRole("slider")[0];
    fireEvent.focus(first);
    expect(readHandoff().entries).toEqual([]);
    expect(examples().length).toBeGreaterThan(0);
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(container.querySelector('[data-usability="example"]')).toBeNull();
    for (const slider of screen.getAllByRole("slider")) {
      fireEvent.keyDown(slider, { key: "ArrowRight" });
    }
    expect(examples()).toHaveLength(0);
    expect(container.querySelector("[data-calculator-example]")).toBeNull();
  });

  it.each(["session", "profile"] as const)("never labels %s prefills as examples, including values equal to defaults", source => {
    const entries: HandoffEntry[] = [
      { field: "heightCm", value: 190, unit: "cm", calculator: "saddle-height", method: "declared", touchedAt: Date.now() },
      { field: "weightKg", value: 75, unit: "kg", calculator: "saddle-width", method: "measured", touchedAt: Date.now() },
      { field: "ftpWatts", value: 225, unit: "W", calculator: "climb-planner", method: "measured", touchedAt: Date.now() },
    ];
    if (source === "session") entries.forEach(entry => writeHandoffEntry(entry));
    const before = readHandoff();
    const save = vi.fn();
    const { container } = render(<CalculatorDataContext.Provider value={{ source, ready: true,
      identity: "example-fixture", entries, save, remove: vi.fn() }}>
      <PublicBodyReliabilityCalculator calculator="frame-size" locale={locale} />
      <PublicSaddleHeightCalculator isNl={locale === "nl"} />
      <PublicPerformanceCalculator tool="ftp-wkg" locale={locale} />
    </CalculatorDataContext.Provider>);
    expect(container.querySelectorAll('[data-usability="example-label"]')).toHaveLength(0);
    expect(container.querySelectorAll("[data-calculator-example]")).toHaveLength(0);
    expect(readHandoff()).toEqual(before);
    expect(save).not.toHaveBeenCalled();
  });

  it("keeps other defaults marked after one field is edited", () => {
    const { container } = render(<PublicPerformanceCalculator tool="climb-planner" locale={locale} />);
    const count = container.querySelectorAll('[data-usability="example-label"]').length;
    fireEvent.keyDown(screen.getAllByRole("slider")[0], { key: "ArrowRight" });
    expect(container.querySelectorAll('[data-usability="example-label"]')).toHaveLength(count - 1);
    expect(container.querySelector('[data-example-field="distanceKm"]')).toBeNull();
    expect(container.querySelector('[data-usability="example"]')).toBeNull();
  });

  it.each(["ftp-wkg", "fuel-hydration"] as const)("%s does not repeat an account CTA after completed inputs", tool => {
    const { container } = render(<PublicPerformanceCalculator tool={tool} locale={locale} />);
    for (const slider of screen.getAllByRole("slider")) fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(container.querySelector('[data-reliability-next-step]')).toBeNull();
    expect(container.querySelectorAll('[data-usability="account-reason"]')).toHaveLength(1);
    expect(container.querySelector('[data-usability="next-step"] a')).not.toBeNull();
  });

  it("hides the result notice with partial reuse while retaining untouched badges", () => {
    writeHandoffEntry({ field: "weightKg", value: 75, unit: "kg", calculator: "saddle-width",
      method: "measured", touchedAt: Date.now() });
    const { container } = render(<PublicPerformanceCalculator tool="climb-planner" locale={locale} />);
    expect(container.querySelector('[data-usability="example"]')).toBeNull();
    expect(container.querySelector('[data-example-field="weightKg"]')).toBeNull();
    expect(container.querySelectorAll('[data-usability="example-label"]')).toHaveLength(3);
    expect(readHandoff().entries).toHaveLength(1);
  });
});
