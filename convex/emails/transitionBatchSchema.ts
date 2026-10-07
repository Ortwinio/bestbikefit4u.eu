import { defineTable } from "convex/server";
import { v } from "convex/values";

export const transitionEmailKind = v.union(v.literal("transition_announcement"), v.literal("transition_reminder"));

export const billingTransitionRuns = defineTable({
  adminUserId: v.id("users"),
  kind: transitionEmailKind,
  launchAt: v.number(),
  dryRun: v.boolean(),
  dryRunId: v.optional(v.id("billingTransitionRuns")),
  appliedRunId: v.optional(v.id("billingTransitionRuns")),
  cursor: v.optional(v.string()),
  scanned: v.number(),
  eligible: v.number(),
  queued: v.number(),
  complete: v.boolean(),
  createdAt: v.number(),
  completedAt: v.optional(v.number()),
}).index("by_admin", ["adminUserId"]);
