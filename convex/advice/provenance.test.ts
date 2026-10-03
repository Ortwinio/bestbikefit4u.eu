import { describe, expect, it } from "vitest";
import type { Doc, Id } from "../_generated/dataModel";
import { calculatorUsedInputs, capturePressureInputProvenance, matchInputProvenance } from "./provenance";
import type { QueryCtx } from "../_generated/server";
import { performanceDefaults } from "../../src/lib/calculators/accountState";

const userId = "owner" as Id<"users">;
const bikeId = "bike" as Id<"bikes">;
const profile = { userId, heightCm: 180, weightKg: 75 } as Doc<"profiles">;
const bike = { _id: bikeId, userId, currentGeometry: { stackMm: 550 } } as Doc<"bikes">;
function observation(overrides: Partial<Doc<"profileObservations">> = {}) {
  return { _id: "observation", userId, field: "heightCm", value: 180, status: "current", recordedAt: 10,
    ...overrides } as Doc<"profileObservations">;
}

describe("exact outcome input provenance", () => {
  it("captures linked tire and wheel fields after checking the ownership chain", async () => {
    const tireId = "tire" as Id<"tireSetups">;
    const rows: Record<string, unknown> = {
      bike,
      tire: { _id: tireId, userId, wheelsetId: "wheel", widthFrontMm: 28, widthRearMm: 30, tubeType: "tubeless" },
      wheel: { _id: "wheel", userId, bikeId, rimType: "hooked" },
    };
    const ctx = { db: {
      get: async (id: string) => rows[id] ?? null,
      query: (table: string) => ({ withIndex: () => ({
        unique: async () => table === "profiles" ? profile : null, collect: async () => [],
      }) }),
    } } as unknown as QueryCtx;
    const input = { bodyWeightKg: 75, widthFrontMm: 28, widthRearMm: 30, tubeType: "tubeless", rimType: "hooked" };
    const result = await capturePressureInputProvenance(ctx, userId, input, bikeId, tireId);
    expect(result.dependencies.find((item) => item.field === "widthFrontMm"))
      .toEqual({ field: "widthFrontMm", bikeId, value: 28, record: { table: "tireSetups", id: tireId } });
    expect(result.dependencies.find((item) => item.field === "rimType")?.record)
      .toEqual({ table: "wheelsets", id: "wheel" });
    expect(result.dependencies.find(item => item.field === "maxPressureBar")).toBeUndefined();
    const noLimit = await capturePressureInputProvenance(ctx, userId,
      { ...input, maxPressureBar: undefined }, bikeId, tireId);
    expect(noLimit.dependencies.find(item => item.field === "maxPressureBar"))
      .toEqual({ field: "maxPressureBar", bikeId, value: null, record: { table: "tireSetups", id: tireId } });
    rows.bike = { ...bike, userId: "foreign" };
    await expect(capturePressureInputProvenance(ctx, userId, input, bikeId, tireId))
      .rejects.toThrow("Pressure setup not found");
    rows.bike = bike;
    for (const key of ["tire", "wheel"]) {
      const original = rows[key] as Record<string, unknown>;
      rows[key] = { ...original, userId: "foreign" };
      await expect(capturePressureInputProvenance(ctx, userId, input, bikeId, tireId))
        .rejects.toThrow("Pressure setup not found");
      rows[key] = original;
    }
  });
  it("does not add irrelevant rider fields to fuel guidance", () => {
    expect(calculatorUsedInputs({ calculator: "fuel-hydration", values: performanceDefaults }, bikeId)).toEqual([]);
  });
  it("tracks FTP but not bike weight for the climb engine", () => {
    const fields = calculatorUsedInputs({ calculator: "climb-planner", values: performanceDefaults }, bikeId)
      .map((input) => input.field);
    expect(fields).toEqual(["weightKg", "ftpWatts", "bikeType"]);
  });
  it("does not treat an estimated FTP test result as the stored FTP input", () => {
    const fields = calculatorUsedInputs({ calculator: "ftp-wkg", values: { ...performanceDefaults, method: "ramp" } })
      .map((input) => input.field);
    expect(fields).toEqual(["weightKg"]);
  });
  it("captures only fields actually used and matching current values", () => {
    const result = matchInputProvenance(userId, [{ field: "heightCm", value: 180 }], profile, bike,
      [observation(), observation({ field: "weightKg", value: 75 })], 100);
    expect(result).toEqual({ version: 1, capturedAt: 100,
      dependencies: [{ field: "heightCm", value: 180, observationId: "observation" }] });
  });
  it("does not attribute temporary overrides to the saved rider profile", () => {
    expect(matchInputProvenance(userId, [{ field: "heightCm", value: 181 }], profile, bike,
      [observation({ value: 181 })], 100).dependencies).toEqual([]);
  });
  it("keeps legacy exact values without inventing observation IDs", () => {
    expect(matchInputProvenance(userId, [{ field: "heightCm", value: 180 }], profile, null, [], 100)
      .dependencies).toEqual([{ field: "heightCm", value: 180 }]);
  });
  it("rejects foreign, superseded, mismatched and other-bike observations", () => {
    const rows = [observation({ userId: "other" as Id<"users"> }),
      observation({ status: "superseded" }), observation({ value: 181 }), observation({ bikeId })];
    expect(matchInputProvenance(userId, [{ field: "heightCm", value: 180 }], profile, bike, rows, 100)
      .dependencies[0].observationId).toBeUndefined();
    expect(matchInputProvenance(userId, [{ field: "heightCm", value: 180 }],
      { ...profile, userId: "other" as Id<"users"> }, bike, [], 100).dependencies).toEqual([]);
  });
  it("pins the exact bike and newest current matching observation", () => {
    const input = { field: "currentGeometry.stackMm", value: 550, bikeId };
    const rows = [observation({ ...input, recordedAt: 5 }),
      observation({ ...input, _id: "new" as Id<"profileObservations">, recordedAt: 20 })];
    expect(matchInputProvenance(userId, [input], profile, bike, rows, 100).dependencies)
      .toEqual([{ ...input, observationId: "new" }]);
    expect(matchInputProvenance(userId, [input], profile,
      { ...bike, _id: "other" as Id<"bikes"> }, rows, 100).dependencies).toEqual([]);
  });
  it("keeps a captured result unchanged when the profile changes before async storage", () => {
    const stored = { ...profile };
    const result = matchInputProvenance(userId, [{ field: "heightCm", value: 180 }], stored, null,
      [observation()], 100);
    stored.heightCm = 181;
    expect(result.dependencies[0]).toEqual({ field: "heightCm", value: 180, observationId: "observation" });
    expect(result.capturedAt).toBe(100);
  });
});
