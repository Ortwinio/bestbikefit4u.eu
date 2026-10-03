import { describe, expect, it } from "vitest";
import { scoreAdviceReliability, scoreBike } from "./index";

const now = Date.UTC(2026, 9, 3);

describe("advice reliability", () => {
  it("scores only selected fields, not the whole profile or engine confidence", () => {
    const input = { profile: { inseamCm: 81 }, riderFields: ["inseamCm"], bikeFields: [] };
    expect(scoreAdviceReliability(input, now).reliability).toBe(85);
    expect(scoreAdviceReliability({ ...input, profile: { ...input.profile, heightCm: 180, ftpWatts: 290 } }, now))
      .toEqual(scoreAdviceReliability(input, now));
  });

  it("normalizes weights without dropping missing required inputs", () => {
    const result = scoreAdviceReliability({ profile: { inseamCm: 81 },
      riderFields: ["inseamCm", "heightCm"], bikeFields: [] }, now);
    expect(result.completeness).toBe(66.7);
    expect(result.reliability).toBe(56.7);
    expect(result.missingFields).toEqual([{ scope: "rider", field: "heightCm" }]);
  });

  it("does not require unselected siblings from a compound rule", () => {
    const result = scoreAdviceReliability({ profile: { shoeSizeEu: 42 },
      riderFields: ["shoeSizeEu"], bikeFields: [] }, now);
    expect(result.completeness).toBe(100);
    expect(result.missingFields).toEqual([]);
  });

  it("uses derived quality and freshness for the actual selected input", () => {
    const result = scoreAdviceReliability({ profile: { ftpWatts: 230 },
      observations: [{ field: "ftpWatts", value: 230, kind: "derived", recordedAt: Date.UTC(2025, 1, 1) }],
      riderFields: ["ftpWatts"], bikeFields: [] }, now);
    expect(result.reliability).toBe(24);
    expect(result.items[0].freshness).toBe(0.8);
  });

  it("deduplicates selected fields and handles empty selections without a false score", () => {
    expect(scoreAdviceReliability({ riderFields: [], bikeFields: [] }, now).reliability).toBe(0);
    expect(scoreAdviceReliability({ profile: { inseamCm: 81 },
      riderFields: ["inseamCm", "inseamCm"], bikeFields: [] }, now).items).toHaveLength(1);
    expect(() => scoreAdviceReliability({ riderFields: ["unknown"], bikeFields: [] }, now)).toThrow(RangeError);
  });

  it("retains array evidence by structural equality and rejects differing arrays", () => {
    const input = { bike: { gearing: { chainrings: [34, 50] } }, riderFields: [], bikeFields: ["gearing.chainrings"] };
    expect(scoreAdviceReliability({ ...input, observations: [{ field: "gearing.chainrings", value: [34, 50],
      kind: "declared", method: "component_label" }] }, now).reliability).toBe(90);
    expect(scoreAdviceReliability({ ...input, observations: [{ field: "gearing.chainrings", value: [50, 34],
      kind: "declared", method: "component_label" }] }, now).reliability).toBe(60);
  });

  it.each([["geometry_database", 95], ["strava_import", 70], ["listing_import", 70]] as const)(
    "recognizes evidenced legacy %s without treating values alone as measured", (method, expected) => {
      const input = { bike: { currentGeometry: { stackMm: 560 } }, riderFields: [], bikeFields: ["currentGeometry.stackMm"] };
      expect(scoreAdviceReliability({ ...input, observations: [{ field: "currentGeometry.stackMm", value: 560,
        source: "legacy_migration", kind: "declared", method }] }, now).reliability).toBe(expected);
      expect(scoreAdviceReliability(input, now).reliability).toBe(60);
      expect(scoreAdviceReliability({ ...input, observations: [{ field: "currentGeometry.stackMm", value: 560,
        source: "legacy_migration", kind: "derived", method }] }, now).reliability).toBe(30);
    });

  it("applies structural equality in the complete bike score too", () => {
    const score = scoreBike({ bike: { gearing: { chainrings: [34, 50], cassetteTeeth: [11, 32] } },
      observations: ["chainrings", "cassetteTeeth"].map(field => ({ field: `gearing.${field}`,
        value: field === "chainrings" ? [34, 50] : [11, 32], method: "component_label" })) }, now);
    expect(score.items.find(item => item.key === "gears")?.reliability).toBe(3.6);
  });

  it("does not attach rider evidence or another bike's evidence to the selected bike", () => {
    const input = { bike: { _id: "bike-one", cleatSystem: "spd" }, riderFields: [], bikeFields: ["cleatSystem"] };
    for (const bikeId of [undefined, "bike-two"]) {
      expect(scoreAdviceReliability({ ...input, observations: [{ field: "cleatSystem", value: "spd",
        bikeId, kind: "declared", method: "component_label" }] }, now).reliability).toBe(60);
    }
    expect(scoreAdviceReliability({ ...input, observations: [{ field: "cleatSystem", value: "spd",
      bikeId: "bike-one", kind: "declared", method: "component_label" }] }, now).reliability).toBe(90);
  });
});
