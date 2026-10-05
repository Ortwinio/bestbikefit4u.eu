import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getMyProvenance, recordProfileObservations, saveObservation } from "./provenance";
import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

const { auth } = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: auth }));

type Row = Record<string, unknown> & { _id: string };
function context() {
  const tables = new Map<string, Row[]>();
  let sequence = 0;
  const get = async (id: string) => [...tables.values()].flat().find(row => row._id === id) ?? null;
  const insert = vi.fn(async (table: string, fields: object) => {
    const row = { _id: `${table}_${++sequence}`, _creationTime: 1700000000000, ...fields };
    tables.set(table, [...(tables.get(table) ?? []), row]);
    return row._id;
  });
  const patch = vi.fn(async (id: string, fields: object) => Object.assign((await get(id))!, fields));
  const query = (table: string) => {
    const filters: ((row: Row) => boolean)[] = [];
    const index = { eq: (field: string, value: unknown) => {
      filters.push(row => row[field] === value); return index;
    } };
    const expression = {
      field: (name: string) => (row: Row) => row[name],
      eq: (left: (row: Row) => unknown, value: unknown) => (row: Row) => left(row) === value,
      and: (...conditions: ((row: Row) => boolean)[]) => (row: Row) => conditions.every(part => part(row)),
    };
    const rows = () => (tables.get(table) ?? []).filter(row => filters.every(filter => filter(row)));
    const cursor = {
      withIndex: (_name: string, apply: (builder: typeof index) => unknown) => { apply(index); return cursor; },
      filter: (apply: (builder: typeof expression) => (row: Row) => boolean) => {
        filters.push(apply(expression)); return cursor;
      },
      unique: async () => rows()[0] ?? null,
      collect: async () => rows(),
    };
    return cursor;
  };
  return { db: { get, insert, patch, query }, tables };
}

type Handler = { _handler: (ctx: unknown, args: unknown) => Promise<unknown> };
const invoke = (ctx: unknown, args: unknown) => (saveObservation as unknown as Handler)._handler(ctx, args);
const entry = (overrides: Record<string, unknown> = {}) => ({ field: "inseamCm", value: 81,
  kind: "measured", method: "single_measurement", expectedCurrentValue: null, ...overrides });

beforeEach(() => {
  auth.mockResolvedValue("user_owner");
  vi.spyOn(Date, "now").mockReturnValue(1791000010000);
});
afterEach(() => vi.restoreAllMocks());

describe("profile provenance", () => {
  it("requires an authenticated owner", async () => {
    auth.mockResolvedValue(null);
    const ctx = context();
    await expect(invoke(ctx, entry())).rejects.toThrow();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("saves a single measured value without inventing a complete profile", async () => {
    const ctx = context();
    expect(await invoke(ctx, entry())).toEqual({ status: "saved", field: "inseamCm" });
    expect(ctx.tables.get("profiles")?.[0]).toMatchObject({ inseamCm: 81, userId: "user_owner" });
    expect(ctx.tables.get("profiles")?.[0].heightCm).toBeUndefined();
    expect(ctx.tables.get("profileObservations")?.[0]).toMatchObject({ field: "inseamCm", value: 81,
      source: "profile_edit", kind: "measured", method: "single_measurement", status: "current" });
  });

  it("returns a conflict without any writes and only accepts a fresh explicit resolution", async () => {
    const ctx = context();
    await ctx.db.insert("profiles", { userId: "user_owner", inseamCm: 83 });
    ctx.db.insert.mockClear();
    expect(await invoke(ctx, entry({ expectedCurrentValue: 82 }))).toEqual({
      status: "conflict", field: "inseamCm", currentValue: 83, incomingValue: 81,
    });
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
    await invoke(ctx, entry({ expectedCurrentValue: 83 }));
    expect(ctx.tables.get("profiles")?.[0].inseamCm).toBe(81);
  });

  it("supersedes only owner rider evidence and never infers triple measurement from repeated saves", async () => {
    const ctx = context();
    await ctx.db.insert("profileObservations", { userId: "other", field: "inseamCm", status: "current" });
    await ctx.db.insert("profileObservations", { userId: "user_owner", bikeId: "bike_1",
      field: "inseamCm", status: "current" });
    await invoke(ctx, entry());
    await invoke(ctx, entry({ expectedCurrentValue: 81 }));
    await invoke(ctx, entry({ expectedCurrentValue: 81 }));
    const rows = ctx.tables.get("profileObservations")!;
    expect(rows.slice(0, 2).every(row => row.status === "current")).toBe(true);
    expect(rows.slice(2).map(row => row.status)).toEqual(["superseded", "superseded", "current"]);
    expect(rows.slice(0, 2).every(row => row.repeatCount === undefined && row.withinTolerance === undefined)).toBe(true);
    expect(rows.slice(2).map(row => ({ repeatCount: row.repeatCount, withinTolerance: row.withinTolerance })))
      .toEqual(Array.from({ length: 3 }, () => ({ repeatCount: 1, withinTolerance: false })));
  });

  it.each([
    { field: "userId", value: "other" }, { field: "__proto__", value: "x" },
    { value: NaN }, { value: Infinity }, { value: 49 }, { value: "81" },
    { kind: "measured", method: "ftp_test" },
    { field: "flexibilityScore", value: "average" },
    { field: "hasPain", value: "no", kind: "measured" },
    { field: "coreStabilityScore", value: 2.5, kind: "estimated", method: "self_assessment" },
  ])("rejects invalid field/value/method before writes (%j)", async override => {
    const ctx = context();
    await expect(invoke(ctx, entry(override))).rejects.toThrow();
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("compares array answers structurally and records declared provenance", async () => {
    const ctx = context();
    await ctx.db.insert("profiles", { userId: "user_owner", painAreas: ["lower_back"] });
    await invoke(ctx, entry({ field: "painAreas", value: ["neck"], expectedCurrentValue: ["lower_back"],
      kind: "declared", method: "self_report" }));
    expect(ctx.tables.get("profileObservations")?.[0]).toMatchObject({ value: ["neck"], kind: "declared" });
  });

  it("dates actual FTP and weight confirmations", async () => {
    const ctx = context();
    await invoke(ctx, entry({ field: "ftpWatts", value: 250, method: "ftp_test" }));
    await invoke(ctx, entry({ field: "weightKg", value: 70 }));
    expect(ctx.tables.get("profiles")?.[0]).toMatchObject({ ftpMeasuredAt: Date.now(),
      ftpMethod: "ftp_test", weightUpdatedAt: Date.now() });
  });

  it("does not refresh untouched legacy evidence during autosave", async () => {
    const ctx = context();
    const profile = { userId: "user_owner", inseamCm: 81 } as Doc<"profiles">;
    await recordProfileObservations(ctx as unknown as MutationCtx, "user_owner" as Id<"users">,
      { inseamCm: 81 }, profile);
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("rejects a derived replacement for measured evidence", async () => {
    const ctx = context();
    await invoke(ctx, entry());
    const profile = ctx.tables.get("profiles")![0] as unknown as Doc<"profiles">;
    await expect(recordProfileObservations(ctx as unknown as MutationCtx, "user_owner" as Id<"users">,
      { inseamCm: 82 }, profile, { kinds: { inseamCm: "derived" } })).rejects.toThrow(/cannot replace/);
  });

  it("queries only the authenticated owner's current rider observations", async () => {
    const ctx = context();
    await ctx.db.insert("profiles", { userId: "other", inseamCm: 99 });
    await invoke(ctx, entry());
    await ctx.db.insert("profileObservations", { userId: "other", field: "heightCm", status: "current" });
    await ctx.db.insert("profileObservations", { userId: "user_owner", field: "heightCm",
      bikeId: "bike_other", status: "current" });
    const result = await (getMyProvenance as unknown as Handler)._handler(ctx, {});
    expect(result).toMatchObject({ profile: { userId: "user_owner", inseamCm: 81 }, observations: [
      { field: "inseamCm", userId: "user_owner", status: "current" },
    ] });
  });

  it("shows conservative provenance before migration without writing or crediting old formula defaults", async () => {
    const ctx = context();
    await ctx.db.insert("profiles", { userId: "user_owner", heightCm: 180, armLengthCm: 180 * 0.44 });
    ctx.db.insert.mockClear();
    const result = await (getMyProvenance as unknown as Handler)._handler(ctx, {});
    expect(result).toMatchObject({ observations: expect.arrayContaining([
      expect.objectContaining({ field: "heightCm", kind: "estimated", source: "legacy_migration" }),
      expect.objectContaining({ field: "armLengthCm", kind: "derived", method: "legacy_height_formula",
        recordedAt: 1700000000000 }),
    ]) });
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("does not attach an old measurement's provenance to a different current value", async () => {
    const ctx = context();
    await ctx.db.insert("profiles", { userId: "user_owner", heightCm: 180, armLengthCm: 180 * 0.44 });
    await ctx.db.insert("profileObservations", { userId: "user_owner", field: "armLengthCm", value: 65,
      kind: "measured", method: "single_measurement", status: "current", recordedAt: Date.now() });
    const result = await (getMyProvenance as unknown as Handler)._handler(ctx, {}) as {
      observations: { field: string; value: unknown; kind: string }[];
    };
    expect(result.observations.filter(row => row.field === "armLengthCm")).toEqual([
      expect.objectContaining({ field: "armLengthCm", value: 180 * .44, kind: "derived" }),
    ]);
    expect(ctx.tables.get("profileObservations")?.[0]).toMatchObject({ kind: "measured", status: "current" });
  });
});
