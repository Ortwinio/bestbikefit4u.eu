import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { importHandoff } from "./handoff";
import { getHandoffContext } from "./queries";

const { auth } = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: auth }));
vi.mock("../bikes/mutations", async () => {
  const { v } = await import("convex/values");
  return {
    bikeTypeValidator: v.string(),
    createBikeWithProfiles: async (ctx: { db: { insert: (table: string, fields: object) => Promise<string> } },
      fields: object) => ctx.db.insert("bikes", fields),
  };
});

type Row = Record<string, unknown> & { _id: string };
type Handler = { _handler: (ctx: unknown, args: unknown) => Promise<{
  status: string; importedFields: string[]; profileId: string | null; bikeId: string | null;
  conflicts: { field: string; currentValue: string | number; incomingValue: string | number }[];
}> };
const invoke = (ctx: unknown, args: unknown) => (importHandoff as unknown as Handler)._handler(ctx, args);

function context() {
  const tables = new Map<string, Row[]>();
  let sequence = 0;
  const insert = vi.fn(async (table: string, fields: Record<string, unknown>) => {
    const row = { _id: `${table}_${++sequence}`, ...fields };
    tables.set(table, [...(tables.get(table) ?? []), row]);
    return row._id;
  });
  const get = async (id: string) => [...tables.values()].flat().find((row) => row._id === id) ?? null;
  const patch = vi.fn(async (id: string, fields: Record<string, unknown>) => Object.assign((await get(id))!, fields));
  const query = (table: string) => {
    const filters: ((row: Row) => boolean)[] = [];
    const index = { eq: (field: string, value: unknown) => {
      filters.push((row) => row[field] === value); return index;
    } };
    const expression = {
      field: (name: string) => (row: Row) => row[name],
      eq: (left: (row: Row) => unknown, value: unknown) => (row: Row) => left(row) === value,
      and: (...conditions: ((row: Row) => boolean)[]) => (row: Row) => conditions.every((part) => part(row)),
    };
    const rows = () => (tables.get(table) ?? []).filter((row) => filters.every((filter) => filter(row)));
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
const entry = (overrides: Record<string, unknown> = {}) => ({
  field: "inseamCm", value: 81, unit: "cm", calculator: "saddle-height", method: "measured",
  touchedAt: 1791000000000, ...overrides,
});

beforeEach(() => {
  auth.mockResolvedValue("user_owner");
  vi.spyOn(Date, "now").mockReturnValue(1791000010000);
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

describe("public handoff import", () => {
  it("refuses paid handoff values and unchanged-value provenance upgrades when enforced", async () => {
    vi.stubEnv("PAID_ACCESS_ENFORCED", "true");
    const ctx = context();
    await expect(invoke(ctx, { records: [entry({ field: "femurLengthCm", value: 40 })] }))
      .rejects.toThrow("PAID_PROFILE_ACCESS_REQUIRED");
    expect(ctx.db.insert).not.toHaveBeenCalled();
    await ctx.db.insert("profiles", { userId: "user_owner", femurLengthCm: 40 });
    ctx.db.insert.mockClear();
    await expect(invoke(ctx, { records: [entry({ field: "femurLengthCm", value: 40 })] }))
      .rejects.toThrow("PAID_PROFILE_ACCESS_REQUIRED");
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("creates an inseam-only profile without inventing any other measurement", async () => {
    const ctx = context();
    const result = await invoke(ctx, { records: [entry()] });
    expect(result.status).toBe("imported");
    expect(ctx.tables.get("profiles")?.[0]).toMatchObject({ userId: "user_owner", inseamCm: 81 });
    expect(ctx.tables.get("profiles")?.[0].heightCm).toBeUndefined();
    expect(ctx.tables.get("profileObservations")?.[0]).toMatchObject({
      field: "inseamCm", value: 81, kind: "measured", method: "measured", source: "public_handoff",
      recordedAt: 1791000000000, status: "current", userId: "user_owner",
    });
  });

  it("returns conflicts with no partial writes or bike creation", async () => {
    const ctx = context();
    await ctx.db.insert("profiles", { userId: "user_owner", inseamCm: 85 });
    ctx.db.insert.mockClear();
    const result = await invoke(ctx, { records: [entry(), entry({ field: "heightCm", value: 174 })],
      bike: { name: "My bike", bikeType: "road" } });
    expect(result.status).toBe("conflicts");
    expect(result.conflicts).toEqual([{ field: "inseamCm", currentValue: 85, incomingValue: 81, unit: "cm" }]);
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it.each(["profile", "remeasure", "today"])("honors explicit %s resolution", async (choice) => {
    const ctx = context();
    await ctx.db.insert("profiles", { userId: "user_owner", inseamCm: 85 });
    await invoke(ctx, { records: [entry()], resolutions: [{ field: "inseamCm", choice, expectedCurrentValue: 85 }] });
    expect(ctx.tables.get("profiles")?.[0].inseamCm).toBe(choice === "today" ? 81 : 85);
    expect(ctx.tables.get("profileObservations")?.length ?? 0).toBe(choice === "today" ? 1 : 0);
  });

  it("returns a fresh conflict when the profile changed after preview", async () => {
    const ctx = context();
    await ctx.db.insert("profiles", { userId: "user_owner", inseamCm: 84 });
    const result = await invoke(ctx, { records: [entry()],
      resolutions: [{ field: "inseamCm", choice: "today", expectedCurrentValue: 85 }] });
    expect(result.status).toBe("conflicts");
    expect(ctx.tables.get("profiles")?.[0].inseamCm).toBe(84);
  });

  it.each([
    { value: 49 }, { value: 121 }, { value: NaN }, { value: Infinity }, { value: "81" },
    { unit: "mm" }, { field: "adminRole" }, { calculator: "unknown" },
    { touchedAt: 0 }, { touchedAt: 1792000010000 }, { method: "bike" },
  ])("rejects invalid input without writing: %j", async (override) => {
    const ctx = context();
    await expect(invoke(ctx, { records: [entry(override)] })).rejects.toThrow();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("requires authentication and cannot affect another user's current values", async () => {
    const ctx = context();
    await ctx.db.insert("profiles", { userId: "someone_else", inseamCm: 87 });
    auth.mockResolvedValueOnce(null);
    await expect(invoke(ctx, { records: [entry()] })).rejects.toThrow();
    await invoke(ctx, { records: [entry()] });
    expect(ctx.tables.get("profiles")?.[0].inseamCm).toBe(87);
    const result = await (getHandoffContext as unknown as { _handler: (ctx: unknown, args: object) =>
      Promise<{ profile: Row; observations: Row[] }> })._handler(ctx, {});
    expect(result.profile.inseamCm).toBe(81);
    expect(result.observations.every((row) => row.userId === "user_owner")).toBe(true);
  });

  it("records FTP protocol/date and reuses positionPriority for the riding goal", async () => {
    const ctx = context();
    await invoke(ctx, { records: [
      entry({ field: "ftpWatts", unit: "W", value: 240 }),
      entry({ field: "ftpMethod", unit: "none", value: "20-minute", method: "declared" }),
      entry({ field: "ridingGoal", unit: "none", value: "balanced", method: "declared" }),
    ] });
    expect(ctx.tables.get("profiles")?.[0]).toMatchObject({
      ftpWatts: 240, ftpMeasuredAt: 1791000000000, ftpMethod: "20-minute", positionPriority: "balanced",
    });
  });

  it("requires a saddle measurement point before creating an owned bike", async () => {
    const ctx = context();
    const records = [entry({ field: "currentSaddleHeightMm", value: 728, unit: "mm", method: "bike" })];
    await expect(invoke(ctx, { records, bike: { name: "My bike", bikeType: "road" } })).rejects.toThrow();
    expect(ctx.db.insert).not.toHaveBeenCalled();
    const result = await invoke(ctx, { records,
      bike: { name: "My bike", bikeType: "road", saddleHeightMeasurePoint: "bb_center_to_saddle_top" } });
    expect(await ctx.db.get(result.bikeId!)).toMatchObject({ userId: "user_owner", currentSetup: {
      saddleHeightMm: 728, saddleHeightMeasurement: { measurePoint: "bb_center_to_saddle_top",
        measuredAt: 1791000000000, source: "public_handoff" },
    } });
  });

  it("does not attribute a new FTP estimate to an older test protocol", async () => {
    const ctx = context();
    await ctx.db.insert("profiles", { userId: "user_owner", ftpWatts: 240, ftpMethod: "20-minute" });
    await invoke(ctx, { records: [entry({ field: "ftpWatts", unit: "W", value: 250, method: "estimated" })],
      resolutions: [{ field: "ftpWatts", choice: "today", expectedCurrentValue: 240 }] });
    expect(ctx.tables.get("profiles")?.[0].ftpMethod).toBeUndefined();
    expect(ctx.tables.get("profileObservations")?.[0]).toMatchObject({ kind: "estimated", method: "estimated" });
  });

  it("does not persist bike entries when the bike toggle is off", async () => {
    const ctx = context();
    const result = await invoke(ctx, { records: [entry(),
      entry({ field: "currentSaddleHeightMm", value: 728, unit: "mm", method: "bike" })] });
    expect(result.importedFields).toEqual(["inseamCm"]);
    expect(ctx.tables.get("bikes")).toBeUndefined();
  });

  it("normalizes calculator bike categories and rejects inconsistent bike provenance", async () => {
    const ctx = context();
    const records = [entry({ field: "bikeCategory", value: "mtb", unit: "none", method: "bike" })];
    await expect(invoke(ctx, { records, bike: { name: "Trail bike", bikeType: "road" } })).rejects.toThrow();
    expect(ctx.db.insert).not.toHaveBeenCalled();
    await invoke(ctx, { records, bike: { name: "Trail bike", bikeType: "mountain" } });
    expect(ctx.tables.get("profileObservations")?.[0]).toMatchObject({ field: "bikeType", value: "mountain" });
  });

  it("keeps observation history while repeated confirmation is idempotent for rider data", async () => {
    const ctx = context();
    await invoke(ctx, { records: [entry()] });
    await invoke(ctx, { records: [entry()] });
    expect(ctx.tables.get("profileObservations")).toHaveLength(1);
    await invoke(ctx, { records: [entry({ value: 82, touchedAt: 1791000005000 })],
      resolutions: [{ field: "inseamCm", choice: "today", expectedCurrentValue: 81 }] });
    expect(ctx.tables.get("profileObservations")?.map((row) => row.status)).toEqual(["superseded", "current"]);
  });
});
