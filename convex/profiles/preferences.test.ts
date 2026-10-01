import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FunctionArgs } from "convex/server";
import type { MutationCtx } from "../_generated/server";
import { api } from "../_generated/api";
import { updatePreferences } from "./mutations";

const auth = vi.hoisted(() => ({ userId: "user1" as string | null }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: async () => auth.userId }));
type Args = FunctionArgs<typeof api.profiles.mutations.updatePreferences>;
const save = (updatePreferences as unknown as {
  _handler: (ctx: MutationCtx, args: Args) => Promise<string>;
})._handler;

function database() {
  const row = { _id: "profile1", userId: "user1", experienceLevel: "beginner", hasPain: "yes",
    painAreas: [], painSeverity: 4, kneePainTiming: "after_ride", painAreaSeverities: {} };
  const equal = vi.fn();
  const db = {
    patch: vi.fn(async (_id: string, value: object) => { Object.assign(row, value); }),
    query: vi.fn(() => ({ withIndex: (_name: string, apply: (query: { eq: typeof equal }) => unknown) => {
      apply({ eq: equal });
      return { unique: async () => auth.userId === row.userId ? row : null };
    } })),
  };
  return { row, db, equal, ctx: { db } as unknown as MutationCtx };
}
beforeEach(() => { auth.userId = "user1"; });
describe("partial profile preferences", () => {
  it("updates only preferences and timestamps, preserving pain and missing preferences", async () => {
    const { ctx, row, db, equal } = database();
    await save(ctx, { experienceLevel: "advanced", weeklyHours: undefined });
    expect(equal).toHaveBeenCalledWith("userId", "user1");
    expect(db.patch).toHaveBeenCalledExactlyOnceWith("profile1", {
      experienceLevel: "advanced", updatedAt: expect.any(Number), riderProfileUpdatedAt: expect.any(Number),
    });
    expect(row).toMatchObject({ experienceLevel: "advanced", hasPain: "yes", painSeverity: 4,
      painAreas: [], kneePainTiming: "after_ride" });
    expect(row).not.toHaveProperty("weeklyHours");
    await save(ctx, { experienceLevel: "advanced" });
    expect(db.patch).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledWith("profiles");
  });
  it("rejects unauthenticated users and never targets another user's profile", async () => {
    const { ctx, db } = database();
    auth.userId = null;
    await expect(save(ctx, { positionPriority: "comfort" })).rejects.toThrow("Not authenticated");
    expect(db.query).not.toHaveBeenCalled();
    auth.userId = "user2";
    await expect(save(ctx, { positionPriority: "comfort" })).rejects.toThrow("Profile not found");
    expect(db.patch).not.toHaveBeenCalled();
  });
});
