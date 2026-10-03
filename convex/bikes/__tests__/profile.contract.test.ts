import { afterEach, describe, expect, it, vi } from "vitest";
import type { MutationCtx } from "../../_generated/server";
import type { Doc } from "../../_generated/dataModel";
import { updateFields, bikeProfileSummary } from "../profile";
import { update, create, createBikeWithProfiles } from "../mutations";

const { auth } = vi.hoisted(() => ({ auth: vi.fn(async () => "owner" as string | null) }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: auth }));
afterEach(() => auth.mockResolvedValue("owner"));
type Row = Record<string, unknown>;
type Handler = { _handler: (ctx: unknown, args: Row) => Promise<unknown> };
const invoke = (fn: unknown, ctx: unknown, args: Row) => (fn as Handler)._handler(ctx, args);
const baseBike = { _id: "bike", _creationTime: 1, userId: "owner", name: "Road", bikeType: "road",
  createdAt: 1, updatedAt: 1, currentSetup: { saddleHeightMm: 740, spacersMm: 20 },
  currentGeometry: { stackMm: 570, reachMm: 380 },
};
function fixture(initial: Row = baseBike) {
  const tables: Record<string, Row[]> = { bikes: [structuredClone(initial)], profileObservations: [], geometry_records: [] };
  let sequence = 0;
  const db = {
    get: vi.fn(async (id: unknown) => Object.values(tables).flat().find(row => row._id === id) ?? null),
    query: vi.fn((table: string) => {
      const conditions: [string, unknown][] = [];
      const index = { eq: (key: string, value: unknown) => { conditions.push([key, value]); return index; } };
      const rows = () => (tables[table] ?? []).filter(row => conditions.every(([key, value]) => row[key] === value));
      const query = { withIndex: (_name: string, callback: (q: typeof index) => unknown) => { callback(index); return query; },
        collect: async () => rows(), unique: async () => rows()[0] ?? null, first: async () => rows()[0] ?? null };
      return query;
    }),
    patch: vi.fn(async (id: unknown, changes: Row) => {
      const row = Object.values(tables).flat().find(item => item._id === id);
      if (!row) throw new Error("Missing fixture row");
      Object.assign(row, changes);
    }),
    insert: vi.fn(async (table: string, values: Row) => {
      const id = `${table}${++sequence}`;
      (tables[table] ??= []).push({ ...values, _id: id, _creationTime: Date.now() });
      return id;
    }),
  };
  const ctx = { db, runMutation: vi.fn(async (_reference: unknown, args: Row): Promise<unknown> => invoke(update, ctx, args)) };
  return { ctx, tables };
}
const measured = { field: "currentSetup.saddleHeightMm", value: 745, expectedCurrentValue: 740,
  kind: "measured", measuredAt: 100, measurePoint: "bb_center_to_saddle_top" };

describe("bike profile measurements", () => {
  it("requires auth and owner before any changes", async () => {
    for (const user of [null, "other"]) {
      auth.mockResolvedValue(user);
      const { ctx } = fixture();
      await expect(invoke(updateFields, ctx, { bikeId: "bike", changes: [measured] })).rejects.toThrow();
      expect(ctx.db.patch).not.toHaveBeenCalled();
      expect(ctx.db.insert).not.toHaveBeenCalled();
    }
  });
  it("validates measurement point, timestamp and bounds before writing", async () => {
    for (const patch of [{ value: 2000 }, { measuredAt: Date.now() + 60_000 },
      { measurePoint: "unknown" }, { measuredAt: undefined }, { field: "privateNotes" }]) {
      const { ctx } = fixture();
      await expect(invoke(updateFields, ctx, { bikeId: "bike", changes: [{ ...measured, ...patch }] })).rejects.toThrow();
      expect(ctx.db.patch).not.toHaveBeenCalled();
      expect(ctx.db.insert).not.toHaveBeenCalled();
    }
  });
  it("reports optimistic conflicts without a partial save", async () => {
    const { ctx } = fixture();
    expect(await invoke(updateFields, ctx, { bikeId: "bike", changes: [measured,
      { field: "currentSetup.spacersMm", value: 10, expectedCurrentValue: 30, kind: "declared" },
    ] })).toMatchObject({ status: "conflict", conflicts: [{ field: "currentSetup.spacersMm", currentValue: 20 }] });
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
  it("records source, original measurement date and fixed reference point", async () => {
    const { ctx, tables } = fixture();
    await invoke(updateFields, ctx, { bikeId: "bike", changes: [measured] });
    const bike = tables.bikes[0] as unknown as Doc<"bikes">;
    expect(bike.fieldMeasurements?.[measured.field]).toEqual({
      kind: "measured", measuredAt: 100, source: "profile_edit", measurePoint: "bb_center_to_saddle_top",
    });
    const summary = bikeProfileSummary(bike, tables.profileObservations as unknown as Doc<"profileObservations">[]);
    expect(summary.bikeObservations.find(item => item.field === measured.field)).toMatchObject({
      value: 745, kind: "measured", measurePoint: "bb_center_to_saddle_top", recordedAt: 100,
    });
    expect(summary.profileScore.items.find(item => item.key === "saddleHeight")?.quality).toBe(1);
  });
  it("keeps newly recorded goal metadata when the existing goal submutation runs", async () => {
    const { ctx, tables } = fixture();
    await invoke(updateFields, ctx, { bikeId: "bike", changes: [
      { field: "primaryGoal", value: "comfort", expectedCurrentValue: null, kind: "declared" }, measured,
    ] });
    expect(tables.bikes[0].primaryGoal).toBe("comfort");
    expect(tables.bikes[0].fieldMeasurements).toHaveProperty("primaryGoal");
    expect(ctx.runMutation).toHaveBeenCalledOnce();
  });
  it("merges form patches, preserves untouched metadata and removes stale measurement flags", async () => {
    const { ctx, tables } = fixture();
    await invoke(updateFields, ctx, { bikeId: "bike", changes: [measured] });
    await invoke(update, ctx, { bikeId: "bike", currentSetup: { spacersMm: 15 } });
    const first = tables.bikes[0] as unknown as Doc<"bikes">;
    expect(first.currentSetup?.saddleHeightMm).toBe(745);
    expect(first.fieldMeasurements?.[measured.field]?.kind).toBe("measured");
    await invoke(update, ctx, { bikeId: "bike", currentSetup: { saddleHeightMm: 748 } });
    const next = tables.bikes[0] as unknown as Doc<"bikes">;
    expect(next.currentSetup?.spacersMm).toBe(15);
    expect(next.currentSetup?.saddleHeightMeasurement).toBeUndefined();
    expect(next.fieldMeasurements?.[measured.field]?.kind).toBe("declared");
    await invoke(update, ctx, { bikeId: "bike", clearFields: ["currentSetup.spacersMm"] });
    expect((tables.bikes[0] as unknown as Doc<"bikes">).currentSetup?.spacersMm).toBeUndefined();
    expect((tables.bikes[0] as unknown as Doc<"bikes">).fieldMeasurements?.["currentSetup.spacersMm"]).toBeUndefined();
  });
  it("links actual trusted geometry, not the caller's proposed dimensions, without restamping unchanged evidence", async () => {
    const { ctx, tables } = fixture();
    tables.geometry_records.push({ _id: "geometry", status: "active", source: "manufacturer", stack: 580,
      reach: 390, sizeLabel: "M", seatTubeAngle: 73 });
    await invoke(update, ctx, { bikeId: "bike", geometryRecordId: "geometry",
      currentGeometry: { stackMm: 500, reachMm: 300 } });
    const bike = tables.bikes[0] as unknown as Doc<"bikes">;
    expect(bike.currentGeometry).toEqual({ stackMm: 580, reachMm: 390, frameSize: "M", seatTubeAngle: 73 });
    expect(bike.fieldMeasurements?.["currentGeometry.stackMm"]?.source).toBe("geometry_database");
    const count = tables.profileObservations.length;
    await invoke(update, ctx, { bikeId: "bike", geometryRecordId: "geometry", notes: "Different note" });
    expect(tables.profileObservations).toHaveLength(count);
    const summary = bikeProfileSummary(bike, tables.profileObservations as unknown as Doc<"profileObservations">[]);
    expect(summary.bikeObservations.find(item => item.field === "currentGeometry.stackMm")?.source).toBe("geometry_database");
  });
  it("rejects inactive geometry and does not upgrade user-entered records to database evidence", async () => {
    const { ctx, tables } = fixture();
    tables.geometry_records.push({ _id: "draft", status: "draft", stack: 580, sizeLabel: "M" });
    await expect(invoke(update, ctx, { bikeId: "bike", geometryRecordId: "draft" })).rejects.toThrow("Active geometry");
    expect(ctx.db.patch).not.toHaveBeenCalled();
    tables.geometry_records.push({ _id: "user-record", status: "active", source: "user_entered", stack: 580, sizeLabel: "M" });
    await invoke(update, ctx, { bikeId: "bike", geometryRecordId: "user-record" });
    expect((tables.bikes[0] as unknown as Doc<"bikes">).fieldMeasurements?.["currentGeometry.stackMm"]?.source)
      .toBe("profile_edit");
  });
  it("records supplied create fields as declared, without inventing missing setup values", async () => {
    const { ctx, tables } = fixture();
    await invoke(create, ctx, { name: "New bike", bikeType: "road", currentSetup: { spacersMm: 15 }, saddleModel: "Example" });
    const created = tables.bikes[1] as unknown as Doc<"bikes">;
    expect(created.currentSetup).toEqual({ spacersMm: 15 });
    expect(created.fieldMeasurements?.["currentSetup.spacersMm"]?.kind).toBe("declared");
    expect(created.fieldMeasurements).not.toHaveProperty("currentSetup.saddleHeightMm");
  });
  it("strips previous-owner measurement metadata from passport setup copies", async () => {
    const { ctx, tables } = fixture();
    const id = await createBikeWithProfiles(ctx as unknown as MutationCtx, {
      userId: "owner" as never, name: "Imported", bikeType: "road", source: "passport_import",
      currentSetup: { saddleHeightMm: 740,
        saddleHeightMeasurement: { measurePoint: "bb_center_to_saddle_top", measuredAt: 100, source: "profile_edit" },
      } as unknown as Parameters<typeof createBikeWithProfiles>[1]["currentSetup"],
    });
    const imported = tables.bikes.find(item => item._id === id) as unknown as Doc<"bikes">;
    expect(imported.currentSetup?.saddleHeightMm).toBe(740);
    expect(imported.currentSetup?.saddleHeightMeasurement).toBeUndefined();
    expect(imported.fieldMeasurements?.["currentSetup.saddleHeightMm"]?.kind).toBe("estimated");
    expect(tables.profileObservations).toContainEqual(expect.objectContaining({
      bikeId: id, kind: "estimated", method: "passport_import",
    }));
  });
  it.each(["missing", "superseded"])("copies passport geometry with a %s link as imported evidence", async (status) => {
    const { ctx, tables } = fixture();
    if (status !== "missing") tables.geometry_records.push({
      _id: "old-geometry", status, source: "manufacturer", stack: 600,
    });
    const id = await createBikeWithProfiles(ctx as unknown as MutationCtx, {
      userId: "owner" as never, name: "Imported", bikeType: "road", source: "passport_import",
      geometryRecordId: "old-geometry" as never, currentGeometry: { stackMm: 570 },
    });
    const imported = tables.bikes.find(item => item._id === id) as unknown as Doc<"bikes">;
    expect(imported.geometryRecordId).toBeUndefined();
    expect(imported.currentGeometry).toEqual({ stackMm: 570 });
    expect(imported.fieldMeasurements?.["currentGeometry.stackMm"])
      .toMatchObject({ kind: "estimated", source: "profile_edit" });
    expect(tables.profileObservations).toContainEqual(expect.objectContaining({
      bikeId: id, field: "currentGeometry.stackMm", method: "passport_import",
    }));
  });
  it("rejects invalid or repeated clear fields before changing metadata", async () => {
    const { ctx } = fixture();
    for (const clearFields of [["adminNotes"], ["saddleModel", "saddleModel"], Array(33).fill("saddleModel")]) {
      await expect(invoke(update, ctx, { bikeId: "bike", clearFields })).rejects.toThrow("Invalid clear fields");
    }
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
  it("ignores another rider's evidence even when a malformed row references this bike", () => {
    const summary = bikeProfileSummary(baseBike as unknown as Doc<"bikes">, [{
      userId: "other", bikeId: "bike", field: "currentSetup.saddleHeightMm", value: 740,
      status: "current", kind: "measured", method: "single_measurement", recordedAt: 1,
    }] as unknown as Doc<"profileObservations">[]);
    expect(summary.bikeObservations.some(item => item.kind === "measured")).toBe(false);
  });
  it("never equates maximum exposed seatpost length with maximum saddle height", () => {
    const bike = { ...baseBike, maxSeatpostMm: 250, maxSpacerStackMm: 30 } as unknown as Doc<"bikes">;
    expect(bikeProfileSummary(bike, []).adjustmentRoom.status).toBe("unknown");
    expect(bikeProfileSummary({ ...bike, maxSpacerStackMm: 10 }, []).adjustmentRoom)
      .toMatchObject({ status: "exceeds", reason: "spacer_limit_exceeded" });
  });
});
