import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireUserId } from "../lib/authz";

export const submitFeedback = mutation({
  args: {
    type: v.union(
      v.literal("bug"),
      v.literal("feature_request"),
      v.literal("support_case")
    ),
    title: v.string(),
    description: v.string(),
    category: v.optional(v.string()),
    pagePath: v.optional(v.string()),
    linkedSessionId: v.optional(v.id("fitSessions")),
    linkedBikeId: v.optional(v.id("bikes")),
    expectedResult: v.optional(v.string()),
    actualResult: v.optional(v.string()),
    browserInfoJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return await ctx.db.insert("feedback_items", {
      ...args,
      userId,
      status: "new",
      priority: "normal",
      upvoteCount: args.type === "feature_request" ? 1 : undefined,
      requesterCount: args.type === "feature_request" ? 1 : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
