// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CalculatorBaselineTracker } from "@/components/analytics/useCalculatorBaseline";
import { writeCookieConsent } from "@/lib/cookieConsent";
import { PersonalizeAdviceBlock, handoffLoginHref } from "./PersonalizeAdviceBlock";
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
  it.each(["nl", "en"] as const)("renders every calculator in %s with no default handoff", (locale) => {
    for (const calculator of Object.keys(handoffMessages[locale].calculators) as HandoffCalculator[]) {
      const view = render(<PersonalizeAdviceBlock calculator={calculator} locale={locale} />);
      const copy = handoffMessages[locale];
      expect(screen.getByText(copy.calculators[calculator].headline)).toBeTruthy();
      expect(screen.getByText(copy.empty)).toBeTruthy();
      expect(screen.getByRole("link", { name: copy.cta }).getAttribute("href"))
        .toBe(`/${locale}/login?src=${calculator}&handoff=1`);
      expect(sessionStorage.getItem(HANDOFF_KEY)).toBeNull();
      view.unmount();
    }
  });
  it("updates the count at three touches and preserves provenance without values in the URL", () => {
    render(<PersonalizeAdviceBlock calculator="saddle-height" locale="nl" />);
    act(() => {
      writeHandoffEntry({ field: "inseamCm", value: 81, unit: "cm", calculator: "saddle-height",
        method: "estimated", touchedAt: Date.now() });
      writeHandoffEntry({ field: "heightCm", value: 174, unit: "cm", calculator: "frame-size",
        method: "measured", touchedAt: Date.now() });
      writeHandoffEntry({ field: "ridingGoal", value: "balanced", unit: "none", calculator: "saddle-height",
        method: "declared", touchedAt: Date.now() });
    });
    expect(screen.getByText("3 gegevens klaar om te bewaren")).toBeTruthy();
    expect(screen.getByText("Lichaamslengte (vorige calculator)")).toBeTruthy();
    expect(screen.getByText("81 cm")).toBeTruthy();
    expect(screen.getByText("geschat")).toBeTruthy();
    const url = new URL(handoffLoginHref("saddle-height", "nl"), "https://bestbikefit4u.eu");
    expect([...url.searchParams.keys()]).toEqual(["src", "handoff"]);
    expect(url.href).not.toMatch(/81|174|balanced/);
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
  const anchor = screen.getByRole("link", { name: handoffMessages[locale].cta });
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

it.each(["nl", "en"] as const)("updates the %s retention line when consent changes", locale => {
  const copy = handoffMessages[locale];
  render(<PersonalizeAdviceBlock calculator="saddle-height" locale={locale} />);
  expect(screen.getByText(copy.sessionOnly)).toBeTruthy();
  act(() => writeCookieConsent("accepted"));
  expect(screen.getByText(copy.persistentRetention)).toBeTruthy();
  expect(screen.queryByText(copy.sessionOnly)).toBeNull();
  act(() => writeCookieConsent("essential"));
  expect(screen.getByText(copy.sessionOnly)).toBeTruthy();
  expect(screen.queryByText(copy.persistentRetention)).toBeNull();
});
it("keeps the prefill notice consistent with browser retention", () => {
  render(<HandoffPrefillNotice calculator="saddle-height" locale="nl" fields={["inseamCm"]} />);
  expect(screen.getByText(handoffMessages.nl.sessionOnly)).toBeTruthy();
  act(() => writeCookieConsent("accepted"));
  expect(screen.getByText(handoffMessages.nl.persistentRetention)).toBeTruthy();
});
