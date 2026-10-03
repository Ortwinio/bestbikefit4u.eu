import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FunctionArgs } from "convex/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { api } from "../_generated/api";
import { createDashboardGearingSession } from "./mutations";
import { getLatestGearingSession } from "./queries";
import { calculateGearingAnalysis } from "../../src/lib/gearing-engine";

const auth = vi.hoisted(() => ({ userId: "user1" as string | null }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: async () => auth.userId }));
type Args = FunctionArgs<typeof api.gearing.mutations.createDashboardGearingSession>;
const save = (createDashboardGearingSession as unknown as {
  _handler: (ctx: MutationCtx, args: Args) => Promise<string>;
})._handler;
const load = (getLatestGearingSession as unknown as {
  _handler: (ctx: QueryCtx, args: Pick<Args, "bikeId">) => Promise<Record<string, unknown> | null>;
})._handler;

function database() {
  const rows: Record<string, unknown>[] = [];
  const db = {
    get: vi.fn(async (id: string) => ({ _id: id, userId: id === "foreign" ? "other" : "user1" })),
    insert: vi.fn(async (_table: string, value: Record<string, unknown>) => {
      const _id = `row${rows.length + 1}`;
      rows.push({ _id, ...value });
      return _id;
    }),
    patch: vi.fn(async (id: string, value: Record<string, unknown>) => {
      Object.assign(rows.find((row) => row._id === id)!, value);
    }),
    query: (table: string) => ({
      withIndex: (_index: string, apply: (q: { eq: (key: string, value: unknown) => unknown }) => unknown) => {
        const filters: [string, unknown][] = [];
        const q = { eq: (key: string, value: unknown) => { filters.push([key, value]); return q; } };
        apply(q);
        const results = () => (table === "gearingSessions" ? [...rows].reverse() : [])
          .filter((row) => filters.every(([key, value]) => row[key] === value));
        return { unique: async () => results()[0] ?? null, collect: async () => results(),
          order: () => ({ first: async () => results()[0] ?? null }) };
      },
    }),
  };
  return { rows, db, ctx: { db } as unknown as MutationCtx & QueryCtx };
}

const input = {
  drivetrainType: "2x" as const, chainrings: [50, 34], cassetteTeeth: [11, 17, 24, 32],
  wheelCircumferenceMm: 2105, cadenceRpm: 85,
};
function args(bikeId?: string, ring = 50): Args {
  const next = { ...input, chainrings: [ring, 34] };
  return { bikeId: bikeId as Args["bikeId"], input: next, ...calculateGearingAnalysis(next) };
}
beforeEach(() => { auth.userId = "user1"; });

describe("current gearing setup", () => {
  it("rejects stale user identities before accessing data and accepts matching identities", async () => {
    const blockedDb = { get: vi.fn(), query: vi.fn(), insert: vi.fn(), patch: vi.fn() };
    const staleArgs = { ...args("bike1"), expectedUserId: "user2" as Args["expectedUserId"] };
    await expect(save({ db: blockedDb } as unknown as MutationCtx, staleArgs))
      .rejects.toThrow("User changed before saving");
    for (const operation of Object.values(blockedDb)) expect(operation).not.toHaveBeenCalled();

    const { ctx, rows } = database();
    await save(ctx, { ...args(), expectedUserId: "user1" as Args["expectedUserId"] });
    expect(rows).toHaveLength(1);
    expect(rows[0]).not.toHaveProperty("expectedUserId");
  });
  it("upserts one current row per rider/bike and reloads its latest input", async () => {
    const { ctx, rows, db } = database();
    const id = await save(ctx, args("bike1"));
    expect(await save(ctx, args("bike1", 52))).toBe(id);
    expect(rows).toHaveLength(1);
    expect(db.patch).toHaveBeenCalledOnce();
    expect((await load(ctx, { bikeId: args("bike1").bikeId }))?.input).toMatchObject({ chainrings: [52, 34] });
    await save(ctx, args("bike2"));
    await save(ctx, args());
    expect(rows).toHaveLength(3);
    expect((await load(ctx, {}))?.bikeId).toBeUndefined();
  });
  it("isolates users and rejects unauthenticated or foreign-bike reads/writes", async () => {
    const { ctx, db } = database();
    await save(ctx, args());
    auth.userId = "user2";
    expect(await load(ctx, {})).toBeNull();
    auth.userId = "user1";
    await expect(save(ctx, args("foreign"))).rejects.toThrow("Bike not found");
    await expect(load(ctx, { bikeId: args("foreign").bikeId })).rejects.toThrow("Bike not found");
    auth.userId = null;
    await expect(save(ctx, args())).rejects.toThrow("Not authenticated");
    await expect(load(ctx, {})).rejects.toThrow("Not authenticated");
    expect(db.insert).toHaveBeenCalledOnce();
  });
  it("rejects invalid inputs and recalculates supplied results on the server", async () => {
    const { ctx, db, rows } = database();
    const bad = args();
    bad.input.wheelCircumferenceMm = 10;
    await expect(save(ctx, bad)).rejects.toThrow("Wheel circumference");
    expect(db.insert).not.toHaveBeenCalled();
    const altered = args();
    altered.math.rangePercent = -123;
    await save(ctx, altered);
    expect(rows[0].math).toEqual(calculateGearingAnalysis(input).math);
  });
});
