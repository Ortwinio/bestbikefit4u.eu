// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import en from "@/i18n/messages/en";
import nl from "@/i18n/messages/nl";
import { reliabilityPressureMessages } from "@/i18n/calculators/reliabilityPressure";
import { journeyMessages } from "@/i18n/calculators/journey";
import { tirePressureMessages } from "@/i18n/calculators/tirePressure";
import { calculateBasicPressure } from "@/lib/pressure-engine";
import { readHandoff, writeHandoffEntry, type HandoffEntry } from "@/lib/handoff/store";
import { PressureCalculatorForm } from "./PressureCalculatorForm";

afterEach(() => { cleanup(); sessionStorage.clear(); localStorage.clear(); });

const input = {
  discipline: "gravel", bodyWeightKg: 83, widthFrontMm: 40, widthRearMm: 42,
  surface: "hardpack_gravel", tubeType: "tubeless", bikeWeightKg: 11, ridingGoal: "comfort",
} as const;

describe.each(["en", "nl"] as const)("%s pressure reliability shell", (locale) => {
  const labels = { en, nl }[locale].pressure;
  const copy = tirePressureMessages[locale];
  const reliability = reliabilityPressureMessages[locale];

  it("renders two steps, one next step, honest uncertainty and manufacturer limits", () => {
    const { container } = render(<PressureCalculatorForm locale={locale}
      labels={labels.form} resultLabels={labels.result} initialValues={input} />);
    expect(container.querySelectorAll("[data-reliability-step]")).toHaveLength(2);
    expect(container.querySelectorAll("[data-reliability-next-step]")).toHaveLength(1);
    expect(screen.getByText(copy.steps[0])).toBeTruthy();
    expect(screen.getByText(reliability.uncertainty)).toBeTruthy();
    expect(screen.getByText(copy.limit)).toBeTruthy();
    expect(screen.getByText(copy.excluded)).toBeTruthy();
    expect(screen.getByText(journeyMessages[locale].reasons["tire-pressure"].text)).toBeTruthy();
    expect(screen.queryByRole("meter")).toBeNull();
    expect(screen.queryByText(copy.scale)).toBeNull();
    expect(screen.getByRole("link", { name: journeyMessages[locale].reasons["tire-pressure"].cta }).getAttribute("href"))
      .toContain("tire-pressure");
    const result = calculateBasicPressure(input);
    const number = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const summary = screen.getByRole("status", { name: copy.summary });
    expect(summary.textContent).toContain(`${number.format(result.frontBar)} bar`);
    expect(summary.textContent).toContain(`${number.format(result.rearBar)} bar`);
    expect(readHandoff().entries).toHaveLength(0);
  });

  it("labels untouched pressure defaults and removes the example after a deliberate edit", () => {
    const { container } = render(<PressureCalculatorForm locale={locale}
      labels={labels.form} resultLabels={labels.result} />);
    expect(container.querySelector('[data-usability="example"]')?.textContent).toContain("75 kg");
    expect(container.querySelector('[data-example-field="bodyWeightKg"]')).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("slider", { name: labels.form.bodyWeightLabel }), { key: "ArrowRight" });
    expect(container.querySelector('[data-usability="example"]')).toBeNull();
    expect(container.querySelector('[data-example-field="bodyWeightKg"]')).toBeNull();
    expect(container.querySelector('[data-example-field="widthFrontMm"]')).toBeTruthy();
  });

  it("reuses every compatible handoff field without writing defaults or prefill", () => {
    const entries: Array<Pick<HandoffEntry, "field" | "value" | "unit">> = [
      { field: "bikeCategory", value: input.discipline, unit: "none" },
      { field: "weightKg", value: input.bodyWeightKg, unit: "kg" },
      { field: "tireWidthFrontMm", value: input.widthFrontMm, unit: "mm" },
      { field: "tireWidthRearMm", value: input.widthRearMm, unit: "mm" },
      { field: "surface", value: input.surface, unit: "none" },
      { field: "rimType", value: "hookless", unit: "none" },
      { field: "bikeWeightKg", value: input.bikeWeightKg, unit: "kg" },
      { field: "ridingGoal", value: input.ridingGoal, unit: "none" },
    ];
    for (const entry of entries) writeHandoffEntry({ ...entry, calculator: "tire-pressure", method: "declared", touchedAt: Date.now() });
    const before = readHandoff();
    const { container } = render(<PressureCalculatorForm locale={locale} labels={labels.form} resultLabels={labels.result} />);
    expect(screen.getByRole("slider", { name: labels.form.bodyWeightLabel }).getAttribute("aria-valuenow")).toBe("83");
    expect(screen.getByRole("slider", { name: labels.form.widthFrontLabel }).getAttribute("aria-valuenow")).toBe("40");
    expect(screen.getByRole("slider", { name: labels.form.widthRearLabel }).getAttribute("aria-valuenow")).toBe("42");
    expect(screen.getByRole("slider", { name: labels.form.bikeWeightLabel }).getAttribute("aria-valuenow")).toBe("11");
    expect(screen.getByRole("region", { name: copy.result })).toBeTruthy();
    expect(readHandoff()).toEqual(before);
    expect(container.querySelector('[data-usability="example"]')).toBeNull();
    expect(container.querySelector('[data-example-field="bodyWeightKg"]')).toBeNull();
    fireEvent.keyDown(screen.getByRole("slider", { name: labels.form.bikeWeightLabel }), { key: "End" });
    expect(readHandoff().entries.find(entry => entry.field === "bikeWeightKg")?.value).toBe(20);
    expect(readHandoff().entries).toHaveLength(entries.length);
  });

  it("keeps account gauges, slots, three steps and change/commit behavior", () => {
    const onValuesChange = vi.fn();
    const onValuesCommit = vi.fn();
    const { container } = render(<PressureCalculatorForm locale={locale} accountMode initialValues={input}
      labels={labels.form} resultLabels={labels.result} onValuesChange={onValuesChange}
      onValuesCommit={onValuesCommit} headerSlot={<p>Header slot</p>} statusSlot={<p>Status slot</p>} />);
    expect(container.querySelector("[data-reliability-calculator]")).toBeNull();
    for (const title of [copy.body, copy.tires, copy.route]) expect(screen.getByRole("heading", { name: title })).toBeTruthy();
    expect(container.querySelectorAll("[data-component=PressureDisplay] .pressure-wheel")).toHaveLength(2);
    expect(screen.getByText(copy.scale)).toBeTruthy();
    expect(container.querySelector('[data-usability="safety"]')?.textContent).toContain(copy.limit);
    expect(screen.getByText("Header slot")).toBeTruthy();
    expect(screen.getByText("Status slot")).toBeTruthy();
    expect(screen.queryByText(reliability.uncertainty)).toBeNull();
    expect(onValuesChange).not.toHaveBeenCalled();
    expect(onValuesCommit).not.toHaveBeenCalled();
    const weight = screen.getByRole("slider", { name: labels.form.bodyWeightLabel });
    fireEvent.keyDown(weight, { key: "ArrowRight" });
    fireEvent.keyUp(weight, { key: "ArrowRight" });
    expect(onValuesChange).toHaveBeenLastCalledWith({ ...input, bodyWeightKg: 84 });
    expect(onValuesCommit).toHaveBeenLastCalledWith({ ...input, bodyWeightKg: 84 });
    expect(readHandoff().entries).toHaveLength(0);
  });
});
