import { makeFunctionReference } from "convex/server";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { isStripeBillingEnabled } from "../../src/config/billing";

export async function hasAnnouncementProof(ctx: MutationCtx, args: { kind: string; launchAt?: number; transitionRunId?: Id<"billingTransitionRuns"> }) {
  if (args.kind !== "transition_announcement" || !args.transitionRunId) return false;
  const run = await ctx.db.get(args.transitionRunId);
  if (!run || run.dryRun || run.kind !== args.kind || run.launchAt !== args.launchAt || !run.dryRunId) return false;
  const proof = await ctx.db.get(run.dryRunId);
  return Boolean(proof?.dryRun && proof.complete && proof.completedAt && proof.adminUserId === run.adminUserId && proof.kind === run.kind && proof.launchAt === run.launchAt && proof.appliedRunId === run._id);
}

export type BillingEmailKind = "purchase" | "welcome" | "cancellation" | "renewal" | "expired" | "transition_announcement" | "transition_reminder";
export const sendBillingEmailReference = makeFunctionReference<"action", { jobId: Id<"billingEmailJobs"> }>("emails/billing:sendBillingEmail");

export async function queueBillingEmail(ctx: MutationCtx, args: {
  kind: BillingEmailKind;
  userId: Id<"users">;
  sendKey: string;
  entitlementId?: Id<"pricingEntitlements">;
  launchAt?: number;
  transitionOfferId?: Id<"pricingTransitionOffers">;
  transitionRunId?: Id<"billingTransitionRuns">;
}): Promise<boolean> {
  if (!isStripeBillingEnabled() && !await hasAnnouncementProof(ctx, args)) return false;
  const existing = await ctx.db.query("billingEmailJobs").withIndex("by_send_key", query => query.eq("sendKey", args.sendKey)).first();
  if (existing) return false;
  const jobId = await ctx.db.insert("billingEmailJobs", { ...args, status: "pending", attempts: 0, createdAt: Date.now() });
  await ctx.scheduler.runAfter(0, sendBillingEmailReference, { jobId });
  return true;
}

export async function wakeBillingEmailEvidence(ctx: MutationCtx, userId: Id<"users">) {
  const jobs = await ctx.db.query("billingEmailJobs").withIndex("by_user", query => query.eq("userId", userId)).collect();
  for (const job of jobs) {
    if (job.status !== "pending" || job.failureCode !== "awaiting_payment_evidence") continue;
    await ctx.db.patch(job._id, { leaseUntil: undefined, failureCode: undefined });
    await ctx.scheduler.runAfter(0, sendBillingEmailReference, { jobId: job._id });
  }
}
