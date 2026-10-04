"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { deliverEmail, emailActionUrl } from "./delivery";
import { renderGiftMeasurement } from "./templates/giftMeasurement";

export const sendGiftMeasurement = internalAction({
  args: { giftId: v.id("pricingGifts"), token: v.string() },
  handler: async (ctx, { giftId, token }) => {
    const gift = await ctx.runQuery(internal.gifts.queries.getGiftEmailContext, { giftId, token });
    if (!gift?.recipientEmail || gift.expiresAt <= Date.now()) return;
    const email = renderGiftMeasurement({
      message: gift.message,
      expiresAt: gift.expiresAt,
      actionUrl: emailActionUrl(gift.locale, `/gift#token=${encodeURIComponent(token)}`),
    }, gift.locale);
    const emailId = await deliverEmail(gift.recipientEmail, email, {
      idempotencyKey: `gift_measurement:${giftId}`,
    });
    if (emailId) await ctx.runMutation(internal.gifts.mutations.markGiftEmailSent, { giftId });
  },
});
