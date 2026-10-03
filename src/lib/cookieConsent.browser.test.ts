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

describe("consent and remembered calculator data", () => {
  it("promotes touched session data on acceptance and clears both stores on withdrawal without subscribers", () => {
    touch();
    expect(sessionStorage.getItem(HANDOFF_KEY)).not.toBeNull();
    writeCookieConsent("accepted");
    expect(localStorage.getItem(HANDOFF_KEY)).not.toBeNull();
    expect(sessionStorage.getItem(HANDOFF_KEY)).toBeNull();
    expect(document.cookie).not.toContain("81");
    writeCookieConsent("essential");
    expect(localStorage.getItem(HANDOFF_KEY)).toBeNull();
    expect(sessionStorage.getItem(HANDOFF_KEY)).toBeNull();
    expect(readHandoff().entries).toEqual([]);
  });
  it("reads and writes cookie consent when browser storage is denied", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("denied"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("denied"); });
    expect(readCookieConsent()).toBeNull();
    expect(() => writeCookieConsent("essential")).not.toThrow();
    expect(readCookieConsent()).toBe("essential");
  });
});
