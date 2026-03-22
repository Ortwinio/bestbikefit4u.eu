import { mutation, type MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "../_generated/dataModel";
import {
  requireBikeOwner,
  requireBikeProfileOwner,
  requireSessionOwner,
} from "../lib/authz";
import { validateNumberRange, validateShortString } from "../lib/validation";
import { buildBikeRoleBias } from "../recommendations/bikeRoleBias";

const WEEKLY_HOURS_RANGE = [0, 60] as const;
const LONGEST_RIDE_KM_RANGE = [0, 600] as const;

async function deleteBySessionIndex(
  ctx: MutationCtx,
  table:
    | "questionnaireResponses"
    | "recommendations"
    | "recommendationShadowComparisons"
    | "validationCaptures"
    | "rideFeedbackEntries"
    | "emailReports",
  sessionId: Id<"fitSessions">
) {
  const docs = await ctx.db
    .query(table)
    .withIndex("by_session", (q: any) => q.eq("sessionId", sessionId))
    .collect();

  for (const doc of docs) {
    await ctx.db.delete(doc._id);
  }
}

export const create = mutation({
  args: {
    bikeType: v.optional(
      v.union(
        v.literal("road"),
        v.literal("gravel"),
        v.literal("mountain"),
        v.literal("hybrid"),
        v.literal("tt_triathlon"),
        v.literal("cyclocross"),
        v.literal("touring"),
        v.literal("city")
      )
    ),
    ridingStyle: v.optional(
      v.union(
        v.literal("recreational"),
        v.literal("fitness"),
        v.literal("sportive"),
        v.literal("racing"),
        v.literal("commuting"),
        v.literal("touring")
      )
    ),
    primaryGoal: v.optional(
      v.union(
        v.literal("comfort"),
        v.literal("balanced"),
        v.literal("performance"),
        v.literal("aerodynamics")
      )
    ),
    bikeId: v.optional(v.id("bikes")),
    bikeProfileId: v.optional(v.id("bikeProfiles")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let resolvedBikeId = args.bikeId;
    let snapshotBikeType = args.bikeType;
    let snapshotRidingStyle = args.ridingStyle;
    let snapshotPrimaryGoal = args.primaryGoal;

    if (args.bikeId) {
      const { bike } = await requireBikeOwner(ctx, args.bikeId);
      if (args.bikeType && bike.bikeType !== args.bikeType) {
        throw new Error("Bike type must match selected bike");
      }
      snapshotBikeType ??= bike.bikeType;
      const bikeRoleBias = buildBikeRoleBias({
        bikeName: bike.name,
        bikeType: bike.bikeType,
        discipline: bike.discipline,
        ridingStyle: bike.ridingStyle,
        primaryGoal: bike.primaryGoal,
      });
      snapshotRidingStyle ??=
        (bike.ridingStyle as typeof snapshotRidingStyle) ??
        (bikeRoleBias.suggestedRidingStyle as typeof snapshotRidingStyle);
      snapshotPrimaryGoal ??=
        (bike.primaryGoal as typeof snapshotPrimaryGoal) ??
        (bikeRoleBias.suggestedPrimaryGoal as typeof snapshotPrimaryGoal);
    }

    if (args.bikeProfileId) {
      const { bikeProfile } = await requireBikeProfileOwner(ctx, args.bikeProfileId);
      const { bike } = await requireBikeOwner(ctx, bikeProfile.bikeId);

      if (resolvedBikeId && resolvedBikeId !== bike._id) {
        throw new Error("Bike profile must belong to the selected bike");
      }

      if (args.bikeType && bike.bikeType !== args.bikeType) {
        throw new Error("Bike type must match selected bike profile");
      }

      resolvedBikeId = bike._id;
      snapshotBikeType ??= bike.bikeType;
      const bikeRoleBias = buildBikeRoleBias({
        bikeName: bike.name,
        bikeType: bike.bikeType,
        discipline: bike.discipline,
        ridingStyle: bike.ridingStyle,
        primaryGoal: bike.primaryGoal,
        profileName: bikeProfile.name,
        profileType: bikeProfile.profileType,
      });
      snapshotRidingStyle ??=
        (bike.ridingStyle as typeof snapshotRidingStyle) ??
        (bikeRoleBias.suggestedRidingStyle as typeof snapshotRidingStyle);
      snapshotPrimaryGoal ??=
        (bike.primaryGoal as typeof snapshotPrimaryGoal) ??
        (bikeRoleBias.suggestedPrimaryGoal as typeof snapshotPrimaryGoal);
    }

    if (!snapshotBikeType || !snapshotRidingStyle || !snapshotPrimaryGoal) {
      throw new Error("Bike type, riding style, and primary goal are required");
    }

    // Get user's profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile required to start a fit session");

    return await ctx.db.insert("fitSessions", {
      userId,
      profileId: profile._id,
      bikeId: resolvedBikeId,
      bikeProfileId: args.bikeProfileId,
      bikeType: snapshotBikeType,
      engineVersion: "v2",
      sourceType: args.bikeProfileId ? "bike_profile_flow" : "legacy_flow",
      status: "in_progress",
      ridingStyle: snapshotRidingStyle,
      primaryGoal: snapshotPrimaryGoal,
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    sessionId: v.id("fitSessions"),
    status: v.union(
      v.literal("in_progress"),
      v.literal("questionnaire_complete"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("archived")
    ),
  },
  handler: async (ctx, args) => {
    await requireSessionOwner(ctx, args.sessionId);
    const updates: Record<string, unknown> = { status: args.status };
    if (args.status === "completed") {
      updates.completedAt = Date.now();
    }
    await ctx.db.patch(args.sessionId, updates);
  },
});

export const addPainPoints = mutation({
  args: {
    sessionId: v.id("fitSessions"),
    painPoints: v.array(
      v.object({
        area: v.string(),
        frequency: v.union(
          v.literal("rarely"),
          v.literal("sometimes"),
          v.literal("often"),
          v.literal("always")
        ),
        severity: v.union(
          v.literal("mild"),
          v.literal("moderate"),
          v.literal("severe")
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    await requireSessionOwner(ctx, args.sessionId);
    for (const point of args.painPoints) {
      validateShortString(point.area, "painPoints.area");
    }
    await ctx.db.patch(args.sessionId, {
      painPoints: args.painPoints,
    });
  },
});

export const updateRidingDetails = mutation({
  args: {
    sessionId: v.id("fitSessions"),
    weeklyHours: v.optional(v.number()),
    longestRideKm: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireSessionOwner(ctx, args.sessionId);
    const updates: Record<string, unknown> = {};
    if (args.weeklyHours !== undefined) {
      validateNumberRange(
        args.weeklyHours,
        "weeklyHours",
        WEEKLY_HOURS_RANGE[0],
        WEEKLY_HOURS_RANGE[1]
      );
      updates.weeklyHours = args.weeklyHours;
    }
    if (args.longestRideKm !== undefined) {
      validateNumberRange(
        args.longestRideKm,
        "longestRideKm",
        LONGEST_RIDE_KM_RANGE[0],
        LONGEST_RIDE_KM_RANGE[1]
      );
      updates.longestRideKm = args.longestRideKm;
    }
    await ctx.db.patch(args.sessionId, updates);
  },
});

export const remove = mutation({
  args: {
    sessionId: v.id("fitSessions"),
  },
  handler: async (ctx, args) => {
    await requireSessionOwner(ctx, args.sessionId);

    await deleteBySessionIndex(ctx, "questionnaireResponses", args.sessionId);
    await deleteBySessionIndex(ctx, "recommendations", args.sessionId);
    await deleteBySessionIndex(
      ctx,
      "recommendationShadowComparisons",
      args.sessionId
    );
    await deleteBySessionIndex(ctx, "validationCaptures", args.sessionId);
    await deleteBySessionIndex(ctx, "rideFeedbackEntries", args.sessionId);
    await deleteBySessionIndex(ctx, "emailReports", args.sessionId);

    await ctx.db.delete(args.sessionId);
  },
});
