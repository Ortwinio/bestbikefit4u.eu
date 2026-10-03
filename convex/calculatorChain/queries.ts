import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireBikeOwner, requireUserId } from "../lib/authz";
import { readProfileProvenance } from "../profiles/provenance";
import { planLegacyObservations } from "../../shared/profileObservationMigration";
import { equalProfileObservationValues } from "../../shared/profileObservationFields";
import { activeTires } from "./wheels";
import { valueAt } from "../advice/provenance";

export const getContext = query({
  args: { bikeId: v.optional(v.id("bikes")) },
  handler: async (ctx, { bikeId }) => {
    const userId = await requireUserId(ctx);
    if (bikeId) await requireBikeOwner(ctx, bikeId);
    const { profile, observations } = await readProfileProvenance(ctx, userId);
    const bikes = await ctx.db.query("bikes").withIndex("by_user", q => q.eq("userId", userId)).collect();
    const current = await ctx.db.query("profileObservations")
      .withIndex("by_user_field", q => q.eq("userId", userId)).collect();
    const wheels = await activeTires(ctx, userId, bikeId);
    const bikeObservations = bikes.flatMap(bike => {
      const matching = current.filter(item => item.bikeId === bike._id && item.status === "current"
        && equalProfileObservationValues(item.value, item.field.startsWith("tires.")
          ? bike._id === bikeId ? valueAt(wheels.activeTireSetup, item.field.slice(6)) : undefined
          : valueAt(bike, item.field)));
      const fallback = planLegacyObservations("bikes", bike).observations.filter(item =>
        !matching.some(stored => stored.field === item.field));
      return [...matching, ...fallback.map(item => ({ ...item, bikeId: bike._id,
        source: "legacy_migration" as const, status: "current" as const }))];
    });
    const [states, saddles, gearings, pressures, recommendations] = await Promise.all([
      ctx.db.query("calculatorStates").withIndex("by_user_updated", q => q.eq("userId", userId)).collect(),
      ctx.db.query("saddleWidthSessions").withIndex("by_user", q => q.eq("userId", userId)).collect(),
      ctx.db.query("gearingSessions").withIndex("by_user", q => q.eq("userId", userId)).collect(),
      ctx.db.query("pressureCalculations").withIndex("by_user", q => q.eq("userId", userId)).collect(),
      ctx.db.query("recommendations").withIndex("by_user", q => q.eq("userId", userId)).collect(),
    ]);
    const recentCalculators = [
      ...states.map(item => ({ calculator: item.calculator, updatedAt: item.updatedAt, bikeId: item.bikeId })),
      ...saddles.map(item => ({ calculator: "saddle-width", updatedAt: item.createdAt, bikeId: item.bikeId })),
      ...gearings.map(item => ({ calculator: "gearing", updatedAt: item.createdAt, bikeId: item.bikeId })),
      ...pressures.map(item => ({ calculator: "tire-pressure", updatedAt: item.createdAt, bikeId: item.bikeId })),
      ...recommendations.map(item => ({ calculator: "bike-fit", updatedAt: item.createdAt, bikeId: item.bikeId })),
    ].filter(item => !bikeId || !item.bikeId || item.bikeId === bikeId).sort((a, b) => b.updatedAt - a.updatedAt);
    return { profile, observations, bikes, bikeObservations, recentCalculators, ...wheels,
      // Conservative summary only; R9's persisted dependencies provide exact advice staleness separately.
      advice: recentCalculators.map(item => ({ ...item, stale: Math.max(profile?.updatedAt ?? 0,
        bikes.find(bike => bike._id === item.bikeId)?.updatedAt ?? 0) > item.updatedAt })),
    };
  },
});
