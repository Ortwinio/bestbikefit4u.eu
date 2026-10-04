import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { PRODUCTS, type PaidProductId } from "../../shared/pricing/products";
import { grantPurchasedAccess } from "../pricing/grants";

type ObjectData = Record<string, unknown>;
const object = (value: unknown): ObjectData => value && typeof value === "object" ? value as ObjectData : {};
const string = (value: unknown): string | undefined => typeof value === "string" && value ? value : undefined;
const id = (value: unknown): string | undefined => string(value) ?? string(object(value).id);
const number = (value: unknown): number | undefined => typeof value === "number" && Number.isFinite(value) ? value : undefined;
const milliseconds = (value: unknown): number | undefined => {
  const seconds = number(value);
  return seconds !== undefined && seconds >= 0 ? seconds * 1000 : undefined;
};

function requirePrice(currency: unknown, amount: unknown, expected: number) {
  if (currency !== "eur" || amount !== expected) throw new Error("STRIPE_PRICE_MISMATCH");
}
function product(checkout: Doc<"stripeCheckouts">): PaidProductId {
  if (checkout.productId === "free" || !Object.hasOwn(PRODUCTS, checkout.productId)) throw new Error("INVALID_PRODUCT");
  return checkout.productId as PaidProductId;
}

async function resolveCheckout(ctx: MutationCtx, data: ObjectData, subscriptionId?: string) {
  const metadata = object(data.metadata);
  const rawReservationId = string(metadata.reservationId);
  const reservationId = rawReservationId ? ctx.db.normalizeId("stripeCheckouts", rawReservationId) : null;
  const checkout = reservationId ? await ctx.db.get(reservationId)
    : subscriptionId ? await ctx.db.query("stripeCheckouts")
      .withIndex("by_subscription", q => q.eq("subscriptionId", subscriptionId)).unique() : null;
  if (!checkout) {
    if (!rawReservationId && !metadata.userId && !metadata.productId) return null;
    throw new Error("CHECKOUT_RESERVATION_NOT_FOUND");
  }
  if (rawReservationId && (metadata.userId !== checkout.userId || metadata.productId !== checkout.productId
    || (checkout.bikeId && metadata.bikeId !== checkout.bikeId))) throw new Error("CHECKOUT_METADATA_MISMATCH");
  if (checkout.subscriptionId && subscriptionId && checkout.subscriptionId !== subscriptionId) {
    throw new Error("SUBSCRIPTION_MISMATCH");
  }
  const customerId = id(data.customer);
  const user = await ctx.db.get(checkout.userId);
  if (!user || !customerId || (checkout.customerId && checkout.customerId !== customerId)
    ) throw new Error("CUSTOMER_MISMATCH");
  const annualPriceId = string(metadata.annualPriceId) ?? checkout.annualPriceId;
  if (checkout.annualPriceId && annualPriceId !== checkout.annualPriceId) throw new Error("ANNUAL_PRICE_MISMATCH");
  await ctx.db.patch(checkout._id, { customerId, ...(subscriptionId ? { subscriptionId } : {}),
    ...(annualPriceId ? { annualPriceId } : {}) });
  if (!user.stripeCustomerId) await ctx.db.patch(checkout.userId, { stripeCustomerId: customerId });
  return { ...checkout, customerId, annualPriceId, subscriptionId: subscriptionId ?? checkout.subscriptionId };
}

async function fullyRefunded(ctx: MutationCtx, paymentIntentId?: string) {
  if (!paymentIntentId) return false;
  return Boolean((await ctx.db.query("stripePaymentRefunds")
    .withIndex("by_payment_intent", q => q.eq("paymentIntentId", paymentIntentId)).unique())?.fullyRefunded);
}

async function paid(ctx: MutationCtx, checkout: Doc<"stripeCheckouts">, args: {
  startsAt: number; periodEnd?: number; renewal?: boolean; paymentIntentId?: string; grantKey: string; invoiceId?: string;
}) {
  if (await fullyRefunded(ctx, args.paymentIntentId)) {
    const existing = await ctx.db.query("pricingEntitlements")
      .withIndex("by_grant_key", q => q.eq("grantKey", args.grantKey)).unique();
    if (existing && existing.userId === checkout.userId) await ctx.db.patch(existing._id, {
      paymentIntentId: args.paymentIntentId, status: "revoked", revokedReason: "refunded",
    });
    if (!args.renewal) await ctx.db.patch(checkout._id, { status: "refunded" });
    return;
  }
  const existingGrant = await ctx.db.query("pricingEntitlements")
    .withIndex("by_grant_key", q => q.eq("grantKey", args.grantKey)).unique();
  const entitlementId = await grantPurchasedAccess(ctx, {
    userId: checkout.userId, bikeId: checkout.bikeId, productId: product(checkout),
    ...args,
    // Cancellation can shorten the stored expiry. A later delivery must not try to restore the original end.
    ...(existingGrant?.cancelled && checkout.subscriptionEndedAt !== undefined ? { periodEnd: undefined } : {}),
    eligibilityAt: checkout.createdAt, customerId: checkout.customerId, subscriptionId: checkout.subscriptionId,
  });
  if (checkout.subscriptionId && checkout.customerId && args.periodEnd !== undefined && args.invoiceId) {
    const existingPeriod = await ctx.db.query("stripeBillingPeriods")
      .withIndex("by_grant_key", q => q.eq("grantKey", args.grantKey)).unique();
    if (!existingPeriod) await ctx.db.insert("stripeBillingPeriods", {
      userId: checkout.userId, entitlementId, grantKey: args.grantKey, invoiceId: args.invoiceId,
      subscriptionId: checkout.subscriptionId, customerId: checkout.customerId,
      paymentIntentId: args.paymentIntentId, periodStart: args.startsAt, periodEnd: args.periodEnd,
      periodPriceCents: args.renewal ? PRODUCTS.annual.priceCents : PRODUCTS[product(checkout)].priceCents,
      renewed: args.renewal ?? false,
    });
    else if (!existingPeriod.paymentIntentId && args.paymentIntentId) {
      await ctx.db.patch(existingPeriod._id, { paymentIntentId: args.paymentIntentId });
    }
  }
  if (checkout.subscriptionCancelled !== undefined || checkout.subscriptionEndedAt !== undefined) {
    const entitlement = await ctx.db.get(entitlementId);
    if (entitlement) await ctx.db.patch(entitlementId, {
      cancelled: checkout.subscriptionCancelled ?? false,
      ...(checkout.subscriptionEndedAt !== undefined ? {
        expiresAt: Math.min(entitlement.expiresAt, checkout.subscriptionEndedAt),
        ...(checkout.subscriptionEndedAt <= Date.now() ? { status: "expired" as const } : {}),
      } : {}),
    });
  }
  if (!args.renewal) await ctx.db.patch(checkout._id, { status: "paid", entitlementId,
    ...(args.paymentIntentId ? { paymentIntentId: args.paymentIntentId } : {}) });
}

async function processCheckout(ctx: MutationCtx, type: string, data: ObjectData, eventTime: number) {
  const subscriptionId = id(data.subscription);
  const checkout = await resolveCheckout(ctx, data, subscriptionId);
  if (!checkout) return;
  const sessionId = id(data);
  if (!sessionId || (checkout.sessionId && checkout.sessionId !== sessionId)) throw new Error("SESSION_MISMATCH");
  const productId = product(checkout);
  const recurring = PRODUCTS[productId].renewalPriceCents !== null;
  if (data.mode !== (recurring ? "subscription" : "payment")) throw new Error("CHECKOUT_MODE_MISMATCH");
  requirePrice(data.currency, data.amount_total, PRODUCTS[productId].priceCents);
  const paymentIntentId = id(data.payment_intent);
  await ctx.db.patch(checkout._id, { sessionId, amountTotalCents: PRODUCTS[productId].priceCents,
    lastEventAt: Math.max(eventTime, checkout.lastEventAt ?? 0),
    ...(paymentIntentId ? { paymentIntentId } : {}) });
  if (type === "checkout.session.expired" || type === "checkout.session.async_payment_failed") {
    if (checkout.status !== "paid" && checkout.status !== "refunded" && eventTime >= (checkout.lastEventAt ?? 0)) {
      await ctx.db.patch(checkout._id, { status: type.endsWith("expired") ? "expired" : "failed" });
    }
    return;
  }
  // Subscription access uses invoice.paid's actual billing period, never session defaults.
  if (recurring || data.payment_status !== "paid" || !paymentIntentId) return;
  await paid(ctx, checkout, { startsAt: milliseconds(data.created) ?? eventTime,
    paymentIntentId, grantKey: `stripe:payment:${paymentIntentId}` });
}

async function processInvoice(ctx: MutationCtx, type: string, data: ObjectData, eventTime: number) {
  const details = object(object(data.parent).subscription_details);
  const subscriptionId = id(details.subscription) ?? id(data.subscription);
  if (!subscriptionId) return; // An unrelated one-off invoice does not grant subscription access.
  const checkout = await resolveCheckout(ctx, { ...data, metadata: details.metadata ?? data.metadata }, subscriptionId);
  if (!checkout) return;
  if (type !== "invoice.paid") {
    if (checkout.status !== "paid" && checkout.status !== "refunded" && eventTime >= (checkout.lastEventAt ?? 0)) {
      await ctx.db.patch(checkout._id, { status: type === "invoice.payment_failed" ? "failed" : "pending",
        lastEventAt: eventTime });
    }
    return;
  }
  if (data.paid !== true || data.status !== "paid") return;
  const productId = product(checkout);
  if (PRODUCTS[productId].renewalPriceCents === null) throw new Error("NON_RECURRING_PRODUCT");
  const renewal = data.billing_reason === "subscription_cycle";
  if (!renewal && data.billing_reason !== "subscription_create") throw new Error("UNSUPPORTED_INVOICE_REASON");
  requirePrice(data.currency, data.amount_paid, renewal ? PRODUCTS.annual.priceCents : PRODUCTS[productId].priceCents);
  if (!renewal) await ctx.db.patch(checkout._id, { amountTotalCents: PRODUCTS[productId].priceCents });
  const annualPriceId = checkout.annualPriceId;
  if (!annualPriceId) throw new Error("ANNUAL_PRICE_NOT_CONFIGURED");
  const lines = object(data.lines).data;
  const annualLine = Array.isArray(lines) ? lines.map(object).find(line => {
    const parent = object(line.parent);
    return parent.type === "subscription_item_details" && object(parent.subscription_item_details).proration !== true
      && id(object(object(line.pricing).price_details).price) === annualPriceId;
  }) : undefined;
  const period = object(annualLine?.period);
  const startsAt = milliseconds(period.start);
  const periodEnd = milliseconds(period.end);
  if (startsAt === undefined || periodEnd === undefined || periodEnd <= startsAt) throw new Error("INVALID_BILLING_PERIOD");
  const payments = object(data.payments).data;
  const firstPayment = Array.isArray(payments) ? object(object(payments[0]).payment) : {};
  const invoiceId = id(data);
  if (!invoiceId) throw new Error("INVOICE_ID_MISSING");
  const link = await ctx.db.query("stripeInvoicePaymentLinks")
    .withIndex("by_invoice", q => q.eq("invoiceId", invoiceId)).unique();
  if (link) requirePrice(link.currency, link.amountPaid, number(data.amount_paid)!);
  const paymentIntentId = id(data.payment_intent) ?? id(firstPayment.payment_intent) ?? link?.paymentIntentId;
  if (link && paymentIntentId !== link.paymentIntentId) throw new Error("INVOICE_PAYMENT_MISMATCH");
  await paid(ctx, checkout, { startsAt, periodEnd, renewal, paymentIntentId, invoiceId,
    grantKey: `stripe:subscription:${subscriptionId}:${startsAt}` });
}

async function processSubscription(ctx: MutationCtx, type: string, data: ObjectData, eventTime: number) {
  const subscriptionId = id(data);
  if (!subscriptionId) throw new Error("SUBSCRIPTION_MISSING");
  const checkout = await resolveCheckout(ctx, data, subscriptionId);
  if (!checkout || eventTime < (checkout.subscriptionEventAt ?? 0)) return;
  // Subscription status is not payment evidence, including active/trialing/created.
  const cancelled = checkout.subscriptionEndedAt !== undefined || type === "customer.subscription.deleted"
    || data.cancel_at_period_end === true;
  const endedAt = type === "customer.subscription.deleted" ? milliseconds(data.ended_at) ?? eventTime
    : checkout.subscriptionEndedAt;
  await ctx.db.patch(checkout._id, { subscriptionEventAt: eventTime, subscriptionCancelled: cancelled,
    ...(endedAt !== undefined ? { subscriptionEndedAt: endedAt } : {}) });
  const entitlements = await ctx.db.query("pricingEntitlements")
    .withIndex("by_user", q => q.eq("userId", checkout.userId)).collect();
  for (const entitlement of entitlements) {
    if (entitlement.subscriptionId !== subscriptionId) continue;
    await ctx.db.patch(entitlement._id, { cancelled,
      ...(endedAt !== undefined ? { expiresAt: Math.min(entitlement.expiresAt, endedAt),
        ...(endedAt <= Date.now() ? { status: "expired" as const } : {}) } : {}) });
  }
}

async function processRefund(ctx: MutationCtx, data: ObjectData, eventTime: number) {
  const paymentIntentId = id(data.payment_intent);
  const amount = number(data.amount);
  const amountRefunded = number(data.amount_refunded);
  if (!paymentIntentId || amount === undefined || amountRefunded === undefined || amountRefunded <= 0) return;
  const full = data.refunded === true && amountRefunded >= amount;
  const previous = await ctx.db.query("stripePaymentRefunds")
    .withIndex("by_payment_intent", q => q.eq("paymentIntentId", paymentIntentId)).unique();
  if (previous) await ctx.db.patch(previous._id, {
    fullyRefunded: previous.fullyRefunded || full, amountRefunded: Math.max(previous.amountRefunded, amountRefunded),
    updatedAt: Math.max(previous.updatedAt, eventTime),
  });
  else await ctx.db.insert("stripePaymentRefunds", { paymentIntentId, fullyRefunded: full, amountRefunded, updatedAt: eventTime });
  if (!full) return; // A partial refund is not proof that all purchased access should be revoked.
  const customerId = id(data.customer);
  if (!customerId) return;
  const entitlements = await ctx.db.query("pricingEntitlements")
    .withIndex("by_payment_intent", q => q.eq("paymentIntentId", paymentIntentId)).collect();
  for (const entitlement of entitlements) {
    if (entitlement.paymentIntentId === paymentIntentId && entitlement.customerId === customerId) {
      await ctx.db.patch(entitlement._id, { status: "revoked", revokedReason: "refunded" });
    }
  }
  const checkout = await ctx.db.query("stripeCheckouts")
    .withIndex("by_payment_intent", q => q.eq("paymentIntentId", paymentIntentId)).unique();
  if (checkout) await ctx.db.patch(checkout._id, { status: "refunded" });
}

async function processInvoicePayment(ctx: MutationCtx, data: ObjectData) {
  if (data.status !== "paid" || object(data.payment).type !== "payment_intent") return;
  const invoiceId = id(data.invoice);
  const paymentIntentId = id(object(data.payment).payment_intent);
  const amountPaid = number(data.amount_paid);
  if (!invoiceId || !paymentIntentId || amountPaid === undefined || data.currency !== "eur") return;
  const existing = await ctx.db.query("stripeInvoicePaymentLinks")
    .withIndex("by_invoice", q => q.eq("invoiceId", invoiceId)).unique();
  if (existing && (existing.paymentIntentId !== paymentIntentId || existing.amountPaid !== amountPaid)) {
    throw new Error("INVOICE_PAYMENT_MISMATCH");
  }
  if (!existing) await ctx.db.insert("stripeInvoicePaymentLinks", { invoiceId, paymentIntentId, amountPaid, currency: "eur" });
  const period = await ctx.db.query("stripeBillingPeriods").withIndex("by_invoice", q => q.eq("invoiceId", invoiceId)).unique();
  if (!period) return; // Invoice may arrive later; the saved signed link will be checked when it does.
  requirePrice(data.currency, amountPaid, period.periodPriceCents);
  if (period.paymentIntentId && period.paymentIntentId !== paymentIntentId) throw new Error("INVOICE_PAYMENT_MISMATCH");
  await ctx.db.patch(period._id, { paymentIntentId });
  const refunded = await fullyRefunded(ctx, paymentIntentId);
  await ctx.db.patch(period.entitlementId, { paymentIntentId,
    ...(refunded ? { status: "revoked" as const, revokedReason: "refunded" as const } : {}) });
  if (!period.renewed) {
    const checkout = await ctx.db.query("stripeCheckouts")
      .withIndex("by_subscription", q => q.eq("subscriptionId", period.subscriptionId)).unique();
    if (checkout) await ctx.db.patch(checkout._id, { paymentIntentId,
      ...(refunded ? { status: "refunded" as const } : {}) });
  }
}

/** Called only by the internal mutation after signature verification. Atomic with event deduplication. */
export async function applyStripeEvent(ctx: MutationCtx, payloadJson: string) {
  const event = object(JSON.parse(payloadJson));
  const eventId = string(event.id);
  const eventType = string(event.type);
  const eventTime = milliseconds(event.created);
  if (!eventId || !eventType || eventTime === undefined) throw new Error("INVALID_STRIPE_EVENT");
  const existing = await ctx.db.query("stripe_events").withIndex("by_event_id", q => q.eq("stripeEventId", eventId)).unique();
  if (existing) return { duplicate: true };
  const data = object(object(event.data).object);
  if (["checkout.session.completed", "checkout.session.expired", "checkout.session.async_payment_succeeded",
    "checkout.session.async_payment_failed"].includes(eventType)) await processCheckout(ctx, eventType, data, eventTime);
  else if (["invoice.paid", "invoice.payment_failed", "invoice.payment_action_required"].includes(eventType)) {
    await processInvoice(ctx, eventType, data, eventTime);
  } else if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(eventType)) {
    await processSubscription(ctx, eventType, data, eventTime);
  } else if (eventType === "charge.refunded") await processRefund(ctx, data, eventTime);
  else if (eventType === "invoice_payment.paid") await processInvoicePayment(ctx, data);
  await ctx.db.insert("stripe_events", {
    stripeEventId: eventId, eventType, livemode: event.livemode === true, apiVersion: string(event.api_version),
    objectId: id(data), processedAt: Date.now(), payloadJson,
  });
  return { duplicate: false };
}
