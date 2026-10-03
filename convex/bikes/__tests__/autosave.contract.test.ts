import { beforeEach, describe, expect, it, vi } from "vitest";
const auth = vi.hoisted(() => ({ user: "user" as string | null }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: async () => auth.user }));
import { update as updateBike } from "../mutations";
import { update as updateWheelset } from "../../wheelsets/mutations";
import { update as updateTires } from "../../tireSetups/mutations";

type Handler = (ctx: unknown, args: unknown) => Promise<unknown>;
const run = (fn: unknown, ctx: unknown, args: unknown) => (fn as { _handler: Handler })._handler(ctx, args);
function fixture() {
  const rows: Record<string, Record<string, unknown>> = {
    bike: {
      _id: "bike",
      userId: "user",
      name: "Bike",
      bikeType: "road",
      ridingStyle: "sportive",
      currentGeometry: { stackMm: 950, reachMm: 385 },
    },
    wheel: { _id: "wheel", userId: "user", bikeId: "bike", name: "Wheels", internalRimWidthFrontMm: 23 },
    tire: {
      _id: "tire",
      userId: "user",
      wheelsetId: "wheel",
      name: "Tires",
      widthFrontMm: 28,
      widthRearMm: 28,
      maxPressureBar: 6,
      casingType: "allround",
    },
  };
  const patch = vi.fn(async (id: string, values: object) => {
    Object.assign(rows[id], values);
  });
  const query = { withIndex: vi.fn().mockReturnThis(), first: async () => null, collect: async () => [] };
  return { rows, ctx: { db: { get: async (id: string) => rows[id], patch, insert: vi.fn(async () => "observation"), query: () => query } } };
}
beforeEach(() => {
  auth.user = "user";
});
describe("bike autosave server contract", () => {
  it("clears text and optional riding style without touching archived fits or unrelated measurements", async () => {
    const { rows, ctx } = fixture();
    await run(updateBike, ctx, { bikeId: "bike", notes: "", clearFields: ["ridingStyle"] });
    expect(rows.bike.notes).toBe("");
    expect(rows.bike.ridingStyle).toBeUndefined();
    expect(rows.bike.currentGeometry).toEqual({ stackMm: 950, reachMm: 385 });
    expect(ctx.db.patch.mock.calls.every(([id]) => id === "bike")).toBe(true);
  });
  it("preserves unchanged legacy geometry but rejects a newly invalid value", async () => {
    const { ctx } = fixture();
    await run(updateBike, ctx, { bikeId: "bike", currentGeometry: { stackMm: 950, reachMm: 390 } });
    await expect(
      run(updateBike, ctx, { bikeId: "bike", currentGeometry: { stackMm: 1000 } }),
    ).rejects.toThrow();
    await expect(run(updateBike, ctx, { bikeId: "bike", name: " " })).rejects.toThrow();
    await expect(run(updateBike, ctx, { bikeId: "bike", bikeWeightKg: 50 })).rejects.toThrow();
  });
  it("supports explicit optional wheel and tire clearing, with real range validation", async () => {
    const { rows, ctx } = fixture();
    await run(updateWheelset, ctx, { wheelsetId: "wheel", internalRimWidthFrontMm: null });
    await run(updateTires, ctx, { tireSetupId: "tire", maxPressureBar: null, casingType: null });
    expect(rows.wheel.internalRimWidthFrontMm).toBeUndefined();
    expect(rows.tire.maxPressureBar).toBeUndefined();
    expect(rows.tire.casingType).toBeUndefined();
    await expect(
      run(updateWheelset, ctx, { wheelsetId: "wheel", internalRimWidthRearMm: 99 }),
    ).rejects.toThrow();
    await expect(run(updateTires, ctx, { tireSetupId: "tire", widthFrontMm: 0 })).rejects.toThrow();
    await expect(run(updateTires, ctx, { tireSetupId: "tire", maxPressureBar: 20 })).rejects.toThrow();
  });
  it("rejects unauthenticated and foreign owners for each record type", async () => {
    const { ctx } = fixture();
    for (const user of [null, "someone-else"]) {
      auth.user = user;
      await expect(run(updateBike, ctx, { bikeId: "bike", notes: "no" })).rejects.toThrow();
      await expect(run(updateWheelset, ctx, { wheelsetId: "wheel", name: "no" })).rejects.toThrow();
      await expect(run(updateTires, ctx, { tireSetupId: "tire", name: "no" })).rejects.toThrow();
    }
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
});
