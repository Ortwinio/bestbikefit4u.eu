import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireBikeOwner, requireUserId } from "../lib/authz";
import { calculatorId } from "./validators";

export const get = query({
  args: { calculator: calculatorId, bikeId: v.optional(v.id("bikes")) },
  handler: async (ctx, { calculator, bikeId }) => {
    const userId = await requireUserId(ctx);
    if (bikeId) await requireBikeOwner(ctx, bikeId);
    return await ctx.db.query("calculatorStates")
      .withIndex("by_user_calculator_bike", (q) =>
        q.eq("userId", userId).eq("calculator", calculator).eq("bikeId", bikeId)).unique();
  },
});
