import { v } from "convex/values";
import { query, internalQuery } from "../_generated/server";
import { requireUserId } from "../lib/authz";
import { GIFTS_PER_YEAR, giftConsumesCredit, giftPreview } from "../../shared/pricing/gifts";
import { findGift, giftSourceValid, hashGiftToken, paidAnnualPeriod } from "./helpers";

export const getOverview = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const period = await paidAnnualPeriod(ctx, userId, now);
    const gifts = await ctx.db.query("pricingGifts").withIndex("by_giver", (index) => index.eq("giverId", userId)).collect();
    const consumed = period ? gifts.filter((gift) => gift.entitlementId === period._id && gift.periodStartsAt === period.startsAt && giftConsumesCredit(gift, now)).length : 0;
    const visibleGifts = await Promise.all(gifts.sort((left, right) => right.createdAt - left.createdAt).slice(0, 50).map(async (gift) => {
      const status = gift.status !== "pending" ? gift.status : gift.expiresAt <= now ? "expired" as const
        : !await giftSourceValid(ctx, gift.entitlementId) ? "cancelled" as const
          : gift.emailSentAt !== undefined ? "sent" as const : "pending" as const;
      return { id: gift._id, status, createdAt: gift.createdAt, expiresAt: gift.expiresAt };
    }));
    return {
      eligible: !!period,
      availableCredits: period ? Math.max(0, GIFTS_PER_YEAR - consumed) : 0,
      periodExpiresAt: period?.expiresAt,
      gifts: visibleGifts,
    };
  },
});

export const preview = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const gift = await findGift(ctx, token);
    if (gift?.status === "pending" && !await giftSourceValid(ctx, gift.entitlementId)) return { status: "invalid" as const };
    return giftPreview(gift, Date.now());
  },
});

export const getGiftEmailContext = internalQuery({
  args: { giftId: v.id("pricingGifts"), token: v.string() },
  handler: async (ctx, { giftId, token }) => {
    const gift = await ctx.db.get(giftId);
    if (!gift || gift.status !== "pending" || gift.expiresAt <= Date.now() || gift.emailSentAt !== undefined
      || !gift.recipientEmail || gift.tokenHash !== await hashGiftToken(token)
      || !await giftSourceValid(ctx, gift.entitlementId)) return null;
    return { recipientEmail: gift.recipientEmail, message: gift.message, locale: gift.locale, expiresAt: gift.expiresAt };
  },
});
