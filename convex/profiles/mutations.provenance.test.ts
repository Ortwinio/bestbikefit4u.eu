import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as mutations from "./mutations";
import * as provenance from "./provenance";

const auth = vi.hoisted(() => ({ userId: "owner" as string | null }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: async () => auth.userId }));

type Row = Record<string, unknown> & { _id: string };
type Handler = { _handler: (ctx: unknown, args: unknown) => Promise<string> };
type SaveName = "upsert" | "updateMeasurements" | "updateAssessment" | "updateRiderProfile" | "updatePreferences" | "updateComfort";
const invoke = (name: SaveName, ctx: unknown, args: unknown) =>
  (mutations[name] as unknown as Handler)._handler(ctx, args);

function context() {
  const tables = new Map<string, Row[]>();
  let sequence = 0;
  const get = async (id: string) => [...tables.values()].flat().find((row) => row._id === id) ?? null;
  const insert = vi.fn(async (table: string, fields: Record<string, unknown>) => {
    const row = { ...structuredClone(fields), _id: `${table}_${++sequence}` };
    tables.set(table, [...(tables.get(table) ?? []), row]);
    return row._id;
  });
  const patch = vi.fn(async (id: string, fields: Record<string, unknown>) => {
    const row = await get(id);
    if (!row) throw new Error("Row not found");
    for (const [field, value] of Object.entries(fields)) {
      if (value === undefined) delete row[field];
      else row[field] = structuredClone(value);
    }
  });
  const query = vi.fn((table: string) => {
    const predicates: ((row: Row) => boolean)[] = [];
    const index = { eq: (field: string, value: unknown) => {
      predicates.push((row) => row[field] === value);
      return index;
    } };
    const expression = {
      field: (name: string) => (row: Row) => row[name],
      eq: (left: (row: Row) => unknown, value: unknown) => (row: Row) => left(row) === value,
      and: (...conditions: ((row: Row) => boolean)[]) => (row: Row) => conditions.every((condition) => condition(row)),
    };
    const rows = () => structuredClone((tables.get(table) ?? []).filter((row) => predicates.every((predicate) => predicate(row))));
    const cursor = {
      withIndex: (_name: string, apply: (builder: typeof index) => unknown) => { apply(index); return cursor; },
      filter: (apply: (builder: typeof expression) => (row: Row) => boolean) => { predicates.push(apply(expression)); return cursor; },
      collect: async () => rows(),
      unique: async () => rows()[0] ?? null,
    };
    return cursor;
  });
  return { db: { get, insert, patch, query }, tables };
}

const measurements = { heightCm: 180, inseamCm: 84, flexibilityScore: "average", coreStabilityScore: 3 };
const rider = { experienceLevel: "advanced", weeklyHours: "6-10", typicalRideLength: "long",
  hasPain: "no", painAreas: [], positionPriority: "comfort" };
const cases: [SaveName, Record<string, unknown>, string, unknown, string][] = [
  ["upsert", measurements, "heightCm", 180, "measured"],
  ["updateMeasurements", { weightKg: 75 }, "weightKg", 75, "measured"],
  ["updateAssessment", { flexibilityScore: "good", coreStabilityScore: 4 }, "flexibilityScore", "good", "estimated"],
  ["updateRiderProfile", rider, "positionPriority", "comfort", "declared"],
  ["updatePreferences", { experienceLevel: "advanced" }, "experienceLevel", "advanced", "declared"],
  ["updateComfort", { hasPain: "no", painAreas: [] }, "hasPain", "no", "declared"],
];
const current = (ctx: ReturnType<typeof context>, field: string) =>
  (ctx.tables.get("profileObservations") ?? []).filter((row) => row.field === field && row.status === "current");

beforeEach(() => {
  auth.userId = "owner";
  vi.spyOn(Date, "now").mockReturnValue(1791000010000);
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

describe("enforced paid profile mutations", () => {
  it("refuses changed full-form/measurement writes and same-value provenance upgrades", async () => {
    vi.stubEnv("PAID_ACCESS_ENFORCED", "true");
    const ctx = context();
    const profileId = await ctx.db.insert("profiles", { userId: "owner", ...measurements, femurLengthCm: 40 });
    await expect(invoke("upsert", ctx, { ...measurements, femurLengthCm: 41 })).rejects.toThrow("PAID_PROFILE_ACCESS_REQUIRED");
    await expect(invoke("updateMeasurements", ctx, { femurLengthCm: 41 })).rejects.toThrow("PAID_PROFILE_ACCESS_REQUIRED");
    await expect(invoke("upsert", ctx, { ...measurements, femurLengthCm: 40 })).resolves.toBe(profileId);
    await expect((provenance.saveObservation as unknown as Handler)._handler(ctx, { field: "femurLengthCm", value: 40,
      expectedCurrentValue: 40, kind: "measured", method: "single_measurement" })).rejects.toThrow("PAID_PROFILE_ACCESS_REQUIRED");
    expect(await ctx.db.get(profileId)).toMatchObject({ femurLengthCm: 40 });
  });

  it("allows expired-value removal with a current-value guard and supersedes evidence", async () => {
    vi.stubEnv("PAID_ACCESS_ENFORCED", "true");
    const ctx = context();
    const profileId = await ctx.db.insert("profiles", { userId: "owner", femurLengthCm: 40 });
    const observationId = await ctx.db.insert("profileObservations", { userId: "owner", field: "femurLengthCm",
      value: 40, status: "current" });
    const remove = (mutations.removePaidField as unknown as Handler)._handler;
    await expect(remove(ctx, { field: "femurLengthCm", expectedCurrentValue: 41 })).rejects.toThrow("PROFILE_VALUE_CHANGED");
    await expect(remove(ctx, { field: "heightCm", expectedCurrentValue: 180 })).rejects.toThrow("Invalid profile field");
    await expect(remove(ctx, { field: "femurLengthCm", expectedCurrentValue: 40 })).resolves.toBe(profileId);
    expect(await ctx.db.get(profileId)).not.toHaveProperty("femurLengthCm");
    expect(await ctx.db.get(observationId)).toMatchObject({ status: "superseded" });
    auth.userId = "other";
    await expect(remove(ctx, { field: "femurLengthCm", expectedCurrentValue: 40 })).rejects.toThrow("Profile not found");
  });
});

describe("profile saves keep provenance current", () => {
  it.each(cases)("%s records changed values and supersedes prior observations", async (name, args, field, value, kind) => {
    const ctx = context();
    const previous = field === "weightKg" ? 70 : field === "heightCm" ? 175 : "previous";
    const profileId = await ctx.db.insert("profiles", { userId: "owner", [field]: previous, updatedAt: 1 });
    const oldId = await ctx.db.insert("profileObservations", { userId: "owner", field, value: previous,
      kind, unit: "", method: "measured", source: "public_handoff", recordedAt: 1, status: "current" });
    expect(await invoke(name, ctx, args)).toBe(profileId);
    expect(await ctx.db.get(profileId)).toMatchObject({ [field]: value });
    expect(await ctx.db.get(oldId)).toMatchObject({ status: "superseded" });
    expect(current(ctx, field)).toEqual([expect.objectContaining({ userId: "owner", field, value, kind,
      source: "profile_edit", recordedAt: 1791000010000 })]);
    const count = ctx.tables.get("profileObservations")!.length;
    await invoke(name, ctx, args);
    expect(ctx.tables.get("profileObservations")).toHaveLength(count);
  });

  it("creates no fabricated dimensions or provenance for absent measurements", async () => {
    const ctx = context();
    const profileId = await invoke("upsert", ctx, measurements);
    const row = await ctx.db.get(profileId);
    for (const field of ["armLengthCm", "torsoLengthCm", "shoulderWidthCm", "weightKg"]) {
      expect(row).not.toHaveProperty(field);
      expect(current(ctx, field)).toEqual([]);
    }
    expect(current(ctx, "heightCm")[0]).toMatchObject({ value: 180, kind: "measured" });
    expect(current(ctx, "coreStabilityScore")[0]).toMatchObject({ value: 3, kind: "estimated" });
  });

  it.each(cases)("%s does not relabel unchanged legacy values as newly measured", async (name, args) => {
    const ctx = context();
    await ctx.db.insert("profiles", { userId: "owner", ...args, updatedAt: 1 });
    await invoke(name, ctx, { ...args });
    expect(ctx.tables.get("profileObservations") ?? []).toEqual([]);
  });

  it("records only the changed measurement in a full profile save", async () => {
    const ctx = context();
    await ctx.db.insert("profiles", { userId: "owner", ...measurements, armLengthCm: 79.2,
      torsoLengthCm: 57.6, shoulderWidthCm: 42, weightKg: 70, updatedAt: 1 });
    await invoke("upsert", ctx, { ...measurements, armLengthCm: 79.2,
      torsoLengthCm: 57.6, shoulderWidthCm: 42, weightKg: 75 });
    expect(ctx.tables.get("profileObservations")).toEqual([expect.objectContaining({
      field: "weightKg", value: 75, kind: "measured", source: "profile_edit",
    })]);
  });

  it.each(["updateRiderProfile", "updateComfort"] as const)("%s preserves omitted optional pain details and their provenance", async (name) => {
    const ctx = context();
    const profileId = await ctx.db.insert("profiles", { userId: "owner", ...rider,
      painSeverity: 4, kneePainTiming: "after_ride", updatedAt: 1 });
    const observationId = await ctx.db.insert("profileObservations", { userId: "owner", field: "painSeverity",
      value: 4, kind: "declared", method: "self_report", source: "profile_edit", recordedAt: 1, status: "current" });
    await invoke(name, ctx, name === "updateRiderProfile" ? rider : { hasPain: "no", painAreas: [], painSeverity: undefined });
    expect(await ctx.db.get(profileId)).toMatchObject({ painSeverity: 4, kneePainTiming: "after_ride" });
    expect(current(ctx, "painSeverity")).toEqual([expect.objectContaining({ _id: observationId, value: 4, recordedAt: 1 })]);
  });

  it("preserves measured dimensions and their original provenance when upsert omits them", async () => {
    const ctx = context();
    const profileId = await ctx.db.insert("profiles", { userId: "owner", ...measurements,
      armLengthCm: 63, torsoLengthCm: 59, shoulderWidthCm: 39, weightKg: 73, painAreas: ["knee"],
      riderProfileUpdatedAt: 100, updatedAt: 1 });
    const oldId = await ctx.db.insert("profileObservations", { userId: "owner", field: "armLengthCm",
      value: 63, kind: "measured", method: "tape", source: "public_handoff", recordedAt: 1, status: "current" });
    await invoke("upsert", ctx, { ...measurements, heightCm: 182, armLengthCm: undefined });
    expect(await ctx.db.get(profileId)).toMatchObject({ armLengthCm: 63, torsoLengthCm: 59,
      shoulderWidthCm: 39, weightKg: 73, painAreas: ["knee"], riderProfileUpdatedAt: 100 });
    expect(current(ctx, "armLengthCm")).toEqual([expect.objectContaining({ _id: oldId, value: 63, kind: "measured", recordedAt: 1 })]);
  });

  it.each(cases)("%s authenticates before any database access", async (name, args) => {
    const ctx = context();
    auth.userId = null;
    await expect(invoke(name, ctx, args)).rejects.toThrow("Not authenticated");
    expect(ctx.db.query).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it.each(cases)("%s never modifies another rider's profile or observations", async (name, args) => {
    const ctx = context();
    const profileId = await ctx.db.insert("profiles", { userId: "other", heightCm: 190, updatedAt: 1 });
    if (name === "upsert") await invoke(name, ctx, args);
    else await expect(invoke(name, ctx, args)).rejects.toThrow("Profile not found");
    expect(await ctx.db.get(profileId)).toEqual({ _id: profileId, userId: "other", heightCm: 190, updatedAt: 1 });
    expect((ctx.tables.get("profileObservations") ?? []).every((row) => row.userId === "owner")).toBe(true);
  });

  it.each([
    ["upsert", { ...measurements, armLengthCm: 0 }],
    ["updateMeasurements", { weightKg: NaN }],
    ["updateAssessment", { flexibilityScore: "good", coreStabilityScore: 2.5 }],
    ["updateRiderProfile", { ...rider, painSeverity: 20 }],
    ["updateComfort", { hasPain: "yes", painAreas: ["knee"], painSeverity: -1 }],
  ] as const)("%s validates before any profile or provenance write", async (name, args) => {
    const ctx = context();
    await ctx.db.insert("profiles", { userId: "owner", updatedAt: 1 });
    ctx.db.insert.mockClear();
    await expect(invoke(name, ctx, args)).rejects.toThrow();
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("does not proceed with a profile update if provenance recording fails", async () => {
    const ctx = context();
    await ctx.db.insert("profiles", { userId: "owner", weightKg: 70, updatedAt: 1 });
    vi.spyOn(provenance, "recordProfileObservations").mockRejectedValueOnce(new Error("Observation write failed"));
    await expect(invoke("updateMeasurements", ctx, { weightKg: 75 })).rejects.toThrow("Observation write failed");
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
});
