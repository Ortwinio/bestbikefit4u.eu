import { describe, expect, it } from "vitest";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { buildGearingPersistence, buildGearingPrefill } from "./gearingPrefill";

const bike = {
  bikeType: "gravel", gearing: { drivetrainType: "2x", chainrings: [31, 48], cassetteTeeth: [36, 11, 15],
    wheelCircumferenceMm: 2200, groupsetName: "GRX" }, bikeWeightKg: 10,
} as Doc<"bikes">;
const saved = {
  drivetrainType: "2x", chainrings: [34, 52], cassetteTeeth: [34, 11, 17],
  wheelCircumferenceMm: 2150, cadenceRpm: 95, riderWeightKg: 68, ftpWatts: 250, groupsetName: "Saved",
} as Doc<"gearingSessions">["input"];
describe("gearing account adapters", () => {
  it("prefers saved values over bike data and maps unordered rings/cogs", () => {
    expect(buildGearingPrefill(saved, bike)).toMatchObject({
      outerChainringTeeth: 52, innerChainringTeeth: 34, cadenceRpm: 95,
      cassetteSmallestCogTeeth: 11, cassetteLargestCogTeeth: 34, wheelCircumferenceMm: 2150,
    });
  });
  it("uses bike values before public defaults", () => {
    expect(buildGearingPrefill(undefined, bike)).toMatchObject({ outerChainringTeeth: 48, innerChainringTeeth: 31,
      cassetteLargestCogTeeth: 36, wheelCircumferenceMm: 2200, bikeType: "gravel", cadenceRpm: 80 });
    expect(buildGearingPrefill()).toMatchObject({ outerChainringTeeth: 50, innerChainringTeeth: 34,
      cassetteLargestCogTeeth: 34, wheelCircumferenceMm: 2105, bikeType: "road", cadenceRpm: 80 });
  });
  it("keeps optional saved fields and unchanged complete cassette", () => {
    expect(buildGearingPersistence(buildGearingPrefill(saved, bike), saved, bike))
      .toMatchObject({ cassetteTeeth: saved.cassetteTeeth, ftpWatts: 250, riderWeightKg: 68, groupsetName: "Saved" });
  });
  it("does not inject hidden profile values and replaces changed cassette endpoints", () => {
    const values = { ...buildGearingPrefill(undefined, bike), cassetteLargestCogTeeth: 40 };
    const input = buildGearingPersistence(values, undefined, bike);
    expect(input).toMatchObject({ cassetteTeeth: [11, 40] });
    expect(input.riderWeightKg).toBeUndefined();
    expect(input.bikeWeightKg).toBeUndefined();
  });
});
