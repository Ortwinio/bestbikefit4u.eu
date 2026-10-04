import { beforeEach, describe, expect, it, vi } from "vitest";
const { userId } = vi.hoisted(() => ({ userId: vi.fn() }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: userId }));
import { clearConnections } from "./retireStrava";

const handler = (clearConnections as unknown as {
  _handler: (ctx: unknown, args: unknown) => Promise<{
    dryRun: boolean; counts: { scanned: number; eligible: number; withTokens: number; withState: number; deleted: number };
    continueCursor: string; isDone: boolean;
  }>;
})._handler;

type ConnectionFixture = {
  _id: string; provider: string; accessToken?: string; refreshToken?: string; oauthState?: string;
};

function context(role: string | undefined = "super_admin", rows: ConnectionFixture[] = [
  { _id: "connection1", provider: "strava", accessToken: "fake-access", refreshToken: "fake-refresh", oauthState: "fake-state" },
  { _id: "connection2", provider: "strava", accessToken: undefined, refreshToken: undefined, oauthState: undefined },
]) {
  const paginate = vi.fn(async () => ({ page: rows, continueCursor: "next-page", isDone: false }));
  return { paginate, db: {
    get: vi.fn(async () => role ? { _id: "admin", adminRole: role } : { _id: "admin" }),
    query: vi.fn(() => ({ paginate })), delete: vi.fn(async () => undefined), patch: vi.fn(), insert: vi.fn(),
  } };
}

describe("retired connection cleanup", () => {
  beforeEach(() => { userId.mockReset(); userId.mockResolvedValue("admin"); });

  it("is internal and defaults to count-only without exposing secrets or touching records", async () => {
    expect((clearConnections as unknown as { isInternal: boolean }).isInternal).toBe(true);
    const ctx = context();
    const result = await handler(ctx, { cursor: null });
    expect(result).toEqual({ dryRun: true,
      counts: { scanned: 2, eligible: 2, withTokens: 1, withState: 1, deleted: 0 },
      continueCursor: "next-page", isDone: false });
    expect(ctx.paginate).toHaveBeenCalledWith({ cursor: null, numItems: 25, maximumRowsRead: 100, maximumBytesRead: 1_000_000 });
    expect(ctx.db.delete).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toMatch(/fake-access|fake-refresh|fake-state|connection1/);
  });

  it.each([undefined, "ops_admin", "support_admin", "analyst"])("rejects non-super-admin role %s before scanning", async (role) => {
    const ctx = context(role ?? "");
    await expect(handler(ctx, { cursor: null })).rejects.toThrow(/authorized/);
    expect(ctx.db.query).not.toHaveBeenCalled();
    expect(ctx.db.delete).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated internal calls", async () => {
    userId.mockResolvedValue(null);
    const ctx = context();
    await expect(handler(ctx, { cursor: null })).rejects.toThrow("Not authenticated");
    expect(ctx.db.query).not.toHaveBeenCalled();
  });

  it.each([0, 101, 1.5, NaN, Infinity])("rejects unbounded page size %s", async (numItems) => {
    const ctx = context();
    await expect(handler(ctx, { cursor: null, numItems })).rejects.toThrow("Page size");
    expect(ctx.db.query).not.toHaveBeenCalled();
  });

  it.each([undefined, "yes", "clear"])("requires the explicit destructive confirmation %s", async (confirmation) => {
    const ctx = context();
    await expect(handler(ctx, { cursor: null, dryRun: false, confirmation })).rejects.toThrow("dry-run first");
    expect(ctx.db.query).not.toHaveBeenCalled();
    expect(ctx.db.delete).not.toHaveBeenCalled();
  });

  it("deletes only matching connection rows after confirmation, preserves legacy bike/activity data, and is repeatable", async () => {
    const ctx = context("super_admin", [
      { _id: "connection1", provider: "strava", accessToken: "fake-access", refreshToken: "fake-refresh", oauthState: "fake-state" },
      { _id: "other", provider: "future-provider", accessToken: "untouched", refreshToken: undefined, oauthState: undefined },
    ]);
    const args = { cursor: "prior-page", numItems: 10, dryRun: false, confirmation: "CLEAR_STRAVA_CONNECTIONS" };
    const result = await handler(ctx, args);
    expect(result.counts.deleted).toBe(1);
    expect(ctx.db.query).toHaveBeenCalledExactlyOnceWith("integrations");
    expect(ctx.db.delete).toHaveBeenCalledExactlyOnceWith("connection1");
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.paginate).toHaveBeenCalledWith({
      cursor: "prior-page", numItems: 10, maximumRowsRead: 100, maximumBytesRead: 1_000_000,
    });
    const empty = context("super_admin", []);
    expect((await handler(empty, args)).counts.deleted).toBe(0);
    expect(empty.db.delete).not.toHaveBeenCalled();
  });
});
