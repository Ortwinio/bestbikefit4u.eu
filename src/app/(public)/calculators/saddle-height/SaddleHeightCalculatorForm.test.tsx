/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { runSaddleHeightCalculation } from "@/lib/public-calculators/fitAdapters";
import { saddleHeightMessages } from "@/i18n/calculators/saddleHeight";
import { saddleReliabilityMessages } from "@/i18n/calculators/saddleReliability";
import { journeyMessages } from "@/i18n/calculators/journey";
import { calculatorExamples } from "@/i18n/calculators/examples";
import { quickFixMessages } from "@/i18n/calculators/quickFix";
import { readHandoff, writeHandoffEntry } from "@/lib/handoff/store";
import * as saddleModel from "../../../../../shared/reliability/saddleHeight";
import { SaddleHeightCalculatorForm } from "./SaddleHeightCalculatorForm";
import styles from "./SaddleHeightCalculatorForm.module.css";

vi.mock("@/lib/analytics/useSaddleReliabilityAnalytics", () => ({
  useSaddleReliabilityAnalytics: () => ({ trackInseamAdded: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  localStorage.clear();
  vi.restoreAllMocks();
});

function setSlider(name: string, value: number) {
  const slider = screen.getByRole("slider", { name });
  for (let count = 0; count < 200; count += 1) {
    const current = Number(slider.getAttribute("aria-valuenow"));
    if (current === value) return slider;
    fireEvent.keyDown(slider, { key: current < value ? "ArrowRight" : "ArrowLeft" });
  }
  expect(Number(slider.getAttribute("aria-valuenow"))).toBe(value);
  return slider;
}

function expectResult(
  copy: typeof saddleReliabilityMessages.en,
  state: saddleModel.PublicSaddleHeightState,
  isNl = false,
) {
  const result = state.result!;
  const range = screen.getByRole("img", {
    name: isNl
      ? `${copy.result} ${result.adviceMm} mm, bereik ${result.lowerMm} tot ${result.upperMm} mm`
      : `${copy.result} ${result.adviceMm} mm, range ${result.lowerMm} to ${result.upperMm} mm`,
  });
  expect(range.querySelector("[data-range-zone]")?.classList.contains("border-dashed")).toBe(state.dashed);
  const region = screen.getByRole("region", { name: copy.result });
  expect(region.textContent).toMatch(new RegExp(`±\\s*${result.halfWidthMm}\\s*mm`));
  return range;
}

describe("SaddleHeightCalculatorForm", () => {
  it.each([true, false])("renders the account result and boundary values intact (NL=%s)", (isNl) => {
    const copy = saddleHeightMessages[isNl ? "nl" : "en"];
    render(<SaddleHeightCalculatorForm isNl={isNl} initialValues={{
      inseamCm: 84, source: "measured", category: "road", ambition: "balanced",
      flexibility: 4, core: 3, compare: false, current: 750, currentConfirmed: false,
    }} />);
    const hero = screen.getByRole("region", { name: copy.result });
    expect(hero.classList.contains(styles.resultHero)).toBe(true);
    expect(document.getElementById("saddle-result")?.classList.contains(styles.resultCard)).toBe(true);
    expect(hero.parentElement?.classList.contains(styles.resultGrid)).toBe(true);
    expect(hero.querySelector("dd > span:first-child")?.textContent).toBe("745");
    expect(hero.querySelector("dd > span:nth-child(2)")?.textContent).toBe("mm");
    expect(hero.querySelector("dd")?.classList.contains("font-mono")).toBe(true);
    const inseam = screen.getByRole("slider", { name: copy.inseam });
    for (const [key, inseamCm] of [["Home", 55], ["End", 105]] as const) {
      fireEvent.keyDown(inseam, { key });
      const result = runSaddleHeightCalculation({ inseamCm, category: "road",
        ridingGoal: "balanced", flexibility: 4, coreStability: 3, inseamSource: "measured" });
      expect(hero.querySelector("dd > span:first-child")?.textContent).toBe(String(result.height));
      expect(hero.querySelector("dd > span:nth-child(2)")?.textContent).toBe("mm");
    }
  });

  it("keeps callback-only consumers on the legacy account form", () => {
    const onValuesChange = vi.fn();
    render(<SaddleHeightCalculatorForm onValuesChange={onValuesChange} />);
    expect(screen.queryByRole("slider", { name: saddleReliabilityMessages.en.height })).toBeNull();
    expect(screen.getByRole("slider", { name: saddleHeightMessages.en.flexibility })).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("slider", { name: saddleHeightMessages.en.inseam }), { key: "ArrowRight" });
    expect(onValuesChange).toHaveBeenLastCalledWith(expect.objectContaining({ inseamCm: 84.5 }));
    expect(readHandoff().entries).toEqual([]);
  });

  describe.each([true, false])("public reliability (NL=%s)", (isNl) => {
    const copy = saddleReliabilityMessages[isNl ? "nl" : "en"];
    const legacy = saddleHeightMessages[isNl ? "nl" : "en"];
    const action = journeyMessages[isNl ? "nl" : "en"].reasons["saddle-height"].cta;

    function expectSafety() {
      const safety = screen.getByRole("region", { name: copy.safety.title });
      expect(safety.closest("details")).toBeNull();
      for (const text of [copy.safety.high, copy.safety.low, copy.safety.adjustment, copy.safety.stop]) {
        expect(safety.textContent).toContain(text);
      }
      const fitter = within(safety).getByRole("link", { name: copy.fitter });
      expect(fitter.getAttribute("href")).toBe(`/${isNl ? "nl" : "en"}/bike-fitting`);
      expect(fitter.classList.contains("min-h-11")).toBe(true);
    }

    it("keeps board safety visible in full mode without fabricating measurements", () => {
      const { rerender } = render(<SaddleHeightCalculatorForm isNl={isNl} />);
      expectSafety();
      expect(copy.safety.adjustment).toContain("10 mm");
      expect(copy.safety.adjustment).toContain("5 mm");
      expect(readHandoff().entries).toEqual([]);
      rerender(<SaddleHeightCalculatorForm isNl={isNl} mode="quick" />);
      expect(screen.queryByRole("region", { name: copy.safety.title })).toBeNull();
      rerender(<SaddleHeightCalculatorForm isNl={isNl} mode="full" />);
      expectSafety();
      expect(readHandoff().entries).toEqual([]);
    });

    it("shows the actual current range in the full-mode ladder and hides paid content in quick mode", () => {
      const { container, rerender } = render(<SaddleHeightCalculatorForm isNl={isNl} />);
      const chip = container.querySelector('[data-presentation="range-chip"]');
      expect(chip?.getAttribute("href")).toBe(`/${isNl ? "nl" : "en"}/pricing`);
      expect(chip?.classList.contains("min-h-11")).toBe(true);
      const ladder = () => container.querySelector('[data-presentation="ladder"]');
      expect(ladder()?.textContent).toContain("±49 mm");
      fireEvent.keyDown(screen.getByRole("slider", { name: copy.inseam }), { key: "ArrowRight" });
      expect(ladder()?.textContent).toContain("±23 mm");
      rerender(<SaddleHeightCalculatorForm isNl={isNl} mode="quick" />);
      expect(container.querySelector('[data-usability="paid-presentation"]')).toBeNull();
    });

    it("starts with the unpersisted 190 cm example and an absent 89 cm inseam", () => {
      render(<SaddleHeightCalculatorForm isNl={isNl} />);
      expect(screen.getByRole("heading", { level: 1, name: copy.title })).toBeTruthy();
      expect(screen.getByText(calculatorExamples[isNl ? "nl" : "en"].height.replace("{height}", "190"))).toBeTruthy();
      expect(screen.getAllByText(copy.missing).length).toBeGreaterThan(0);
      expect(screen.getByRole("slider", { name: copy.height }).getAttribute("aria-valuenow")).toBe("190");
      expect(screen.getByRole("slider", { name: copy.inseam }).getAttribute("aria-valuenow")).toBe("89");
      const state = saddleModel.calculatePublicSaddleHeight({ heightCm: 190 });
      expect(state.result).toMatchObject({ adviceMm: 789, halfWidthMm: 49, lowerMm: 740, upperMm: 840 });
      expectResult(copy, state, isNl);
      expect(screen.getByText(copy.nextSteps["add-inseam"].replace("{width}", "23"))).toBeTruthy();
      expect(screen.getByRole("link", { name: action })).toBeTruthy();
      expect(readHandoff().entries).toEqual([]);
    });

    it("uses a touched inseam and the shared uncertainty instead of the legacy guardrail", () => {
      render(<SaddleHeightCalculatorForm isNl={isNl} />);
      const inseam = screen.getByRole("slider", { name: copy.inseam });
      fireEvent.keyDown(inseam, { key: "ArrowRight" });
      expect(inseam.getAttribute("aria-valuetext")).toBe(isNl ? "89,5 cm" : "89.5 cm");
      fireEvent.keyDown(inseam, { key: "ArrowLeft" });
      const state = saddleModel.calculatePublicSaddleHeight({ heightCm: 190, inseamCm: 89 });
      expect(state.result).toMatchObject({ adviceMm: 786, halfWidthMm: 23, lowerMm: 765, upperMm: 810 });
      expectResult(copy, state, isNl);
      expect(screen.queryByText(copy.missing)).toBeNull();
      expect(screen.getByText(copy.narrower.replace("{from}", "49").replace("{to}", "23"))).toBeTruthy();
      expect(screen.getByText(copy.nextSteps["save-and-repeat"].replace("{width}", "18"))).toBeTruthy();
      expect(screen.getByRole("link", { name: action })).toBeTruthy();
    });

    it("removes legacy public controls", () => {
      render(<SaddleHeightCalculatorForm isNl={isNl} />);
      expect(screen.getAllByRole("slider")).toHaveLength(2);
      expect(screen.queryByRole("spinbutton")).toBeNull();
      expect(screen.queryByRole("combobox")).toBeNull();
      for (const name of [legacy.flexibility, legacy.core, legacy.current]) {
        expect(screen.queryByRole("slider", { name })).toBeNull();
      }
      for (const name of [legacy.category, legacy.goal]) {
        expect(screen.queryByRole("radiogroup", { name })).toBeNull();
      }
      expect(screen.queryByRole("button", { name: `${legacy.measured} ${legacy.measuredHint}` })).toBeNull();
      expect(screen.queryByRole("button", { name: `${legacy.estimated} ${legacy.estimatedHint}` })).toBeNull();
      expect(screen.queryByText(legacy.band)).toBeNull();
    });

    it.each([82, 96])("requires confirmation for a suspicious %s cm inseam", (inseamCm) => {
      render(<SaddleHeightCalculatorForm isNl={isNl} />);
      setSlider(copy.inseam, inseamCm);
      const input = { heightCm: 190, inseamCm };
      expectResult(copy, saddleModel.calculatePublicSaddleHeight(input), isNl);
      expect(screen.getByText(copy.checkTitle)).toBeTruthy();
      expectSafety();
      expect(screen.queryByRole("link", { name: action })).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: copy.confirm }));
      expectResult(copy, saddleModel.calculatePublicSaddleHeight({ ...input, confirmed: true }), isNl);
      expectSafety();
      expect(screen.getByRole("link", { name: action })).toBeTruthy();
    });

    it("uses height for a large deviation, then keeps the override dashed and unresolved", () => {
      render(<SaddleHeightCalculatorForm isNl={isNl} />);
      setSlider(copy.inseam, 105);
      const input = { heightCm: 190, inseamCm: 105 };
      expectResult(copy, saddleModel.calculatePublicSaddleHeight(input), isNl);
      expect(screen.getByText(copy.largeBody)).toBeTruthy();
      expect(screen.getByText(copy.heightFallback)).toBeTruthy();
      expect(screen.getByRole("button", { name: copy.remeasure })).toBeTruthy();
      expect(within(screen.getByRole("alert")).getByRole("link", { name: copy.fitter })).toBeTruthy();
      expectSafety();
      fireEvent.click(screen.getByRole("button", { name: copy.override }));
      expectResult(copy, saddleModel.calculatePublicSaddleHeight({ ...input, override: true }), isNl);
      expect(screen.getByText(copy.overridden)).toBeTruthy();
      expectSafety();
      expect(within(screen.getByRole("region", { name: copy.result })).getByText(copy.nextSteps.remeasure)).toBeTruthy();
      expect(screen.queryByRole("link", { name: action })).toBeNull();
    });

    it.each(["height", "inseam"] as const)("resets confirmation when %s changes", (field) => {
      render(<SaddleHeightCalculatorForm isNl={isNl} />);
      setSlider(copy.inseam, 96);
      fireEvent.click(screen.getByRole("button", { name: copy.confirm }));
      setSlider(copy[field], field === "height" ? 189 : 96.5);
      expectResult(copy, saddleModel.calculatePublicSaddleHeight({
        heightCm: field === "height" ? 189 : 190,
        inseamCm: field === "inseam" ? 96.5 : 96,
      }), isNl);
      expect(screen.getByRole("button", { name: copy.confirm })).toBeTruthy();
      expect(screen.queryByRole("link", { name: action })).toBeNull();
    });

    it.each(["height", "inseam"] as const)("resets a large override when %s changes", (field) => {
      render(<SaddleHeightCalculatorForm isNl={isNl} />);
      setSlider(copy.inseam, 105);
      fireEvent.click(screen.getByRole("button", { name: copy.override }));
      setSlider(copy[field], field === "height" ? 189 : 104.5);
      expectResult(copy, saddleModel.calculatePublicSaddleHeight({
        heightCm: field === "height" ? 189 : 190,
        inseamCm: field === "inseam" ? 104.5 : 105,
      }), isNl);
      expect(screen.getByText(copy.heightFallback)).toBeTruthy();
      expect(screen.queryByText(copy.overridden)).toBeNull();
    });

    it("shows the model error without a fabricated range or refinement", () => {
      const invalid = saddleModel.calculatePublicSaddleHeight({ heightCm: 190, inseamCm: 54 });
      vi.spyOn(saddleModel, "calculatePublicSaddleHeight").mockReturnValue(invalid);
      render(<SaddleHeightCalculatorForm isNl={isNl} />);
      expect(screen.getByText(copy.error)).toBeTruthy();
      expectSafety();
      expect(screen.queryByRole("img", { name: new RegExp(`^${copy.result} `) })).toBeNull();
      expect(screen.queryByRole("link", { name: action })).toBeNull();
      expect(readHandoff().entries).toEqual([]);
    });

    it.each(["confirmed", "override"] as const)("preserves %s state and values across quick/full modes", (kind) => {
      const { rerender } = render(<SaddleHeightCalculatorForm isNl={isNl} mode="full" />);
      setSlider(copy.height, 189);
      const inseamCm = kind === "confirmed" ? 96 : 105;
      setSlider(copy.inseam, inseamCm);
      fireEvent.click(screen.getByRole("button", { name: kind === "confirmed" ? copy.confirm : copy.override }));
      const state = saddleModel.calculatePublicSaddleHeight({ heightCm: 189, inseamCm, [kind]: true });
      const entries = readHandoff().entries;
      rerender(<SaddleHeightCalculatorForm isNl={isNl} mode="quick" />);
      expectResult(copy, state, isNl);
      expect(screen.queryByRole("link", { name: action })).toBeNull();
      rerender(<SaddleHeightCalculatorForm isNl={isNl} mode="full" />);
      expectResult(copy, state, isNl);
      expect(screen.getByRole("slider", { name: copy.height }).getAttribute("aria-valuenow")).toBe("189");
      expect(screen.getByRole("slider", { name: copy.inseam }).getAttribute("aria-valuenow")).toBe(String(inseamCm));
      expect(readHandoff().entries).toEqual(entries);
      expect(Boolean(screen.queryByRole("link", { name: action }))).toBe(kind === "confirmed");
    });

    it.each([
      { initialInseam: 89, status: "ok" },
      { initialInseam: 95, status: "check" },
      { initialInseam: 104, status: "large" },
    ] as const)("reports inseam additions only for actual accepted measurements ($status)", ({ initialInseam, status }) => {
      writeHandoffEntry({ field: "inseamCm", value: initialInseam, unit: "cm",
        calculator: "bike-fit", method: "measured", touchedAt: Date.now() });
      const onInseamAdded = vi.fn();
      const { rerender } = render(<SaddleHeightCalculatorForm isNl={isNl} onInseamAdded={onInseamAdded} />);
      expect(screen.getByRole("slider", { name: copy.inseam }).getAttribute("aria-valuenow")).toBe(String(initialInseam));
      expect(onInseamAdded).not.toHaveBeenCalled();

      setSlider(copy.inseam, initialInseam + 0.5);
      expect(onInseamAdded).toHaveBeenCalledTimes(status === "ok" ? 1 : 0);
      if (status !== "ok") {
        fireEvent.click(screen.getByRole("button", { name: status === "check" ? copy.confirm : copy.override }));
      }
      const expectedCalls = status === "large" ? 0 : 1;
      expect(onInseamAdded).toHaveBeenCalledTimes(expectedCalls);
      if (expectedCalls) expect(onInseamAdded).toHaveBeenCalledWith();

      for (const mode of ["quick", "full"] as const) {
        rerender(<SaddleHeightCalculatorForm isNl={isNl} mode={mode} onInseamAdded={onInseamAdded} />);
        expect(onInseamAdded).toHaveBeenCalledTimes(expectedCalls);
      }
    });

    it("does not treat opening the quick-mode inseam card as a measurement", () => {
      render(<SaddleHeightCalculatorForm isNl={isNl} mode="quick" />);
      const quickCopy = quickFixMessages[isNl ? "nl" : "en"];
      fireEvent.click(screen.getByText(quickCopy.optionalInseam));
      expectResult(copy, saddleModel.calculatePublicSaddleHeight({ heightCm: 190 }), isNl);
      expect(readHandoff().entries).toEqual([]);
      setSlider(copy.inseam, 89.5);
      expectResult(copy, saddleModel.calculatePublicSaddleHeight({ heightCm: 190, inseamCm: 89.5 }), isNl);
    });
  });
});
