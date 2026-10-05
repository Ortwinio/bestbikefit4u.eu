// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { COOKIE_CONSENT_KEY, writeCookieConsent } from "@/lib/cookieConsent";
import { useSaddleReliabilityAnalytics } from "./useSaddleReliabilityAnalytics";

const state = vi.hoisted(() => ({ path: "/nl/calculators/saddle-height", log: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => state.path }));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({ useMarketingEventLogger: () => state.log }));

beforeEach(() => {
  state.path = "/nl/calculators/saddle-height";
  state.log.mockReset();
  localStorage.clear();
  document.cookie = `${COOKIE_CONSENT_KEY}=; Max-Age=0; Path=/`;
});
afterEach(cleanup);

describe("saddle reliability interaction analytics", () => {
  it("does not log hydration or interactions without marketing consent", () => {
    const { result } = renderHook(useSaddleReliabilityAnalytics);
    expect(state.log).not.toHaveBeenCalled();
    act(() => {
      result.current.trackQuickFixUsed();
      result.current.trackInseamAdded();
      writeCookieConsent("essential");
      result.current.trackQuickFixUsed();
      result.current.trackInseamAdded();
    });
    expect(state.log).not.toHaveBeenCalled();
  });

  it.each(["nl", "en"])("logs each %s interaction once without measurements or query data", (locale) => {
    state.path = `/${locale}/calculators/saddle-height?height=190#inseam=89`;
    writeCookieConsent("accepted");
    const { result, rerender } = renderHook(useSaddleReliabilityAnalytics);
    act(() => {
      result.current.trackQuickFixUsed();
      result.current.trackInseamAdded();
    });
    rerender();
    act(() => {
      result.current.trackQuickFixUsed();
      result.current.trackInseamAdded();
    });
    expect(state.log.mock.calls).toEqual(["quick_fix_used", "inseam_added"].map((eventType) => [{
      eventType, sourceTag: "saddle-height", locale, pagePath: `/${locale}/calculators/saddle-height`,
    }]));
  });

  it("does not record on other public or account routes", () => {
    writeCookieConsent("accepted");
    const { result, rerender } = renderHook(useSaddleReliabilityAnalytics);
    for (const path of ["/nl/calculators/gearing", "/nl/dashboard", "/nl/profile"]) {
      state.path = path;
      rerender();
      act(() => {
        result.current.trackQuickFixUsed();
        result.current.trackInseamAdded();
      });
    }
    expect(state.log).not.toHaveBeenCalled();
  });

  it("only logs a fresh interaction after consent rather than replaying rejected events", () => {
    const { result } = renderHook(useSaddleReliabilityAnalytics);
    act(() => result.current.trackQuickFixUsed());
    act(() => writeCookieConsent("accepted"));
    expect(state.log).not.toHaveBeenCalled();
    act(() => result.current.trackQuickFixUsed());
    expect(state.log).toHaveBeenCalledTimes(1);
  });
});
