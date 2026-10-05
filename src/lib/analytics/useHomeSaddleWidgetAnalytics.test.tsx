// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { COOKIE_CONSENT_KEY, writeCookieConsent } from "@/lib/cookieConsent";
import { useHomeSaddleWidgetAnalytics } from "./useHomeSaddleWidgetAnalytics";

const state = vi.hoisted(() => ({ path: "/nl" as string | null, log: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => state.path }));

beforeEach(() => {
  state.path = "/nl";
  state.log.mockReset();
  localStorage.clear();
  document.cookie = `${COOKIE_CONSENT_KEY}=; Max-Age=0; Path=/`;
});
afterEach(cleanup);

describe("homepage saddle interaction analytics", () => {
  it("does not log mounting or interactions without marketing consent", () => {
    const { result } = renderHook(() => useHomeSaddleWidgetAnalytics(state.log));
    expect(state.log).not.toHaveBeenCalled();
    act(() => result.current.trackHomeSaddleWidgetUsed());
    act(() => writeCookieConsent("essential"));
    act(() => result.current.trackHomeSaddleWidgetUsed());
    expect(state.log).not.toHaveBeenCalled();
  });

  it.each(["nl", "en"])("logs the %s homepage once without measurements or URL data", (locale) => {
    state.path = `/${locale}/?height=190&email=rider@example.com#inseam=89`;
    writeCookieConsent("accepted");
    const { result, rerender } = renderHook(() => useHomeSaddleWidgetAnalytics(state.log));
    expect(state.log).not.toHaveBeenCalled();
    act(() => result.current.trackHomeSaddleWidgetUsed());
    rerender();
    act(() => result.current.trackHomeSaddleWidgetUsed());
    expect(state.log.mock.calls).toEqual([[{
      eventType: "home_saddle_widget_used", sourceTag: "saddle-height",
      locale, pagePath: `/${locale}`,
    }]]);
  });

  it.each([null, "", "/", "/de", "/nl/home", "/en/pricing", "/nl/dashboard",
    "/nl/calculators/saddle-height", "/en/calculators/saddle-height", "//nl", "/nl//"])(
    "ignores non-homepage path %s", (pathname) => {
      state.path = pathname;
      writeCookieConsent("accepted");
      const { result } = renderHook(() => useHomeSaddleWidgetAnalytics(state.log));
      act(() => result.current.trackHomeSaddleWidgetUsed());
      expect(state.log).not.toHaveBeenCalled();
    },
  );

  it("requires a fresh interaction after consent and honors withdrawal", () => {
    const { result, rerender } = renderHook(() => useHomeSaddleWidgetAnalytics(state.log));
    act(() => result.current.trackHomeSaddleWidgetUsed());
    act(() => writeCookieConsent("accepted"));
    expect(state.log).not.toHaveBeenCalled();
    act(() => result.current.trackHomeSaddleWidgetUsed());
    state.path = "/en";
    rerender();
    act(() => writeCookieConsent("essential"));
    act(() => result.current.trackHomeSaddleWidgetUsed());
    expect(state.log).toHaveBeenCalledTimes(1);
    act(() => writeCookieConsent("accepted"));
    expect(state.log).toHaveBeenCalledTimes(1);
    act(() => result.current.trackHomeSaddleWidgetUsed());
    expect(state.log).toHaveBeenCalledTimes(2);
  });

  it("deduplicates each locale across navigation and logger changes", () => {
    writeCookieConsent("accepted");
    const { result, rerender } = renderHook(() => useHomeSaddleWidgetAnalytics(state.log));
    for (const pathname of ["/nl", "/en", "/nl"]) {
      state.path = pathname;
      rerender();
      act(() => result.current.trackHomeSaddleWidgetUsed());
    }
    expect(state.log).toHaveBeenCalledTimes(2);
    state.log = vi.fn();
    rerender();
    act(() => result.current.trackHomeSaddleWidgetUsed());
    expect(state.log).not.toHaveBeenCalled();
  });
});
