import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { mutation } from "../_generated/server";
import { requireUserId } from "../lib/authz";

async function getOrCreateReceipt(
  ctx: MutationCtx,
  messageId: Id<"dashboard_messages">,
  userId: Id<"users">
): Promise<Doc<"message_receipts"> | null> {
  const existing = await ctx.db
    .query("message_receipts")
    .withIndex("by_message_user", (q) => q.eq("messageId", messageId).eq("userId", userId))
    .unique();

  if (existing) {
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
