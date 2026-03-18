import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireBikeOwner, requireUserId } from "../lib/authz";

const disciplineValidator = v.union(
  v.literal("road"),
  v.literal("gravel"),
  v.literal("mtb"),
  v.literal("tt")
);

export const create = mutation({
  args: {
    name: v.string(),
    bikeType: v.union(
      v.literal("road"),
      v.literal("gravel"),
      v.literal("mountain"),
      v.literal("hybrid"),
      v.literal("tt_triathlon"),
      v.literal("cyclocross"),
      v.literal("touring"),
      v.literal("city")
    ),
    currentGeometry: v.optional(
      v.object({
        stackMm: v.optional(v.number()),
        reachMm: v.optional(v.number()),
        seatTubeAngle: v.optional(v.number()),
        headTubeAngle: v.optional(v.number()),
        frameSize: v.optional(v.string()),
      })
    ),
    currentSetup: v.optional(
      v.object({
        saddleHeightMm: v.optional(v.number()),
        saddleSetbackMm: v.optional(v.number()),
        stemLengthMm: v.optional(v.number()),
        stemAngle: v.optional(v.number()),
        handlebarWidthMm: v.optional(v.number()),
        crankLengthMm: v.optional(v.number()),
      })
    ),
    discipline: v.optional(disciplineValidator),
    bikeWeightKg: v.optional(v.number()),
    photoUrl: v.optional(v.string()),
    fitProfileId: v.optional(v.id("profiles")),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    const bikeId = await ctx.db.insert("bikes", {
      userId,
      name: args.name,
      bikeType: args.bikeType,
      currentGeometry: args.currentGeometry,
      currentSetup: args.currentSetup,
      discipline: args.discipline,
      bikeWeightKg: args.bikeWeightKg,
      photoUrl: args.photoUrl,
      fitProfileId: args.fitProfileId,
      brand: args.brand,
      model: args.model,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("bikeProfiles", {
      userId,
      bikeId,
      name: "Base",
      profileType: "base",
      isDefault: true,
      status: "active",
      source: "system_default",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return bikeId;
  },
});

export const update = mutation({
  args: {
    bikeId: v.id("bikes"),
    name: v.optional(v.string()),
    currentGeometry: v.optional(
      v.object({
        stackMm: v.optional(v.number()),
        reachMm: v.optional(v.number()),
        seatTubeAngle: v.optional(v.number()),
        headTubeAngle: v.optional(v.number()),
        frameSize: v.optional(v.string()),
      })
    ),
    currentSetup: v.optional(
      v.object({
        saddleHeightMm: v.optional(v.number()),
        saddleSetbackMm: v.optional(v.number()),
        stemLengthMm: v.optional(v.number()),
        stemAngle: v.optional(v.number()),
        handlebarWidthMm: v.optional(v.number()),
        crankLengthMm: v.optional(v.number()),
      })
    ),
    discipline: v.optional(disciplineValidator),
    bikeWeightKg: v.optional(v.number()),
    photoUrl: v.optional(v.string()),
    fitProfileId: v.optional(v.id("profiles")),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireBikeOwner(ctx, args.bikeId);
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.currentGeometry !== undefined)
      updates.currentGeometry = args.currentGeometry;
    if (args.currentSetup !== undefined)
      updates.currentSetup = args.currentSetup;
    if (args.discipline !== undefined) updates.discipline = args.discipline;
    if (args.bikeWeightKg !== undefined) updates.bikeWeightKg = args.bikeWeightKg;
    if (args.photoUrl !== undefined) updates.photoUrl = args.photoUrl;
    if (args.fitProfileId !== undefined) updates.fitProfileId = args.fitProfileId;
    if (args.brand !== undefined) updates.brand = args.brand;
    if (args.model !== undefined) updates.model = args.model;

    await ctx.db.patch(args.bikeId, updates);
  },
});

export const remove = mutation({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    await requireBikeOwner(ctx, args.bikeId);
    await ctx.db.delete(args.bikeId);
  },
});
