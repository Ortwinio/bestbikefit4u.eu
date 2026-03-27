import type { Id } from "../_generated/dataModel";
import { mutation, type MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { requireBikeOwner, requireUserId } from "../lib/authz";
import { validateShortString } from "../lib/validation";

async function deactivateSiblingWheelsets(
  ctx: MutationCtx,
  bikeId: Id<"bikes">
) {
  const wheelsets = await ctx.db
    .query("wheelsets")
    .withIndex("by_bike", (q) => q.eq("bikeId", bikeId))
    .collect();

  await Promise.all(
    wheelsets.map((wheelset) =>
      ctx.db.patch(wheelset._id, { isActive: false, updatedAt: Date.now() })
    )
  );
}

export const create = mutation({
  args: {
    bikeId: v.id("bikes"),
    name: v.string(),
    rimType: v.union(v.literal("hooked"), v.literal("hookless")),
    internalRimWidthFrontMm: v.optional(v.number()),
    internalRimWidthRearMm: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    validateShortString(args.name, "name");
    const { userId } = await requireBikeOwner(ctx, args.bikeId);
    const now = Date.now();

    if (args.isActive) {
      await deactivateSiblingWheelsets(ctx, args.bikeId);
    }

    return await ctx.db.insert("wheelsets", {
      bikeId: args.bikeId,
      userId,
      name: args.name,
      rimType: args.rimType,
      internalRimWidthFrontMm: args.internalRimWidthFrontMm,
      internalRimWidthRearMm: args.internalRimWidthRearMm,
      isActive: args.isActive,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    wheelsetId: v.id("wheelsets"),
    name: v.optional(v.string()),
    rimType: v.optional(v.union(v.literal("hooked"), v.literal("hookless"))),
    internalRimWidthFrontMm: v.optional(v.number()),
    internalRimWidthRearMm: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.name !== undefined) validateShortString(args.name, "name");
    const userId = await requireUserId(ctx);
    const wheelset = await ctx.db.get(args.wheelsetId);
    if (!wheelset || wheelset.userId !== userId) {
      throw new Error("Wheelset not found");
    }

    if (args.isActive) {
      await deactivateSiblingWheelsets(ctx, wheelset.bikeId);
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.rimType !== undefined) updates.rimType = args.rimType;
    if (args.internalRimWidthFrontMm !== undefined) {
      updates.internalRimWidthFrontMm = args.internalRimWidthFrontMm;
    }
    if (args.internalRimWidthRearMm !== undefined) {
      updates.internalRimWidthRearMm = args.internalRimWidthRearMm;
    }
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.wheelsetId, updates);
  },
});

export const remove = mutation({
  args: { wheelsetId: v.id("wheelsets") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const wheelset = await ctx.db.get(args.wheelsetId);
    if (!wheelset || wheelset.userId !== userId) {
      throw new Error("Wheelset not found");
    }

    const tireSetups = await ctx.db
      .query("tireSetups")
      .withIndex("by_wheelset", (q) => q.eq("wheelsetId", args.wheelsetId))
      .collect();

    await Promise.all(tireSetups.map((tireSetup) => ctx.db.delete(tireSetup._id)));
    await ctx.db.delete(args.wheelsetId);

    if (wheelset.isActive) {
      const siblings = await ctx.db
        .query("wheelsets")
        .withIndex("by_bike", (q) => q.eq("bikeId", wheelset.bikeId))
        .collect();
      const nextActive =
        [...siblings].sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
      if (nextActive) {
        await ctx.db.patch(nextActive._id, {
          isActive: true,
          updatedAt: Date.now(),
        });
      }
    }
  },
});
