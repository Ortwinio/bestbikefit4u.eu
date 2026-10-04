import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { prepareFitterNotification } from "../../shared/pricing/appointmentNotification";

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
    if (existing) return { status: "pending_integration" as const, id: existing._id };
    const id = await ctx.db.insert("pricingAppointmentNotifications", {
      entitlementId, userId: entitlement.userId, recipient: plan.recipient,
      riderName: plan.rider.name, riderEmail: plan.rider.email, locale: plan.locale,
      status: "pending_integration", idempotencyKey: plan.idempotencyKey, createdAt: Date.now(),
    });
    return { status: "pending_integration" as const, id };
  },
});
