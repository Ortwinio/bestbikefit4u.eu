import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FunctionArgs } from "convex/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { api } from "../_generated/api";
import { upsertBasic } from "./mutations";
import { getLatestByBikeForUser, getLatestWithoutBikeForUser } from "./queries";
import { calculateBasicPressure } from "../../src/lib/pressure-engine";

const auth = vi.hoisted(() => ({ userId: "user1" as string | null }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: async () => auth.userId }));

type Args = FunctionArgs<typeof api.pressureCalculations.mutations.upsertBasic>;
type Row = Record<string, unknown> & { _id: string };
type Predicate = (row: Row) => boolean;
const save = (upsertBasic as unknown as { _handler: (ctx: MutationCtx, args: Args) => Promise<string> })._handler;
const load = (getLatestWithoutBikeForUser as unknown as {
  _handler: (ctx: QueryCtx, args: Record<string, never>) => Promise<Row | null>;
})._handler;
const loadBikes = (getLatestByBikeForUser as unknown as {
  _handler: (ctx: QueryCtx, args: Record<string, never>) => Promise<Array<{ bikeId: string; latestCalculation: Row | null }>>;
})._handler;

function database() {
  const rows: Row[] = [];
  const bikes: Row[] = [
    { _id: "bike1", userId: "user1" },
    { _id: "bike2", userId: "user1" },
    { _id: "foreign", userId: "user2" },
  ];
  const db = {
    get: vi.fn(async (id: string) => bikes.find((bike) => bike._id === id) ?? null),
    insert: vi.fn(async (table: string, value: Record<string, unknown>) => {
      expect(table).toBe("pressureCalculations");
      const id = `row${rows.length + 1}`;
      rows.push({ _id: id, ...value });
      return id;
    }),
    patch: vi.fn(async (id: string, value: Record<string, unknown>) => {
      Object.assign(rows.find((row) => row._id === id)!, value);
    }),
    query: (table: string) => ({
      withIndex: (_index: string, apply: (query: { eq: (key: string, value: unknown) => unknown }) => unknown) => {
        const predicates: Predicate[] = [];
        const index = {
          eq: (key: string, value: unknown) => {
            predicates.push((row) => row[key] === value);
            return index;
          },
        };
        apply(index);
        const expression = {
          field: (key: string) => key,
          eq: (key: string, value: unknown): Predicate => (row) => row[key] === value,
          and: (...filters: Predicate[]): Predicate => (row) => filters.every((filter) => filter(row)),
        };
        const results = () => (table === "bikes" ? bikes : rows).filter((row) => predicates.every((filter) => filter(row)));
        const query = {
          filter: (builder: (value: typeof expression) => Predicate) => { predicates.push(builder(expression)); return query; },
          order: (direction: string) => { expect(direction).toBe("desc"); return query; },
          first: async () => results().sort((first, second) => Number(second.createdAt) - Number(first.createdAt))[0] ?? null,
          collect: async () => results(),
        };
        return query;
      },
    }),
  };
  return { rows, bikes, db, ctx: { db } as unknown as MutationCtx & QueryCtx };
}

function args(bikeId?: string, weight = 75): Args {
  return {
    expectedUserId: (auth.userId ?? "user1") as Args["expectedUserId"],
    bikeId: bikeId as Args["bikeId"],
    inputSnapshot: {
      discipline: "road", bodyWeightKg: weight, widthFrontMm: 28, widthRearMm: 30,
      tubeType: "tubeless", surface: "average_asphalt", bikeWeightKg: 9, ridingGoal: "comfort",
    },
  };
}

beforeEach(() => { auth.userId = "user1"; });

describe("basic account pressure autosave", () => {
  it("rejects queued input from a previous identity before an unbound or bike write", async () => {
    const { ctx, db, rows } = database();
    const unboundInput = args();
    const bikeInput = args("foreign");
    auth.userId = "user2";
    await expect(save(ctx, unboundInput)).rejects.toThrow("ACCOUNT_CHANGED");
    await expect(save(ctx, bikeInput)).rejects.toThrow("ACCOUNT_CHANGED");
    expect(db.get).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
    expect(db.patch).not.toHaveBeenCalled();
    expect(rows).toEqual([]);
  });

  it("updates one managed row per bike and reloads the latest input without touching history", async () => {
    const { ctx, rows, db } = database();
    rows.push(
      { _id: "history", userId: "user1", bikeId: "bike1", sourceType: "dashboard_advanced", createdAt: 1 },
      { _id: "basic_history", userId: "user1", bikeId: "bike1", sourceType: "dashboard_basic", createdAt: 2 }
    );
    const history = structuredClone(rows);
    const id = await save(ctx, args("bike1"));
    expect(await save(ctx, args("bike1", 85))).toBe(id);
    expect(await save(ctx, args("bike1", 85))).toBe(id);
    expect(db.patch).toHaveBeenCalledOnce();
    expect(rows).toHaveLength(3);
    expect(rows.slice(0, 2)).toEqual(history);
    expect((await loadBikes(ctx, {}))[0].latestCalculation?.inputSnapshot).toEqual(args("bike1", 85).inputSnapshot);
    await save(ctx, args("bike2", 80));
    await save(ctx, args(undefined, 90));
    expect(rows).toHaveLength(5);
    expect((await load(ctx, {}))?.inputSnapshot).toEqual(args(undefined, 90).inputSnapshot);
  });

  it("saves the same server-calculated result as the public basic calculator", async () => {
    const { ctx, rows } = database();
    const input = args();
    const result = calculateBasicPressure(input.inputSnapshot);
    await save(ctx, input);
    expect(rows[0]).toMatchObject({
      sourceType: "dashboard_basic", autoNoteSource: "account_basic_autosave",
      recommendedFrontBar: result.frontBar, recommendedRearBar: result.rearBar,
      recommendedFrontPsi: result.frontPsi, recommendedRearPsi: result.rearPsi,
      warningsJson: JSON.stringify(result.warnings),
    });
  });

  it("isolates users and rejects missing or foreign bikes before writing", async () => {
    const { ctx, rows, bikes, db } = database();
    await save(ctx, args());
    auth.userId = "user2";
    expect(await load(ctx, {})).toBeNull();
    await save(ctx, args(undefined, 95));
    expect(rows).toHaveLength(2);
    auth.userId = "user1";
    expect((await load(ctx, {}))?.inputSnapshot).toEqual(args().inputSnapshot);
    await expect(save(ctx, args("foreign"))).rejects.toThrow("Bike not found");
    bikes.splice(bikes.findIndex((bike) => bike._id === "bike1"), 1);
    await expect(save(ctx, args("bike1"))).rejects.toThrow("Bike not found");
    auth.userId = null;
    await expect(save(ctx, args())).rejects.toThrow("Not authenticated");
    await expect(load(ctx, {})).rejects.toThrow("Not authenticated");
    expect(db.insert).toHaveBeenCalledTimes(2);
    expect(db.patch).not.toHaveBeenCalled();
  });

  it.each([
    ["bodyWeightKg", 34], ["bodyWeightKg", 161], ["widthFrontMm", 17], ["widthRearMm", 81],
    ["bikeWeightKg", 2], ["bikeWeightKg", 21], ["bikeWeightKg", Number.NaN], ["widthFrontMm", Infinity],
  ])("rejects invalid %s = %s before saving", async (field, value) => {
    const { ctx, db } = database();
    const input = args();
    Object.assign(input.inputSnapshot, { [field]: value });
    await expect(save(ctx, input)).rejects.toThrow("INVALID_PRESSURE_INPUT");
    expect(db.insert).not.toHaveBeenCalled();
    expect(db.patch).not.toHaveBeenCalled();
  });
});
