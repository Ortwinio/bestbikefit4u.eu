import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireBikeOwner, requireUserId } from "../lib/authz";
import { validateShortString, validateTextString } from "../lib/validation";
import {
  getSystemClimbingBikeProfile,
  getSystemDefaultBikeProfile,
} from "../bikeProfiles/defaults";

const disciplineValidator = v.union(
  v.literal("road"),
  v.literal("gravel"),
  v.literal("mtb"),
  v.literal("tt")
);

const ridingStyleValidator = v.union(
  v.literal("recreational"),
  v.literal("fitness"),
  v.literal("sportive"),
  v.literal("racing"),
  v.literal("commuting"),
  v.literal("touring")
);

const primaryGoalValidator = v.union(
  v.literal("comfort"),
  v.literal("balanced"),
  v.literal("performance"),
  v.literal("aerodynamics")
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
    ridingStyle: v.optional(ridingStyleValidator),
    primaryGoal: v.optional(primaryGoalValidator),
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

    const defaultProfile = getSystemDefaultBikeProfile({
      bikeType: args.bikeType,
      ridingStyle: args.ridingStyle,
    });

    const bikeId = await ctx.db.insert("bikes", {
      userId,
      name: args.name,
      bikeType: args.bikeType,
      currentGeometry: args.currentGeometry,
      currentSetup: args.currentSetup,
      discipline: args.discipline,
      ridingStyle: args.ridingStyle,
      primaryGoal: args.primaryGoal,
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
      name: defaultProfile.name,
      profileType: defaultProfile.profileType,
      isDefault: true,
      status: "active",
      source: "system_default",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const climbingProfile = getSystemClimbingBikeProfile({
      bikeType: args.bikeType,
    });
    if (climbingProfile) {
      await ctx.db.insert("bikeProfiles", {
        userId,
        bikeId,
        name: climbingProfile.name,
        profileType: climbingProfile.profileType,
        isDefault: false,
        status: "active",
        source: "system_default",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

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
    ridingStyle: v.optional(ridingStyleValidator),
    primaryGoal: v.optional(primaryGoalValidator),
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
    const { bike } = await requireBikeOwner(ctx, args.bikeId);
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.currentGeometry !== undefined)
      updates.currentGeometry = args.currentGeometry;
    if (args.currentSetup !== undefined)
      updates.currentSetup = args.currentSetup;
    if (args.discipline !== undefined) updates.discipline = args.discipline;
    if (args.ridingStyle !== undefined) updates.ridingStyle = args.ridingStyle;
    if (args.primaryGoal !== undefined) updates.primaryGoal = args.primaryGoal;
    if (args.bikeWeightKg !== undefined) updates.bikeWeightKg = args.bikeWeightKg;
    if (args.photoUrl !== undefined) updates.photoUrl = args.photoUrl;
    if (args.fitProfileId !== undefined) updates.fitProfileId = args.fitProfileId;
    if (args.brand !== undefined) updates.brand = args.brand;
    if (args.model !== undefined) updates.model = args.model;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.bikeId, updates);

    if (args.ridingStyle !== undefined) {
      const nextBike = {
        bikeType: bike.bikeType,
        ridingStyle: args.ridingStyle,
      };
      const defaults = getSystemDefaultBikeProfile(nextBike);
      const defaultProfile = await ctx.db
        .query("bikeProfiles")
        .withIndex("by_bike_default", (q) =>
          q.eq("bikeId", args.bikeId).eq("isDefault", true)
        )
        .first();

      if (defaultProfile && defaultProfile.source === "system_default") {
        await ctx.db.patch(defaultProfile._id, {
          name: defaults.name,
          profileType: defaults.profileType,
          updatedAt: Date.now(),
        });
      }
    }
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
