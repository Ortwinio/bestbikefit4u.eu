/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as adapters from "@/lib/public-calculators/fitAdapters";
import { readHandoff, writeHandoffEntry } from "@/lib/handoff/store";
import { crankLengthMessages } from "@/i18n/calculators/crankLength";
import { SaddleHeightCalculatorForm } from "./SaddleHeightCalculatorForm";
import { FrameSizeCalculatorForm } from "../frame-size/FrameSizeCalculatorForm";
import { CrankLengthCalculatorForm } from "../crank-length/CrankLengthCalculatorForm";
import { BikeFitCalculatorForm } from "../bike-fit/BikeFitCalculatorForm";
import { SaddleWidthCalculatorForm } from "../saddle-width/SaddleWidthCalculatorForm";

afterEach(() => { cleanup(); sessionStorage.clear(); vi.restoreAllMocks(); });

describe("public body calculator handoff", () => {
  it.each(["nl", "en"] as const)("renders one handoff per calculator without storing defaults in %s", (locale) => {
    const forms = [
      <SaddleHeightCalculatorForm key="saddle-height" isNl={locale === "nl"} />,
      <FrameSizeCalculatorForm key="frame-size" locale={locale} />,
      <CrankLengthCalculatorForm key="crank-length" locale={locale}
        copy={crankLengthMessages[locale]} initialCategory="road" />,
      <BikeFitCalculatorForm key="bike-fit" isNl={locale === "nl"} />,
      <SaddleWidthCalculatorForm key="saddle-width" locale={locale} />,
    ];
    for (const form of forms) {
      const { container, unmount } = render(form);
      const links = container.querySelectorAll('a[href*="handoff=1"]');
      expect(links).toHaveLength(1);
      const url = new URL(links[0].getAttribute("href")!, "https://example.test");
      expect(url.pathname).toBe(`/${locale}/login`);
      expect([...url.searchParams.keys()]).toEqual(["src", "handoff"]);
      expect(readHandoff().entries).toEqual([]);
      expect(container.querySelector('[data-slot="configurator-results"]')).toBeTruthy();
      unmount();
    }
  });

  it("prefills an actually edited inseam across calculators without retouching provenance", () => {
    const saddle = render(<SaddleHeightCalculatorForm isNl />);
    fireEvent.keyDown(screen.getByRole("slider", { name: "Binnenbeenlengte" }), { key: "ArrowRight" });
    const before = readHandoff();
    expect(before.entries).toEqual([expect.objectContaining({
      field: "inseamCm", value: 84.5, method: "declared", calculator: "saddle-height",
    })]);
    saddle.unmount();
    render(<FrameSizeCalculatorForm locale="nl" />);
    expect(screen.getByRole("slider", { name: "Binnenbeenlengte" }).getAttribute("aria-valuenow")).toBe("84.5");
    expect(screen.getByText("Je binnenbeen van de vorige calculator is al ingevuld.")).toBeTruthy();
    expect(readHandoff()).toEqual(before);
  });

  it.each(["declared", "estimated"] as const)("does not upgrade %s inseam provenance during prefill", (method) => {
    writeHandoffEntry({ field: "inseamCm", value: 85, unit: "cm", calculator: "crank-length",
      method, touchedAt: Date.now() });
    const before = readHandoff();
    const calculate = vi.spyOn(adapters, "runFrameSizeCalculation");
    const frame = render(<FrameSizeCalculatorForm locale="en" />);
    expect(calculate).toHaveBeenCalledWith(expect.objectContaining({ inseamCm: 85, inseamSource: "estimated" }));
    expect(readHandoff()).toEqual(before);
    frame.unmount();
    render(<SaddleHeightCalculatorForm />);
    fireEvent.keyDown(screen.getByRole("slider", { name: "Inseam" }), { key: "ArrowRight" });
    expect(readHandoff().entries[0].method).toBe(method);
  });

  it("maps aero to the profile performance goal while keeping the public calculation aerodynamic", () => {
    const calculate = vi.spyOn(adapters, "runBikeFitCalculation");
    render(<BikeFitCalculatorForm isNl={false} />);
    fireEvent.click(screen.getByRole("radio", { name: /^Aero/ }));
    expect(calculate).toHaveBeenCalledWith(expect.objectContaining({ ridingGoal: "aero" }));
    expect(readHandoff().entries).toEqual([expect.objectContaining({
      field: "ridingGoal", value: "performance", method: "declared",
    })]);
  });

  it("records a method confirmation only for inseam, never untouched height or scores", () => {
    render(<BikeFitCalculatorForm isNl={false} />);
    fireEvent.click(screen.getByRole("radio", { name: "Measured" }));
    expect(readHandoff().entries).toEqual([expect.objectContaining({
      field: "inseamCm", value: 84, method: "measured",
    })]);
  });

  it("isolates account inputs and callbacks from the public session", () => {
    writeHandoffEntry({ field: "inseamCm", value: 90, unit: "cm", calculator: "bike-fit",
      method: "measured", touchedAt: Date.now() });
    const before = readHandoff();
    const changed = vi.fn();
    const { container } = render(<SaddleHeightCalculatorForm isNl onValuesChange={changed}
      initialValues={{ inseamCm: 82, source: "measured", category: "road", ambition: "balanced",
        flexibility: 3, core: 3, compare: false, current: 750, currentConfirmed: false }} />);
    expect(screen.getByRole("slider", { name: "Binnenbeenlengte" }).getAttribute("aria-valuenow")).toBe("82");
    expect(container.querySelector('a[href*="handoff=1"]')).toBeNull();
    expect(changed).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole("slider", { name: "Binnenbeenlengte" }), { key: "ArrowRight" });
    expect(changed).toHaveBeenCalled();
    expect(readHandoff()).toEqual(before);
  });

  it("clears optional bike inputs from the session when they are erased", () => {
    render(<CrankLengthCalculatorForm locale="en" copy={crankLengthMessages.en} initialCategory="road" />);
    const input = screen.getByRole("spinbutton", { name: "Your current crank length (mm)" });
    fireEvent.change(input, { target: { value: "170" } });
    expect(readHandoff().entries).toEqual([expect.objectContaining({
      field: "currentCrankLengthMm", value: 170, method: "bike",
    })]);
    fireEvent.change(input, { target: { value: "" } });
    expect(readHandoff().entries).toEqual([]);
  });
});
