import { describe, expect, it, vi } from "vitest";

vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: async () => "admin_1" }));

import { estimateMessageReach, getOverviewStats, getUserDetail } from "../queries";

type Handler = (ctx: unknown, args: unknown) => Promise<unknown>;

function makeCtx() {
  const user = { _id: "admin_1", adminRole: "super_admin", tier: "free", _creationTime: 1 };
  const bike = { _id: "bike_1", userId: "admin_1", source: "strava", name: "Imported bike", _creationTime: 1 };
  return {
    db: {
      get: vi.fn(async () => user),
      query: vi.fn((table: string) => {
        if (table === "integrations") throw new Error("Legacy integration read");
        const rows = table === "users" ? [user] : table === "bikes" ? [bike] : [];
        const chain = {
          collect: async () => rows,
          withIndex: () => chain,
        };
        return chain;
      }),
    },
  };
}

describe("admin legacy integration removal", () => {
  it.each(["true", "false"])("reports zero reach for inactive %s targets mixed with all", async (targetValue) => {
    const handler = (estimateMessageReach as unknown as { _handler: Handler })._handler;
    const ctx = makeCtx();
    expect(await handler(ctx, { targets: [
      { targetType: "strava_connected", targetValue }, { targetType: "all" },
    ] })).toEqual({ estimatedReach: 0 });
    expect(await handler(ctx, { targets: [{ targetType: "all" }] })).toEqual({ estimatedReach: 1 });
    expect(ctx.db.query).not.toHaveBeenCalledWith("integrations");
  });

  it("retains imported bikes in user detail and omits connection metrics", async () => {
    const ctx = makeCtx();
    const detail = await (getUserDetail as unknown as { _handler: Handler })._handler(ctx, { userId: "admin_1" });
    expect(detail).toMatchObject({ bikeCount: 1, bikes: [{ source: "strava", name: "Imported bike" }] });
    expect(detail).not.toHaveProperty("integration");
    expect(detail).not.toHaveProperty("stravaConnected");
    const stats = await (getOverviewStats as unknown as { _handler: Handler })._handler(ctx, {});
    expect(stats).toMatchObject({ totalUsers: 1 });
    expect(stats).not.toHaveProperty("stravaConnected");
    expect(ctx.db.query).not.toHaveBeenCalledWith("integrations");
  });
});
