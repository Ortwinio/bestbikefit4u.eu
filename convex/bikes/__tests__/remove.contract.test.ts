import { describe, expect, it } from "vitest";
import { getCopyableBikeFields } from "../passport";
import { isManagedBikeStorageId } from "../mutations";

describe("bikes.remove storage cleanup", () => {
  it("keeps external legacy photo URLs out of Convex storage deletion", () => {
    expect(isManagedBikeStorageId("https://images.example.com/bike.jpg")).toBe(false);
    expect(isManagedBikeStorageId("http://images.example.com/bike.jpg")).toBe(false);
  });

  it("allows Convex-managed storage ids to be deleted", () => {
    expect(isManagedBikeStorageId("kg2f3c9p0m4n1z8r7")).toBe(true);
  });

  it("rejects empty values", () => {
    expect(isManagedBikeStorageId("")).toBe(false);
    expect(isManagedBikeStorageId(null)).toBe(false);
    expect(isManagedBikeStorageId(undefined)).toBe(false);
  });

  it("includes geometry linkage fields in passport-copyable bike data", () => {
    const copyable = getCopyableBikeFields({
      name: "Race Bike",
      bikeType: "road",
      currentGeometry: undefined,
      currentSetup: undefined,
      discipline: "road",
      ridingStyle: "racing",
      primaryGoal: "performance",
      bikeWeightKg: 7.8,
      brand: "Canyon",
      model: "Ultimate",
      bikeModelId: "model_1" as never,
      geometryRecordId: "record_1" as never,
      description: "Fast bike",
      descriptionSource: "manual",
    } as never);

    expect(copyable.bikeModelId).toBe("model_1");
    expect(copyable.geometryRecordId).toBe("record_1");
  });
});
