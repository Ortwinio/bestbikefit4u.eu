import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "../_generated/server";
import {
  computeContextCompleteness,
  feedbackRouteFamilyValidator,
  inferRouteFamily,
  sanitizeJsonString,
  trimOptionalString,
  trimRequiredString,
} from "./shared";

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
      v.literal("support_case"),
      v.literal("review")
    ),
    title: v.string(),
    description: v.string(),
    category: v.optional(v.string()),
    pageUrl: v.optional(v.string()),
    pathname: v.optional(v.string()),
    queryString: v.optional(v.string()),
    locale: v.optional(v.union(v.literal("en"), v.literal("nl"))),
    routeFamily: v.optional(feedbackRouteFamilyValidator),
    activitySummary: v.optional(v.string()),
    activityTrailJson: v.optional(v.string()),
    pagePath: v.optional(v.string()),
    linkedSessionId: v.optional(v.id("fitSessions")),
    linkedBikeId: v.optional(v.id("bikes")),
    contactEmail: v.optional(v.string()),
    contactName: v.optional(v.string()),
    expectedResult: v.optional(v.string()),
    actualResult: v.optional(v.string()),
    browserInfoJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (args.linkedBikeId) {
      if (!userId) {
        throw new Error("Authentication required for linked bike");
      }
      const linkedBike = await ctx.db.get(args.linkedBikeId);
      if (!linkedBike || linkedBike.userId !== userId) {
        throw new Error("Invalid linked bike");
      }
    }

    if (args.linkedSessionId) {
      if (!userId) {
        throw new Error("Authentication required for linked session");
      }
      const linkedSession = await ctx.db.get(args.linkedSessionId);
      if (!linkedSession || linkedSession.userId !== userId) {
        throw new Error("Invalid linked session");
      }
    }

    const now = Date.now();
    const pagePath = trimOptionalString(args.pagePath, 512);
    const pathname = trimOptionalString(args.pathname, 512);
    const routeFamily = inferRouteFamily(pathname, pagePath, args.routeFamily);
    const activitySummary = trimOptionalString(args.activitySummary, 280);
    const activityTrailJson = sanitizeJsonString(args.activityTrailJson, 4000);
    const browserInfoJson = sanitizeJsonString(args.browserInfoJson, 4000);
    const pageUrl = trimOptionalString(args.pageUrl, 2048);
    const queryString = trimOptionalString(args.queryString, 1024);
    const description = trimRequiredString(args.description, 4000);
    const title = trimRequiredString(args.title, 160);
    const contactEmail = trimOptionalString(args.contactEmail, 320);
    const contactName = trimOptionalString(args.contactName, 160);
    const contextCompleteness = computeContextCompleteness({
      pageUrl,
      pathname,
      description,
      routeFamily,
      linkedSessionId: args.linkedSessionId,
      linkedBikeId: args.linkedBikeId,
      browserInfoJson,
      activitySummary,
      activityTrailJson,
      userId: userId ?? undefined,
      contactEmail,
      contactName,
    });
    const feedbackItemId = await ctx.db.insert("feedback_items", {
      type: args.type,
      title,
      description,
      category: trimOptionalString(args.category, 120),
      pageUrl,
      pathname,
      queryString,
      locale: args.locale,
      routeFamily,
      activitySummary,
      activityTrailJson,
      pagePath,
      linkedSessionId: args.linkedSessionId,
      linkedBikeId: args.linkedBikeId,
      contactEmail,
      contactName,
      expectedResult: trimOptionalString(args.expectedResult, 2000),
      actualResult: trimOptionalString(args.actualResult, 2000),
      browserInfoJson,
      userId: userId ?? undefined,
      contextCompleteness,
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
