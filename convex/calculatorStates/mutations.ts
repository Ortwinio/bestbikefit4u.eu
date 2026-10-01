import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireBikeOwner, requireUserId } from "../lib/authz";
import { calculatorState } from "./validators";
import { validCalculatorState } from "../../src/lib/calculators/accountState";

export const upsert = mutation({
  args: { bikeId: v.optional(v.id("bikes")), state: calculatorState },
  handler: async (ctx, { bikeId, state }) => {
    const userId = await requireUserId(ctx);
    if (bikeId) await requireBikeOwner(ctx, bikeId);
    if (!validCalculatorState(state)) throw new Error("INVALID_CALCULATOR_VALUES");
    const current = await ctx.db.query("calculatorStates")
      .withIndex("by_user_calculator_bike", (q) =>
        q.eq("userId", userId).eq("calculator", state.calculator).eq("bikeId", bikeId)).unique();
    const record = { userId, bikeId, calculator: state.calculator, state, updatedAt: Date.now() };
    if (current) { await ctx.db.patch(current._id, record); return current._id; }
    return await ctx.db.insert("calculatorStates", record);
  },
});
