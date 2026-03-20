import type { Id } from "../_generated/dataModel";
import { mutation, type MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { requireUserId } from "../lib/authz";
import { validateShortString } from "../lib/validation";

async function requireOwnedWheelset(
  ctx: MutationCtx,
  wheelsetId: Id<"wheelsets">,
  userId: Id<"users">
) {
  const wheelset = await ctx.db.get(wheelsetId);
  if (!wheelset || wheelset.userId !== userId) {
    throw new Error("Wheelset not found");
  }

  const bike = await ctx.db.get(wheelset.bikeId);
  if (!bike || bike.userId !== userId) {
    throw new Error("Bike not found");
  }

  return { wheelset, bike };
}

async function deactivateSiblingTireSetups(
  ctx: MutationCtx,
  wheelsetId: Id<"wheelsets">
) {
  const tireSetups = await ctx.db
    .query("tireSetups")
    .withIndex("by_wheelset", (q) => q.eq("wheelsetId", wheelsetId))
    .collect();

  await Promise.all(
    tireSetups.map((tireSetup) =>
      ctx.db.patch(tireSetup._id, { isActive: false, updatedAt: Date.now() })
    )
  );
}

const casingTypeValidator = v.optional(
  v.union(
    v.literal("race_light"),
    v.literal("allround"),
    v.literal("reinforced")
  )
);

const tubeTypeValidator = v.union(
  v.literal("inner_tube"),
  v.literal("latex_tube"),
  v.literal("tubeless")
);

export const create = mutation({
  args: {
    wheelsetId: v.id("wheelsets"),
    name: v.string(),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    widthFrontMm: v.number(),
    widthRearMm: v.number(),
    tubeType: tubeTypeValidator,
    casingType: casingTypeValidator,
    maxPressureBar: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    validateShortString(args.name, "name");
    if (args.brand !== undefined) validateShortString(args.brand, "brand");
    if (args.model !== undefined) validateShortString(args.model, "model");
    const userId = await requireUserId(ctx);
    await requireOwnedWheelset(ctx, args.wheelsetId, userId);
    const now = Date.now();

    if (args.isActive) {
      await deactivateSiblingTireSetups(ctx, args.wheelsetId);
    }

    return await ctx.db.insert("tireSetups", {
      wheelsetId: args.wheelsetId,
      userId,
      name: args.name,
      brand: args.brand,
      model: args.model,
      widthFrontMm: args.widthFrontMm,
      widthRearMm: args.widthRearMm,
      tubeType: args.tubeType,
      casingType: args.casingType,
      maxPressureBar: args.maxPressureBar,
      isActive: args.isActive,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    tireSetupId: v.id("tireSetups"),
    name: v.optional(v.string()),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    widthFrontMm: v.optional(v.number()),
    widthRearMm: v.optional(v.number()),
    tubeType: v.optional(tubeTypeValidator),
    casingType: casingTypeValidator,
    maxPressureBar: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.name !== undefined) validateShortString(args.name, "name");
    if (args.brand !== undefined) validateShortString(args.brand, "brand");
    if (args.model !== undefined) validateShortString(args.model, "model");
    const userId = await requireUserId(ctx);
    const tireSetup = await ctx.db.get(args.tireSetupId);
    if (!tireSetup || tireSetup.userId !== userId) {
      throw new Error("Tire setup not found");
    }

    await requireOwnedWheelset(ctx, tireSetup.wheelsetId, userId);

    if (args.isActive) {
      await deactivateSiblingTireSetups(ctx, tireSetup.wheelsetId);
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.brand !== undefined) updates.brand = args.brand;
    if (args.model !== undefined) updates.model = args.model;
    if (args.widthFrontMm !== undefined) updates.widthFrontMm = args.widthFrontMm;
    if (args.widthRearMm !== undefined) updates.widthRearMm = args.widthRearMm;
    if (args.tubeType !== undefined) updates.tubeType = args.tubeType;
    if (args.casingType !== undefined) updates.casingType = args.casingType;
    if (args.maxPressureBar !== undefined) updates.maxPressureBar = args.maxPressureBar;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.tireSetupId, updates);
  },
});

export const remove = mutation({
  args: { tireSetupId: v.id("tireSetups") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const tireSetup = await ctx.db.get(args.tireSetupId);
    if (!tireSetup || tireSetup.userId !== userId) {
      throw new Error("Tire setup not found");
    }

    await ctx.db.delete(args.tireSetupId);
  },
});
