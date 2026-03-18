import { mutation, type MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import {
  requireBikeOwner,
  requireBikeProfileOwner,
} from "../lib/authz";

const profileTypeValidator = v.union(
  v.literal("base"),
  v.literal("mountain"),
  v.literal("endurance"),
  v.literal("performance"),
  v.literal("aero"),
  v.literal("indoor"),
  v.literal("technical"),
  v.literal("comfort"),
  v.literal("custom")
);

async function clearDefaultProfileForBike(
  ctx: MutationCtx,
  bikeId: Id<"bikes">
) {
  const existingDefaults = await ctx.db
    .query("bikeProfiles")
    .withIndex("by_bike_default", (q) =>
      q.eq("bikeId", bikeId).eq("isDefault", true)
    )
    .collect();

  await Promise.all(
    existingDefaults.map((profile) =>
      ctx.db.patch(profile._id, {
        isDefault: false,
        updatedAt: Date.now(),
      })
    )
  );
}

export const create = mutation({
  args: {
    bikeId: v.id("bikes"),
    name: v.string(),
    profileType: profileTypeValidator,
    isDefault: v.optional(v.boolean()),
    source: v.optional(
      v.union(
        v.literal("manual"),
        v.literal("system_default"),
        v.literal("legacy_migration")
      )
    ),
    legacySessionId: v.optional(v.id("fitSessions")),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireBikeOwner(ctx, args.bikeId);
    const isDefault = args.isDefault ?? false;

    if (isDefault) {
      await clearDefaultProfileForBike(ctx, args.bikeId);
    }

    return await ctx.db.insert("bikeProfiles", {
      userId,
      bikeId: args.bikeId,
      name: args.name,
      profileType: args.profileType,
      isDefault,
      status: "active",
      source: args.source ?? "manual",
      legacySessionId: args.legacySessionId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    bikeProfileId: v.id("bikeProfiles"),
    name: v.optional(v.string()),
    profileType: v.optional(profileTypeValidator),
    isDefault: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("active"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    const { bikeProfile } = await requireBikeProfileOwner(ctx, args.bikeProfileId);

    if (args.isDefault === true) {
      await clearDefaultProfileForBike(ctx, bikeProfile.bikeId);
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.profileType !== undefined) updates.profileType = args.profileType;
    if (args.isDefault !== undefined) updates.isDefault = args.isDefault;
    if (args.status !== undefined) {
      updates.status = args.status;
      if (args.status === "archived") {
        updates.archivedAt = Date.now();
      }
    }

    await ctx.db.patch(args.bikeProfileId, updates);
  },
});

export const archive = mutation({
  args: {
    bikeProfileId: v.id("bikeProfiles"),
  },
  handler: async (ctx, args) => {
    const { bikeProfile } = await requireBikeProfileOwner(ctx, args.bikeProfileId);
    if (bikeProfile.isDefault) {
      throw new Error("Cannot archive the default bike profile");
    }

    await ctx.db.patch(args.bikeProfileId, {
      status: "archived",
      archivedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const ensureDefaultForBike = mutation({
  args: {
    bikeId: v.id("bikes"),
    name: v.optional(v.string()),
    profileType: v.optional(profileTypeValidator),
  },
  handler: async (ctx, args) => {
    const { userId, bike } = await requireBikeOwner(ctx, args.bikeId);

    const existingDefault = await ctx.db
      .query("bikeProfiles")
      .withIndex("by_bike_default", (q) =>
        q.eq("bikeId", bike._id).eq("isDefault", true)
      )
      .first();

    if (existingDefault) {
      return existingDefault._id;
    }

    return await ctx.db.insert("bikeProfiles", {
      userId,
      bikeId: bike._id,
      name: args.name ?? "Base",
      profileType: args.profileType ?? "base",
      isDefault: true,
      status: "active",
      source: "system_default",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
