// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  calculatorFromPath, calculatorLoginHref, observeCalculatorEdits, PUBLIC_CALCULATORS, publicCalculatorPath,
} from "./calculatorBaseline";

afterEach(() => { vi.restoreAllMocks(); document.body.innerHTML = ""; });

describe("public calculator baseline paths and attribution", () => {
  it("recognizes every public calculator and all pressure aliases without query data", () => {
    for (const calculator of PUBLIC_CALCULATORS) {
      expect(calculatorFromPath(`/nl/calculators/${calculator}`)).toBe(calculator);
      expect(publicCalculatorPath(calculator, `/en/calculators/${calculator}?weight=80`))
        .toBe(`/en/calculators/${calculator}`);
    }
    for (const route of ["tire-pressure-calculator", "bandenspanning-calculator", "bandenspanning/racefiets",
      "bandenspanning/gravelbike", "bandenspanning/mtb", "tire-pressure/road-bike"]) {
      expect(calculatorFromPath(`/nl/${route}`)).toBe("tire-pressure");
    }
    for (const path of ["/nl/pressure-calculator", "/nl/tools/climb-planner", "/nl/gearing", "/nl/app",
      "/nl/tire-pressure/70kg-road-bike", "/nl/calculators/frame-size/extra"]) {
      expect(calculatorFromPath(path)).toBeNull();
    }
  });
  it("puts only the calculator id into the actual router href", () => {
    expect(calculatorLoginHref("/nl/login", "saddle-height")).toBe("/nl/login?src=saddle-height");
    expect(calculatorLoginHref("/en/login?src=old#form", "gearing")).toBe("/en/login?src=gearing#form");
    expect(calculatorLoginHref("https://other.example/login", "gearing")).toBe("https://other.example/login");
    expect(calculatorLoginHref("/en/profile", "gearing")).toBe("/en/profile");
  });
});

function setup() {
  document.body.innerHTML = `<div data-slot="configurator-inputs">
    <div data-slot="slider"><div data-slot="slider-control"><span data-slot="slider-track"></span>
      <div role="slider" aria-valuenow="80"></div></div></div>
    <button role="radio" aria-checked="false">Measured</button><input value="80" />
  </div><div data-slot="configurator-results"><section data-slot="result-hero"></section></div>`;
  const listeners = new Map<string, EventListener>();
  vi.spyOn(document, "addEventListener").mockImplementation((type, callback) => {
    listeners.set(type, callback as EventListener);
  });
  let frame: FrameRequestCallback = () => {};
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => { frame = callback; return 1; });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  const result = vi.fn();
  const stop = observeCalculatorEdits(result);
  const gesture = (type: string, target: Element, trusted = true) => {
    listeners.get(type)?.({ type, target, isTrusted: trusted } as unknown as Event);
  };
  return { result, stop, gesture, flush: () => frame(0) };
}

describe("explicit calculator edits", () => {
  it("ignores hydration, programmatic changes and unchanged control gestures", () => {
    const { result, stop, gesture, flush } = setup();
    const slider = document.querySelector('[role="slider"]')!;
    slider.setAttribute("aria-valuenow", "85");
    gesture("input", slider, false);
    gesture("pointerdown", slider);
    flush();
    expect(result).not.toHaveBeenCalled();
    stop();
  });
  it("recognizes changed slider track gestures and changed option/segmented radios", () => {
    const { result, stop, gesture, flush } = setup();
    gesture("pointerdown", document.querySelector('[data-slot="slider-track"]')!);
    document.querySelector('[role="slider"]')!.setAttribute("aria-valuenow", "81");
    flush();
    expect(result).toHaveBeenCalledTimes(1);
    const radio = document.querySelector('[role="radio"]')!;
    gesture("click", radio);
    radio.setAttribute("aria-checked", "true");
    flush();
    expect(result).toHaveBeenCalledTimes(2);
    stop();
  });
  it("requires an actual rendered result after a trusted edit", () => {
    const { result, stop, gesture, flush } = setup();
    document.querySelector('[data-slot="result-hero"]')!.remove();
    gesture("input", document.querySelector("input")!);
    flush();
    expect(result).not.toHaveBeenCalled();
    stop();
  });
});
