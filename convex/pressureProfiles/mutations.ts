import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireBikeOwner, requireUserId } from "../lib/authz";
import { validateShortString } from "../lib/validation";

const useCaseValidator = v.union(
  v.literal("race"),
  v.literal("endurance"),
  v.literal("wet_weather"),
  v.literal("gravel_mixed"),
  v.literal("comfort"),
  v.literal("custom")
);

export const save = mutation({
  args: {
    bikeId: v.id("bikes"),
    tireSetupId: v.id("tireSetups"),
    name: v.string(),
    useCase: useCaseValidator,
    targetSurface: v.optional(v.string()),
    targetGoal: v.optional(v.string()),
    recommendedFrontBar: v.number(),
    recommendedRearBar: v.number(),
    lastCalculatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    validateShortString(args.name, "name");
    if (args.targetSurface !== undefined) validateShortString(args.targetSurface, "targetSurface");
    if (args.targetGoal !== undefined) validateShortString(args.targetGoal, "targetGoal");
    const { userId } = await requireBikeOwner(ctx, args.bikeId);
    const tireSetup = await ctx.db.get(args.tireSetupId);
    if (!tireSetup || tireSetup.userId !== userId) {
      throw new Error("Tire setup not found");
    }

    const now = Date.now();
    const existing = (
      await ctx.db
        .query("pressureProfiles")
        .withIndex("by_bike", (q) => q.eq("bikeId", args.bikeId))
        .collect()
    ).find((profile) => profile.userId === userId && profile.useCase === args.useCase);

    if (existing) {
      await ctx.db.patch(existing._id, {
        tireSetupId: args.tireSetupId,
        name: args.name,
        useCase: args.useCase,
        targetSurface: args.targetSurface,
        targetGoal: args.targetGoal,
        recommendedFrontBar: args.recommendedFrontBar,
        recommendedRearBar: args.recommendedRearBar,
        lastCalculatedAt: args.lastCalculatedAt,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("pressureProfiles", {
      bikeId: args.bikeId,
      tireSetupId: args.tireSetupId,
      userId,
      name: args.name,
      useCase: args.useCase,
      targetSurface: args.targetSurface,
      targetGoal: args.targetGoal,
      recommendedFrontBar: args.recommendedFrontBar,
      recommendedRearBar: args.recommendedRearBar,
      lastCalculatedAt: args.lastCalculatedAt,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: { profileId: v.id("pressureProfiles") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await ctx.db.get(args.profileId);
    if (!profile || profile.userId !== userId) {
      throw new Error("Pressure profile not found");
    }
    await ctx.db.delete(args.profileId);
  },
});
