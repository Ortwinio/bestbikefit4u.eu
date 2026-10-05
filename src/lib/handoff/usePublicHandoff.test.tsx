// @vitest-environment jsdom
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { writeCookieConsent } from "@/lib/cookieConsent";
import { HANDOFF_KEY, clearHandoff, readHandoff, writeHandoffEntry } from "./store";
import { usePublicHandoff } from "./usePublicHandoff";

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  document.cookie = "bf_cookie_consent=; Max-Age=0; Path=/";
});
afterEach(cleanup);

describe("usePublicHandoff", () => {
  it("mounting and calculating with defaults does not store any fields", () => {
    const { result, rerender } = renderHook(() => usePublicHandoff("saddle-height"));
    rerender();
    expect(result.current.ready).toBe(true);
    expect(result.current.entries).toEqual([]);
    expect(sessionStorage.getItem(HANDOFF_KEY)).toBeNull();
  });
  it("prefills a second calculator without changing provenance or touched time", () => {
    const first = renderHook(() => usePublicHandoff("saddle-height"));
    act(() => first.result.current.touch("inseamCm", 81, "cm", "measured"));
    const original = readHandoff().entries[0];
    first.unmount();
    const second = renderHook(() => usePublicHandoff("frame-size"));
    expect(second.result.current.getPrefill("inseamCm")).toEqual(original);
    expect(second.result.current.getPrefill("heightCm")).toBeUndefined();
    expect(readHandoff().entries).toEqual([original]);
    act(() => second.result.current.touch("heightCm", 179, "cm"));
    expect(second.result.current.entries).toHaveLength(2);
    expect(second.result.current.initialEntries).toEqual([original]);
  });
  it("restores previous entries when returning to the same calculator", () => {
    writeHandoffEntry({
      field: "inseamCm", value: 81, unit: "cm", method: "measured", calculator: "saddle-height", touchedAt: Date.now(),
    });
    const { result } = renderHook(() => usePublicHandoff("saddle-height"));
    expect(result.current.getPrefill("inseamCm")?.value).toBe(81);
  });
  it("never reads or writes account-mode handoff data", () => {
    const { result } = renderHook(() => usePublicHandoff("saddle-height", false));
    act(() => result.current.touch("inseamCm", 81, "cm"));
    expect(result.current.ready).toBe(false);
    expect(result.current.entries).toEqual([]);
    expect(result.current.getPrefill("inseamCm")).toBeUndefined();
    expect(sessionStorage.getItem(HANDOFF_KEY)).toBeNull();
  });
  it("renders an empty server snapshot even if the browser has stored data", () => {
    writeHandoffEntry({
      field: "inseamCm", value: 81, unit: "cm", method: "measured", calculator: "saddle-height", touchedAt: Date.now(),
    });
    function Snapshot() {
      const handoff = usePublicHandoff("frame-size");
      return createElement("span", null, `${handoff.ready}:${handoff.entries.length}`);
    }
    expect(renderToString(createElement(Snapshot))).toBe("<span>false:0</span>");
    expect(readHandoff().entries).toHaveLength(1);
  });
  it("removes a cleared optional input without deleting other touched values", () => {
    const { result } = renderHook(() => usePublicHandoff("crank-length"));
    act(() => {
      result.current.touch("inseamCm", 81, "cm");
      result.current.touch("currentCrankLengthMm", 172.5, "mm", "bike");
    });
    act(() => result.current.remove("currentCrankLengthMm"));
    expect(result.current.entries.map((entry) => entry.field)).toEqual(["inseamCm"]);
    act(() => result.current.remove("inseamCm"));
    expect(sessionStorage.getItem(HANDOFF_KEY)).toBeNull();
  });
  it("updates all mounted consumers after writes and clearing", () => {
    const first = renderHook(() => usePublicHandoff("saddle-height"));
    const second = renderHook(() => usePublicHandoff("frame-size"));
    act(() => first.result.current.touch("inseamCm", 81, "cm"));
    expect(second.result.current.entries).toHaveLength(1);
    act(clearHandoff);
    expect(first.result.current.entries).toEqual([]);
    expect(second.result.current.entries).toEqual([]);
  });
});

it("keeps data session-only through consent changes and preserves the original prefill snapshot", () => {
  const { result } = renderHook(() => usePublicHandoff("saddle-height"));
  expect(result.current.retention).toBe("session");
  act(() => writeCookieConsent("accepted"));
  expect(result.current.retention).toBe("session");
  expect(result.current.entries).toEqual([]);
  expect(localStorage.getItem(HANDOFF_KEY)).toBeNull();
  act(() => result.current.touch("inseamCm", 81, "cm", "measured"));
  expect(localStorage.getItem(HANDOFF_KEY)).toBeNull();
  expect(sessionStorage.getItem(HANDOFF_KEY)).not.toBeNull();
  expect(result.current.initialEntries).toEqual([]);
  act(() => writeCookieConsent("essential"));
  expect(result.current.retention).toBe("session");
  expect(result.current.entries).toHaveLength(1);
  expect(localStorage.getItem(HANDOFF_KEY)).toBeNull();
});
