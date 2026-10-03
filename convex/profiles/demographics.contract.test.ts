import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Doc } from "../_generated/dataModel";
import { upsert } from "./mutations";
import { saveObservation } from "./provenance";
import { scoreRiderProfile } from "../../shared/profileScore";

const auth = vi.hoisted(() => ({ userId: "owner" as string | null }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: async () => auth.userId }));
const NOW = Date.UTC(2026, 9, 3, 12);
type Row = Record<string, unknown> & { _id: string; _creationTime: number };
type Handler = { _handler: (ctx: unknown, args: unknown) => Promise<unknown> };
const invoke = (handler: unknown, ctx: unknown, args: unknown) => (handler as Handler)._handler(ctx, args);
const measurements = { heightCm: 180, inseamCm: 84, flexibilityScore: "good", coreStabilityScore: 4 };
const protectedValues = { ftpWatts: 260, ftpMethod: "ftp_test", ftpMeasuredAt: NOW - 1000,
  flexibilityScore: "good", coreStabilityScore: 4, age: 45 };
const score = (profile: Row | null) => scoreRiderProfile({ profile: profile as Doc<"profiles"> | null }, NOW);

function context() {
  const tables = new Map<string, Row[]>();
  let sequence = 0;
  const stored = (id: string) => [...tables.values()].flat().find((row) => row._id === id) ?? null;
  const get = async (id: string) => structuredClone(stored(id));
  const insert = vi.fn(async (table: string, values: Record<string, unknown>) => {
    const row = { ...structuredClone(values), _id: `${table}_${++sequence}`, _creationTime: NOW };
    tables.set(table, [...(tables.get(table) ?? []), row]);
    return row._id;
  });
  const patch = vi.fn(async (id: string, values: Record<string, unknown>) => {
    const row = stored(id);
    if (!row) throw new Error("Row not found");
    for (const [field, value] of Object.entries(values)) {
      if (value === undefined) delete row[field];
      else row[field] = structuredClone(value);
    }
  });
  const query = vi.fn((table: string) => {
    const predicates: ((row: Row) => boolean)[] = [];
    const index = { eq: (field: string, value: unknown) => { predicates.push((row) => row[field] === value); return index; } };
    const expression = {
      field: (name: string) => (row: Row) => row[name],
      eq: (left: (row: Row) => unknown, right: unknown) => (row: Row) => left(row) === right,
      and: (...conditions: ((row: Row) => boolean)[]) => (row: Row) => conditions.every((condition) => condition(row)),
    };
    const rows = () => structuredClone((tables.get(table) ?? []).filter((row) => predicates.every((predicate) => predicate(row))));
    const cursor = {
      withIndex: (_name: string, apply: (builder: typeof index) => unknown) => { apply(index); return cursor; },
      filter: (apply: (builder: typeof expression) => (row: Row) => boolean) => { predicates.push(apply(expression)); return cursor; },
      collect: async () => rows(),
      unique: async () => { const found = rows(); if (found.length > 1) throw new Error("Non-unique result"); return found[0] ?? null; },
    };
    return cursor;
  });
  const clearWrites = () => { insert.mockClear(); patch.mockClear(); };
  const expectNoWrites = () => { expect(insert).not.toHaveBeenCalled(); expect(patch).not.toHaveBeenCalled(); };
  return { db: { get, insert, patch, query }, tables, clearWrites, expectNoWrites };
}

function observation(field: string, value: unknown, expectedCurrentValue: unknown = null) {
  return { field, value, expectedCurrentValue, kind: "declared", method: "self_report" };
}
const validEntries = [["sex", "female"], ["sex", "male"], ["sex", "prefer_not_to_say"], ["birthDate", "1990-04-12"]] as const;
const invalidEntries = [
  ["sex", "unknown"], ["sex", "Female"], ["sex", ""], ["sex", 1],
  ["birthDate", "1991-02-29"], ["birthDate", "1990-04-31"], ["birthDate", "1990-1-01"],
  ["birthDate", "2027-01-01"], ["birthDate", "2016-10-04"], ["birthDate", "1925-10-03"], ["birthDate", 1990],
] as const;

beforeEach(() => { auth.userId = "owner"; vi.spyOn(Date, "now").mockReturnValue(NOW); });
afterEach(() => vi.restoreAllMocks());

describe("demographics through single-observation saves", () => {
  it.each(validEntries)("persists explicit %s=%s as declared self-report without inferring any other value", async (field, value) => {
    const ctx = context();
    expect(await invoke(saveObservation, ctx, observation(field, value))).toEqual({ status: "saved", field });
    const profile = ctx.tables.get("profiles")![0];
    expect(profile).toMatchObject({ userId: "owner", [field]: value });
    for (const missing of ["age", "heightCm", "armLengthCm", "ftpWatts", "flexibilityScore", field === "sex" ? "birthDate" : "sex"]) {
      expect(profile).not.toHaveProperty(missing);
    }
    expect(score(profile)).toEqual(score(null));
    expect(ctx.tables.get("profileObservations")).toEqual([expect.objectContaining({ userId: "owner", field, value,
      unit: field === "birthDate" ? "date" : "none", kind: "declared", method: "self_report", source: "profile_edit",
      recordedAt: NOW, status: "current" })]);
  });

  it.each(invalidEntries)("rejects invalid %s=%s before writing", async (field, value) => {
    const ctx = context();
    await expect(invoke(saveObservation, ctx, observation(field, value))).rejects.toThrow();
    ctx.expectNoWrites();
  });

  it.each(["sex", "birthDate"])("requires declared self-report for %s", async (field) => {
    const ctx = context();
    const args = observation(field, field === "sex" ? "female" : "1990-04-12");
    for (const [kind, method] of [["measured", "single_measurement"], ["estimated", "self_assessment"], ["declared", "ftp_test"]]) {
      await expect(invoke(saveObservation, ctx, { ...args, kind, method })).rejects.toThrow("Invalid profile method");
    }
    ctx.expectNoWrites();
  });

  it.each([["sex", "female", "male"], ["birthDate", "1990-04-12", "1985-01-01"]])(
    "%s conflicts perform zero writes, and a fresh explicit choice supersedes only rider evidence", async (field, value, previous) => {
      const ctx = context();
      const profileId = await ctx.db.insert("profiles", { userId: "owner", ...measurements, ...protectedValues, [field]: previous, updatedAt: 1 });
      const oldId = await ctx.db.insert("profileObservations", { userId: "owner", field, value: previous, kind: "declared",
        method: "self_report", source: "profile_edit", status: "current", recordedAt: 1, unit: "none" });
      const foreignId = await ctx.db.insert("profileObservations", { userId: "other", field, value: previous, status: "current" });
      const bikeId = await ctx.db.insert("profileObservations", { userId: "owner", bikeId: "bike1", field, value: previous, status: "current" });
      const before = await ctx.db.get(profileId);
      ctx.clearWrites();
      expect(await invoke(saveObservation, ctx, observation(field, value))).toEqual({
        status: "conflict", field, currentValue: previous, incomingValue: value,
      });
      ctx.expectNoWrites();
      expect(await ctx.db.get(profileId)).toEqual(before);
      await invoke(saveObservation, ctx, observation(field, value, previous));
      const after = await ctx.db.get(profileId);
      expect(after).toMatchObject({ ...protectedValues, [field]: value });
      expect(score(after)).toEqual(score(before));
      expect(await ctx.db.get(oldId)).toMatchObject({ status: "superseded" });
      expect(await ctx.db.get(foreignId)).toMatchObject({ status: "current" });
      expect(await ctx.db.get(bikeId)).toMatchObject({ status: "current" });
    },
  );
});

describe("demographics through profile upsert", () => {
  it.each([["sex", "female", "male"], ["birthDate", "1990-04-12", "1985-01-01"]])(
    "%s refreshes rider staleness only when its current value changes", async (field, value, previous) => {
      const ctx = context();
      const profileId = await ctx.db.insert("profiles", { userId: "owner", ...measurements, ...protectedValues,
        [field]: previous, riderProfileUpdatedAt: 100, updatedAt: 100 });
      await invoke(upsert, ctx, { ...measurements, [field]: value });
      expect(await ctx.db.get(profileId)).toMatchObject({ [field]: value, riderProfileUpdatedAt: NOW });
      vi.mocked(Date.now).mockReturnValue(NOW + 1000);
      await invoke(upsert, ctx, { ...measurements, [field]: value });
      expect(await ctx.db.get(profileId)).toMatchObject({ riderProfileUpdatedAt: NOW, updatedAt: NOW + 1000 });
      await invoke(upsert, ctx, { ...measurements, [field]: undefined });
      expect(await ctx.db.get(profileId)).toMatchObject({ [field]: value, riderProfileUpdatedAt: NOW });
      expect(ctx.tables.get("profileObservations")).toHaveLength(1);
    },
  );

  it.each(validEntries)("supports %s=%s while preserving FTP, flexibility, existing age and score", async (field, value) => {
    const ctx = context();
    const profileId = await ctx.db.insert("profiles", { userId: "owner", ...measurements, ...protectedValues, updatedAt: 1 });
    const before = await ctx.db.get(profileId);
    expect(await invoke(upsert, ctx, { ...measurements, [field]: value })).toBe(profileId);
    const after = await ctx.db.get(profileId);
    expect(after).toMatchObject({ ...protectedValues, [field]: value });
    expect(score(after)).toEqual(score(before));
    expect(after).not.toHaveProperty(field === "sex" ? "birthDate" : "sex");
    expect(ctx.tables.get("profileObservations")).toEqual([expect.objectContaining({ field, value,
      kind: "declared", method: "self_report", source: "profile_edit", recordedAt: NOW })]);
    ctx.clearWrites();
    await invoke(upsert, ctx, { ...measurements, [field]: value });
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it.each(invalidEntries)("rejects invalid %s=%s before even measurement observations are written", async (field, value) => {
    const ctx = context();
    await expect(invoke(upsert, ctx, { ...measurements, [field]: value })).rejects.toThrow();
    ctx.expectNoWrites();
  });

  it("leaves omitted demographics absent and preserves previously supplied values on later saves", async () => {
    const ctx = context();
    const profileId = await invoke(upsert, ctx, measurements) as string;
    const initial = await ctx.db.get(profileId);
    expect(initial).not.toHaveProperty("sex");
    expect(initial).not.toHaveProperty("birthDate");
    expect(initial).not.toHaveProperty("age");
    await invoke(upsert, ctx, { ...measurements, sex: "prefer_not_to_say", birthDate: "1990-04-12" });
    await invoke(upsert, ctx, { ...measurements, heightCm: 181, sex: undefined, birthDate: undefined });
    expect(await ctx.db.get(profileId)).toMatchObject({ sex: "prefer_not_to_say", birthDate: "1990-04-12" });
    expect((await ctx.db.get(profileId))).not.toHaveProperty("age");
    const demographics = ctx.tables.get("profileObservations")!.filter((row) => row.field === "sex" || row.field === "birthDate");
    expect(demographics).toHaveLength(2);
    expect(demographics.every((row) => row.status === "current" && row.kind === "declared")).toBe(true);
  });
});

describe("demographics authentication and owner isolation", () => {
  it.each(["saveObservation", "upsert"])("%s requires authentication before database access", async (path) => {
    const ctx = context();
    auth.userId = null;
    await expect(invoke(path === "upsert" ? upsert : saveObservation, ctx,
      path === "upsert" ? { ...measurements, sex: "female" } : observation("sex", "female"))).rejects.toThrow("Not authenticated");
    expect(ctx.db.query).not.toHaveBeenCalled();
    ctx.expectNoWrites();
  });

  it.each(["saveObservation", "upsert"])("%s can only write the authenticated owner's profile", async (path) => {
    const ctx = context();
    const foreignId = await ctx.db.insert("profiles", { userId: "other", sex: "male", birthDate: "1980-01-01", updatedAt: 1 });
    const foreign = await ctx.db.get(foreignId);
    await invoke(path === "upsert" ? upsert : saveObservation, ctx,
      path === "upsert" ? { ...measurements, birthDate: "1990-04-12" } : observation("birthDate", "1990-04-12"));
    expect(await ctx.db.get(foreignId)).toEqual(foreign);
    expect(ctx.tables.get("profiles")?.find((row) => row.userId === "owner")).toMatchObject({ birthDate: "1990-04-12" });
    expect(ctx.tables.get("profileObservations")!.every((row) => row.userId === "owner")).toBe(true);
  });
});
