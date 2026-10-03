import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireBikeOwner, requireUserId } from "../lib/authz";
import { groupAdvice } from "./groupAdvice";

export const listAdviceGroups = query({
  args: { bikeId: v.optional(v.id("bikes")) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    if (args.bikeId) await requireBikeOwner(ctx, args.bikeId);
    const [bikes, profile, observations, recommendations, saddleWidth, gearing, pressure, states, tireSetups, wheelsets, rideFeedback] = await Promise.all([
      ctx.db.query("bikes").withIndex("by_user", index => index.eq("userId", userId)).collect(),
      ctx.db.query("profiles").withIndex("by_user", index => index.eq("userId", userId)).first(),
      ctx.db.query("profileObservations").withIndex("by_user_field", index => index.eq("userId", userId)).collect(),
      ctx.db.query("recommendations").withIndex("by_user", index => index.eq("userId", userId)).collect(),
      ctx.db.query("saddleWidthSessions").withIndex("by_user", index => index.eq("userId", userId)).collect(),
      ctx.db.query("gearingSessions").withIndex("by_user", index => index.eq("userId", userId)).collect(),
      ctx.db.query("pressureCalculations").withIndex("by_user", index => index.eq("userId", userId)).collect(),
      ctx.db.query("calculatorStates").withIndex("by_user_updated", index => index.eq("userId", userId)).collect(),
      ctx.db.query("tireSetups").withIndex("by_user", index => index.eq("userId", userId)).collect(),
      ctx.db.query("wheelsets").withIndex("by_user", index => index.eq("userId", userId)).collect(),
      ctx.db.query("rideFeedbackEntries").withIndex("by_user", index => index.eq("userId", userId)).collect(),
    ]);
    const visible = <Row extends { bikeId?: string }>(rows: Row[]) => rows.filter(row =>
      (!args.bikeId || row.bikeId === args.bikeId) && (!row.bikeId || bikes.some(bike => bike._id === row.bikeId)));
    return groupAdvice({ bikes, profile, observations, tireSetups, wheelsets, rideFeedback, recommendations: visible(recommendations),
      saddleWidth: visible(saddleWidth.filter(row => row.sessionType === "dashboard")),
      gearing: visible(gearing.filter(row => row.sessionType === "dashboard")), pressure: visible(pressure), states: visible(states) }, Date.now());
  },
});
