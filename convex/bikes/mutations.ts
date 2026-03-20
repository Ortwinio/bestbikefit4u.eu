import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireBikeOwner, requireUserId } from "../lib/authz";
import { validateShortString, validateTextString } from "../lib/validation";

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
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    validateShortString(args.name, "name");
    if (args.brand !== undefined) validateShortString(args.brand, "brand");
    if (args.model !== undefined) validateShortString(args.model, "model");
    if (args.notes !== undefined) validateTextString(args.notes, "notes");
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
      notes: args.notes,
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
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.name !== undefined) validateShortString(args.name, "name");
    if (args.brand !== undefined) validateShortString(args.brand, "brand");
    if (args.model !== undefined) validateShortString(args.model, "model");
    if (args.notes !== undefined) validateTextString(args.notes, "notes");
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
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.bikeId, updates);
  },
});

export const remove = mutation({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    const { userId } = await requireBikeOwner(ctx, args.bikeId);

    const fitSessions = await ctx.db
      .query("fitSessions")
      .withIndex("by_user_bike", (q) =>
        q.eq("userId", userId).eq("bikeId", args.bikeId)
      )
      .collect();

    if (fitSessions.length > 0) {
      throw new Error(
        "This bike cannot be deleted yet because it has fitting history."
      );
    }

    const pressureCalculations = await ctx.db
      .query("pressureCalculations")
      .withIndex("by_bike", (q) => q.eq("bikeId", args.bikeId))
      .collect();
    for (const calculation of pressureCalculations) {
      await ctx.db.delete(calculation._id);
    }

    const pressureProfiles = await ctx.db
      .query("pressureProfiles")
      .withIndex("by_bike", (q) => q.eq("bikeId", args.bikeId))
      .collect();
    for (const profile of pressureProfiles) {
      await ctx.db.delete(profile._id);
    }

    const bikeProfiles = await ctx.db
      .query("bikeProfiles")
      .withIndex("by_bike", (q) => q.eq("bikeId", args.bikeId))
      .collect();
    for (const bikeProfile of bikeProfiles) {
      await ctx.db.delete(bikeProfile._id);
    }

    const wheelsets = await ctx.db
      .query("wheelsets")
      .withIndex("by_bike", (q) => q.eq("bikeId", args.bikeId))
      .collect();
    for (const wheelset of wheelsets) {
      const tireSetups = await ctx.db
        .query("tireSetups")
        .withIndex("by_wheelset", (q) => q.eq("wheelsetId", wheelset._id))
        .collect();
      for (const tireSetup of tireSetups) {
        await ctx.db.delete(tireSetup._id);
      }
      await ctx.db.delete(wheelset._id);
    }

    await ctx.db.delete(args.bikeId);
  },
});
