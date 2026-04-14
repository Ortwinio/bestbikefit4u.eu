import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireBikeOwner, requireUserId } from "../lib/authz";
import { validateNumberRange, validateShortString } from "../lib/validation";

function validateSupportedWidthRecommendation(args: {
  measurementMethod: "measured" | "estimated";
  sitBoneWidthMm?: number;
  heightCm?: number;
  weightKg?: number;
  hipCircumferenceCm?: number;
  flexibilityScore?: number;
  coreStabilityScore?: number;
  ridingType: string;
  postureCategory: string;
  indoorOutdoor?: string;
  typicalRideLength?: string;
  currentSaddleWidthMm?: number;
  currentSaddleShape?: string;
  currentSaddleTilt?: string;
  currentSaddleSatisfaction?: string;
  recommendedWidthMm: number;
  widthRangeMinMm: number;
  widthRangeMaxMm: number;
  primaryWidthClass: string;
  saddleFamily: string;
  noseType: string;
  profileShape: string;
  confidenceScore: number;
  confidenceLevel: string;
  explanationKey: string;
}) {
  const ridingTypes = [
    "road_race",
    "endurance_road",
    "gravel",
    "mtb",
    "commuter_leisure",
    "tt_triathlon",
    "indoor_only",
  ];
  const postureCategories = ["aggressive", "balanced", "upright"];
  const confidenceLevels = ["high", "medium", "lower"];
  const indoorOutdoorModes = ["outdoor", "mixed", "indoor"];
  const rideLengths = ["short", "medium", "long", "ultra"];
  const currentShapes = ["unknown", "flat", "waved", "hammock", "short_nose"];
  const currentTilts = ["unknown", "neutral", "nose_down", "nose_up"];
  const currentSatisfaction = ["unsure", "too_narrow", "just_right", "too_wide"];

  validateShortString(args.ridingType, "ridingType");
  validateShortString(args.postureCategory, "postureCategory");
  validateShortString(args.primaryWidthClass, "primaryWidthClass");
  validateShortString(args.saddleFamily, "saddleFamily");
  validateShortString(args.noseType, "noseType");
  validateShortString(args.profileShape, "profileShape");
  validateShortString(args.confidenceLevel, "confidenceLevel");
  validateShortString(args.explanationKey, "explanationKey");

  if (!ridingTypes.includes(args.ridingType)) {
    throw new Error("ridingType is invalid");
  }
  if (!postureCategories.includes(args.postureCategory)) {
    throw new Error("postureCategory is invalid");
  }
  if (!confidenceLevels.includes(args.confidenceLevel)) {
    throw new Error("confidenceLevel is invalid");
  }
  if (args.indoorOutdoor && !indoorOutdoorModes.includes(args.indoorOutdoor)) {
    throw new Error("indoorOutdoor is invalid");
  }
  if (args.typicalRideLength && !rideLengths.includes(args.typicalRideLength)) {
    throw new Error("typicalRideLength is invalid");
  }
  if (args.currentSaddleShape && !currentShapes.includes(args.currentSaddleShape)) {
    throw new Error("currentSaddleShape is invalid");
  }
  if (args.currentSaddleTilt && !currentTilts.includes(args.currentSaddleTilt)) {
    throw new Error("currentSaddleTilt is invalid");
  }
  if (
    args.currentSaddleSatisfaction &&
    !currentSatisfaction.includes(args.currentSaddleSatisfaction)
  ) {
    throw new Error("currentSaddleSatisfaction is invalid");
  }

  validateNumberRange(args.recommendedWidthMm, "recommendedWidthMm", 70, 260);
  validateNumberRange(args.widthRangeMinMm, "widthRangeMinMm", 60, 255);
  validateNumberRange(args.widthRangeMaxMm, "widthRangeMaxMm", 65, 265);
  validateNumberRange(args.confidenceScore, "confidenceScore", 0, 100);

  if (args.widthRangeMinMm > args.widthRangeMaxMm) {
    throw new Error("widthRangeMinMm must be less than or equal to widthRangeMaxMm");
  }
  if (
    args.recommendedWidthMm < args.widthRangeMinMm ||
    args.recommendedWidthMm > args.widthRangeMaxMm
  ) {
    throw new Error("recommendedWidthMm must fall within widthRangeMinMm and widthRangeMaxMm");
  }

  if (args.measurementMethod === "measured") {
    if (args.sitBoneWidthMm === undefined) {
      throw new Error("Measured sessions require sitBoneWidthMm");
    }
    validateNumberRange(args.sitBoneWidthMm, "sitBoneWidthMm", 60, 200);
  } else {
    if (
      args.heightCm === undefined ||
      args.weightKg === undefined ||
      args.hipCircumferenceCm === undefined
    ) {
      throw new Error(
        "Estimated sessions require heightCm, weightKg, and hipCircumferenceCm"
      );
    }
    validateNumberRange(args.heightCm, "heightCm", 140, 220);
    validateNumberRange(args.weightKg, "weightKg", 40, 150);
    validateNumberRange(args.hipCircumferenceCm, "hipCircumferenceCm", 70, 160);
  }

  if (args.flexibilityScore !== undefined) {
    validateNumberRange(args.flexibilityScore, "flexibilityScore", 1, 5);
  }
  if (args.coreStabilityScore !== undefined) {
    validateNumberRange(args.coreStabilityScore, "coreStabilityScore", 1, 5);
  }
  if (args.currentSaddleWidthMm !== undefined) {
    validateNumberRange(args.currentSaddleWidthMm, "currentSaddleWidthMm", 120, 190);
  }
}

export const createPublicSaddleWidthSession = mutation({
  args: {
    measurementMethod: v.union(v.literal("measured"), v.literal("estimated")),
    sitBoneWidthMm: v.optional(v.number()),
    heightCm: v.optional(v.number()),
    weightKg: v.optional(v.number()),
    hipCircumferenceCm: v.optional(v.number()),
    ridingType: v.string(),
    postureCategory: v.string(),
    recommendedWidthMm: v.number(),
    widthRangeMinMm: v.number(),
    widthRangeMaxMm: v.number(),
    primaryWidthClass: v.string(),
    saddleFamily: v.string(),
    noseType: v.string(),
    profileShape: v.string(),
    cutoutRecommended: v.boolean(),
    paddingPreference: v.string(),
    confidenceScore: v.number(),
    confidenceLevel: v.string(),
    explanationKey: v.string(),
  },
  handler: async (ctx, args) => {
    validateSupportedWidthRecommendation(args);
    return await ctx.db.insert("saddleWidthSessions", {
      userId: undefined,
      bikeId: undefined,
      sessionType: "public",
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const createDashboardSaddleWidthSession = mutation({
  args: {
    bikeId: v.optional(v.id("bikes")),
    measurementMethod: v.union(v.literal("measured"), v.literal("estimated")),
    sitBoneWidthMm: v.optional(v.number()),
    heightCm: v.optional(v.number()),
    weightKg: v.optional(v.number()),
    hipCircumferenceCm: v.optional(v.number()),
    flexibilityScore: v.optional(v.number()),
    coreStabilityScore: v.optional(v.number()),
    ridingType: v.string(),
    postureCategory: v.string(),
    indoorOutdoor: v.optional(v.string()),
    typicalRideLength: v.optional(v.string()),
    currentSaddleWidthMm: v.optional(v.number()),
    currentSaddleShape: v.optional(v.string()),
    currentSaddleTilt: v.optional(v.string()),
    currentSaddleSatisfaction: v.optional(v.string()),
    symptoms: v.optional(v.array(v.string())),
    recommendedWidthMm: v.number(),
    widthRangeMinMm: v.number(),
    widthRangeMaxMm: v.number(),
    primaryWidthClass: v.string(),
    saddleFamily: v.string(),
    noseType: v.string(),
    profileShape: v.string(),
    cutoutRecommended: v.boolean(),
    paddingPreference: v.string(),
    confidenceScore: v.number(),
    confidenceLevel: v.string(),
    widthMatchScore: v.optional(v.number()),
    fitInteractionWarnings: v.optional(v.array(v.string())),
    explanationKey: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    if (args.bikeId) {
      await requireBikeOwner(ctx, args.bikeId);
    }
    validateSupportedWidthRecommendation(args);

    return await ctx.db.insert("saddleWidthSessions", {
      userId,
      sessionType: "dashboard",
      ...args,
      createdAt: Date.now(),
    });
  },
});
