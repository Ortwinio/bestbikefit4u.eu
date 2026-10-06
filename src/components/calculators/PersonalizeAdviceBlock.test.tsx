// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CalculatorBaselineTracker } from "@/components/analytics/useCalculatorBaseline";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { CalculatorAdviceLadder, CalculatorPaidChip } from "./CalculatorAdviceLadder";
import { CalculatorDataContext } from "@/lib/calculatorData/context";
import { writeCookieConsent } from "@/lib/cookieConsent";
import { PersonalizeAdviceBlock, handoffLoginHref, SHOWN_REASONS_KEY } from "./PersonalizeAdviceBlock";
import { journeyMessages } from "@/i18n/calculators/journey";
import { CalculatorJourneyHeader, calculatorJourneys, calculatorJourney, publicCalculatorHref } from "./CalculatorJourney";
import { HandoffPrefillNotice } from "./HandoffPrefillNotice";
import { HANDOFF_KEY, writeHandoffEntry } from "@/lib/handoff/store";
import { handoffMessages } from "@/i18n/calculators/handoff";
import type { HandoffCalculator } from "@/lib/handoff/store";

const baseline = vi.hoisted(() => ({ path: "/nl/calculators/saddle-height", log: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => baseline.path }));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({ useMarketingEventLogger: () => baseline.log }));

beforeEach(() => {
  baseline.path = "/nl/calculators/saddle-height";
  baseline.log.mockReset();
  sessionStorage.clear();
  localStorage.clear();
  document.cookie = "bf_cookie_consent=; Max-Age=0; Path=/";
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
describe("public personalize block", () => {
  it("scrolls the route strip to the current step without moving the page", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      if (this.tagName === "OL") return { left: 0, width: 300 } as DOMRect;
      if (this.getAttribute("aria-current") === "step") return { left: 600, width: 100 } as DOMRect;
      return { left: 0, width: 0 } as DOMRect;
    });
    const view = render(<CalculatorJourneyHeader calculator="fuel-hydration" locale="en" />);
    expect(view.container.querySelector("ol")?.scrollLeft).toBe(500);
    expect(screen.getByRole("link", { current: "step" }).getAttribute("href"))
      .toBe("/en/calculators/fuel-hydration");
  });
  it.each(["nl", "en"] as const)("renders every calculator in %s with no default handoff", (locale) => {
    for (const calculator of Object.keys(handoffMessages[locale].calculators) as HandoffCalculator[]) {
      const view = render(<PersonalizeAdviceBlock calculator={calculator} locale={locale} />);
      const copy = journeyMessages[locale];
      expect(screen.getByText(copy.reasons[calculator].text)).toBeTruthy();
      expect(screen.getByText(copy.carry)).toBeTruthy();
      expect(screen.getByRole("link", { name: copy.reasons[calculator].cta }).getAttribute("href"))
        .toBe(`/${locale}/login?src=${calculator}&handoff=1`);
      expect(sessionStorage.getItem(HANDOFF_KEY)).toBeNull();
      view.unmount();
    }
  });
  it("shows carried values in the known-values strip without values in the URL", () => {
    render(<><PersonalizeAdviceBlock calculator="saddle-height" locale="nl" />
      <HandoffPrefillNotice calculator="saddle-height" locale="nl" fields={["heightCm", "inseamCm"]} /></>);
    act(() => {
      writeHandoffEntry({ field: "inseamCm", value: 81, unit: "cm", calculator: "saddle-height",
        method: "estimated", touchedAt: Date.now() });
      writeHandoffEntry({ field: "heightCm", value: 174, unit: "cm", calculator: "frame-size",
        method: "measured", touchedAt: Date.now() });
      writeHandoffEntry({ field: "ridingGoal", value: "balanced", unit: "none", calculator: "saddle-height",
        method: "declared", touchedAt: Date.now() });
    });
    expect(screen.getByText(/174 cm.*81 cm/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Wijzig" })).toBeTruthy();
    const url = new URL(handoffLoginHref("saddle-height", "nl"), "https://bikefitboost.com");
    expect([...url.searchParams.keys()]).toEqual(["src", "handoff"]);
    expect(url.href).not.toMatch(/81|174|balanced/);
  });
  it.each(["nl", "en"] as const)("keeps the %s edit target at least 44px in both dimensions", (locale) => {
    render(<HandoffPrefillNotice calculator="saddle-height" locale={locale} fields={["heightCm"]} />);
    const button = screen.getByRole("button", { name: journeyMessages[locale].edit });
    expect(button.classList.contains("min-h-11")).toBe(true);
    expect(button.classList.contains("min-w-11")).toBe(true);
  });
  it("shows a notice only for fields actually prefilled", () => {
    const view = render(<HandoffPrefillNotice calculator="saddle-height" locale="nl" fields={[]} />);
    expect(screen.queryByRole("status")).toBeNull();
    view.rerender(<HandoffPrefillNotice calculator="saddle-height" locale="nl" fields={["inseamCm"]} />);
    expect(screen.getByText("Je binnenbeen van de vorige calculator is al ingevuld.")).toBeTruthy();
  });
});

it.each(["nl", "en"] as const)("preserves one consented value-free baseline event for the %s handoff CTA", locale => {
  baseline.path = `/${locale}/calculators/saddle-height`;
  const listeners: EventListener[] = [];
  const addEventListener = document.addEventListener.bind(document);
  vi.spyOn(document, "addEventListener").mockImplementation((type, listener, options) => {
    if (type === "click" && options === true) listeners.push(listener as EventListener);
    addEventListener(type, listener, options);
  });
  render(<><CalculatorBaselineTracker /><main>
    <PersonalizeAdviceBlock calculator="saddle-height" locale={locale} />
  </main></>);
  act(() => writeHandoffEntry({ field: "inseamCm", value: 81, unit: "cm", calculator: "saddle-height",
    method: "measured", touchedAt: Date.now() }));
  const anchor = screen.getByRole("link", { name: journeyMessages[locale].reasons["saddle-height"].cta });
  const click = (isTrusted = true) => listeners.forEach(listener => listener({ isTrusted, target: anchor } as unknown as Event));
  expect(anchor.getAttribute("href")).toBe(`/${locale}/login?src=saddle-height&handoff=1`);
  click();
  expect(baseline.log).not.toHaveBeenCalled();
  act(() => writeCookieConsent("accepted"));
  click(false);
  expect(baseline.log).not.toHaveBeenCalled();
  click();
  expect(baseline.log.mock.calls).toEqual([[{ eventType: "calculator_login_cta_click", sourceTag: "saddle-height",
    locale, pagePath: `/${locale}/calculators/saddle-height` }]]);
  expect(JSON.stringify(baseline.log.mock.calls)).not.toContain("81");
});

it.each(["nl", "en"] as const)("keeps the %s session-only retention line when consent changes", locale => {
  const copy = handoffMessages[locale];
  render(<PersonalizeAdviceBlock calculator="saddle-height" locale={locale} />);
  expect(screen.getByText(copy.sessionOnly)).toBeTruthy();
  act(() => writeCookieConsent("accepted"));
  expect(screen.getByText(copy.sessionOnly)).toBeTruthy();
  act(() => writeCookieConsent("essential"));
  expect(screen.getByText(copy.sessionOnly)).toBeTruthy();
});
it("keeps the prefill notice consistent with browser retention", () => {
  render(<HandoffPrefillNotice calculator="saddle-height" locale="nl" fields={["inseamCm"]} />);
  expect(screen.getByText(handoffMessages.nl.sessionOnly)).toBeTruthy();
  act(() => writeCookieConsent("accepted"));
  expect(screen.getByText(handoffMessages.nl.sessionOnly)).toBeTruthy();
});

it.each(["nl", "en"] as const)("links every %s route in order without personal URL data", locale => {
  for (const steps of Object.values(calculatorJourneys)) {
    for (const calculator of steps) {
      const view = render(<><CalculatorJourneyHeader calculator={calculator} locale={locale} />
        <PersonalizeAdviceBlock calculator={calculator} locale={locale} /></>);
      const journey = calculatorJourney(calculator);
      const progress = document.querySelector('[data-usability="route-progress"]');
      expect(progress?.querySelectorAll("a")).toHaveLength(steps.length);
      expect(progress?.querySelector('[aria-current="step"]')?.getAttribute("href"))
        .toBe(publicCalculatorHref(calculator, locale));
      expect(document.querySelector('[data-usability="next-step"] a')?.getAttribute("href"))
        .toBe(publicCalculatorHref(journey.next, locale));
      view.unmount();
    }
  }
});

it("records a reason only when visible and never repeats it on a later mount", () => {
  let reportVisibility: IntersectionObserverCallback = () => undefined;
  const disconnect = vi.fn();
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { reportVisibility = callback; }
    observe() {}
    disconnect = disconnect;
  });
  const view = render(<PersonalizeAdviceBlock calculator="saddle-height" locale="nl" />);
  expect(sessionStorage.getItem(SHOWN_REASONS_KEY)).toBeNull();
  act(() => reportVisibility([{ isIntersecting: true }] as IntersectionObserverEntry[], {} as IntersectionObserver));
  expect(JSON.parse(sessionStorage.getItem(SHOWN_REASONS_KEY)!)).toEqual(["saddle-height"]);
  expect(document.querySelector('[data-usability="account-reason"]')).not.toBeNull();
  view.unmount();
  const next = render(<PersonalizeAdviceBlock calculator="saddle-height" locale="en" />);
  expect(document.querySelector('[data-usability="account-reason"]')).toBeNull();
  expect(document.querySelector('[data-usability="next-step"]')).not.toBeNull();
  next.rerender(<PersonalizeAdviceBlock calculator="frame-size" locale="en" />);
  expect(screen.getByText(journeyMessages.en.reasons["frame-size"].text)).toBeTruthy();
  vi.unstubAllGlobals();
});

it("renders normally if session storage is blocked", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
  render(<PersonalizeAdviceBlock calculator="ftp-wkg" locale="nl" />);
  expect(screen.getByRole("link", { name: "Bewaar mijn FTP" })).toBeTruthy();
});

it("does not hide an immediately visible reason during server hydration", async () => {
  vi.stubGlobal("IntersectionObserver", class {
    callback: IntersectionObserverCallback;
    constructor(callback: IntersectionObserverCallback) { this.callback = callback; }
    observe() { this.callback([{ isIntersecting: true }] as IntersectionObserverEntry[], this as unknown as IntersectionObserver); }
    disconnect() {}
  });
  const container = document.createElement("div");
  container.innerHTML = renderToString(<PersonalizeAdviceBlock calculator="frame-size" locale="nl" />);
  document.body.append(container);
  let root: ReturnType<typeof hydrateRoot>;
  await act(async () => { root = hydrateRoot(container, <PersonalizeAdviceBlock calculator="frame-size" locale="nl" />); });
  expect(container.querySelector('[data-usability="account-reason"]')).not.toBeNull();
  expect(JSON.parse(sessionStorage.getItem(SHOWN_REASONS_KEY)!)).toEqual(["frame-size"]);
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

it.each(["nl", "en"] as const)("shows truthful %s paid options without manufacturing a narrower range", locale => {
  const { container } = render(<><CalculatorPaidChip locale={locale} />
    <CalculatorAdviceLadder locale={locale} currentRange="±49 mm" /></>);
  expect(container.querySelectorAll('[data-usability="paid-presentation"]')).toHaveLength(2);
  expect(screen.getByText("±49 mm")).toBeTruthy();
  const text = container.textContent!;
  expect(text).toMatch(/13[,.]50/);
  expect(text).toMatch(/21[,.]50/);
  expect(text).not.toMatch(/±\s*(?:23|18|8)\b/);
  expect(text).toContain(locale === "nl" ? "Betalen maakt je bereik niet smaller" : "Payment does not narrow your range");
  for (const link of screen.getAllByRole("link")) expect(link.getAttribute("href")).toBe(`/${locale}/pricing`);
});

it("does not count the auth-loading subtree replacement as a reason revisit", () => {
  vi.stubGlobal("IntersectionObserver", class {
    callback: IntersectionObserverCallback;
    constructor(callback: IntersectionObserverCallback) { this.callback = callback; }
    observe() { this.callback([{ isIntersecting: true }] as IntersectionObserverEntry[], this as unknown as IntersectionObserver); }
    disconnect() {}
  });
  const pending = { source: "session" as const, ready: false, identity: "pending", entries: [], save: vi.fn(), remove: vi.fn() };
  const view = render(<CalculatorDataContext.Provider key="pending" value={pending}>
    <PersonalizeAdviceBlock calculator="frame-size" locale="nl" />
  </CalculatorDataContext.Provider>);
  expect(sessionStorage.getItem(SHOWN_REASONS_KEY)).toBeNull();
  view.rerender(<CalculatorDataContext.Provider key="session" value={{ ...pending, ready: true, identity: "session" }}>
    <PersonalizeAdviceBlock calculator="frame-size" locale="nl" />
  </CalculatorDataContext.Provider>);
  expect(document.querySelector('[data-usability="account-reason"]')).not.toBeNull();
  expect(JSON.parse(sessionStorage.getItem(SHOWN_REASONS_KEY)!)).toEqual(["frame-size"]);
  vi.unstubAllGlobals();
});
