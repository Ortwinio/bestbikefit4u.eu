// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearHandoff, HANDOFF_KEY, HANDOFF_MAX_BYTES, HANDOFF_MAX_ENTRIES, readHandoff,
  subscribeHandoff, writeHandoffEntry, getHandoffRetention, HANDOFF_MAX_AGE_MS,
  syncHandoffConsent, removeHandoffEntry, mergeHandoffEntries, type HandoffEntry,
} from "./store";

const entry: HandoffEntry = {
  field: "inseamCm", value: 81, unit: "cm", calculator: "saddle-height", method: "measured", touchedAt: 1000,
};
const seed = (target: Storage, entries: HandoffEntry[]) =>
  target.setItem(HANDOFF_KEY, JSON.stringify({ version: 1, entries }));

beforeEach(() => {
  vi.spyOn(Date, "now").mockReturnValue(2000);
  sessionStorage.clear();
  localStorage.clear();
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe("session-only calculator data", () => {
  it("does not save untouched defaults", () => {
    expect(readHandoff()).toEqual({ version: 1, entries: [] });
    expect(sessionStorage.getItem(HANDOFF_KEY)).toBeNull();
  });
  it.each(["accepted", "essential", null] as const)("never persists values with consent %s", choice => {
    seed(localStorage, [{ ...entry, value: 99 }]);
    writeHandoffEntry(entry);
    syncHandoffConsent(choice);
    expect(getHandoffRetention()).toBe("session");
    expect(readHandoff().entries).toEqual([entry]);
    expect(localStorage.getItem(HANDOFF_KEY)).toBeNull();
  });
  it("clears legacy persistent values without reviving them in a new session", () => {
    seed(localStorage, [entry]);
    expect(readHandoff().entries).toEqual([]);
    expect(localStorage.getItem(HANDOFF_KEY)).toBeNull();
    writeHandoffEntry(entry);
    sessionStorage.clear();
    expect(readHandoff().entries).toEqual([]);
  });
  it("preserves validated provenance and strips unknown properties", () => {
    const provenance = { ...entry, kind: "measured" as const, measurementMethod: "book",
      repeatCount: 3, withinTolerance: true, unresolvedWarning: false };
    seed(sessionStorage, [{ ...provenance, extra: "untrusted" } as HandoffEntry]);
    expect(readHandoff().entries).toEqual([provenance]);
  });
  it.each([
    "not JSON", "null", JSON.stringify({ version: 2, entries: [entry] }),
    JSON.stringify({ version: 1, entries: Array(HANDOFF_MAX_ENTRIES + 1).fill(entry) }),
    JSON.stringify({ version: 1, entries: [entry, entry] }), " ".repeat(HANDOFF_MAX_BYTES + 1),
  ])("discards invalid stored records", raw => {
    sessionStorage.setItem(HANDOFF_KEY, raw);
    expect(readHandoff().entries).toEqual([]);
  });
  it.each([
    { field: "unknown" }, { unit: "mm" }, { calculator: "unknown" }, { method: "derived" },
    { value: Infinity }, { touchedAt: 0 }, { touchedAt: 1.5 }, { value: "81" },
    { field: "ftpMethod", unit: "none", value: "a".repeat(121) },
    { kind: "unknown" }, { repeatCount: 0 }, { withinTolerance: "yes" }, { unresolvedWarning: 1 },
  ])("rejects malformed entries", patch => {
    writeHandoffEntry({ ...entry, ...patch } as HandoffEntry);
    expect(readHandoff().entries).toEqual([]);
  });
  it("keeps measured data over newer declared data and newest equal-quality data", () => {
    writeHandoffEntry(entry);
    writeHandoffEntry({ ...entry, value: 82, method: "declared", touchedAt: 1200 });
    expect(readHandoff().entries).toEqual([entry]);
    writeHandoffEntry({ ...entry, value: 83, touchedAt: 1300 });
    writeHandoffEntry({ ...entry, value: 70, touchedAt: 900 });
    expect(readHandoff().entries[0].value).toBe(83);
  });
  it("merges measured over declared even when the measured observation is older", () => {
    expect(mergeHandoffEntries([{ ...entry, method: "declared", touchedAt: 1500 }], [entry])).toEqual([entry]);
    expect(mergeHandoffEntries([{ ...entry, kind: "derived", touchedAt: 1500 }], [entry])).toEqual([entry]);
  });
  it("uses the profile quality order measured, declared, estimated, derived", () => {
    const kinds = ["measured", "declared", "estimated", "derived"] as const;
    for (let higherIndex = 0; higherIndex < kinds.length; higherIndex += 1) {
      for (let lowerIndex = higherIndex + 1; lowerIndex < kinds.length; lowerIndex += 1) {
        const higher = { ...entry, kind: kinds[higherIndex] };
        const lower = { ...entry, kind: kinds[lowerIndex], touchedAt: 1500 };
        expect(mergeHandoffEntries([higher], [lower])).toEqual([higher]);
        expect(mergeHandoffEntries([lower], [higher])).toEqual([higher]);
      }
    }
  });
  it("keeps the existing observation when quality and timestamp are identical", () => {
    expect(mergeHandoffEntries([entry], [{ ...entry, value: 82 }])).toEqual([entry]);
  });
  it("supports shared power, journey and hip measurements", () => {
    writeHandoffEntry({ ...entry, field: "powerWatts", value: 210, unit: "W" });
    writeHandoffEntry({ ...entry, field: "distanceKm", value: 80, unit: "km" });
    writeHandoffEntry({ ...entry, field: "hipCircumferenceCm", value: 94 });
    expect(readHandoff().entries).toHaveLength(3);
  });
  it("notifies same-tab subscribers and allows explicit removal", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeHandoff(listener);
    writeHandoffEntry(entry);
    removeHandoffEntry("inseamCm");
    expect(readHandoff().entries).toEqual([]);
    clearHandoff();
    expect(listener).toHaveBeenCalledTimes(3);
    unsubscribe();
  });
  it("does not erase session values when consent or another tab changes", () => {
    const unsubscribe = subscribeHandoff(vi.fn());
    writeHandoffEntry(entry);
    window.dispatchEvent(new Event("bf-cookie-consent-change"));
    window.dispatchEvent(new StorageEvent("storage", {
      key: HANDOFF_KEY, newValue: null, storageArea: localStorage,
    }));
    expect(readHandoff().entries).toEqual([entry]);
    unsubscribe();
  });
  it("tolerates unavailable storage", () => {
    vi.spyOn(window, "sessionStorage", "get").mockImplementation(() => { throw new Error("Unavailable"); });
    expect(readHandoff().entries).toEqual([]);
    expect(() => writeHandoffEntry(entry)).not.toThrow();
    expect(() => clearHandoff()).not.toThrow();
  });
  it("prunes expired and future data and refreshes subscribers at expiry", () => {
    vi.useFakeTimers();
    vi.spyOn(Date, "now").mockReturnValue(HANDOFF_MAX_AGE_MS + 1500);
    seed(sessionStorage, [{ ...entry, touchedAt: 2000 },
      { ...entry, field: "heightCm", touchedAt: Date.now() + 1 }]);
    const listener = vi.fn();
    const unsubscribe = subscribeHandoff(listener);
    expect(readHandoff().entries).toHaveLength(1);
    vi.spyOn(Date, "now").mockReturnValue(HANDOFF_MAX_AGE_MS + 2000);
    vi.advanceTimersByTime(500);
    expect(listener).toHaveBeenCalledOnce();
    expect(readHandoff().entries).toEqual([]);
    unsubscribe();
  });
});
