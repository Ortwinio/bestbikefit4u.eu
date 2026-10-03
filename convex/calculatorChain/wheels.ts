import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

/** Match the bike detail's active-or-first wheel/tire selection, with ownership checked at each level. */
export async function activeTires(ctx: Pick<QueryCtx, "db">, userId: Id<"users">, bikeId?: Id<"bikes">) {
  if (!bikeId) return { activeWheelset: null, activeTireSetup: null };
  const wheelsets = (await ctx.db.query("wheelsets").withIndex("by_bike", q => q.eq("bikeId", bikeId)).collect())
    .filter(item => item.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  const activeWheelset = wheelsets.find(item => item.isActive) ?? wheelsets[0] ?? null;
  if (!activeWheelset) return { activeWheelset: null, activeTireSetup: null };
  const setups = (await ctx.db.query("tireSetups")
    .withIndex("by_wheelset", q => q.eq("wheelsetId", activeWheelset._id)).collect())
    .filter(item => item.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  return { activeWheelset, activeTireSetup: setups.find(item => item.isActive) ?? setups[0] ?? null };
}
