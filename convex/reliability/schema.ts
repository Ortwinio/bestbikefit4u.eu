import { defineTable } from "convex/server";
import { v } from "convex/values";

export const saddlePreferences = {
  bikeType: v.optional(v.union(v.literal("road"), v.literal("gravel"), v.literal("mtb"), v.literal("city"))),
  goal: v.optional(v.union(v.literal("comfort"), v.literal("balanced"), v.literal("performance"), v.literal("aero"))),
  climbing: v.optional(v.union(v.literal("none"), v.literal("low"), v.literal("medium"), v.literal("high"))),
  currentSaddleHeightMm: v.optional(v.number()),
};
export const reliabilityTables = {
  reliabilitySaddlePreferences: defineTable({ userId: v.id("users"), bikeId: v.optional(v.id("bikes")),
    ...saddlePreferences, updatedAt: v.number(),
  }).index("by_user_bike", ["userId", "bikeId"]).index("by_user", ["userId"]).index("by_bike", ["bikeId"]),
  reliabilityInseamMeasurements: defineTable({
    userId: v.id("users"), valueCm: v.number(), method: v.string(), recordedAt: v.number(),
    requestId: v.string(), unresolvedWarning: v.boolean(), seriesId: v.string(),
    profileObservationId: v.optional(v.id("profileObservations")),
    summary: v.optional(v.object({ meanInseamCm: v.number(), repeatCount: v.number(),
      withinTolerance: v.boolean(), unresolvedWarning: v.boolean() })),
  }).index("by_user", ["userId"]).index("by_user_request", ["userId", "requestId"]),
  reliabilityKneeMeasurements: defineTable({
    userId: v.id("users"), bikeId: v.optional(v.id("bikes")), requestId: v.string(),
    angleDegrees: v.number(), currentSaddleHeightMm: v.number(), inseamCm: v.number(),
    provenance: v.object({ kind: v.union(v.literal("measured"), v.literal("declared"),
      v.literal("estimated"), v.literal("derived")), method: v.optional(v.string()), repeatCount: v.optional(v.number()),
      withinTolerance: v.optional(v.boolean()), unresolvedWarning: v.optional(v.boolean()) }),
    sigmaInseamMm: v.number(), inWindow: v.boolean(), stepMm: v.number(), targetSaddleHeightMm: v.number(),
    recordedAt: v.number(), evaluationAt: v.number(), evaluationSentAt: v.optional(v.number()),
  }).index("by_user", ["userId"]).index("by_user_request", ["userId", "requestId"])
    .index("by_bike", ["bikeId"]),
};
