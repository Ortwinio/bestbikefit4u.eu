import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { mutation } from "../_generated/server";
import { requireUserId } from "../lib/authz";

async function getReceiptCandidates(
  ctx: MutationCtx,
  messageId: Id<"dashboard_messages">,
  userId: Id<"users">
) {
  return await ctx.db
    .query("message_receipts")
    .withIndex("by_message_user", (q) => q.eq("messageId", messageId).eq("userId", userId))
    .collect();
}

async function ensureMessageRecipient(
  ctx: MutationCtx,
  messageId: Id<"dashboard_messages">,
  userId: Id<"users">
) {
  const [message, targets, user, integration, fitSessions] = await Promise.all([
    ctx.db.get(messageId),
    ctx.db.query("message_targets").withIndex("by_message", (q) => q.eq("messageId", messageId)).collect(),
    ctx.db.get(userId),
    ctx.db
      .query("integrations")
      .withIndex("by_user_and_provider", (q) => q.eq("userId", userId).eq("provider", "strava"))
      .unique(),
    ctx.db.query("fitSessions").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
  ]);

  if (!message || message.status !== "published" || message.pausedAt) {
    throw new Error("Message not available");
  }

  const now = Date.now();
  if ((message.startsAt && message.startsAt > now) || (message.expiresAt && message.expiresAt <= now)) {
    throw new Error("Message not available");
  }

  const userTier = user?.tier ?? "free";
  const hasActiveStrava = integration?.accessStatus === "active";
  const hasCompletedFit = fitSessions.some((session) => session.status === "completed");

  const isTargeted = targets.some((target) => {
    switch (target.targetType) {
      case "all":
        return true;
      case "user":
        return target.targetValue === String(userId);
      case "plan":
        return target.targetValue === userTier;
      case "locale":
        return (
          target.targetValue === "all" ||
          message.locale === undefined ||
          target.targetValue === message.locale
        );
      case "strava_connected":
        return target.targetValue === String(hasActiveStrava);
      case "fit_completed":
        return target.targetValue === String(hasCompletedFit);
      default:
        return false;
    }
  });

  if (!isTargeted) {
    throw new Error("Message not available");
  }

  return message;
}

async function getOrCreateReceipt(
  ctx: MutationCtx,
  messageId: Id<"dashboard_messages">,
  userId: Id<"users">
): Promise<Doc<"message_receipts"> | null> {
  await ensureMessageRecipient(ctx, messageId, userId);
  const existingReceipts = await getReceiptCandidates(ctx, messageId, userId);
  const existing = [...existingReceipts].sort((a, b) => a.deliveredAt - b.deliveredAt)[0] ?? null;

  if (existing) {
    for (const duplicate of existingReceipts) {
      if (duplicate._id !== existing._id) {
        await ctx.db.delete(duplicate._id);
      }
    }
    return existing;
  }

  const receiptId = await ctx.db.insert("message_receipts", {
    messageId,
    userId,
    deliveredAt: Date.now(),
  });
  return await ctx.db.get(receiptId);
}

export const markMessageViewed = mutation({
  args: { messageId: v.id("dashboard_messages") },
  handler: async (ctx, { messageId }) => {
    const userId = await requireUserId(ctx);
    const receipt = await getOrCreateReceipt(ctx, messageId, userId);
    if (receipt && !receipt.viewedAt) {
      await ctx.db.patch(receipt._id, { viewedAt: Date.now() });
    }
  },
});

export const markMessageDismissed = mutation({
  args: { messageId: v.id("dashboard_messages") },
  handler: async (ctx, { messageId }) => {
    const userId = await requireUserId(ctx);
    const receipt = await getOrCreateReceipt(ctx, messageId, userId);
    if (receipt) {
      await ctx.db.patch(receipt._id, {
        viewedAt: receipt.viewedAt ?? Date.now(),
        dismissedAt: Date.now(),
      });
    }
  },
});

export const markMessageAcknowledged = mutation({
  args: { messageId: v.id("dashboard_messages") },
  handler: async (ctx, { messageId }) => {
    const userId = await requireUserId(ctx);
    const receipt = await getOrCreateReceipt(ctx, messageId, userId);
    if (receipt) {
      await ctx.db.patch(receipt._id, {
        viewedAt: receipt.viewedAt ?? Date.now(),
        acknowledgedAt: Date.now(),
      });
    }
  },
});

export const markMessageClicked = mutation({
  args: { messageId: v.id("dashboard_messages") },
  handler: async (ctx, { messageId }) => {
    const userId = await requireUserId(ctx);
    const receipt = await getOrCreateReceipt(ctx, messageId, userId);
    if (receipt) {
      await ctx.db.patch(receipt._id, {
        viewedAt: receipt.viewedAt ?? Date.now(),
        clickedAt: Date.now(),
      });
    }
  },
});
