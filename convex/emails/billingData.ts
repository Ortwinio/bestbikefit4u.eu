import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { hasAnnouncementProof, sendBillingEmailReference } from "./billingQueue";
import { isStripeBillingEnabled } from "../../src/config/billing";
import { isAnnualProduct } from "../../shared/pricing/products";
import { RENEWAL_REMINDER_DAYS } from "./billingBatches";

const DAY = 24 * 60 * 60 * 1000;
const LEASE = 5 * 60 * 1000;
export const claim = internalMutation({
  args: { jobId: v.id("billingEmailJobs") },
  handler: async (ctx, { jobId }) => {
    const job = await ctx.db.get(jobId);
    const now = Date.now();
    if (!job || !["pending", "sending"].includes(job.status) || (job.leaseUntil ?? 0) > now) return null;
    if (!isStripeBillingEnabled() && !await hasAnnouncementProof(ctx, job)) return null;
    const stop = async (status: "cancelled" | "failed", failureCode: string) => {
      await ctx.db.patch(jobId, { status, failureCode, leaseUntil: undefined });
      return null;
    };
    if (job.attempts >= 6 || (job.firstAttemptAt !== undefined && now - job.firstAttemptAt >= 20 * 60 * 60 * 1000)) return stop("failed", "retry_limit");
    const user = await ctx.db.get(job.userId);
    if (!user?.email || user.isAnonymous || user.emailPreferences?.service === false) return stop("cancelled", "recipient_unavailable");
    if (job.deliveryPayload && job.deliveryPayload.recipient !== user.email) return stop("failed", "recipient_changed");
    const entitlement = job.entitlementId ? await ctx.db.get(job.entitlementId) : null;
    if (job.entitlementId && (!entitlement || entitlement.userId !== job.userId)) return stop("cancelled", "entitlement_unavailable");
    if (job.kind === "purchase" && entitlement?.productId !== "single" && entitlement?.productId !== "personal_fit_standalone") return stop("failed", "invalid_product");
    if (job.kind === "welcome" && (!entitlement || !isAnnualProduct(entitlement.productId))) return stop("failed", "invalid_product");
    const period = entitlement ? await ctx.db.query("stripeBillingPeriods").withIndex("by_grant_key", query => query.eq("grantKey", entitlement.grantKey)).first() : null;
    const link = period ? await ctx.db.query("stripeInvoicePaymentLinks").withIndex("by_invoice", query => query.eq("invoiceId", period.invoiceId)).first() : null;
    const paymentIntentId = entitlement?.paymentIntentId ?? period?.paymentIntentId ?? link?.paymentIntentId;
    const refund = paymentIntentId ? await ctx.db.query("stripePaymentRefunds").withIndex("by_payment_intent", query => query.eq("paymentIntentId", paymentIntentId)).first() : null;
    const offer = job.transitionOfferId ? await ctx.db.get(job.transitionOfferId) : await ctx.db.query("pricingTransitionOffers").withIndex("by_user", query => query.eq("userId", job.userId)).first();
    let waiting = false;
    let cancellationRefundCents: number | undefined;
    if (["purchase", "welcome", "renewal", "expired"].includes(job.kind) && (refund?.fullyRefunded || entitlement?.revokedReason === "refunded")) return stop("cancelled", "refunded");
    if (job.kind === "purchase" || job.kind === "welcome") {
      if (!entitlement || entitlement.status === "revoked") return stop("cancelled", "entitlement_unavailable");
      waiting = !paymentIntentId;
    }
    if (job.kind === "cancellation") {
      if (!entitlement?.cancelled) return stop("cancelled", "not_cancelled");
      if (entitlement.renewed) {
        if (!period || period.periodEnd <= period.periodStart) waiting = true;
        else {
          const expected = Math.floor(period.periodPriceCents * Math.max(0, period.periodEnd - entitlement.expiresAt) / (period.periodEnd - period.periodStart));
          if (expected > 0) {
            waiting = refund?.cancellationKey !== `refund:${period.subscriptionId}:${period.periodStart}` || refund.cancellationAmountRefunded !== expected;
            if (!waiting) cancellationRefundCents = expected;
          }
        }
      }
    }
    if (job.kind === "renewal" && (!entitlement?.subscriptionId || entitlement.status !== "active" || entitlement.cancelled || entitlement.startsAt > now || entitlement.expiresAt <= now || entitlement.expiresAt > now + RENEWAL_REMINDER_DAYS * DAY)) return stop("cancelled", "not_renewing");
    if (job.kind === "expired") {
      if (!entitlement || entitlement.status === "revoked" || entitlement.expiresAt <= 0 || entitlement.expiresAt > now || entitlement.productId === "personal_fit_standalone") return stop("cancelled", "not_expired");
      const current = await ctx.db.query("pricingEntitlements").withIndex("by_user", query => query.eq("userId", job.userId)).collect();
      if (current.some(access => access.status === "active" && access.startsAt <= now && access.expiresAt > now && access.productId !== "personal_fit_standalone" && (access.productId !== "single" || Boolean(entitlement.bikeId && access.bikeId === entitlement.bikeId)))) return stop("cancelled", "access_restored");
    }
    if (job.kind === "transition_announcement" && (!job.launchAt || job.launchAt <= now)) return stop("cancelled", "launch_passed");
    if (job.kind === "transition_reminder" && (!offer || offer.userId !== job.userId || offer.goLiveAt !== job.launchAt || offer.redeemedAt !== undefined || offer.redeemBy <= now || offer.redeemBy > now + 7 * DAY)) return stop("cancelled", "offer_unavailable");
    if (waiting) {
      await ctx.db.patch(jobId, { status: "pending", failureCode: "awaiting_payment_evidence", leaseUntil: undefined });
      return null;
    }
    const attempts = job.attempts + 1;
    await ctx.db.patch(jobId, { status: "sending", attempts, firstAttemptAt: job.firstAttemptAt ?? now, leaseUntil: now + LEASE });
    await ctx.scheduler.runAfter(LEASE + 1, sendBillingEmailReference, { jobId });
    const bike = entitlement?.bikeId ? await ctx.db.get(entitlement.bikeId) : null;
    return { job, user, entitlement, period, refund, offer, bikeName: bike?.name, attempts, cancellationRefundCents };
  },
});

export const freezePayload = internalMutation({
  args: { jobId: v.id("billingEmailJobs"), attempts: v.number(), payload: v.object({ recipient: v.string(), subject: v.string(), preheader: v.string(), html: v.string(), text: v.string() }) },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job || job.status !== "sending" || job.attempts !== args.attempts) return null;
    const user = await ctx.db.get(job.userId);
    const payload = job.deliveryPayload ?? args.payload;
    if (!user?.email || user.email !== payload.recipient || user.emailPreferences?.service === false) {
      await ctx.db.patch(job._id, { status: "cancelled", failureCode: "recipient_changed", leaseUntil: undefined });
      return null;
    }
    if (job.entitlementId && ["purchase", "welcome", "renewal", "expired"].includes(job.kind)) {
      const entitlement = await ctx.db.get(job.entitlementId);
      const period = entitlement ? await ctx.db.query("stripeBillingPeriods").withIndex("by_grant_key", query => query.eq("grantKey", entitlement.grantKey)).first() : null;
      const link = period ? await ctx.db.query("stripeInvoicePaymentLinks").withIndex("by_invoice", query => query.eq("invoiceId", period.invoiceId)).first() : null;
      const paymentIntentId = entitlement?.paymentIntentId ?? period?.paymentIntentId ?? link?.paymentIntentId;
      const refund = paymentIntentId ? await ctx.db.query("stripePaymentRefunds").withIndex("by_payment_intent", query => query.eq("paymentIntentId", paymentIntentId)).first() : null;
      if (!entitlement || entitlement.revokedReason === "refunded" || refund?.fullyRefunded) {
        await ctx.db.patch(job._id, { status: "cancelled", failureCode: "refunded", leaseUntil: undefined, deliveryPayload: undefined });
        return null;
      }
    }
    if (!job.deliveryPayload) await ctx.db.patch(job._id, { deliveryPayload: payload });
    return payload;
  },
});

export const finish = internalMutation({
  args: { jobId: v.id("billingEmailJobs"), attempts: v.number(), sent: v.boolean(), failureCode: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job || job.status !== "sending" || job.attempts !== args.attempts) return;
    if (args.sent) {
      await ctx.db.patch(job._id, { status: "sent", sentAt: Date.now(), leaseUntil: undefined, failureCode: undefined, deliveryPayload: undefined });
      return;
    }
    const terminal = job.attempts >= 6;
    const delay = Math.min(60 * 60 * 1000, 60 * 1000 * 2 ** job.attempts);
    await ctx.db.patch(job._id, { status: terminal ? "failed" : "pending", leaseUntil: terminal ? undefined : Date.now() + delay, failureCode: args.failureCode });
    if (!terminal) await ctx.scheduler.runAfter(delay + 1, sendBillingEmailReference, { jobId: job._id });
  },
});
