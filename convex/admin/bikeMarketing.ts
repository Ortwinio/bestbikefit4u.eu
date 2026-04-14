import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireAdminRole } from "./authz";

export const setMarketingEligible = mutation({
  args: {
    bikeId: v.id("bikes"),
    eligible: v.boolean(),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAdminRole(ctx, [
      "super_admin",
      "ops_admin",
    ]);

    const bike = await ctx.db.get(args.bikeId);
    if (!bike) {
      throw new Error("Bike not found");
    }

    const now = Date.now();

    await ctx.db.patch(args.bikeId, {
      marketingEligible: args.eligible,
      marketingEligibleAt: args.eligible ? now : undefined,
      marketingEligibleBy: args.eligible ? adminId : undefined,
      updatedAt: now,
    });
  },
});
