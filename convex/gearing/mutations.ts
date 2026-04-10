import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireBikeOwner, requireUserId } from "../lib/authz";

const DEFAULT_GEARING_ALGORITHM_VERSION = "gearing-v1";

const gearingBikeTypeValidator = v.union(
  v.literal("road"),
  v.literal("gravel"),
  v.literal("mountain"),
  v.literal("hybrid"),
  v.literal("tt_triathlon"),
  v.literal("cyclocross"),
  v.literal("touring"),
  v.literal("city")
);

const gearingLengthBandValidator = v.union(
  v.literal("short"),
  v.literal("medium"),
  v.literal("long"),
  v.literal("alpine")
);

const gearingSurfaceValidator = v.union(
  v.literal("road"),
  v.literal("gravel"),
  v.literal("mtb"),
  v.literal("commuter"),
  v.literal("indoor"),
  v.literal("mixed")
);

const gearingReadinessLabelValidator = v.union(
  v.literal("suitable"),
  v.literal("challenging"),
  v.literal("likely_overgeared")
);

const gearingSetupLabelValidator = v.union(
  v.literal("comfort-oriented climbing setup"),
  v.literal("balanced sportive setup"),
  v.literal("performance climbing setup"),
  v.literal("race gearing"),
  v.literal("undergeared on the flat but mountain-ready"),
  v.literal("overgeared for Alpine use"),
  v.literal("needs bailout gear")
);

const gearingConfidenceLevelValidator = v.union(
  v.literal("high"),
  v.literal("medium"),
  v.literal("low")
);

const gearingGearPairValidator = v.object({
  frontChainringTeeth: v.number(),
  rearCogTeeth: v.number(),
  ratio: v.number(),
  developmentM: v.number(),
  gearInches: v.number(),
  gainRatio: v.optional(v.number()),
  speedKmhAtCadence: v.optional(v.number()),
  cadenceRpmAtSpeed: v.optional(v.number()),
});

const gearingConfidenceValidator = v.object({
  score: v.number(),
  level: gearingConfidenceLevelValidator,
  mathScore: v.number(),
  suitabilityScore: v.number(),
  reasons: v.array(v.string()),
});

const gearingInputValidator = v.object({
  drivetrainType: v.union(v.literal("1x"), v.literal("2x")),
  chainrings: v.array(v.number()),
  cassetteTeeth: v.array(v.number()),
  wheelCircumferenceMm: v.number(),
  crankLengthMm: v.optional(v.number()),
  cadenceRpm: v.optional(v.number()),
  targetSpeedKmh: v.optional(v.number()),
  bikeType: v.optional(gearingBikeTypeValidator),
  surfaceType: v.optional(gearingSurfaceValidator),
  riderWeightKg: v.optional(v.number()),
  bikeWeightKg: v.optional(v.number()),
  ftpWatts: v.optional(v.number()),
  preferredCadenceRpm: v.optional(v.number()),
  comfortableCadenceMinRpm: v.optional(v.number()),
  comfortableCadenceMaxRpm: v.optional(v.number()),
  climbGradientPct: v.optional(v.number()),
  climbMaxGradientPct: v.optional(v.number()),
  climbLengthKm: v.optional(v.number()),
  climbLengthBand: v.optional(gearingLengthBandValidator),
  elevationGainM: v.optional(v.number()),
  eventType: v.optional(v.string()),
  rideIntent: v.optional(v.string()),
  preference: v.optional(v.string()),
  alpineFlag: v.optional(v.boolean()),
  rearDerailleurMaxCog: v.optional(v.number()),
});

const gearingMathValidator = v.object({
  drivetrainType: v.union(v.literal("1x"), v.literal("2x")),
  normalizedChainrings: v.array(v.number()),
  normalizedCassetteTeeth: v.array(v.number()),
  wheelCircumferenceMm: v.number(),
  wheelDiameterInches: v.number(),
  wheelRadiusMm: v.number(),
  gearPairs: v.array(gearingGearPairValidator),
  easiestGear: gearingGearPairValidator,
  hardestGear: gearingGearPairValidator,
  rangeRatio: v.number(),
  rangePercent: v.number(),
});

const gearingSuitabilityValidator = v.object({
  publicVerdict: gearingReadinessLabelValidator,
  setupLabel: gearingSetupLabelValidator,
  gearRangeScore: v.number(),
  climbSuitabilityScore: v.number(),
  eventReadinessScore: v.number(),
  requiredPowerWatts: v.optional(v.number()),
  sustainablePowerWatts: v.optional(v.number()),
  powerGapWatts: v.optional(v.number()),
  estimatedClimbDurationMinutes: v.optional(v.number()),
  preferredCadenceFeasible: v.optional(v.boolean()),
  cadenceNeededAtSustainablePowerRpm: v.optional(v.number()),
  assumptions: v.array(v.string()),
  warnings: v.array(v.string()),
  recommendationText: v.string(),
  confidence: gearingConfidenceValidator,
});

const gearingSessionArgs = {
  scenarioName: v.optional(v.string()),
  input: gearingInputValidator,
  math: gearingMathValidator,
  suitability: gearingSuitabilityValidator,
} as const;

export const createPublicGearingSession = mutation({
  args: gearingSessionArgs,
  handler: async (ctx, args) => {
    return await ctx.db.insert("gearingSessions", {
      userId: undefined,
      bikeId: undefined,
      sessionType: "public",
      algorithmVersion: DEFAULT_GEARING_ALGORITHM_VERSION,
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const createDashboardGearingSession = mutation({
  args: {
    bikeId: v.optional(v.id("bikes")),
    ...gearingSessionArgs,
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    if (args.bikeId) {
      await requireBikeOwner(ctx, args.bikeId);
    }

    return await ctx.db.insert("gearingSessions", {
      userId,
      bikeId: args.bikeId,
      sessionType: "dashboard",
      algorithmVersion: DEFAULT_GEARING_ALGORITHM_VERSION,
      scenarioName: args.scenarioName,
      input: args.input,
      math: args.math,
      suitability: args.suitability,
      createdAt: Date.now(),
    });
  },
});
