/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as adapters from "@/lib/public-calculators/fitAdapters";
import { readHandoff, writeHandoffEntry } from "@/lib/handoff/store";
import { crankLengthMessages } from "@/i18n/calculators/crankLength";
import { handoffLoginHref } from "@/components/calculators/PersonalizeAdviceBlock";
import { SaddleHeightCalculatorForm } from "./SaddleHeightCalculatorForm";
import { FrameSizeCalculatorForm } from "../frame-size/FrameSizeCalculatorForm";
import { CrankLengthCalculatorForm } from "../crank-length/CrankLengthCalculatorForm";
import { BikeFitCalculatorForm } from "../bike-fit/BikeFitCalculatorForm";
import { SaddleWidthCalculatorForm } from "../saddle-width/SaddleWidthCalculatorForm";

afterEach(() => { cleanup(); sessionStorage.clear(); vi.restoreAllMocks(); });

function setSlider(name: string, value: number) {
  const slider = screen.getByRole("slider", { name });
  for (let count = 0; count < 150; count += 1) {
    const current = Number(slider.getAttribute("aria-valuenow"));
    if (current === value) return;
    fireEvent.keyDown(slider, { key: current < value ? "ArrowRight" : "ArrowLeft" });
  }
  expect(Number(slider.getAttribute("aria-valuenow"))).toBe(value);
}

describe("public body calculator handoff", () => {
  it.each(["nl", "en"] as const)("renders one handoff per calculator without storing defaults in %s", (locale) => {
    const forms = [
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

  it.each(["nl", "en"] as const)("keeps saddle examples out of the session until edited in %s", (locale) => {
    const { container } = render(<SaddleHeightCalculatorForm isNl={locale === "nl"} />);
    const height = locale === "nl" ? "Lengte" : "Height";
    const inseam = locale === "nl" ? "Binnenbeenlengte" : "Inseam";
    expect(screen.getByRole("slider", { name: height }).getAttribute("aria-valuenow")).toBe("190");
    expect(screen.getByRole("slider", { name: inseam }).getAttribute("aria-valuenow")).toBe("89");
    expect(readHandoff().entries).toEqual([]);
    expect(container.querySelector('a[href*="handoff=1"]')).toBeNull();
    setSlider(height, 191);
    expect(readHandoff().entries).toEqual([expect.objectContaining({
      field: "heightCm", value: 191, unit: "cm", calculator: "saddle-height", method: "declared",
    })]);
    expect(container.querySelector('a[href*="handoff=1"]')).toBeNull();
  });

  it.each(["nl", "en"] as const)("carries edited saddle measurements through the login CTA in %s", (locale) => {
    const { container } = render(<SaddleHeightCalculatorForm isNl={locale === "nl"} />);
    setSlider(locale === "nl" ? "Lengte" : "Height", 191);
    setSlider(locale === "nl" ? "Binnenbeenlengte" : "Inseam", 89.5);
    const links = container.querySelectorAll<HTMLAnchorElement>('a[href*="handoff=1"]');
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toBe(handoffLoginHref("saddle-height", locale));
    const url = new URL(links[0].href);
    expect(url.pathname).toBe(`/${locale}/login`);
    expect(url.searchParams.get("src")).toBe("saddle-height");
    expect(url.searchParams.get("handoff")).toBe("1");
    expect([...url.searchParams.keys()]).toEqual(["src", "handoff"]);
    links[0].addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(links[0]);
    expect(readHandoff().entries).toHaveLength(2);
    expect(readHandoff().entries).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: "heightCm", value: 191, unit: "cm", method: "declared", calculator: "saddle-height" }),
      expect.objectContaining({ field: "inseamCm", value: 89.5, unit: "cm", method: "measured", calculator: "saddle-height" }),
    ]));
  });

  it("confirms the untouched example height only when explicitly saving valid inseam", () => {
    const { container } = render(<SaddleHeightCalculatorForm />);
    setSlider("Inseam", 89.5);
    expect(readHandoff().entries).toEqual([expect.objectContaining({ field: "inseamCm", value: 89.5, method: "measured" })]);
    const link = container.querySelector<HTMLAnchorElement>('a[href*="handoff=1"]');
    expect(link).not.toBeNull();
    link!.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(link!);
    expect(readHandoff().entries).toHaveLength(2);
    expect(readHandoff().entries).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: "heightCm", value: 190, method: "declared" }),
      expect.objectContaining({ field: "inseamCm", value: 89.5, method: "measured" }),
    ]));
  });

  it.each(["nl", "en"] as const)("withholds a warning inseam until confirmation and resets on edit in %s", (locale) => {
    const { container } = render(<SaddleHeightCalculatorForm isNl={locale === "nl"} />);
    const inseam = locale === "nl" ? "Binnenbeenlengte" : "Inseam";
    const confirm = locale === "nl" ? "Klopt, ga verder" : "Correct, continue";
    setSlider(inseam, 95);
    expect(readHandoff().entries).toEqual([]);
    expect(container.querySelector('a[href*="handoff=1"]')).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: confirm }));
    expect(readHandoff().entries).toEqual([expect.objectContaining({ field: "inseamCm", value: 95, method: "measured" })]);
    expect(container.querySelector('a[href*="handoff=1"]')).not.toBeNull();
    setSlider(inseam, 95.5);
    expect(readHandoff().entries).toEqual([]);
    expect(container.querySelector('a[href*="handoff=1"]')).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: confirm }));
    setSlider(locale === "nl" ? "Lengte" : "Height", 191);
    expect(readHandoff().entries).toEqual([expect.objectContaining({ field: "heightCm", value: 191 })]);
    expect(container.querySelector('a[href*="handoff=1"]')).toBeNull();
  });

  it.each(["nl", "en"] as const)("withholds large-warning inseam even after override in %s", (locale) => {
    const { container } = render(<SaddleHeightCalculatorForm isNl={locale === "nl"} />);
    setSlider(locale === "nl" ? "Binnenbeenlengte" : "Inseam", 105);
    expect(readHandoff().entries).toEqual([]);
    expect(container.querySelector('a[href*="handoff=1"]')).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: locale === "nl" ? "Toch gebruiken" : "Use anyway" }));
    expect(readHandoff().entries).toEqual([]);
    expect(container.querySelector('a[href*="handoff=1"]')).toBeNull();
  });

  it("removes a previously saved inseam when choosing to measure again", () => {
    const { container } = render(<SaddleHeightCalculatorForm />);
    setSlider("Height", 191);
    setSlider("Inseam", 95);
    fireEvent.click(screen.getByRole("button", { name: "Correct, continue" }));
    expect(readHandoff().entries.find((entry) => entry.field === "inseamCm")?.value).toBe(95);
    setSlider("Inseam", 95.5);
    fireEvent.click(screen.getByRole("button", { name: "Measure again" }));
    expect(readHandoff().entries).toEqual([expect.objectContaining({ field: "heightCm", value: 191 })]);
    expect(screen.getByRole("slider", { name: "Inseam" }).getAttribute("aria-valuenow")).toBe("89");
    expect(container.querySelector('a[href*="handoff=1"]')).toBeNull();
  });

  it.each([54, 106])("does not promote an invalid prefilled inseam of %s cm to a measurement", (value) => {
    writeHandoffEntry({ field: "inseamCm", value, unit: "cm", calculator: "crank-length", method: "declared", touchedAt: Date.now() });
    const before = readHandoff();
    const { container } = render(<SaddleHeightCalculatorForm />);
    expect(screen.getByRole("slider", { name: "Inseam" }).getAttribute("aria-valuenow")).toBe("89");
    expect(container.querySelector('a[href*="handoff=1"]')).toBeNull();
    expect(readHandoff()).toEqual(before);
  });

  it("prefills an actually edited inseam across calculators without retouching provenance", () => {
    const saddle = render(<SaddleHeightCalculatorForm isNl />);
    fireEvent.keyDown(screen.getByRole("slider", { name: "Binnenbeenlengte" }), { key: "ArrowRight" });
    const before = readHandoff();
    expect(before.entries).toEqual([expect.objectContaining({
      field: "inseamCm", value: 89.5, method: "measured", calculator: "saddle-height",
    })]);
    saddle.unmount();
    render(<FrameSizeCalculatorForm locale="nl" />);
    expect(screen.getByRole("slider", { name: "Binnenbeenlengte" }).getAttribute("aria-valuenow")).toBe("89.5");
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
    const inseam = screen.getByRole("slider", { name: "Inseam" });
    expect(inseam.getAttribute("aria-valuenow")).toBe("89");
    expect(inseam.getAttribute("aria-valuetext")).toBe("not entered yet");
    expect(screen.getByRole("img", { name: "Saddle height 789 mm, range 740 to 840 mm" })).toBeTruthy();
    expect(readHandoff()).toEqual(before);
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
