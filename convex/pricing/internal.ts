import { v } from "convex/values";
import { makeFunctionReference } from "convex/server";
import { internalMutation } from "../_generated/server";
import { requireAdminRole } from "../admin/authz";
import { addCalendarMonths } from "../../shared/pricing/products";

export const expireEntitlements = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const rows = await ctx.db.query("pricingEntitlements")
      .withIndex("by_status_expiry", (query) => query.eq("status", "active").gt("expiresAt", 0).lte("expiresAt", now)).take(200);
    for (const row of rows) await ctx.db.patch(row._id, { status: "expired" });
    if (rows.length === 200) await ctx.scheduler.runAfter(0, makeFunctionReference<"mutation">("pricing/internal:expireEntitlements"), {});
    return { expired: rows.length, mayHaveMore: rows.length === 200 };
  },
});

export const beginTransition = internalMutation({
  args: {
    goLiveAt: v.number(), dryRun: v.optional(v.boolean()),
    dryRunId: v.optional(v.id("pricingTransitionRuns")),
  },
  handler: async (ctx, args) => {
    const adminUserId = await requireAdminRole(ctx, "billing_admin");
    if (!Number.isSafeInteger(args.goLiveAt) || args.goLiveAt <= 0) {
      throw new Error("INVALID_GO_LIVE_CUTOFF");
    }
    const dryRun = args.dryRun ?? true;
    if (!dryRun) {
      const evidence = args.dryRunId ? await ctx.db.get(args.dryRunId) : null;
      if (!evidence?.dryRun || evidence.phase !== "complete" || evidence.goLiveAt !== args.goLiveAt
        || evidence.adminUserId !== adminUserId) throw new Error("COMPLETED_DRY_RUN_REQUIRED");
    }
    return ctx.db.insert("pricingTransitionRuns", {
      adminUserId, goLiveAt: args.goLiveAt, dryRun, dryRunId: args.dryRunId,
      phase: "reports", reportCount: 0, offerCount: 0, legacyProCount: 0, createdAt: Date.now(),
    });
  },
});

export const continueTransition = internalMutation({
  args: { runId: v.id("pricingTransitionRuns") },
  handler: async (ctx, { runId }) => {
    const adminUserId = await requireAdminRole(ctx, "billing_admin");
    const run = await ctx.db.get(runId);
    if (!run || run.adminUserId !== adminUserId) throw new Error("TRANSITION_NOT_FOUND");
    if (run.phase === "complete") return run;
    const now = Date.now();
    const offersOnly = run.createdAt < run.goLiveAt;
    if (run.phase === "reports") {
      const page = await ctx.db.query("recommendations").paginate({ cursor: run.cursor ?? null, numItems: 50 });
      let reportCount = run.reportCount;
      for (const report of page.page) {
        if (report._creationTime >= run.goLiveAt || report.createdAt >= run.goLiveAt) continue;
        const owner = await ctx.db.get(report.userId);
        if (!owner || owner._creationTime >= run.goLiveAt) continue;
        reportCount += 1;
        if (!run.dryRun && !offersOnly && !report.legacyFullAccess) await ctx.db.patch(report._id, { legacyFullAccess: true });
      }
      await ctx.db.patch(runId, {
        reportCount, phase: page.isDone ? "users" : "reports", cursor: page.isDone ? undefined : page.continueCursor,
      });
    } else {
      const page = await ctx.db.query("users").paginate({ cursor: run.cursor ?? null, numItems: 25 });
      let offerCount = run.offerCount;
      let legacyProCount = run.legacyProCount;
      for (const user of page.page) {
        if (user._creationTime >= run.goLiveAt) continue;
        const report = await ctx.db.query("recommendations").withIndex("by_user", (query) => query.eq("userId", user._id))
          .filter((query) => query.and(query.lt(query.field("createdAt"), run.goLiveAt), query.lt(query.field("_creationTime"), run.goLiveAt))).first();
        if (report) {
          offerCount += 1;
          const existing = await ctx.db.query("pricingTransitionOffers").withIndex("by_user", (query) => query.eq("userId", user._id)).unique();
          if (!run.dryRun && !existing) await ctx.db.insert("pricingTransitionOffers", {
            userId: user._id, goLiveAt: run.goLiveAt, redeemBy: addCalendarMonths(run.goLiveAt, 2), createdAt: now,
          });
        }
        const subscriptions = await ctx.db.query("subscriptions").withIndex("by_user", (query) => query.eq("userId", user._id)).collect();
        for (const subscription of subscriptions) {
          if (subscription._creationTime >= run.goLiveAt || !["active", "canceled"].includes(subscription.status)
            || !subscription.currentPeriodEnd || subscription.currentPeriodEnd <= now) continue;
          const plan = await ctx.db.get(subscription.planId);
          if (!plan || (plan.tier !== "pro" && plan.tier !== "premium")) continue;
          legacyProCount += 1;
          const grantKey = `legacy:${subscription._id}`;
          const existing = await ctx.db.query("pricingEntitlements").withIndex("by_grant_key", (query) => query.eq("grantKey", grantKey)).unique();
          if (!run.dryRun && !offersOnly && !existing) await ctx.db.insert("pricingEntitlements", {
            userId: user._id, productId: "annual", status: "active", source: "legacy_pro", grantKey,
            startsAt: now, expiresAt: subscription.currentPeriodEnd, appointmentGranted: false,
            cancelled: subscription.cancelAtPeriodEnd === true || subscription.status === "canceled", createdAt: now,
          });
        }
      }
      await ctx.db.patch(runId, {
        offerCount, legacyProCount, phase: page.isDone ? "complete" : "users",
        cursor: page.isDone ? undefined : page.continueCursor, completedAt: page.isDone ? now : undefined,
      });
    }
    return ctx.db.get(runId);
  },
});
