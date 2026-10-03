import { expect, it, vi } from "vitest";
import type { FunctionArgs } from "convex/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { api } from "../_generated/api";
import { createDashboardSaddleWidthSession } from "./mutations";
import { getLatestSaddleWidthSession } from "./queries";
import { calculateSaddleWidth, classifySaddleSuitability } from "../../src/lib/saddle-width-engine";
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: async () => "user1" }));
type Args = FunctionArgs<typeof api.saddleWidth.mutations.createDashboardSaddleWidthSession>;
const save = (createDashboardSaddleWidthSession as unknown as {
  _handler: (ctx: MutationCtx, args: Args) => Promise<string>;
})._handler;
const load = (getLatestSaddleWidthSession as unknown as {
  _handler: (ctx: QueryCtx, args: Pick<Args, "bikeId">) => Promise<Record<string, unknown> | null>;
})._handler;

it("updates the exact user's unlinked saddle setup, reloads it, and rejects a foreign bike", async () => {
  const rows: Record<string, unknown>[] = [];
  const db = {
    get: async () => ({ userId: "other" }),
    query: (table: string) => ({ withIndex: () => ({ unique: async () => null,
      collect: async () => [],
      order: () => ({ collect: async () => table === "saddleWidthSessions" ? [...rows].reverse() : [] }) }) }),
    insert: vi.fn(async (_table: string, values: Record<string, unknown>) => {
      rows.push({ _id: "saddle1", ...values }); return "saddle1";
    }),
    patch: vi.fn(async (_id: string, values: Record<string, unknown>) => { Object.assign(rows[0], values); }),
  };
  const ctx = { db } as unknown as MutationCtx & QueryCtx;
  const input = { inputMethod: "measured" as const, sitBoneWidthMm: 125,
    ridingType: "endurance_road" as const, postureCategory: "balanced" as const };
  const width = calculateSaddleWidth(input);
  const fit = classifySaddleSuitability(input, width);
  const args: Args = {
    measurementMethod: "measured", sitBoneWidthMm: 125,
    ridingType: input.ridingType, postureCategory: input.postureCategory,
    recommendedWidthMm: width.finalRecommendedWidthMm, widthRangeMinMm: width.widthRangeMinMm,
    widthRangeMaxMm: width.widthRangeMaxMm, primaryWidthClass: width.primaryWidthClass,
    saddleFamily: fit.saddleFamily, noseType: fit.noseType, profileShape: fit.profileShape,
    cutoutRecommended: fit.cutoutRecommended, paddingPreference: fit.paddingPreference,
    confidenceScore: width.confidenceScore, confidenceLevel: width.confidenceLevel,
    explanationKey: width.explanationKey,
  };
  await save(ctx, args);
  await save(ctx, { ...args, currentSaddleTilt: "nose_down", expectedUserId: "user1" as Args["expectedUserId"] });
  expect(db.insert).toHaveBeenCalledOnce();
  expect(db.patch).toHaveBeenCalledOnce();
  expect(await load(ctx, {})).toMatchObject({ userId: "user1", currentSaddleTilt: "nose_down" });
  expect(rows[0]).not.toHaveProperty("expectedUserId");
  const blockedDb = { get: vi.fn(), query: vi.fn(), insert: vi.fn(), patch: vi.fn() };
  await expect(save({ db: blockedDb } as unknown as MutationCtx, {
    ...args,
    bikeId: "bike1" as Args["bikeId"],
    expectedUserId: "user2" as Args["expectedUserId"],
  })).rejects.toThrow("User changed before saving");
  for (const operation of Object.values(blockedDb)) expect(operation).not.toHaveBeenCalled();
  const bikeId = "foreign" as Args["bikeId"];
  await expect(save(ctx, { ...args, bikeId })).rejects.toThrow("Bike not found");
  await expect(load(ctx, { bikeId })).rejects.toThrow("Bike not found");
  await expect(save(ctx, { ...args, sitBoneWidthMm: 999 })).rejects.toThrow();
  expect(db.patch).toHaveBeenCalledOnce();
});
