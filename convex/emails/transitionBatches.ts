import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { requireAdminRole } from "../admin/authz";
import { isStripeBillingEnabled } from "../../src/config/billing";
import { queueBillingEmail } from "./billingQueue";
import { transitionEmailKind } from "./transitionBatchSchema";

export const TRANSITION_BATCH_SIZE = 25;
export const TRANSITION_DRY_RUN_MAX_AGE_MS = 86_400_000;
const REMINDER_WINDOW_MS = 7 * 86_400_000;

function summary(run: Doc<"billingTransitionRuns">) {
  return { runId: run._id, scanned: run.scanned, eligible: run.eligible, queued: run.queued, complete: run.complete };
}

export const begin = internalMutation({
  args: {
    kind: transitionEmailKind, launchAt: v.number(), dryRun: v.optional(v.boolean()),
    dryRunId: v.optional(v.id("billingTransitionRuns")),
  },
  handler: async (ctx, args) => {
    const adminUserId = await requireAdminRole(ctx, "billing_admin");
    const now = Date.now();
    if (!Number.isSafeInteger(args.launchAt) || args.launchAt <= 0) throw new Error("INVALID_LAUNCH_DATE");
    const dryRun = args.dryRun ?? true;
    if (!dryRun) {
      if (!isStripeBillingEnabled() && args.kind !== "transition_announcement") throw new Error("STRIPE_NOT_IMPLEMENTED");
      const evidence = args.dryRunId ? await ctx.db.get(args.dryRunId) : null;
      if (!evidence?.dryRun || !evidence.complete || evidence.adminUserId !== adminUserId
        || evidence.kind !== args.kind || evidence.launchAt !== args.launchAt || !evidence.completedAt
        || evidence.completedAt > now || now - evidence.completedAt > TRANSITION_DRY_RUN_MAX_AGE_MS
        || evidence.appliedRunId) throw new Error("COMPLETED_MATCHING_DRY_RUN_REQUIRED");
    }
    const runId = await ctx.db.insert("billingTransitionRuns", {
      adminUserId, kind: args.kind, launchAt: args.launchAt, dryRun, dryRunId: args.dryRunId,
      scanned: 0, eligible: 0, queued: 0, complete: false, createdAt: now,
    });
    if (!dryRun && args.dryRunId) await ctx.db.patch(args.dryRunId, { appliedRunId: runId });
    return { runId, scanned: 0, eligible: 0, queued: 0, complete: false };
  },
});

export const continueBatch = internalMutation({
  args: { runId: v.id("billingTransitionRuns") },
  handler: async (ctx, { runId }) => {
    const adminUserId = await requireAdminRole(ctx, "billing_admin");
    const run = await ctx.db.get(runId);
    if (!run || run.adminUserId !== adminUserId) throw new Error("TRANSITION_EMAIL_RUN_NOT_FOUND");
    if (run.complete) return summary(run);
    const now = Date.now();
    if (!run.dryRun) {
      if (!isStripeBillingEnabled() && run.kind !== "transition_announcement") throw new Error("STRIPE_NOT_IMPLEMENTED");
      if (now - run.createdAt > TRANSITION_DRY_RUN_MAX_AGE_MS) throw new Error("TRANSITION_EMAIL_RUN_STALE");
    }
    const page = await ctx.db.query("users").paginate({ cursor: run.cursor ?? null, numItems: TRANSITION_BATCH_SIZE });
    let eligible = run.eligible;
    let queued = run.queued;
    for (const user of page.page) {
      const report = await ctx.db.query("recommendations")
        .withIndex("by_user", (query) => query.eq("userId", user._id)).first();
      if (!report) continue;
      const offer = run.kind === "transition_reminder"
        ? await ctx.db.query("pricingTransitionOffers").withIndex("by_user", (query) => query.eq("userId", user._id)).unique()
        : null;
      if (run.kind === "transition_reminder" && (!offer || offer.goLiveAt !== run.launchAt
        || offer.redeemedAt !== undefined || offer.redeemBy <= now || offer.redeemBy > now + REMINDER_WINDOW_MS)) continue;
      eligible += 1;
      if (run.dryRun) continue;
      const result = await queueBillingEmail(ctx, {
        kind: run.kind, userId: user._id, launchAt: run.launchAt,
        transitionOfferId: offer?._id,
        transitionRunId: runId,
        sendKey: offer ? `transition_reminder:${offer._id}:${user._id}` : `transition_announcement:${run.launchAt}:${user._id}`,
      });
      if (result) queued += 1;
    }
    const changes = {
      scanned: run.scanned + page.page.length, eligible, queued, complete: page.isDone,
      cursor: page.isDone ? undefined : page.continueCursor,
      completedAt: page.isDone ? now : undefined,
    };
    await ctx.db.patch(runId, changes);
    return summary({ ...run, ...changes });
  },
});
