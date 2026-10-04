import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { isPaidAccessEnforced } from "../../shared/pricing/flags";
import { getUserAccess } from "../pricing/access";

export function coreRecommendation(recommendation: Doc<"recommendations">): Doc<"recommendations"> {
  return {
    _id: recommendation._id,
    _creationTime: recommendation._creationTime,
    userId: recommendation.userId,
    sessionId: recommendation.sessionId,
    ...(recommendation.bikeId ? { bikeId: recommendation.bikeId } : {}),
    calculatedFit: recommendation.calculatedFit,
    confidenceScore: recommendation.confidenceScore,
    algorithmVersion: recommendation.algorithmVersion,
    createdAt: recommendation.createdAt,
    frameSizeRecommendations: recommendation.frameSizeRecommendations.map(({ size, fitScore, brand }) =>
      ({ size, fitScore, ...(brand ? { brand } : {}) })),
    fitNotes: [],
    adjustmentPriorities: [],
    recommendationItems: [],
  };
}

export async function hasFullReportAccess(ctx: QueryCtx, recommendation: Doc<"recommendations">) {
  if (!isPaidAccessEnforced() || recommendation.legacyFullAccess === true) return true;
  return (await getUserAccess(ctx, recommendation.userId, recommendation.bikeId)).fullReport;
}

export async function visibleRecommendation(ctx: QueryCtx, recommendation: Doc<"recommendations"> | null) {
  if (!recommendation || await hasFullReportAccess(ctx, recommendation)) return recommendation;
  return coreRecommendation(recommendation);
}

export async function reportAccess(ctx: QueryCtx, recommendation: Doc<"recommendations">) {
  const enforced = isPaidAccessEnforced();
  const fullReport = await hasFullReportAccess(ctx, recommendation);
  const reports = await ctx.db.query("recommendations")
    .withIndex("by_user", index => index.eq("userId", recommendation.userId)).collect();
  const latest = reports.sort((first, second) => second.createdAt - first.createdAt
    || second._creationTime - first._creationTime)[0];
  const isLatestReport = latest?.sessionId === recommendation.sessionId;
  return { enforced, fullReport, legacyFullAccess: recommendation.legacyFullAccess === true,
    isLatestReport, canDownloadPdf: fullReport || isLatestReport, canEmailReport: fullReport || isLatestReport };
}
