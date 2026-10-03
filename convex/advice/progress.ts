import { v } from "convex/values";
import { mutation, type MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { requireUserId } from "../lib/authz";
import { adviceFeedbackResult, adviceSourceValidator } from "./validators";
import { groupAdvice, type AdviceSources } from "./groupAdvice";
import type { AdviceSource } from "../../shared/advice/types";

const identity = { source: adviceSourceValidator, recordId: v.string(), key: v.string(),
  expectedRevision: v.number(), expectedUserId: v.optional(v.id("users")) };
type Identity = { source: AdviceSource; recordId: string; key: string; expectedRevision: number; expectedUserId?: Id<"users"> };
const day = (time: number) => Math.floor(time / 86400000) * 86400000;
function note(value: string | undefined) {
  if (value !== undefined && value.length > 500) throw new Error("INVALID_NOTE");
  return value?.trim() || undefined;
}

async function resolveAdvice(ctx: MutationCtx, args: Identity) {
  const userId = await requireUserId(ctx);
  if (args.expectedUserId && args.expectedUserId !== userId) throw new Error("AUTH_CHANGED");
  const id = ctx.db.normalizeId(args.source, args.recordId);
  const row = id ? await ctx.db.get(id) : null;
  if (!row || row.userId !== userId) throw new Error("ADVICE_NOT_FOUND");
  const bike = row.bikeId ? await ctx.db.get(row.bikeId) : null;
  if (row.bikeId && (!bike || bike.userId !== userId)) throw new Error("ADVICE_NOT_FOUND");
  if (args.source === "recommendations") {
    const session = await ctx.db.get((row as Doc<"recommendations">).sessionId);
    if (!session || session.userId !== userId || session.bikeId !== row.bikeId) throw new Error("ADVICE_NOT_FOUND");
  }
  if ((args.source === "saddleWidthSessions" || args.source === "gearingSessions")
    && (row as Doc<"saddleWidthSessions">).sessionType !== "dashboard") throw new Error("ADVICE_NOT_FOUND");
  if (!Number.isSafeInteger(args.expectedRevision) || args.expectedRevision < 0
    || args.expectedRevision !== (row.adviceRevision ?? 0)) throw new Error("ADVICE_CHANGED");
  const sources: AdviceSources = { bikes: bike ? [bike] : [], profile: null, observations: [],
    recommendations: args.source === "recommendations" ? [row as Doc<"recommendations">] : [],
    saddleWidth: args.source === "saddleWidthSessions" ? [row as Doc<"saddleWidthSessions">] : [],
    gearing: args.source === "gearingSessions" ? [row as Doc<"gearingSessions">] : [],
    pressure: args.source === "pressureCalculations" ? [row as Doc<"pressureCalculations">] : [],
    states: args.source === "calculatorStates" ? [row as Doc<"calculatorStates">] : [] };
  const item = groupAdvice(sources, Date.now()).flatMap(group => group.items).find(candidate => candidate.key === args.key);
  if (!item || item.value === null || item.status === "needs_calculation") throw new Error("ADVICE_NOT_FOUND");
  return { userId, row, item };
}

export const markPerformed = mutation({
  args: { ...identity, performedAt: v.number(), note: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { row, item } = await resolveAdvice(ctx, args);
    if (!Number.isFinite(args.performedAt) || args.performedAt !== day(args.performedAt)
      || args.performedAt < day(item.date) || args.performedAt > day(Date.now())) throw new Error("INVALID_DATE");
    const normalizedNote = note(args.note);
    const existing = row.adviceProgress?.find(entry => entry.key === args.key);
    if (existing?.performedAt === args.performedAt && existing.note === normalizedNote) {
      return { status: existing.feedback ? "performed" as const : "waiting_feedback" as const };
    }
    if (existing) throw new Error("ADVICE_ALREADY_PERFORMED");
    const progress = { key: args.key, performedAt: args.performedAt, ...(normalizedNote ? { note: normalizedNote } : {}) };
    await ctx.db.patch(row._id, { adviceProgress: [...(row.adviceProgress ?? []).filter(entry => entry.key !== args.key), progress] });
    return { status: "waiting_feedback" as const };
  },
});

export const submitFeedback = mutation({
  args: { ...identity, result: adviceFeedbackResult, note: v.optional(v.string()), rideFeedbackId: v.optional(v.id("rideFeedbackEntries")) },
  handler: async (ctx, args) => {
    const { userId, row } = await resolveAdvice(ctx, args);
    const existing = row.adviceProgress?.find(entry => entry.key === args.key);
    if (!existing) throw new Error("FEEDBACK_REQUIRES_PERFORMED");
    if (!["better", "same", "worse"].includes(args.result)) throw new Error("INVALID_FEEDBACK");
    if (args.rideFeedbackId) {
      const linked = await ctx.db.get(args.rideFeedbackId);
      if (args.source !== "recommendations" || !linked || linked.userId !== userId
        || linked.sessionId !== (row as Doc<"recommendations">).sessionId || linked.bikeId !== row.bikeId
        || linked.createdAt < existing.performedAt || linked.createdAt > Date.now()) throw new Error("INVALID_FEEDBACK");
    }
    const normalizedNote = note(args.note);
    if (existing.feedback) {
      if (existing.feedback.result === args.result && existing.feedback.note === normalizedNote
        && existing.feedback.rideFeedbackId === args.rideFeedbackId) return { status: "performed" as const };
      throw new Error("FEEDBACK_ALREADY_RECORDED");
    }
    const feedback = { result: args.result, recordedAt: Date.now(),
      ...(normalizedNote ? { note: normalizedNote } : {}), ...(args.rideFeedbackId ? { rideFeedbackId: args.rideFeedbackId } : {}) };
    await ctx.db.patch(row._id, { adviceProgress: row.adviceProgress!.map(entry =>
      entry.key === args.key ? { ...entry, feedback } : entry) });
    return { status: "performed" as const };
  },
});
