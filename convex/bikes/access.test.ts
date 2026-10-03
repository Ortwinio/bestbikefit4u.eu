import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { assertCanCreateBike } from "./access";

const mocks = vi.hoisted(() => ({ access: vi.fn(), enforced: vi.fn() }));
vi.mock("../pricing/access", () => ({ getUserAccess: mocks.access }));
vi.mock("../../shared/pricing/flags", () => ({ isPaidAccessEnforced: mocks.enforced }));

describe("pricing bike creation limit", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.enforced.mockReturnValue(true); });
  const userId = "owner" as Id<"users">;
  function context(count: number) {
    const take = vi.fn(async (limit: number) => Array.from({ length: Math.min(count, limit) }, () => ({})));
    const eq = vi.fn();
    const query = vi.fn(() => ({ withIndex: (_index: string, range: (builder: object) => void) => {
      range({ eq }); return { take };
    } }));
    return { ctx: { db: { query } } as unknown as MutationCtx, query, eq, take };
  }
  it("preserves existing behaviour without any entitlement lookup when OFF", async () => {
    mocks.enforced.mockReturnValue(false);
    const { ctx, query } = context(8);
    await assertCanCreateBike(ctx, userId);
    expect(query).not.toHaveBeenCalled();
    expect(mocks.access).not.toHaveBeenCalled();
  });
  it("allows the first bike and scopes the count to its owner", async () => {
    mocks.access.mockResolvedValue({ maxBikes: 1 });
    const { ctx, eq, take } = context(0);
    await assertCanCreateBike(ctx, userId);
    expect(eq).toHaveBeenCalledWith("userId", userId);
    expect(take).toHaveBeenCalledWith(1);
  });
  it("rejects extra bikes for free and single access without deleting existing bikes", async () => {
    mocks.access.mockResolvedValue({ maxBikes: 1 });
    await expect(assertCanCreateBike(context(2).ctx, userId)).rejects.toThrow("BIKE_LIMIT_REACHED");
  });
  it("permits all bikes with an active annual right", async () => {
    mocks.access.mockResolvedValue({ maxBikes: null });
    const { ctx, query } = context(8);
    await assertCanCreateBike(ctx, userId);
    expect(query).not.toHaveBeenCalled();
  });
});
