import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { create, importByPassport, update } from "./mutations";
import { applyChanges } from "../calculatorChain/mutations";

const { auth } = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: auth }));
type Row = Record<string, unknown> & { _id: string };
type Handler = { _handler: (ctx: unknown, args: unknown) => Promise<unknown> };
const run = (handler: unknown, ctx: unknown, args: object) => (handler as Handler)._handler(ctx, args);
const now = Date.UTC(2026, 9, 3);
const bike = (id: string, extra = {}): Row => ({ _id: `bikes:${id}`, userId: "users:owner", name: id,
  bikeType: "road", source: "manual", createdAt: now, updatedAt: now, ...extra });
function fixture(rows: Row[] = []) {
  const db = {
    get: async (id: string) => rows.find((item) => item._id === id) ?? null,
    insert: vi.fn(async (table: string, values: object) => {
      const id = `${table}:${rows.length}`; rows.push({ _id: id, _creationTime: now, ...values }); return id;
    }),
    patch: vi.fn(async (id: string, values: object) => Object.assign(rows.find((item) => item._id === id)!, values)),
    query: (table: string) => {
      let selected = rows.filter((item) => item._id.startsWith(`${table}:`));
      const query = {
        withIndex: (_index: string, callback: (range: unknown) => unknown) => {
          const range = { eq: (field: string, value: unknown) => {
            selected = selected.filter((item) => item[field] === value); return range;
          } };
          callback(range); return query;
        },
        collect: async () => selected,
        first: async () => selected[0] ?? null,
        unique: async () => selected[0] ?? null,
        take: async (limit: number) => selected.slice(0, limit),
      };
      return query;
    },
  };
  return { rows, ctx: { db } };
}
beforeEach(() => { auth.mockResolvedValue("users:owner"); vi.stubEnv("PAID_ACCESS_ENFORCED", "true"); vi.spyOn(Date, "now").mockReturnValue(now); });
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

describe("bike pricing server writer integration", () => {
  it.each([
    { currentSetup: { handlebarReachMm: 550 } },
    { currentSetup: { handlebarDropMm: 50 } },
    { currentGeometry: { seatTubeAngle: 73 } },
    { gearing: { chainrings: [50, 34], cassetteTeeth: [11, 13, 15, 17, 19, 21, 24, 28] } },
  ])("refuses free manual creation with refinements %j", async (refinement) => {
    const { ctx } = fixture();
    await expect(run(create, ctx, { name: "Road", bikeType: "road", ...refinement })).rejects.toThrow("PAID_BIKE_ACCESS_REQUIRED");
  });
  it("links free catalogue geometry using base dimensions without paid angles", async () => {
    const { rows, ctx } = fixture([{ _id: "geometry_records:1", status: "active", source: "manufacturer",
      stack: 560, reach: 385, seatTubeAngle: 73, headTubeAngle: 72, sizeLabel: "M" }]);
    const id = await run(create, ctx, { name: "Road", bikeType: "road", geometryRecordId: "geometry_records:1" });
    expect(rows.find((item) => item._id === id)).toMatchObject({ geometryRecordId: "geometry_records:1",
      currentGeometry: { stackMm: 560, reachMm: 385, frameSize: "M" } });
    expect(rows.find((item) => item._id === id)?.currentGeometry).not.toHaveProperty("seatTubeAngle");
    expect(rows.find((item) => item._id === id)?.currentGeometry).not.toHaveProperty("headTubeAngle");
  });
  it("imports a free passport with base fields only", async () => {
    const { rows, ctx } = fixture([bike("source", { userId: "users:other", bikePassportId: "BBF-ABCD-1234",
      currentGeometry: { stackMm: 560, reachMm: 385, seatTubeAngle: 73, headTubeAngle: 72 },
      currentSetup: { saddleHeightMm: 720, handlebarDropMm: 50, handlebarReachMm: 550 } })]);
    const result = await run(importByPassport, ctx, { bikePassportId: "BBF-ABCD-1234", copyPhotos: false }) as { bikeId: string };
    const imported = rows.find((item) => item._id === result.bikeId)!;
    expect(imported.currentSetup).toEqual({ saddleHeightMm: 720 });
    expect(imported.currentGeometry).toMatchObject({ stackMm: 560, reachMm: 385 });
    expect((imported.currentGeometry as Record<string, unknown>).seatTubeAngle).toBeUndefined();
    expect((imported.currentGeometry as Record<string, unknown>).headTubeAngle).toBeUndefined();
    expect(rows.filter((item) => item._id.startsWith("profileObservations:")).some((item) =>
      ["currentSetup.handlebarDropMm", "currentSetup.handlebarReachMm", "currentGeometry.seatTubeAngle", "currentGeometry.headTubeAngle"].includes(String(item.field)))).toBe(false);
  });
  it("refuses changed paid setup on an existing free bike but permits unchanged values", async () => {
    const { ctx } = fixture([bike("A", { currentSetup: { handlebarDropMm: 50 } })]);
    await expect(run(update, ctx, { bikeId: "bikes:A", currentSetup: { handlebarDropMm: 60 } })).rejects.toThrow("PAID_BIKE_ACCESS_REQUIRED");
    await expect(run(update, ctx, { bikeId: "bikes:A", currentSetup: { handlebarDropMm: 50 } })).resolves.toBeUndefined();
  });
  it("single-bike access unlocks A, not another owned bike B", async () => {
    const { ctx } = fixture([bike("A"), bike("B"), { _id: "pricingEntitlements:1", userId: "users:owner",
      bikeId: "bikes:A", productId: "single", status: "active", startsAt: now - 1, expiresAt: now + 1,
      source: "purchase", appointmentGranted: false }]);
    await expect(run(update, ctx, { bikeId: "bikes:A", currentSetup: { handlebarDropMm: 50 } })).resolves.toBeUndefined();
    await expect(run(update, ctx, { bikeId: "bikes:B", currentSetup: { handlebarDropMm: 50 } })).rejects.toThrow("PAID_BIKE_ACCESS_REQUIRED");
  });
  it("calculator-chain refuses paid bike changes before observations or values are written", async () => {
    const { ctx } = fixture([bike("A")]);
    await expect(run(applyChanges, ctx, { calculator: "gearing", bikeId: "bikes:A", changes: [{
      field: "gearing.chainrings", value: [50, 34], expectedCurrentValue: null, kind: "declared",
    }] })).rejects.toThrow("PAID_BIKE_ACCESS_REQUIRED");
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
  it("flag off preserves manual refinement writes", async () => {
    vi.stubEnv("PAID_ACCESS_ENFORCED", "false");
    const { rows, ctx } = fixture();
    const id = await run(create, ctx, { name: "Road", bikeType: "road", currentSetup: { handlebarDropMm: 50 } });
    expect(rows.find((item) => item._id === id)?.currentSetup).toEqual({ handlebarDropMm: 50 });
  });
});
