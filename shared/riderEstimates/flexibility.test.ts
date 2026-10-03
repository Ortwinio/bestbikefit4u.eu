import { describe, expect, it } from "vitest";
import { estimateFlexibility } from "./flexibility";
import { FLEXIBILITY_REFERENCE_STATUS, FLEXIBILITY_SOURCES } from "./sourcesFlexibility";
import type { EstimateInput } from "./types";

const now = Date.UTC(2026, 9, 3);
describe("estimateFlexibility", () => {
  it.each(["very_limited", "limited", "average", "good", "excellent"] as const)("never overrides existing %s", flexibilityScore => {
    expect(estimateFlexibility({ flexibilityScore }, now)).toMatchObject({ status: "unavailable", reason: "existing_value" });
    expect(estimateFlexibility({ flexibilityScore }, now)).not.toHaveProperty("value");
  });
  it.each(["female", "male"] as const)("withholds unsupported %s age-to-category estimates", sex => {
    for (const birthDate of ["2016-10-03", "2000-10-03", "1980-10-03", "1957-10-03", "1926-10-03"]) {
      const result = estimateFlexibility({ sex, birthDate }, now);
      expect(result).toMatchObject({ status: "unavailable", reason: "unsupported_reference", placeholder: "[PLACEHOLDER — bron?]" });
      expect(result).not.toHaveProperty("value");
      expect(result).not.toHaveProperty("quality");
    }
  });
  it("does not substitute missing birth dates with legacy or default ages", () => {
    expect(estimateFlexibility({ sex: "female" }, now)).toMatchObject({ reason: "missing_inputs" });
  });
  it.each([undefined, "prefer_not_to_say"] as const)("does not guess sex %s", sex => {
    expect(estimateFlexibility({ birthDate: "1980-10-03", sex }, now)).toMatchObject({ reason: "sex_not_provided" });
  });
  it.each(["2030-01-01", "1980-02-30", "1980-2-01", "1925-10-03", "2017-10-03"])("rejects invalid/unsupported date %s", birthDate => {
    expect(estimateFlexibility({ birthDate, sex: "male" }, now)).toMatchObject({ reason: "invalid_inputs" });
  });
  it("requires explicit valid time and enum values", () => {
    expect(estimateFlexibility({ birthDate: "1980-10-03", sex: "male" }, NaN)).toMatchObject({ reason: "invalid_inputs" });
    expect(estimateFlexibility({ birthDate: "1980-10-03", sex: "unknown" } as unknown as EstimateInput, now))
      .toMatchObject({ reason: "invalid_inputs" });
  });
  it("does not mutate inputs or turn unrelated FTP/weight into evidence", () => {
    const input = Object.freeze({ birthDate: "1980-10-03", sex: "female" as const, weightKg: 65, ftpWatts: 200 });
    expect(estimateFlexibility(input, now)).toEqual(estimateFlexibility({ birthDate: input.birthDate, sex: input.sex }, now));
  });
  it("keeps the unsupported table hidden and records primary sources", () => {
    expect(FLEXIBILITY_REFERENCE_STATUS).toMatchObject({ display: false, referenceTable: null });
    expect(FLEXIBILITY_SOURCES).toHaveLength(2);
    expect(FLEXIBILITY_SOURCES.every(source => source.url.startsWith("https://") && source.limitation.length > 0)).toBe(true);
  });
});
