import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type DbCtx = QueryCtx | MutationCtx;

export async function requireUserId(ctx: DbCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}

export async function requireSessionOwner(
  ctx: DbCtx,
  sessionId: Id<"fitSessions">
) {
  const userId = await requireUserId(ctx);
  const session = await ctx.db.get(sessionId);
  if (!session || session.userId !== userId) {
    throw new Error("Session not found");
  }
  return { userId, session };
}

export async function requireBikeOwner(ctx: DbCtx, bikeId: Id<"bikes">) {
  const userId = await requireUserId(ctx);
  const bike = await ctx.db.get(bikeId);
  if (!bike || bike.userId !== userId) {
    throw new Error("Bike not found");
  }
  return { userId, bike };
}

export async function requireRecommendationOwner(
  ctx: DbCtx,
  recommendationId: Id<"recommendations">
) {
  const userId = await requireUserId(ctx);
  const recommendation = await ctx.db.get(recommendationId);
  if (!recommendation || recommendation.userId !== userId) {
    throw new Error("Recommendation not found");
  }
  return { userId, recommendation };
}

export async function requireEmailReportOwner(
  ctx: DbCtx,
  reportId: Id<"emailReports">
) {
  const userId = await requireUserId(ctx);
  const report = await ctx.db.get(reportId);
  if (!report || report.userId !== userId) {
    throw new Error("Email report not found");
  }
  return { userId, report };
}
