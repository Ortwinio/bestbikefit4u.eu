export const PUBLIC_CALCULATORS = [
  "bike-fit", "saddle-height", "frame-size", "crank-length", "saddle-width",
  "tire-pressure", "gearing", "power-speed", "climb-planner", "ftp-wkg", "fuel-hydration",
] as const;

export type PublicCalculator = (typeof PUBLIC_CALCULATORS)[number];

export function publicCalculatorPath(calculator: PublicCalculator, pathname: string): string | null {
  const path = pathname.split(/[?#]/)[0].replace(/\/$/, "");
  const bare = path.replace(/^\/(en|nl)(?=\/)/, "");
  if (bare === `/calculators/${calculator}`) return path;
  if (calculator === "tire-pressure" && (
    /^\/(bandenspanning|tire-pressure)-calculator$/.test(bare)
    || /^\/(bandenspanning|tire-pressure)(\/(racefiets|gravelbike|mtb|road-bike|gravel-bike|mountain-bike))?$/.test(bare)
  )) return path;
  return null;
}

export function calculatorFromPath(pathname: string): PublicCalculator | null {
  return PUBLIC_CALCULATORS.find((calculator) => publicCalculatorPath(calculator, pathname)) ?? null;
}

/** Put attribution in the Link prop itself: Next's router does not read later DOM href mutations. */
export function calculatorLoginHref(href: string, calculator: PublicCalculator): string {
  if (!/^\/(?:en\/|nl\/)?login(?:[?#]|$)/.test(href)) return href;
  const url = new URL(href, "https://bestbikefit4u.eu");
  url.searchParams.set("src", calculator);
  return `${url.pathname}${url.search}${url.hash}`;
}

const INPUTS = '[data-slot="configurator-inputs"]';
const CONTROL = 'input, select, textarea, [role="slider"], [aria-pressed], [role="radio"], [role="checkbox"]';

function controlState(control: Element): string {
  // Ephemeral comparison only. Never returned to the event logger or retained after the gesture.
  return [control.getAttribute("aria-valuenow"), control.getAttribute("aria-pressed"),
    control.getAttribute("aria-checked"), String(control.hasAttribute("data-checked")),
    control instanceof HTMLInputElement ? `${control.value}:${control.checked}` :
      control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement ? control.value : ""].join("|");
}

/** Browser events, not React state changes, establish a real edit. Hydration/prefill cannot trigger this. */
export function observeCalculatorEdits(onResult: () => void): () => void {
  let edited = false;
  let frame = 0;
  let observer: MutationObserver | null = null;
  const resultReady = () => Boolean(document.querySelector(
    '[data-slot="configurator-results"] [data-slot="result-hero"]',
  ));
  const check = () => { if (edited && resultReady()) onResult(); };
  const onInput = (event: Event) => {
    if (!event.isTrusted || !(event.target instanceof Element) || !event.target.closest(INPUTS)) return;
    edited = true;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(check);
  };
  const onGesture = (event: Event) => {
    if (!event.isTrusted || !(event.target instanceof Element)) return;
    if (event instanceof KeyboardEvent && ![
      "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown", " ", "Enter",
    ].includes(event.key)) return;
    const control = event.target.closest(CONTROL)
      ?? event.target.closest('[data-slot="slider-control"]')
        ?.closest('[data-slot="slider"]')?.querySelector('[role="slider"]');
    if (!control?.closest(INPUTS)) return;
    const before = controlState(control);
    observer?.disconnect();
    observer = new MutationObserver(() => {
      if (controlState(control) !== before) { edited = true; check(); }
    });
    observer.observe(control, { attributes: true, subtree: true });
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (controlState(control) !== before) edited = true;
      check();
      // Pointer drags may continue beyond a frame; pointerup performs the final check.
      if (event.type !== "pointerdown") observer?.disconnect();
    });
  };
  const onPointerUp = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => { check(); observer?.disconnect(); });
  };
  document.addEventListener("input", onInput, true);
  document.addEventListener("change", onInput, true);
  document.addEventListener("keydown", onGesture, true);
  document.addEventListener("pointerdown", onGesture, true);
  document.addEventListener("click", onGesture, true);
  document.addEventListener("pointerup", onPointerUp, true);
  return () => {
    cancelAnimationFrame(frame);
    observer?.disconnect();
    document.removeEventListener("input", onInput, true);
    document.removeEventListener("change", onInput, true);
    document.removeEventListener("keydown", onGesture, true);
    document.removeEventListener("pointerdown", onGesture, true);
    document.removeEventListener("click", onGesture, true);
    document.removeEventListener("pointerup", onPointerUp, true);
  };
}
