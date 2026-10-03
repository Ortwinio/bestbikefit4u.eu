import { v } from "convex/values";

export const bikeFieldMeasurement = v.object({
  measuredAt: v.number(), measurePoint: v.optional(v.string()),
  source: v.union(v.literal("profile_edit"), v.literal("geometry_database")),
  kind: v.union(v.literal("measured"), v.literal("estimated"), v.literal("declared")),
});
