import { ConvexError, v } from "convex/values";
import { mutation, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { requireUserId } from "../lib/authz";
import { grantGiftEntitlement } from "../pricing/gifts";
import { addCalendarMonths, GIFTS_PER_YEAR, MAX_GIFTS_PER_DAY, giftConsumesCredit, normalizeGiftEmail } from "../../shared/pricing/gifts";
import { findGift, giftSourceValid, hashGiftToken, paidAnnualPeriod } from "./helpers";

export const give = mutation({
  args: {
    recipientEmail: v.string(),
    message: v.optional(v.string()),
    locale: v.union(v.literal("nl"), v.literal("en")),
    requestKey: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(args.requestKey)) {
      throw new ConvexError({ code: "INVALID_REQUEST_KEY" });
    }
    const existing = await ctx.db.query("pricingGifts")
      .withIndex("by_giver_request", (index) => index.eq("giverId", userId).eq("requestKey", args.requestKey))
      .unique();
    if (existing) return { giftId: existing._id, expiresAt: existing.expiresAt };
    let recipientEmail: string;
    try {
      recipientEmail = normalizeGiftEmail(args.recipientEmail);
    } catch {
      throw new ConvexError({ code: "INVALID_RECIPIENT_EMAIL" });
    }
    const giver = await ctx.db.get(userId);
    if (!giver?.email || normalizeGiftEmail(giver.email) === recipientEmail) {
      throw new ConvexError({ code: "SELF_GIFT_NOT_ALLOWED" });
    }
    const message = args.message?.trim();
    if (message && message.length > 500) throw new ConvexError({ code: "GIFT_MESSAGE_TOO_LONG" });
    const now = Date.now();
    const period = await paidAnnualPeriod(ctx, userId, now);
    if (!period) throw new ConvexError({ code: "PAID_ANNUAL_REQUIRED" });
    const gifts = await ctx.db.query("pricingGifts")
      .withIndex("by_giver", (index) => index.eq("giverId", userId)).collect();
    if (gifts.filter((gift) => gift.createdAt > now - 86400000).length >= MAX_GIFTS_PER_DAY) {
      throw new ConvexError({ code: "GIFT_RATE_LIMIT" });
    }
    const consumed = gifts.filter((gift) => gift.entitlementId === period._id
      && gift.periodStartsAt === period.startsAt && giftConsumesCredit(gift, now)).length;
    if (consumed >= GIFTS_PER_YEAR) throw new ConvexError({ code: "NO_GIFT_CREDITS" });
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const expiresAt = addCalendarMonths(now, 1);
    const giftId = await ctx.db.insert("pricingGifts", {
      giverId: userId, entitlementId: period._id, periodStartsAt: period.startsAt, periodExpiresAt: period.expiresAt,
      recipientEmail, message: message || undefined, locale: args.locale, tokenHash: await hashGiftToken(token), requestKey: args.requestKey,
      status: "pending", createdAt: now, expiresAt,
    });
    await ctx.scheduler.runAfter(0, internal.emails.gifts.sendGiftMeasurement, { giftId, token });
    await ctx.scheduler.runAt(expiresAt, internal.gifts.mutations.expireGift, { giftId });
    return { giftId, expiresAt };
  },
});

export const redeem = mutation({
  args: { token: v.string(), bikeId: v.id("bikes") },
  handler: async (ctx, { token, bikeId }) => {
    const userId = await requireUserId(ctx);
    const user = await ctx.db.get(userId);
    const bike = await ctx.db.get(bikeId);
    if (!bike || bike.userId !== userId) throw new ConvexError({ code: "INVALID_BIKE" });
    if (!user?.email || typeof user.emailVerificationTime !== "number" || !Number.isFinite(user.emailVerificationTime)) {
      throw new ConvexError({ code: "VERIFIED_EMAIL_REQUIRED" });
    }
    const gift = await findGift(ctx, token);
    if (!gift) return { status: "invalid" as const };
    if (gift.status === "redeemed") {
      return { status: gift.recipientId === userId && gift.bikeId === bikeId ? "redeemed" as const : "invalid" as const };
    }
    if (gift.giverId === userId || gift.recipientEmail !== normalizeGiftEmail(user.email)) return { status: "invalid" as const };
    const now = Date.now();
    if (gift.status === "expired" || gift.expiresAt <= now) {
      await ctx.db.patch(gift._id, { status: "expired", recipientEmail: undefined, message: undefined });
      return { status: "expired" as const };
    }
    if (gift.status !== "pending" || !await giftSourceValid(ctx, gift.entitlementId)) {
      await ctx.db.patch(gift._id, { status: "cancelled", recipientEmail: undefined, message: undefined });
      return { status: "invalid" as const };
    }
    await grantGiftEntitlement(ctx, { userId, bikeId, giftId: gift._id, redeemedAt: now });
    await ctx.db.patch(gift._id, {
      status: "redeemed", recipientId: userId, bikeId, redeemedAt: now,
      recipientEmail: undefined, message: undefined,
    });
    return { status: "redeemed" as const };
  },
});

export const expire = internalMutation({
  args: {},
  handler: async (ctx) => {
    const expired = await ctx.db.query("pricingGifts")
      .withIndex("by_status_expiry", (index) => index.eq("status", "pending").lte("expiresAt", Date.now()))
      .take(100);
    for (const gift of expired) await ctx.db.patch(gift._id, { status: "expired", recipientEmail: undefined, message: undefined });
    if (expired.length === 100) await ctx.scheduler.runAfter(0, internal.gifts.mutations.expire, {});
    return expired.length;
  },
});

export const expireGift = internalMutation({
  args: { giftId: v.id("pricingGifts") },
  handler: async (ctx, { giftId }) => {
    const gift = await ctx.db.get(giftId);
    if (gift?.status === "pending" && gift.expiresAt <= Date.now()) {
      await ctx.db.patch(giftId, { status: "expired", recipientEmail: undefined, message: undefined });
    }
  },
});

export const markGiftEmailSent = internalMutation({
  args: { giftId: v.id("pricingGifts") },
  handler: async (ctx, { giftId }) => {
    const gift = await ctx.db.get(giftId);
    if (gift && gift.emailSentAt === undefined) await ctx.db.patch(giftId, { emailSentAt: Date.now() });
  },
});
