// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { useLeaveDataNoticeAnalytics } from "./useLeaveDataNoticeAnalytics";

const state = vi.hoisted(() => ({ consent: false, path: "/nl/calculators/frame-size?height=180#result" }));
vi.mock("next/navigation", () => ({ usePathname: () => state.path }));
vi.mock("@/lib/cookieConsent", () => ({ canTrackMarketing: () => state.consent }));

beforeEach(() => {
  state.consent = false;
  state.path = "/nl/calculators/frame-size?height=180#result";
});

it("does not send on mount or without consent", () => {
  const log = vi.fn();
  const { result } = renderHook(() => useLeaveDataNoticeAnalytics("nl", log));
  expect(log).not.toHaveBeenCalled();
  act(() => { result.current("shown"); result.current("signup"); result.current("dismissed"); });
  expect(log).not.toHaveBeenCalled();
});

it("sends each consented action once, only with locale and sanitized page path", () => {
  state.consent = true;
  const log = vi.fn();
  const { result } = renderHook(() => useLeaveDataNoticeAnalytics("nl", log));
  for (const action of ["shown", "signup", "dismissed"] as const) {
    act(() => { result.current(action); result.current(action); });
    expect(log).toHaveBeenCalledWith({ eventType: `leave_data_notice_${action}`,
      locale: "nl", pagePath: "/nl/calculators/frame-size" });
  }
  expect(log).toHaveBeenCalledTimes(3);
});

it("respects consent withdrawal without replaying denied interactions", () => {
  const log = vi.fn();
  const { result } = renderHook(() => useLeaveDataNoticeAnalytics("nl", log));
  act(() => result.current("shown"));
  state.consent = true;
  act(() => result.current("signup"));
  state.consent = false;
  act(() => result.current("dismissed"));
  expect(log).toHaveBeenCalledOnce();
  expect(log.mock.calls[0][0].eventType).toBe("leave_data_notice_signup");
});

it("does not log an unlocalized or mismatched page", () => {
  state.consent = true;
  state.path = "/en/calculators/frame-size";
  const log = vi.fn();
  const { result } = renderHook(() => useLeaveDataNoticeAnalytics("nl", log));
  act(() => result.current("shown"));
  expect(log).not.toHaveBeenCalled();
});
