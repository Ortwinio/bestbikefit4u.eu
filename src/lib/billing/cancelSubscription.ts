import { reportBillingAlert } from "./billingAlert";
import { getServerStripe } from "./serverStripe";
import { PRODUCTS } from "../../../shared/pricing/products";
import type Stripe from "stripe";

export interface SubscriptionContext {
  userId: string;
  customerId?: string;
  subscriptionId?: string;
  paymentIntentId?: string;
  invoiceId?: string;
  periodStart?: number;
  periodEnd?: number;
  periodPriceCents?: number;
  renewed?: boolean;
}

async function renewalPaymentIntent(stripe: Stripe, context: SubscriptionContext): Promise<string> {
  if (context.paymentIntentId) return context.paymentIntentId;
  if (!context.invoiceId) throw new Error("RENEWAL_PAYMENT_MISSING");
  const invoice = await stripe.invoices.retrieve(context.invoiceId);
  const invoiceCustomer = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  const parentSubscription = invoice.parent?.subscription_details?.subscription;
  const invoiceSubscription = typeof parentSubscription === "string" ? parentSubscription : parentSubscription?.id;
  const exactPeriod = invoice.lines.data.some(line => line.period.start * 1000 === context.periodStart
    && line.period.end * 1000 === context.periodEnd);
  if (invoiceCustomer !== context.customerId || invoiceSubscription !== context.subscriptionId
    || invoice.status !== "paid" || invoice.currency !== "eur" || !exactPeriod
    || invoice.amount_paid < (context.periodPriceCents ?? Infinity)) throw new Error("INVOICE_MISMATCH");
  const payments = await stripe.invoicePayments.list({ invoice: context.invoiceId, status: "paid", limit: 100 });
  const candidates = payments.data.filter(row => row.status === "paid" && row.currency === "eur"
    && (typeof row.invoice === "string" ? row.invoice : row.invoice.id) === context.invoiceId
    && (row.amount_paid ?? 0) >= (context.periodPriceCents ?? Infinity)
    && row.payment.type === "payment_intent" && row.payment.payment_intent);
  if (payments.has_more || candidates.length !== 1) throw new Error("RENEWAL_PAYMENT_REQUIRES_REVIEW");
  const payment = candidates[0].payment.payment_intent;
  if (!payment) throw new Error("RENEWAL_PAYMENT_MISSING");
  return typeof payment === "string" ? payment : payment.id;
}

/** Refunds apply only to the unused part of a paid renewal, never the initial year or appointment. */
export function renewalRefundCents(context: SubscriptionContext, now = Date.now()): number {
  const { periodStart, periodEnd, periodPriceCents } = context;
  if (!context.renewed || periodStart === undefined || periodEnd === undefined
    || periodPriceCents === undefined || periodPriceCents < 0 || periodPriceCents > PRODUCTS.annual.priceCents
    || !Number.isInteger(periodPriceCents) || periodEnd <= periodStart || now < periodStart) return 0;
  return Math.floor(periodPriceCents * Math.max(0, periodEnd - now) / (periodEnd - periodStart));
}

export async function cancelOwnedSubscription(context: SubscriptionContext, requireRefund = false) {
  try {
    return await cancelSubscription(context, requireRefund);
  } catch (error) {
    reportBillingAlert("BILLING_CANCELLATION_FAILED");
    throw error;
  }
}

async function cancelSubscription(context: SubscriptionContext, requireRefund: boolean) {
  if (!context.customerId || !context.subscriptionId) throw new Error("SUBSCRIPTION_NOT_FOUND");
  if (requireRefund && !context.renewed) throw new Error("REFUND_NOT_ELIGIBLE");
  const stripe = getServerStripe();
  const subscription = await stripe.subscriptions.retrieve(context.subscriptionId);
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  if (customerId !== context.customerId) throw new Error("SUBSCRIPTION_OWNER_MISMATCH");
  const key = `cancel:${context.subscriptionId}:${context.periodStart}`;
  if (!context.renewed) {
    await stripe.subscriptions.update(context.subscriptionId, { cancel_at_period_end: true }, { idempotencyKey: key });
    return { cancelled: true, endsAt: context.periodEnd, refundCents: 0 };
  }
  const paymentIntentId = await renewalPaymentIntent(stripe, context);
  const payment = await stripe.paymentIntents.retrieve(paymentIntentId);
  const paymentCustomer = typeof payment.customer === "string" ? payment.customer : payment.customer?.id;
  if (paymentCustomer !== context.customerId || payment.currency !== "eur" || payment.status !== "succeeded"
    || payment.amount_received < (context.periodPriceCents ?? Infinity)) throw new Error("PAYMENT_MISMATCH");
  // The provider's actual end timestamp is the immutable quote: public callers cannot reserve it early.
  const cancelled = subscription.status === "canceled" ? subscription
    : await stripe.subscriptions.cancel(context.subscriptionId, { prorate: false }, { idempotencyKey: key });
  const endedAt = cancelled.ended_at ?? cancelled.canceled_at;
  if (cancelled.status !== "canceled" || endedAt === null || !Number.isFinite(endedAt)) {
    throw new Error("CANCELLATION_NOT_CONFIRMED");
  }
  const endsAt = endedAt * 1000;
  const refundCents = renewalRefundCents(context, endsAt);
  if (refundCents > 0) {
    const refundKey = `refund:${context.subscriptionId}:${context.periodStart}`;
    // Provider idempotency caches expire. Signed refund metadata also makes later retries safe.
    const prior = await stripe.refunds.list({ payment_intent: paymentIntentId, limit: 100 });
    const matching = prior.data.find(refund => refund.metadata?.cancellationKey === refundKey
      && refund.status !== "failed" && refund.status !== "canceled");
    if (matching && matching.amount !== refundCents) throw new Error("REFUND_AMOUNT_MISMATCH");
    if (!matching) {
      if (prior.has_more) throw new Error("REFUND_HISTORY_REQUIRES_REVIEW");
      await stripe.refunds.create({
        payment_intent: paymentIntentId, amount: refundCents,
        metadata: { userId: context.userId, subscriptionId: context.subscriptionId, cancellationKey: refundKey },
      }, { idempotencyKey: refundKey });
    }
  }
  return { cancelled: true, endsAt, refundCents };
}
