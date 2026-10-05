import { sessionProfile } from "../sessions/profileSnapshot";
import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireUserId } from "../lib/authz";
import { getUserAccess } from "../pricing/access";
import { getReliabilityRange, type ReliabilityEvidence, type ReliabilityMetric } from "../../shared/reliability/calculators";
import { buildReliabilityEvidence, saddleState } from "./state";

export const getSaddleState = query({
  args: { bikeId: v.optional(v.id("bikes")) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const state = await saddleState(ctx, userId, args.bikeId);
    return { ...state, canUseKneeAngle: (await getUserAccess(ctx, userId, args.bikeId)).fullReport };
  },
});

export const getDashboardReliability = query({
  args: { sessionId: v.optional(v.id("fitSessions")) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const recommendations = await ctx.db.query("recommendations")
      .withIndex("by_user", range => range.eq("userId", userId)).collect();
    const recommendation = recommendations.filter(item => !args.sessionId || item.sessionId === args.sessionId)
      .sort((a, b) => b.createdAt - a.createdAt)[0];
    if (!recommendation) return null;
    const session = await ctx.db.get(recommendation.sessionId);
    if (!session || session.userId !== userId) return null;
    const state = await saddleState(ctx, userId, recommendation.bikeId);
    const profile = state.profile ? sessionProfile(state.profile, session, true) : null;
    const observations = session.profileObservationSnapshot ?? [];
    const evidence = buildReliabilityEvidence({ profile, observations, bike: state.bike,
      kneeAngle: state.latestKneeAngle, saddleHeightMm: recommendation.calculatedFit.saddleHeightMm });
    const fit = recommendation.calculatedFit;
    const definitions: Array<[string, ReliabilityMetric, number]> = [
      ["A", "saddleHeight", fit.saddleHeightMm], ["B", "saddleSetback", fit.saddleSetbackMm],
      ["C", "handlebarDrop", fit.handlebarDropMm], ["D", "reach", fit.handlebarReachMm],
    ];
    const access = await getUserAccess(ctx, userId, recommendation.bikeId);
    const visibleDefinitions = access.fullReport || recommendation.legacyFullAccess === true
      ? definitions : definitions.filter(([letter]) => letter === "A");
    const rows = visibleDefinitions.map(([letter, metric, value]) => ({ letter, metric, value,
      range: getReliabilityRange({ metric, value, level: "account", evidence }) }));
    const improvements = rows.flatMap(row => {
      if (!row.range || row.range.nextStepKey === "narrowest-online") return [];
      const nextEvidence: ReliabilityEvidence = { ...evidence };
      if (row.metric === "saddleHeight") {
        nextEvidence.inseamProvenance = { kind: "measured", method: "single_measurement",
          repeatCount: row.range.nextStepKey === "measure-inseam" ? 1 : 3, withinTolerance: true };
        if (row.range.nextStepKey === "measure-knee-angle") nextEvidence.kneeAngleDegrees = 30;
      } else if (row.metric === "saddleSetback") {
        if (evidence.femurAndFootMeasured) nextEvidence.kneeOverPedalMeasured = true;
        else nextEvidence.femurAndFootMeasured = true;
      }
      else if (row.metric === "handlebarDrop") {
        if (evidence.flexibilityAndCoreAssessed) nextEvidence.flexibilityAndCoreTested = true;
        else nextEvidence.flexibilityAndCoreAssessed = true;
      }
      else if (row.metric === "reach") {
        if (evidence.torsoAndArmMeasured && evidence.bikeGeometryKnown) nextEvidence.posturePhotoMeasured = true;
        else { nextEvidence.torsoAndArmMeasured = true; nextEvidence.bikeGeometryKnown = true; }
      }
      const next = getReliabilityRange({ metric: row.metric, value: row.value, evidence: nextEvidence });
      const reduction = row.range.halfWidth - (next?.halfWidth ?? row.range.halfWidth);
      return reduction > 0 ? [{ metric: row.metric, nextStepKey: row.range.nextStepKey,
        halfWidth: next!.halfWidth, reduction }] : [];
    });
    return { sessionId: session._id, rows, largestGain: improvements.sort((a, b) => b.reduction - a.reduction)[0] ?? null };
  },
});
