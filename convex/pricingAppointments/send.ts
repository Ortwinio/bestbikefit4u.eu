"use node";

import { v } from "convex/values";
import { makeFunctionReference } from "convex/server";
import { internalAction } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import type { PaidProductId } from "../../shared/pricing/products";
import { deliverEmail } from "../emails/delivery";
import { renderFitterNotification } from "../emails/templates/fitterNotification";

type NotificationArgs = { notificationId: Id<"pricingAppointmentNotifications"> };
type Delivery = {
  recipient: string;
  riderName: string;
  riderEmail: string;
  productId: PaidProductId;
  paidAt: number;
  locale: "nl" | "en";
  idempotencyKey: string;
};

const claimNotification = makeFunctionReference<"mutation", NotificationArgs, Delivery | null>(
  "pricingAppointments/internal:claimFitterNotification",
);
const finishNotification = makeFunctionReference<"mutation", NotificationArgs & { sent: boolean }>(
  "pricingAppointments/internal:finishFitterNotification",
);

export const sendFitterNotification = internalAction({
  args: { notificationId: v.id("pricingAppointmentNotifications") },
  handler: async (ctx, args) => {
    if (!process.env.AUTH_RESEND_KEY) return { status: "not_configured" as const };
    const delivery = await ctx.runMutation(claimNotification, args);
    if (!delivery) return { status: "skipped" as const };
    let sent = false;
    try {
      const email = renderFitterNotification({
        riderName: delivery.riderName, riderEmail: delivery.riderEmail,
        productId: delivery.productId, paidAt: delivery.paidAt,
      }, delivery.locale);
      sent = Boolean(await deliverEmail(delivery.recipient, email, { idempotencyKey: delivery.idempotencyKey }));
    } catch {
      console.error("BILLING_ALERT", { code: "FITTER_NOTIFICATION_FAILED" });
    }
    await ctx.runMutation(finishNotification, { ...args, sent });
    return { status: sent ? "sent" as const : "failed" as const };
  },
});
