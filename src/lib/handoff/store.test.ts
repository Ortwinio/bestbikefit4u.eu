// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearHandoff, HANDOFF_KEY, HANDOFF_MAX_BYTES, readHandoff, subscribeHandoff, writeHandoffEntry,
  getHandoffRetention, HANDOFF_MAX_AGE_MS, syncHandoffConsent, removeHandoffEntry, type HandoffEntry,
} from "./store";

const entry: HandoffEntry = {
  field: "inseamCm", value: 81, unit: "cm", calculator: "saddle-height", method: "measured", touchedAt: 1000,
};
beforeEach(() => {
  vi.spyOn(Date, "now").mockReturnValue(2000);
  sessionStorage.clear();
  localStorage.clear();
  document.cookie = "bf_cookie_consent=; Max-Age=0; Path=/";
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe("public handoff storage", () => {
  it("reading untouched calculator defaults never creates session data", () => {
    expect(readHandoff()).toEqual({ version: 1, entries: [] });
    expect(sessionStorage.getItem(HANDOFF_KEY)).toBeNull();
  });
  it("keeps provenance, replaces only the explicitly touched field and ignores older writes", () => {
    writeHandoffEntry(entry);
    writeHandoffEntry({ ...entry, field: "heightCm", value: 180, calculator: "frame-size", touchedAt: 1100 });
    expect(readHandoff().entries[0]).toEqual(entry);
    writeHandoffEntry({ ...entry, value: 82, method: "estimated", touchedAt: 1200 });
    writeHandoffEntry({ ...entry, value: 70, touchedAt: 900 });
    expect(readHandoff().entries).toHaveLength(2);
    expect(readHandoff().entries[1]).toEqual({ ...entry, value: 82, method: "estimated", touchedAt: 1200 });
  });
  it.each([
    "not JSON", "null", JSON.stringify({ version: 2, entries: [entry] }),
    JSON.stringify({ version: 1, entries: Array(33).fill(entry) }),
    JSON.stringify({ version: 1, entries: [entry, entry] }),
    " ".repeat(HANDOFF_MAX_BYTES + 1),
  ])("ignores unusable session records", (raw) => {
    sessionStorage.setItem(HANDOFF_KEY, raw);
    expect(readHandoff().entries).toEqual([]);
  });
  it.each([
    { field: "unknown" }, { unit: "mm" }, { calculator: "unknown" }, { method: "derived" },
    { value: Infinity }, { touchedAt: 0 }, { touchedAt: 1.5 }, { value: "81" },
    { field: "ftpMethod", unit: "none", value: "a".repeat(121) },
  ])("rejects malformed incoming entries", (patch) => {
    writeHandoffEntry({ ...entry, ...patch } as HandoffEntry);
    expect(sessionStorage.getItem(HANDOFF_KEY)).toBeNull();
  });
  it("rejects malformed stored entries and does not forward additional properties", () => {
    sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ version: 1, entries: [{ ...entry, unit: "kg" }] }));
    expect(readHandoff().entries).toEqual([]);
    sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ version: 1, entries: [{ ...entry, extra: "untrusted" }] }));
    expect(readHandoff().entries).toEqual([entry]);
  });
  it("notifies same-tab readers on an explicit write and on clearing", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeHandoff(listener);
    writeHandoffEntry(entry);
    clearHandoff();
    expect(listener).toHaveBeenCalledTimes(2);
    expect(sessionStorage.getItem(HANDOFF_KEY)).toBeNull();
    unsubscribe();
    writeHandoffEntry(entry);
    expect(listener).toHaveBeenCalledTimes(2);
  });
  it("does not throw when browser storage is unavailable", () => {
    vi.spyOn(window, "sessionStorage", "get").mockImplementation(() => { throw new Error("Unavailable"); });
    expect(readHandoff().entries).toEqual([]);
    expect(() => writeHandoffEntry(entry)).not.toThrow();
    expect(() => clearHandoff()).not.toThrow();
  });
});


describe("consented handoff retention", () => {
  const accept = () => localStorage.setItem("bf_cookie_consent", "accepted");
  const fresh = (): HandoffEntry => ({ ...entry, touchedAt: Date.now() - 100 });
  const seed = (target: Storage, entries: HandoffEntry[]) =>
    target.setItem(HANDOFF_KEY, JSON.stringify({ version: 1, entries }));

  it("uses session storage unless accepted and stores no values in cookies", () => {
    expect(getHandoffRetention()).toBe("session");
    writeHandoffEntry(fresh());
    expect(localStorage.getItem(HANDOFF_KEY)).toBeNull();
    accept();
    syncHandoffConsent("accepted");
    expect(getHandoffRetention()).toBe("persistent");
    expect(localStorage.getItem(HANDOFF_KEY)).not.toBeNull();
    expect(sessionStorage.getItem(HANDOFF_KEY)).toBeNull();
    expect(document.cookie).not.toContain("81");
  });
  it("promotes touched fields with their original timestamp and picks the newest per field", () => {
    const old = { ...fresh(), touchedAt: Date.now() - 1000 };
    const latest = fresh();
    seed(sessionStorage, [old]);
    seed(localStorage, [latest]);
    accept();
    expect(readHandoff().entries).toEqual([latest]);
    expect(sessionStorage.getItem(HANDOFF_KEY)).toBeNull();
  });
  it("prunes expired and future entries without extending surviving timestamps", () => {
    vi.spyOn(Date, "now").mockReturnValue(HANDOFF_MAX_AGE_MS * 2);
    accept();
    const current = fresh();
    seed(localStorage, [current, { ...current, field: "heightCm", touchedAt: Date.now() - HANDOFF_MAX_AGE_MS },
      { ...current, field: "weightKg", unit: "kg", touchedAt: Date.now() + 1000 }]);
    expect(readHandoff().entries).toEqual([current]);
    expect(JSON.parse(localStorage.getItem(HANDOFF_KEY)!).entries).toEqual([current]);
    writeHandoffEntry({ ...current, touchedAt: Date.now() - HANDOFF_MAX_AGE_MS });
    expect(readHandoff().entries).toEqual([current]);
  });
  it("keeps the session copy if promotion fails", () => {
    const current = fresh();
    seed(sessionStorage, [current]);
    accept();
    const original = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
      if (this === localStorage && key === HANDOFF_KEY) throw new Error("Quota");
      original.call(this, key, value);
    });
    expect(readHandoff().entries).toEqual([current]);
    expect(sessionStorage.getItem(HANDOFF_KEY)).not.toBeNull();
    writeHandoffEntry({ ...current, value: 82, touchedAt: Date.now() });
    expect(readHandoff().entries[0].value).toBe(82);
  });
  it("does not resurrect a removed field when a persistent write hits quota", () => {
    accept();
    const current = fresh();
    seed(localStorage, [current, { ...current, field: "heightCm", value: 180 }]);
    const original = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
      if (this === localStorage && key === HANDOFF_KEY) throw new Error("Quota");
      original.call(this, key, value);
    });
    removeHandoffEntry("inseamCm");
    expect(readHandoff().entries.map(item => item.field)).toEqual(["heightCm"]);
  });
  it("clears both stores on withdrawal, even without subscribers", () => {
    seed(localStorage, [fresh()]);
    seed(sessionStorage, [fresh()]);
    syncHandoffConsent("essential");
    expect(localStorage.getItem(HANDOFF_KEY)).toBeNull();
    expect(sessionStorage.getItem(HANDOFF_KEY)).toBeNull();
  });
  it("removes optional fields from persistent storage", () => {
    accept();
    writeHandoffEntry(fresh());
    removeHandoffEntry("inseamCm");
    expect(readHandoff().entries).toEqual([]);
    expect(localStorage.getItem(HANDOFF_KEY)).toBeNull();
  });
  it("observes consent changes and cross-tab clears", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeHandoff(listener);
    seed(sessionStorage, [fresh()]);
    accept();
    window.dispatchEvent(new Event("bf-cookie-consent-change"));
    expect(listener).toHaveBeenCalled();
    expect(localStorage.getItem(HANDOFF_KEY)).not.toBeNull();
    seed(sessionStorage, [fresh()]);
    localStorage.removeItem(HANDOFF_KEY);
    window.dispatchEvent(new StorageEvent("storage", {
      key: HANDOFF_KEY, newValue: null, storageArea: localStorage,
    }));
    expect(readHandoff().entries).toEqual([]);
    seed(sessionStorage, [fresh()]);
    localStorage.setItem("bf_cookie_consent", "essential");
    window.dispatchEvent(new StorageEvent("storage", { key: "bf_cookie_consent", newValue: "essential" }));
    expect(sessionStorage.getItem(HANDOFF_KEY)).toBeNull();
    unsubscribe();
  });
  it("falls back safely when local storage is unavailable", () => {
    document.cookie = "bf_cookie_consent=accepted; Path=/";
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => { throw new Error("Unavailable"); });
    expect(getHandoffRetention()).toBe("session");
    writeHandoffEntry(fresh());
    expect(readHandoff().entries).toHaveLength(1);
  });
});


it("expires session data and refreshes subscribers at the nearest expiry", () => {
  vi.useFakeTimers();
  vi.spyOn(Date, "now").mockReturnValue(HANDOFF_MAX_AGE_MS + 1500);
  sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ version: 1, entries: [{ ...entry, touchedAt: 2000 }] }));
  const listener = vi.fn();
  const unsubscribe = subscribeHandoff(listener);
  expect(readHandoff().entries).toHaveLength(1);
  vi.spyOn(Date, "now").mockReturnValue(HANDOFF_MAX_AGE_MS + 2000);
  vi.advanceTimersByTime(500);
  expect(listener).toHaveBeenCalledOnce();
  expect(readHandoff().entries).toEqual([]);
  expect(sessionStorage.getItem(HANDOFF_KEY)).toBeNull();
  unsubscribe();
});
