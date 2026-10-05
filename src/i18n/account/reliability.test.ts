import { describe, expect, it } from "vitest";
import { accountReliabilityMessages } from "./reliability";

describe("account reliability translations", () => {
  it("covers the same states and photo steps in Dutch and English", () => {
    expect(Object.keys(accountReliabilityMessages.nl).sort()).toEqual(Object.keys(accountReliabilityMessages.en).sort());
    expect(accountReliabilityMessages.nl.steps).toHaveLength(accountReliabilityMessages.en.steps.length);
    for (const copy of Object.values(accountReliabilityMessages)) {
      expect(Object.values(copy).every((value) => typeof value === "string" ? value.length > 0 : value.every(Boolean))).toBe(true);
    }
  });
});
