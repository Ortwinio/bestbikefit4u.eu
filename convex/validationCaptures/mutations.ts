import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireSessionOwner } from "../lib/authz";

function isDynamicValidationBetaEnabled(): boolean {
  return process.env.ENGINE_V2_DYNAMIC_VALIDATION_ENABLED?.toLowerCase() === "true";
}

export const createBeta = mutation({
  args: {
    sessionId: v.id("fitSessions"),
    captureType: v.union(
      v.literal("side_video"),
      v.literal("front_video"),
      v.literal("manual_angles")
    ),
    sourceType: v.union(
      v.literal("video_beta"),
      v.literal("manual_beta"),
      v.literal("staff_review")
    ),
    qualityScore: v.number(),
    kneeAngleBdcDeg: v.optional(v.number()),
    hipAngleTdcDeg: v.optional(v.number()),
    trunkAngleDeg: v.optional(v.number()),
    pelvicRockScore: v.optional(v.number()),
    elbowAngleDeg: v.optional(v.number()),
    kneeTrackingScore: v.optional(v.number()),
    cadenceRpm: v.optional(v.number()),
    powerWatts: v.optional(v.number()),
    handPositionMode: v.optional(
      v.union(
        v.literal("tops"),
        v.literal("hoods"),
        v.literal("drops"),
        v.literal("flat_bar"),
        v.literal("aero_extensions")
      )
    ),
  },
  handler: async (ctx, args) => {
    if (!isDynamicValidationBetaEnabled()) {
      throw new Error("Dynamic validation beta is disabled");
    }

    const { userId, session } = await requireSessionOwner(ctx, args.sessionId);

    return await ctx.db.insert("validationCaptures", {
      sessionId: args.sessionId,
      userId,
      bikeId: session.bikeId,
      bikeProfileId: session.bikeProfileId,
      captureType: args.captureType,
      sourceType: args.sourceType,
      status: "active",
      qualityScore: args.qualityScore,
      kneeAngleBdcDeg: args.kneeAngleBdcDeg,
      hipAngleTdcDeg: args.hipAngleTdcDeg,
      trunkAngleDeg: args.trunkAngleDeg,
      pelvicRockScore: args.pelvicRockScore,
      elbowAngleDeg: args.elbowAngleDeg,
      kneeTrackingScore: args.kneeTrackingScore,
      cadenceRpm: args.cadenceRpm,
      powerWatts: args.powerWatts,
      handPositionMode: args.handPositionMode,
      createdAt: Date.now(),
    });
  },
});
