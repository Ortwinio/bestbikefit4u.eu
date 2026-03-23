import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireUserId } from "../lib/authz";

const OPEN_FEATURE_STATUSES = new Set([
  "new",
  "triaged",
  "needs_info",
  "planned",
  "in_progress",
  "in_qa",
]);

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
    if (args.linkedBikeId) {
      const linkedBike = await ctx.db.get(args.linkedBikeId);
      if (!linkedBike || linkedBike.userId !== userId) {
        throw new Error("Invalid linked bike");
      }
    }

    if (args.linkedSessionId) {
      const linkedSession = await ctx.db.get(args.linkedSessionId);
      if (!linkedSession || linkedSession.userId !== userId) {
        throw new Error("Invalid linked session");
      }
    }

    const now = Date.now();
    const feedbackItemId = await ctx.db.insert("feedback_items", {
      ...args,
      userId,
      status: "new",
      priority: "normal",
      upvoteCount: args.type === "feature_request" ? 1 : undefined,
      requesterCount: args.type === "feature_request" ? 1 : undefined,
      createdAt: now,
      updatedAt: now,
    });

    if (args.type === "feature_request") {
      await ctx.db.insert("feedback_upvotes", {
        feedbackItemId,
        userId,
        createdAt: now,
      });
    }

    return feedbackItemId;
  },
});

export const upvoteFeedbackItem = mutation({
  args: {
    feedbackItemId: v.id("feedback_items"),
  },
  handler: async (ctx, { feedbackItemId }) => {
    const userId = await requireUserId(ctx);
    const feedbackItem = await ctx.db.get(feedbackItemId);
    if (!feedbackItem) {
      throw new Error("Feedback item not found");
    }
    if (feedbackItem.type !== "feature_request") {
      throw new Error("Only feature requests can be upvoted");
    }
    if (!OPEN_FEATURE_STATUSES.has(feedbackItem.status)) {
      throw new Error("This feature request can no longer be voted on");
    }

    const existingUpvote = await ctx.db
      .query("feedback_upvotes")
      .withIndex("by_user_and_feedback", (q) =>
        q.eq("userId", userId).eq("feedbackItemId", feedbackItemId)
      )
      .unique();

    if (existingUpvote) {
      await ctx.db.delete(existingUpvote._id);
    } else {
      await ctx.db.insert("feedback_upvotes", {
        feedbackItemId,
        userId,
        createdAt: Date.now(),
      });
    }

    const upvotes = await ctx.db
      .query("feedback_upvotes")
      .withIndex("by_feedback_item", (q) => q.eq("feedbackItemId", feedbackItemId))
      .collect();
    const upvoteCount = upvotes.length;
    const hasUpvoted = !existingUpvote;

    await ctx.db.patch(feedbackItemId, {
      upvoteCount,
      requesterCount: upvoteCount,
      updatedAt: Date.now(),
    });

    return {
      hasUpvoted,
      upvoteCount,
    };
  },
});
