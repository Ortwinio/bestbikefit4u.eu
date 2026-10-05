// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readCookieConsent, writeCookieConsent } from "./cookieConsent";
import { HANDOFF_KEY, readHandoff, writeHandoffEntry } from "./handoff/store";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  document.cookie = "bf_cookie_consent=; Max-Age=0; Path=/";
});
afterEach(() => vi.restoreAllMocks());
const touch = () => writeHandoffEntry({
  field: "inseamCm", value: 81, unit: "cm", calculator: "saddle-height",
  method: "measured", touchedAt: Date.now(),
});

describe("consent and session-only calculator data", () => {
  it("preserves touched session data on acceptance and withdrawal without persistent storage", () => {
    touch();
    const initialEntries = readHandoff().entries;
    expect(sessionStorage.getItem(HANDOFF_KEY)).not.toBeNull();
    writeCookieConsent("accepted");
    expect(localStorage.getItem(HANDOFF_KEY)).toBeNull();
    expect(sessionStorage.getItem(HANDOFF_KEY)).not.toBeNull();
    expect(readHandoff().entries).toEqual(initialEntries);
    expect(document.cookie).not.toContain("81");
    writeCookieConsent("essential");
    expect(localStorage.getItem(HANDOFF_KEY)).toBeNull();
    expect(sessionStorage.getItem(HANDOFF_KEY)).not.toBeNull();
    expect(readHandoff().entries).toEqual(initialEntries);
    sessionStorage.clear();
    expect(readHandoff().entries).toEqual([]);
  });
  it.each(["accepted", "essential"] as const)("clears legacy persistent data with %s consent", choice => {
    touch();
    const initialEntries = readHandoff().entries;
    localStorage.setItem(HANDOFF_KEY, JSON.stringify({ version: 1,
      entries: [{ ...initialEntries[0], value: 99 }] }));
    writeCookieConsent(choice);
    expect(localStorage.getItem(HANDOFF_KEY)).toBeNull();
    expect(readHandoff().entries).toEqual(initialEntries);
  });
  it("reads and writes cookie consent when browser storage is denied", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("denied"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("denied"); });
    expect(readCookieConsent()).toBeNull();
    expect(() => writeCookieConsent("essential")).not.toThrow();
    expect(readCookieConsent()).toBe("essential");
  });
});
