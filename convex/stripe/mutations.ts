import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const upgradeToPro = internalMutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.userId);
    if (!existing) return;
    await ctx.db.patch(args.userId, {
      tier: "pro",
      proSince: existing.proSince ?? Date.now(),
      stripeCustomerId: args.stripeCustomerId ?? existing.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId ?? existing.stripeSubscriptionId,
    });
  },
});

export const downgradeToPro = internalMutation({
  args: {
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, { stripeCustomerId }) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("stripeCustomerId"), stripeCustomerId))
      .first();
    if (!user) return;
    await ctx.db.patch(user._id, {
      tier: "free",
      stripeSubscriptionId: undefined,
    });
  },
});
