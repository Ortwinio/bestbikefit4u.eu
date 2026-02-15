import { mutation } from "../_generated/server";
import { v } from "convex/values";
import {
  requireEmailReportOwner,
  requireRecommendationOwner,
  requireSessionOwner,
  requireUserId,
} from "../lib/authz";

/**
 * Create an email report record
 */
export const createReport = mutation({
  args: {
    sessionId: v.id("fitSessions"),
    userId: v.id("users"),
    recommendationId: v.id("recommendations"),
    recipientEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    if (args.userId !== userId) {
      throw new Error("Not authorized");
    }

    await requireSessionOwner(ctx, args.sessionId);
    const { recommendation } = await requireRecommendationOwner(
      ctx,
      args.recommendationId
    );
    if (recommendation.sessionId !== args.sessionId) {
      throw new Error("Recommendation does not match session");
    }

    return await ctx.db.insert("emailReports", {
      sessionId: args.sessionId,
      userId,
      recommendationId: args.recommendationId,
      recipientEmail: args.recipientEmail,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

/**
 * Update email report status
 */
export const updateStatus = mutation({
  args: {
    reportId: v.id("emailReports"),
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("failed")
    ),
    resendEmailId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireEmailReportOwner(ctx, args.reportId);

    const updates: Record<string, unknown> = {
      status: args.status,
    };

    if (args.status === "sent") {
      updates.sentAt = Date.now();
    }

    if (args.resendEmailId) {
      updates.resendEmailId = args.resendEmailId;
    }

    if (args.errorMessage) {
      updates.errorMessage = args.errorMessage;
    }

    await ctx.db.patch(args.reportId, updates);
  },
});
