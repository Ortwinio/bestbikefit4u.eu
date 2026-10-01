import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { FunctionArgs } from "convex/server";
import { api } from "../_generated/api";
import { upsert } from "./mutations";
import { get } from "./queries";
import { deleteAccount } from "../users/mutations";
import { calculatorDefaults } from "../../src/lib/calculators/accountState";

const auth = vi.hoisted(() => ({ userId: "user1" as string | null }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: async () => auth.userId }));
type Args = FunctionArgs<typeof api.calculatorStates.mutations.upsert>;
const save = (upsert as unknown as { _handler: (ctx: MutationCtx, args: Args) => Promise<string> })._handler;
const load = (get as unknown as { _handler: (ctx: QueryCtx,
  args: FunctionArgs<typeof api.calculatorStates.queries.get>) => Promise<Record<string, unknown> | null> })._handler;
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
    query: () => ({
      withIndex: (_index: string, apply: (q: { eq: (key: string, value: unknown) => unknown }) => unknown) => {
        const filters: [string, unknown][] = [];
        const q = { eq: (key: string, value: unknown) => { filters.push([key, value]); return q; } };
        apply(q);
        return { unique: async () =>
          [...rows].reverse().find((row) => filters.every(([key, value]) => row[key] === value)) ?? null };
      },
    }),
  };
  return { rows, db, ctx: { db } as unknown as MutationCtx & QueryCtx };
}

beforeEach(() => { auth.userId = "user1"; });
const args = (inseamCm = 84, bikeId?: string): Args => ({
  bikeId: bikeId as Args["bikeId"],
  state: { calculator: "saddle-height", values: { ...calculatorDefaults["saddle-height"], inseamCm } },
});
describe("calculator state storage", () => {
  it("updates one record and restores it after a new authenticated visit", async () => {
    const { ctx, db, rows } = database();
    const id = await save(ctx, args());
    expect(await save(ctx, args(88))).toBe(id);
    expect(rows).toHaveLength(1);
    expect(db.patch).toHaveBeenCalledOnce();
    auth.userId = null;
    await expect(load(ctx, { calculator: "saddle-height" })).rejects.toThrow();
    auth.userId = "user1";
    expect(await load(ctx, { calculator: "saddle-height" })).toMatchObject({
      state: { values: { inseamCm: 88 } },
    });
    expect(await load(ctx, { calculator: "frame-size" })).toBeNull();
  });
  it("isolates riders, bikes and unlinked state and rejects foreign bike access", async () => {
    const { ctx, rows } = database();
    await save(ctx, args(84));
    await save(ctx, args(86, "bike1"));
    expect(rows).toHaveLength(2);
    expect(await load(ctx, { calculator: "saddle-height" })).toMatchObject({ state: { values: { inseamCm: 84 } } });
    await expect(save(ctx, args(88, "foreign"))).rejects.toThrow();
    await expect(load(ctx, { calculator: "saddle-height", bikeId: "foreign" as Args["bikeId"] })).rejects.toThrow();
    auth.userId = "user2";
    expect(await load(ctx, { calculator: "saddle-height" })).toBeNull();
    await save(ctx, args(90));
    expect(rows).toHaveLength(3);
  });
  it("removes this rider's stored measurements on account deletion", async () => {
    const rows = [{ _id: "mine", userId: "user1" }, { _id: "other", userId: "user2" }];
    const remove = vi.fn(async () => {});
    const db = {
      delete: remove,
      query: (table: string) => ({ withIndex: (_index: string,
        apply: (q: { eq: (key: string, value: unknown) => unknown }) => unknown) => {
        const filters: [string, unknown][] = [];
        const q = { eq: (key: string, value: unknown) => { filters.push([key, value]); return q; } };
        apply(q);
        return { unique: async () => null, collect: async () => table === "calculatorStates"
          ? rows.filter((row) => filters.every(([key, value]) => row[key as keyof typeof row] === value)) : [] };
      } }),
    };
    await (deleteAccount as unknown as { _handler: (ctx: MutationCtx, args: object) => Promise<void> })
      ._handler({ db } as unknown as MutationCtx, {});
    expect(remove).toHaveBeenCalledWith("mine");
    expect(remove).not.toHaveBeenCalledWith("other");
    expect(remove).toHaveBeenCalledWith("user1");
  });
  it("validates each tool and never mutates the rider profile", async () => {
    const { ctx, db } = database();
    await expect(save(ctx, args(200))).rejects.toThrow("INVALID_CALCULATOR_VALUES");
    await expect(save(ctx, { state: { calculator: "frame-size", values: {
      ...calculatorDefaults["frame-size"], heightCm: 300,
    } } })).rejects.toThrow("INVALID_CALCULATOR_VALUES");
    await expect(save(ctx, { state: { calculator: "crank-length", values: {
      ...calculatorDefaults["crank-length"], inseamCm: 0,
    } } })).rejects.toThrow("INVALID_CALCULATOR_VALUES");
    expect(db.insert).not.toHaveBeenCalled();
    expect(db.patch).not.toHaveBeenCalled();
    await save(ctx, args());
    expect(db.insert.mock.calls[0][0]).toBe("calculatorStates");
  });
});

describe("performance calculator persistence", () => {
  it.each(["power-speed", "climb-planner", "ftp-wkg", "fuel-hydration"] as const)(
    "upserts and restores %s after authentication returns, isolated from other tools", async (calculator) => {
      const { ctx, rows, db } = database();
      const values = calculatorDefaults[calculator];
      const state = { calculator, values };
      await save(ctx, { state });
      const changed = { ...values, values: { ...values.values, riderMass: 81 } };
      await save(ctx, { state: { calculator, values: changed } });
      expect(rows).toHaveLength(1);
      auth.userId = null;
      await expect(load(ctx, { calculator })).rejects.toThrow();
      auth.userId = "user1";
      expect(await load(ctx, { calculator })).toMatchObject({ state: { values: changed } });
      auth.userId = "other";
      expect(await load(ctx, { calculator })).toBeNull();
      auth.userId = "user1";
      await expect(save(ctx, { state, bikeId: "foreign" as Args["bikeId"] })).rejects.toThrow();
      await expect(save(ctx, { state: { calculator,
        values: { ...values, values: { ...values.values, power: 1000 } } } }))
        .rejects.toThrow("INVALID_CALCULATOR_VALUES");
      expect(db.insert.mock.calls.every(([table]) => table === "calculatorStates")).toBe(true);
      expect(db.patch.mock.calls.every(([id]) => rows.some((row) => row._id === id))).toBe(true);
    },
  );
});
