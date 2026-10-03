import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { getUserAccess } from "../pricing/access";
import { isPaidAccessEnforced } from "../../shared/pricing/flags";

export async function assertCanCreateBike(ctx: MutationCtx, userId: Id<"users">) {
  if (!isPaidAccessEnforced()) return;
  const access = await getUserAccess(ctx, userId);
  if (access.maxBikes === null) return;
  const bikes = await ctx.db.query("bikes")
    .withIndex("by_user", range => range.eq("userId", userId))
    .take(access.maxBikes);
  if (bikes.length >= access.maxBikes) throw new Error("BIKE_LIMIT_REACHED");
}

export async function bikeRefinementsAvailable(ctx: MutationCtx, userId: Id<"users">, bikeId?: Id<"bikes">) {
  return !isPaidAccessEnforced() || (await getUserAccess(ctx, userId, bikeId)).fullReport;
}
