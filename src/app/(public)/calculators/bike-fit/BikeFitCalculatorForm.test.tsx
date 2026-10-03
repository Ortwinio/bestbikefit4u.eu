/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { runBikeFitCalculation } from "@/lib/public-calculators/fitAdapters";
import {
  createPublicFitBaseline,
  derivePublicCalculatorConfidence,
  PUBLIC_FIT_REQUIREMENTS,
  validatePublicFitBaseline,
} from "@/lib/publicCalculatorLogic";
import { bikeFitMessages } from "@/i18n/calculators/bikeFit";
import { BikeFitCalculatorForm } from "./BikeFitCalculatorForm";

afterEach(cleanup);
const en = bikeFitMessages.en;
const defaults = {
  heightCm: 180,
  inseamCm: 84,
  category: "road" as const,
  ridingGoal: "balanced" as const,
  flexibility: 3 as const,
  coreStability: 3 as const,
  inseamSource: "measured" as const,
};

function output(label: string) {
  const scope = screen.getByRole("region", { name: en.resultsLabel });
  return within(scope).getByText(label).closest("dl")?.querySelector("dd")?.textContent;
}

function confirm() {
  fireEvent.click(screen.getByRole("radio", { name: en.sources.measured }));
}

describe("BikeFitCalculatorForm", () => {
  it("keeps initial measures illustrative until explicitly confirmed, with accessible numeric sliders", () => {
    render(<BikeFitCalculatorForm isNl={false} />);
    expect(screen.getByRole("heading", { level: 1, name: en.title })).toBeTruthy();
    expect(screen.getAllByText(en.example).length).toBeGreaterThan(0);
    expect(screen.queryByText(en.confidence.high)).toBeNull();
    expect(screen.queryByRole("spinbutton")).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.getByRole("radiogroup", { name: en.goal })).toBeTruthy();
    expect(screen.getByRole("slider", { name: en.flexibility })).toBeTruthy();
    expect(screen.getByRole("slider", { name: en.core })).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("slider", { name: en.inseam }), { key: "ArrowRight" });
    expect(screen.getByRole("slider", { name: en.inseam }).getAttribute("aria-valuetext")).toBe(
      "84.5 cm",
    );
    expect(screen.queryByText(en.confidence.high)).toBeNull();
    confirm();
    const result = runBikeFitCalculation({ ...defaults, inseamCm: 84.5 });
    expect(output(en.saddle)).toBe(`${result.fitResult.saddleHeightMm}mm`);
    expect(output(en.reach)).toBe(`${result.fitResult.saddleToBarReachMm}mm`);
    expect(screen.getByText(en.confidence.high)).toBeTruthy();
  });

  it("preserves actual signed city drop, frame bands and geometry direction", () => {
    render(<BikeFitCalculatorForm isNl={false} />);
    confirm();
    fireEvent.click(screen.getByRole("radio", { name: en.categories.city }));
    const result = runBikeFitCalculation({ ...defaults, category: "city" });
    expect(result.fitResult.barDropMm).toBeLessThan(0);
    expect(output(en.drop)).toBe(`${result.fitResult.barDropMm}mm`);
    expect(output(en.frameSize)).toBe(result.quickEstimate.estimatedFrameSize);
    expect(screen.getByText(en.barsAbove)).toBeTruthy();
    const marker = screen
      .getByRole("img", { name: en.visualAlt })
      .querySelector("[data-drop-marker]");
    expect(Number(marker?.getAttribute("y2"))).toBeLessThan(Number(marker?.getAttribute("y1")));
    fireEvent.click(screen.getByRole("radio", { name: `${en.goals.aero} ${en.goalHints.aero}` }));
    expect(screen.getByText(en.aeroAdjusted)).toBeTruthy();
    const aero = runBikeFitCalculation({ ...defaults, category: "city", ridingGoal: "aero" });
    expect(output(en.saddle)).toBe(`${aero.fitResult.saddleHeightMm}mm`);
  });

  it("supports the complete engine ranges without silently changing other measurements", () => {
    render(<BikeFitCalculatorForm isNl={false} />);
    confirm();
    const height = screen.getByRole("slider", { name: en.height }) as HTMLInputElement;
    const inseam = screen.getByRole("slider", { name: en.inseam }) as HTMLInputElement;
    expect([height.min, height.max, height.step]).toEqual(["130", "210", "1"]);
    expect([inseam.min, inseam.max, inseam.step]).toEqual(["55", "105", "0.5"]);
    for (const [key, value] of [
      ["Home", 130],
      ["End", 210],
    ] as const) {
      fireEvent.keyDown(height, { key });
      expect(inseam.value).toBe("84");
      const expected = runBikeFitCalculation({ ...defaults, heightCm: value });
      expect(output(en.reach)).toBe(`${expected.fitResult.saddleToBarReachMm}mm`);
    }
    for (const [key, value] of [
      ["Home", 55],
      ["End", 105],
    ] as const) {
      fireEvent.keyDown(inseam, { key });
      expect(height.value).toBe("210");
      const expected = runBikeFitCalculation({ ...defaults, heightCm: 210, inseamCm: value });
      expect(output(en.saddle)).toBe(`${expected.fitResult.saddleHeightMm}mm`);
    }
  });

  it("updates real ranges, frame targets, warnings and confidence rather than canvas approximations", () => {
    render(<BikeFitCalculatorForm isNl={false} />);
    confirm();
    fireEvent.keyDown(screen.getByRole("slider", { name: en.height }), { key: "Home" });
    const result = runBikeFitCalculation({ ...defaults, heightCm: 130 });
    expect(screen.getByText(en.warnings.measurement_warning)).toBeTruthy();
    const band = result.fitResult.saddleHeightRange;
    expect(screen.getByText(`${band.min}–${band.max} mm`)).toBeTruthy();
    const targets = screen.getByRole("region", { name: en.frameTargets });
    expect(within(targets).getByText(String(result.fitResult.frameStackTargetMm))).toBeTruthy();
    const baseline = createPublicFitBaseline({
      heightCm: 130,
      inseamCm: 84,
      inseamSource: "measured",
      category: "road",
      ridingGoal: "balanced",
      flexibility: 3,
      coreStability: 3,
    });
    const issues = validatePublicFitBaseline(baseline, PUBLIC_FIT_REQUIREMENTS.bikeFit);
    const confidence = derivePublicCalculatorConfidence({
      baseline,
      issues,
      requirements: PUBLIC_FIT_REQUIREMENTS.bikeFit,
    });
    expect(screen.getByText(en.confidence[confidence.level])).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("slider", { name: en.core }), { key: "Home" });
    const changed = runBikeFitCalculation({ ...defaults, heightCm: 130, coreStability: 1 });
    expect(output(en.reach)).toBe(`${changed.fitResult.saddleToBarReachMm}mm`);
  });

  it("renders Dutch measures, translated warnings and a truthful localized account handoff", () => {
    const nl = bikeFitMessages.nl;
    render(<BikeFitCalculatorForm isNl copy={nl} />);
    fireEvent.keyDown(screen.getByRole("slider", { name: nl.inseam }), { key: "ArrowRight" });
    expect(screen.getByRole("slider", { name: nl.inseam }).getAttribute("aria-valuetext")).toBe(
      "84,5 cm",
    );
    fireEvent.click(screen.getByRole("radio", { name: nl.sources.measured }));
    fireEvent.keyDown(screen.getByRole("slider", { name: nl.height }), { key: "Home" });
    expect(screen.getByText(nl.warnings.measurement_warning)).toBeTruthy();
    expect(screen.queryByText(en.warnings.measurement_warning)).toBeNull();
    expect(screen.getByRole("link", { name: nl.accountCta }).getAttribute("href")).toBe(
      "/nl/login?src=bike-fit",
    );
    expect(screen.getByText(nl.accountHint)).toBeTruthy();
  });
});
