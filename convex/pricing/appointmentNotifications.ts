import { v } from "convex/values";
import { internalQuery } from "../_generated/server";
import { prepareFitterNotification } from "../../shared/pricing/appointmentNotification";

export const prepare = internalQuery({
  args: { entitlementId: v.id("pricingEntitlements") },
  handler: async (ctx, { entitlementId }) => {
    const entitlement = await ctx.db.get(entitlementId);
    if (!entitlement) return { status: "not_eligible" as const };
    const user = await ctx.db.get(entitlement.userId);
    if (!user) return { status: "missing_contact" as const };
    return prepareFitterNotification({
      entitlement,
      entitlementId,
      rider: { name: user.displayName ?? user.name, email: user.email, locale: user.locale },
      recipient: process.env.FITTER_NOTIFICATION_EMAIL,
    });
  },
});
