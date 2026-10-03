// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CalculatorBaselineTracker } from "./useCalculatorBaseline";
import { COOKIE_CONSENT_KEY, writeCookieConsent } from "@/lib/cookieConsent";

const state = vi.hoisted(() => ({ path: "/nl/calculators/saddle-height", log: vi.fn(), result: () => {},
  observe: vi.fn(), stop: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => state.path }));
vi.mock("./MarketingEventTracker", () => ({ useMarketingEventLogger: () => state.log }));
vi.mock("@/lib/analytics/calculatorBaseline", async (original) => ({
  ...await original<typeof import("@/lib/analytics/calculatorBaseline")>(),
  observeCalculatorEdits: (callback: () => void) => {
    state.observe(); state.result = callback; return state.stop;
  },
}));
beforeEach(() => {
  state.path = "/nl/calculators/saddle-height";
  state.log.mockReset(); state.observe.mockReset(); state.stop.mockReset();
  localStorage.clear(); document.cookie = `${COOKIE_CONSENT_KEY}=; Max-Age=0; Path=/`;
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("calculator baseline consent and payload", () => {
  it("sends one value-free result event after a real edit and consent, once per page view", () => {
    const view = render(<CalculatorBaselineTracker />);
    expect(state.log).not.toHaveBeenCalled();
    act(() => state.result());
    expect(state.log).not.toHaveBeenCalled();
    act(() => writeCookieConsent("essential"));
    expect(state.log).not.toHaveBeenCalled();
    act(() => writeCookieConsent("accepted"));
    act(() => state.result());
    view.rerender(<CalculatorBaselineTracker />);
    expect(state.log.mock.calls).toEqual([[{
      eventType: "calculator_result_view", sourceTag: "saddle-height", locale: "nl",
      pagePath: "/nl/calculators/saddle-height",
    }]]);
    state.path = "/en/tire-pressure-calculator?weight=80";
    view.rerender(<CalculatorBaselineTracker />);
    act(() => state.result());
    expect(state.log).toHaveBeenLastCalledWith({ eventType: "calculator_result_view",
      sourceTag: "tire-pressure", locale: "en", pagePath: "/en/tire-pressure-calculator" });
  });
  it("never subscribes on an account route", () => {
    state.path = "/nl/tools/climb-planner";
    render(<CalculatorBaselineTracker />);
    expect(state.observe).not.toHaveBeenCalled();
  });
  it("tracks consented public login clicks without putting URL query values in the payload", () => {
    const listeners = new Map<string, EventListener>();
    vi.spyOn(document, "addEventListener").mockImplementation((type, callback) => {
      listeners.set(type, callback as EventListener);
    });
    render(<><CalculatorBaselineTracker /><main><a href="/nl/login?src=saddle-height">Save</a></main></>);
    const click = () => listeners.get("click")?.({ isTrusted: true,
      target: document.querySelector("a") } as unknown as Event);
    click(); expect(state.log).not.toHaveBeenCalled();
    act(() => writeCookieConsent("accepted"));
    click();
    expect(state.log.mock.calls).toEqual([[{ eventType: "calculator_login_cta_click", sourceTag: "saddle-height",
      locale: "nl", pagePath: "/nl/calculators/saddle-height" }]]);
  });
});
