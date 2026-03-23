import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { query } from "../_generated/server";
import { requireUserId } from "../lib/authz";

async function isMessageVisibleToUser(
  ctx: QueryCtx,
  {
    message,
    userId,
    locale,
    userTier,
    hasActiveStrava,
    hasCompletedFit,
  }: {
    message: Doc<"dashboard_messages">;
    userId: Id<"users">;
    locale: "en" | "nl";
    userTier: string;
    hasActiveStrava: boolean;
    hasCompletedFit: boolean;
  }
) {
  const targets = await ctx.db
    .query("message_targets")
    .withIndex("by_message", (q) => q.eq("messageId", message._id))
    .collect();

  if (targets.length === 0) {
    return false;
  }

  if (message.locale && message.locale !== "all" && message.locale !== locale) {
    return false;
  }

  return targets.some((target) => {
    switch (target.targetType) {
      case "all":
        return true;
      case "user":
        return target.targetValue === String(userId);
      case "plan":
        return target.targetValue === userTier;
      case "locale":
        return target.targetValue === "all" || target.targetValue === locale;
      case "strava_connected":
        return target.targetValue === String(hasActiveStrava);
      case "fit_completed":
        return target.targetValue === String(hasCompletedFit);
      default:
        return false;
    }
  });
}

export const getMyMessages = query({
  args: {
    locale: v.union(v.literal("en"), v.literal("nl")),
  },
  handler: async (ctx, { locale }) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const [messages, receipts, user, integration, fitSessions] = await Promise.all([
      ctx.db.query("dashboard_messages").collect(),
      ctx.db.query("message_receipts").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.get(userId),
      ctx.db
        .query("integrations")
        .withIndex("by_user_and_provider", (q) => q.eq("userId", userId).eq("provider", "strava"))
        .unique(),
      ctx.db.query("fitSessions").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
    ]);

    const receiptByMessageId = new Map(receipts.map((receipt) => [receipt.messageId, receipt]));
    const userTier = user?.tier ?? "free";
    const hasActiveStrava = integration?.accessStatus === "active";
    const hasCompletedFit = fitSessions.some((session) => session.status === "completed");

    const visibleFlags = await Promise.all(
      messages.map(async (message) => ({
        messageId: message._id,
        visible: await isMessageVisibleToUser(ctx, {
          message,
          userId,
          locale,
          userTier,
          hasActiveStrava,
          hasCompletedFit,
        }),
      }))
    );
    const visibleByMessageId = new Map(
      visibleFlags.map((entry) => [entry.messageId, entry.visible] as const)
    );

    return messages
      .filter((message) => message.status === "published")
      .filter((message) => !message.startsAt || message.startsAt <= now)
      .filter((message) => !message.expiresAt || message.expiresAt > now)
      .filter((message) => !message.pausedAt)
      .filter((message) => {
        const receipt = receiptByMessageId.get(message._id);
        if (receipt?.dismissedAt) return false;
        if (receipt?.acknowledgedAt) return false;
        return visibleByMessageId.get(message._id) === true;
      })
      .sort((a, b) => (b.publishedAt ?? b.createdAt) - (a.publishedAt ?? a.createdAt));
  },
});
