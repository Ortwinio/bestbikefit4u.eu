import { v } from "convex/values";
import { makeFunctionReference } from "convex/server";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { prepareFitterNotification } from "../../shared/pricing/appointmentNotification";

const sendNotification = makeFunctionReference<"action", { notificationId: Id<"pricingAppointmentNotifications"> }>(
  "pricingAppointments/send:sendFitterNotification",
);

export const queueFitterNotification = internalMutation({
  args: { entitlementId: v.id("pricingEntitlements") },
  handler: async (ctx, { entitlementId }) => {
    const entitlement = await ctx.db.get(entitlementId);
    if (!entitlement) return { status: "not_eligible" as const };
    const user = await ctx.db.get(entitlement.userId);
    if (!user) return { status: "missing_contact" as const };
    const plan = prepareFitterNotification({
      entitlement, entitlementId,
      rider: { name: user.displayName ?? user.name, email: user.email, locale: user.locale },
      recipient: process.env.FITTER_NOTIFICATION_EMAIL,
    });
    if (plan.status !== "ready") return plan;
    const existing = await ctx.db.query("pricingAppointmentNotifications")
      .withIndex("by_entitlement", index => index.eq("entitlementId", entitlementId)).unique();
    if (existing) {
      if (existing.status !== "pending_integration") return { status: existing.status, id: existing._id };
      await ctx.db.patch(existing._id, { status: "pending" });
      await ctx.scheduler.runAfter(0, sendNotification, { notificationId: existing._id });
      return { status: "pending" as const, id: existing._id };
    }
    const id = await ctx.db.insert("pricingAppointmentNotifications", {
      entitlementId, userId: entitlement.userId, recipient: plan.recipient,
      riderName: plan.rider.name, riderEmail: plan.rider.email, locale: plan.locale,
      status: "pending", idempotencyKey: plan.idempotencyKey, createdAt: Date.now(),
    });
    await ctx.scheduler.runAfter(0, sendNotification, { notificationId: id });
    return { status: "pending" as const, id };
  },
});

export const claimFitterNotification = internalMutation({
  args: { notificationId: v.id("pricingAppointmentNotifications") },
  handler: async (ctx, { notificationId }) => {
    const notification = await ctx.db.get(notificationId);
    if (!notification || notification.status !== "pending") return null;
    const entitlement = await ctx.db.get(notification.entitlementId);
    const user = entitlement ? await ctx.db.get(entitlement.userId) : null;
    if (!entitlement || !user) {
      await ctx.db.patch(notificationId, { status: "cancelled" });
      return null;
    }
    const plan = prepareFitterNotification({
      entitlement, entitlementId: notification.entitlementId,
      rider: { name: user.displayName ?? user.name, email: user.email, locale: user.locale },
      recipient: process.env.FITTER_NOTIFICATION_EMAIL,
    });
    if (plan.status !== "ready") {
      await ctx.db.patch(notificationId, {
        status: plan.status === "not_eligible" ? "cancelled" : "failed",
      });
      return null;
    }
    await ctx.db.patch(notificationId, {
      status: "sending", attemptedAt: Date.now(), recipient: plan.recipient,
      riderName: plan.rider.name, riderEmail: plan.rider.email, locale: plan.locale,
    });
    return {
      recipient: plan.recipient, riderName: plan.rider.name, riderEmail: plan.rider.email,
      locale: plan.locale, productId: entitlement.productId, paidAt: entitlement.createdAt,
      idempotencyKey: notification.idempotencyKey,
    };
  },
});

export const finishFitterNotification = internalMutation({
  args: { notificationId: v.id("pricingAppointmentNotifications"), sent: v.boolean() },
  handler: async (ctx, { notificationId, sent }) => {
    const notification = await ctx.db.get(notificationId);
    if (!notification || notification.status !== "sending") return;
    await ctx.db.patch(notificationId, sent
      ? { status: "sent", sentAt: Date.now() }
      : { status: "failed" });
  },
});
