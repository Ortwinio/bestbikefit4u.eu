import { describe, expect, it } from "vitest";
import { assertAggregateReport, parseDate } from "./riderprofile-baseline.mjs";

describe("baseline report CLI guards", () => {
  it("parses UTC dates and rejects calendar rollover and command text", () => {
    expect(parseDate("2026-10-03")).toBe(Date.UTC(2026, 9, 3));
    for (const value of ["2026-02-30", "2026-13-01", "2026-10-03; echo private", "", undefined]) {
      expect(() => parseDate(value)).toThrow();
    }
  });
  it("rejects unexpected or private query output before writing files", () => {
    const base = { version: 1, publicCalculators: [], limitations: [] };
    expect(() => assertAggregateReport(base)).not.toThrow();
    expect(() => assertAggregateReport({ ...base, userId: "private" })).toThrow();
    expect(() => assertAggregateReport({ ...base, nested: { email: "a@example.com" } })).toThrow();
    expect(() => assertAggregateReport({ ...base, arbitrary: "a@example.com" })).toThrow();
    expect(() => assertAggregateReport([])).toThrow();
  });
});
