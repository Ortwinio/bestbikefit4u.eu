import { describe, expect, it } from "vitest";
import { estimateFtp } from "./ftp";
import type { EstimateInput } from "./types";

const now = Date.UTC(2026, 9, 3);
const input: EstimateInput = { sex: "male", birthDate: "1986-10-03", weightKg: 75 };

describe("source-gated demographic FTP estimate", () => {
  it.each(["male", "female"] as const)("does not invert %s W/kg classification thresholds into an estimate", (sex) => {
    const result = estimateFtp({ ...input, sex }, now);
    expect(result).toMatchObject({ status: "unavailable", reason: "unsupported_reference",
      placeholder: "[PLACEHOLDER — bron?]" });
    expect(result).not.toHaveProperty("value");
    expect(result.sources).toHaveLength(3);
    expect(result.sources.every((source) => source.url.startsWith("https://") && source.limitation)).toBe(true);
  });
  it.each([200, 0, -1, NaN])("never overwrites a supplied FTP (%s)", (ftpWatts) => {
    expect(estimateFtp({ ...input, ftpWatts }, now)).toMatchObject({ status: "unavailable", reason: "existing_value" });
  });
  it.each([undefined, "prefer_not_to_say"] as const)("does not infer sex when %s", (sex) => {
    expect(estimateFtp({ ...input, sex }, now)).toMatchObject({ reason: "sex_not_provided" });
  });
  it.each(["birthDate", "weightKg"] as const)("requires %s", (field) => {
    expect(estimateFtp({ ...input, [field]: undefined }, now)).toMatchObject({ reason: "missing_inputs" });
  });
  it.each(["1986-02-30", "2027-01-01", "1920-01-01", "2020-01-01", "not-a-date"])(
    "rejects invalid or out-of-scope birth date %s", (birthDate) => {
      expect(estimateFtp({ ...input, birthDate }, now)).toMatchObject({ reason: "invalid_inputs" });
    },
  );
  it.each([NaN, Infinity, -1, 0, 1000])("rejects invalid weight %s", (weightKg) => {
    expect(estimateFtp({ ...input, weightKg }, now)).toMatchObject({ reason: "invalid_inputs" });
  });
  it.each([NaN, Infinity])("rejects invalid evaluation time %s", (date) => {
    expect(estimateFtp(input, date)).toMatchObject({ reason: "invalid_inputs" });
  });
  it("is deterministic and does not mutate caller input", () => {
    const frozen = Object.freeze({ ...input });
    expect(estimateFtp(frozen, now)).toEqual(estimateFtp(frozen, now));
    expect(frozen).toEqual(input);
  });
});
