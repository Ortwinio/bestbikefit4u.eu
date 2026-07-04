import { internalMutation, type MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import {
  buildEntitlementPatch,
  mapStripePriceToPlanKey,
  mapStripeSubscriptionStatus,
  subscriptionStatusGrantsAccess,
  type AppSubscriptionStatus,
} from "./mapping";

type StripeObject = Record<string, unknown> & {
  id?: string;
  metadata?: Record<string, string> | null;
};

type StripeEvent = {
  id?: string;
  type?: string;
  livemode?: boolean;
  api_version?: string;
  created?: number;
  data?: { object?: StripeObject };
};

type StripeSubscriptionObject = StripeObject & {
  customer?: string | { id?: string } | null;
  status?: string;
  items?: {
    data?: Array<{
      price?: {
        id?: string;
        product?: string | { id?: string } | null;
        lookup_key?: string | null;
      };
    }>;
  };
  current_period_start?: number;
  current_period_end?: number;
  cancel_at_period_end?: boolean;
  canceled_at?: number | null;
  latest_invoice?: string | { id?: string } | null;
};

type StripeCheckoutSessionObject = StripeObject & {
  customer?: string | { id?: string } | null;
  subscription?: string | { id?: string } | null;
  payment_status?: string;
  expires_at?: number;
};

type StripeInvoiceObject = StripeObject & {
  customer?: string | { id?: string } | null;
  subscription?: string | { id?: string } | null;
  status?: string;
  payment_intent?: string | { id?: string } | null;
  lines?: {
    data?: Array<{
      price?: {
        id?: string;
        product?: string | { id?: string } | null;
        lookup_key?: string | null;
      };
    }>;
  };
};

function unixSecondsToMs(value?: number | null) {
  return typeof value === "number" ? value * 1000 : undefined;
}

function getStripeId(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" ? id : undefined;
  }
  return undefined;
}

function getMetadataUserId(object: StripeObject): Id<"users"> | undefined {
  return object.metadata?.userId as Id<"users"> | undefined;
}

function getSubscriptionPrice(subscription: StripeSubscriptionObject) {
  const price = subscription.items?.data?.[0]?.price;
  return {
    stripePriceId: price?.id,
    stripeProductId: getStripeId(price?.product),
    stripeLookupKey: price?.lookup_key ?? undefined,
  };
}

function getInvoicePrice(invoice: StripeInvoiceObject) {
  const price = invoice.lines?.data?.[0]?.price;
  return {
    stripePriceId: price?.id,
    stripeProductId: getStripeId(price?.product),
    stripeLookupKey: price?.lookup_key ?? undefined,
  };
}

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return JSON.stringify({ unserializable: true });
  }
}

async function findUserForStripeState(
  ctx: MutationCtx,
  args: {
    userId?: Id<"users">;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  }
) {
  if (args.userId) {
    const user = await ctx.db.get(args.userId);
    if (user) return user;
  }

  if (args.stripeSubscriptionId) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();
    if (user) return user;
  }

  if (args.stripeCustomerId) {
    return await ctx.db
      .query("users")
      .withIndex("by_stripe_customer", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
      .first();
  }

  return null;
}

async function findPlanForStripePrice(
  ctx: MutationCtx,
  args: {
    stripePriceId?: string;
    stripeLookupKey?: string;
  }
) {
  if (args.stripePriceId) {
    const plan = await ctx.db
      .query("plans")
      .withIndex("by_stripe_price", (q) => q.eq("stripePriceId", args.stripePriceId))
      .first();
    if (plan) return plan;
  }

  if (args.stripeLookupKey) {
    const plan = await ctx.db
      .query("plans")
      .withIndex("by_stripe_lookup_key", (q) => q.eq("stripeLookupKey", args.stripeLookupKey))
      .first();
    if (plan) return plan;
  }

  const mappedKey = mapStripePriceToPlanKey(
    args.stripePriceId,
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID
  );
  if (mappedKey) {
    const plan = await ctx.db
      .query("plans")
      .withIndex("by_key", (q) => q.eq("key", mappedKey))
      .first();
    if (plan) return plan;
  }

  const plans = await ctx.db.query("plans").collect();
  return (
    plans.find((plan) => plan.isActive && plan.tier === "pro") ??
    plans.find((plan) => plan.tier === "pro") ??
    null
  );
}

async function updateUserEntitlement(
  ctx: MutationCtx,
  args: {
    user: Doc<"users">;
    plan: Doc<"plans">;
    appStatus: AppSubscriptionStatus;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    now: number;
  }
) {
  const previouslyGranted = args.user.tier === "pro" || args.user.tier === "premium";
  const grantsAccess = subscriptionStatusGrantsAccess(args.appStatus);
  const patch = buildEntitlementPatch({
    subscriptionStatus: args.appStatus,
    planTier: args.plan.tier,
    existingProSince: args.user.proSince,
    now: args.now,
    stripeCustomerId: args.stripeCustomerId ?? args.user.stripeCustomerId,
    stripeSubscriptionId: args.stripeSubscriptionId ?? args.user.stripeSubscriptionId,
  });

  await ctx.db.patch(args.user._id, patch);
  return !previouslyGranted && grantsAccess && patch.tier !== "free";
}

async function insertBillingEvent(
  ctx: MutationCtx,
  args: {
    subscriptionId?: Id<"subscriptions">;
    userId?: Id<"users">;
    eventType: string;
    payload: unknown;
    occurredAt: number;
    now: number;
  }
) {
  await ctx.db.insert("billing_events", {
    subscriptionId: args.subscriptionId,
    userId: args.userId,
    eventType: args.eventType,
    payloadJson: safeStringify(args.payload),
    occurredAt: args.occurredAt,
    createdAt: args.now,
  });
}

async function upsertSubscriptionFromStripe(
  ctx: MutationCtx,
  args: {
    subscription: StripeSubscriptionObject;
    eventType: string;
    occurredAt: number;
    now: number;
  }
) {
  const stripeSubscriptionId = args.subscription.id;
  if (!stripeSubscriptionId) return {};

  const stripeCustomerId = getStripeId(args.subscription.customer);
  const price = getSubscriptionPrice(args.subscription);
  const plan = await findPlanForStripePrice(ctx, price);
  const user = await findUserForStripeState(ctx, {
    userId: getMetadataUserId(args.subscription),
    stripeCustomerId,
    stripeSubscriptionId,
  });

  if (!plan) {
    await insertBillingEvent(ctx, {
      userId: user?._id,
      eventType: "stripe_subscription_unmapped_plan",
      payload: { eventType: args.eventType, stripeSubscriptionId, ...price },
      occurredAt: args.occurredAt,
      now: args.now,
    });
    return {};
  }

  const appStatus = mapStripeSubscriptionStatus(args.subscription.status);
  const existing = await ctx.db
    .query("subscriptions")
    .withIndex("by_external_id", (q) => q.eq("externalId", stripeSubscriptionId))
    .first();

  const latestInvoiceId = getStripeId(args.subscription.latest_invoice);
  const currentPeriodStart = unixSecondsToMs(args.subscription.current_period_start);
  const currentPeriodEnd = unixSecondsToMs(args.subscription.current_period_end);
  const canceledAt = unixSecondsToMs(args.subscription.canceled_at);
  const patch = {
    userId: user?._id,
    planId: plan._id,
    status: appStatus,
    provider: "stripe" as const,
    externalId: stripeSubscriptionId,
    stripeCustomerId,
    stripePriceId: price.stripePriceId,
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd: args.subscription.cancel_at_period_end ?? false,
    canceledAt,
    latestInvoiceId,
    startsAt: currentPeriodStart ?? existing?.startsAt ?? args.now,
    endsAt: currentPeriodEnd ?? canceledAt ?? existing?.endsAt,
    updatedAt: args.now,
  };

  const subscriptionId = existing
    ? existing._id
    : await ctx.db.insert("subscriptions", {
        ...patch,
        createdAt: args.now,
      });

  if (existing) {
    await ctx.db.patch(subscriptionId, patch);
  }

  await insertBillingEvent(ctx, {
    subscriptionId,
    userId: user?._id,
    eventType: args.eventType,
    payload: {
      stripeSubscriptionId,
      stripeCustomerId,
      appStatus,
      previousStatus: existing?.status,
      ...price,
    },
    occurredAt: args.occurredAt,
    now: args.now,
  });

  const shouldSendWelcome = user
    ? await updateUserEntitlement(ctx, {
        user,
        plan,
        appStatus,
        stripeCustomerId,
        stripeSubscriptionId,
        now: args.now,
      })
    : false;

  return { welcomeUserId: shouldSendWelcome ? user?._id : undefined };
}

async function handleCheckoutSession(
  ctx: MutationCtx,
  args: {
    session: StripeCheckoutSessionObject;
    eventType: string;
    occurredAt: number;
    now: number;
  }
) {
  const stripeSubscriptionId = getStripeId(args.session.subscription);
  const stripeCustomerId = getStripeId(args.session.customer);
  const user = await findUserForStripeState(ctx, {
    userId: getMetadataUserId(args.session),
    stripeCustomerId,
    stripeSubscriptionId,
  });

  if (user) {
    await ctx.db.patch(user._id, {
      stripeCustomerId: stripeCustomerId ?? user.stripeCustomerId,
      stripeSubscriptionId: stripeSubscriptionId ?? user.stripeSubscriptionId,
    });
  }

  await insertBillingEvent(ctx, {
    userId: user?._id,
    eventType: args.eventType,
    payload: {
      checkoutSessionId: args.session.id,
      stripeCustomerId,
      stripeSubscriptionId,
      paymentStatus: args.session.payment_status,
      expiresAt: unixSecondsToMs(args.session.expires_at),
    },
    occurredAt: args.occurredAt,
    now: args.now,
  });

  return {};
}

async function handleInvoice(
  ctx: MutationCtx,
  args: {
    invoice: StripeInvoiceObject;
    eventType: string;
    occurredAt: number;
    now: number;
  }
) {
  const stripeSubscriptionId = getStripeId(args.invoice.subscription);
  const stripeCustomerId = getStripeId(args.invoice.customer);
  const price = getInvoicePrice(args.invoice);
  const existing = stripeSubscriptionId
    ? await ctx.db
        .query("subscriptions")
        .withIndex("by_external_id", (q) => q.eq("externalId", stripeSubscriptionId))
        .first()
    : null;
  const user = await findUserForStripeState(ctx, {
    userId: getMetadataUserId(args.invoice),
    stripeCustomerId,
    stripeSubscriptionId,
  });
  const plan = existing ? await ctx.db.get(existing.planId) : await findPlanForStripePrice(ctx, price);
  const appStatus: AppSubscriptionStatus =
    args.eventType === "invoice.paid" ? "active" : "past_due";

  let subscriptionId = existing?._id;
  if (!subscriptionId && stripeSubscriptionId && plan) {
    subscriptionId = await ctx.db.insert("subscriptions", {
      userId: user?._id,
      planId: plan._id,
      status: appStatus,
      provider: "stripe",
      externalId: stripeSubscriptionId,
      stripeCustomerId,
      stripePriceId: price.stripePriceId,
      latestInvoiceId: args.invoice.id,
      lastPaymentStatus: args.invoice.status ?? args.eventType,
      startsAt: args.now,
      createdAt: args.now,
      updatedAt: args.now,
    });
  } else if (subscriptionId) {
    await ctx.db.patch(subscriptionId, {
      userId: user?._id ?? existing?.userId,
      status: appStatus,
      stripeCustomerId: stripeCustomerId ?? existing?.stripeCustomerId,
      stripePriceId: price.stripePriceId ?? existing?.stripePriceId,
      latestInvoiceId: args.invoice.id,
      lastPaymentStatus: args.invoice.status ?? args.eventType,
      updatedAt: args.now,
    });
  }

  await insertBillingEvent(ctx, {
    subscriptionId,
    userId: user?._id,
    eventType: args.eventType,
    payload: {
      invoiceId: args.invoice.id,
      stripeSubscriptionId,
      stripeCustomerId,
      appStatus,
      paymentIntentId: getStripeId(args.invoice.payment_intent),
      ...price,
    },
    occurredAt: args.occurredAt,
    now: args.now,
  });

  const shouldSendWelcome =
    user && plan
      ? await updateUserEntitlement(ctx, {
          user,
          plan,
          appStatus,
          stripeCustomerId,
          stripeSubscriptionId,
          now: args.now,
        })
      : false;

  return { welcomeUserId: shouldSendWelcome ? user?._id : undefined };
}

export const processWebhookEvent = internalMutation({
  args: {
    payloadJson: v.string(),
  },
  handler: async (ctx, { payloadJson }) => {
    const event = JSON.parse(payloadJson) as StripeEvent;
    if (!event.id || !event.type || !event.data?.object) {
      throw new Error("Invalid Stripe event payload");
    }
    const eventId = event.id;
    const eventType = event.type;

    const existingEvent = await ctx.db
      .query("stripe_events")
      .withIndex("by_event_id", (q) => q.eq("stripeEventId", eventId))
      .first();
    if (existingEvent) {
      return { status: "duplicate" as const };
    }

    const now = Date.now();
    const object = event.data.object;
    const occurredAt = unixSecondsToMs(event.created) ?? now;

    await ctx.db.insert("stripe_events", {
      stripeEventId: eventId,
      eventType,
      livemode: event.livemode ?? false,
      apiVersion: event.api_version,
      objectId: object.id,
      processedAt: now,
      payloadJson,
    });

    switch (eventType) {
      case "checkout.session.completed":
      case "checkout.session.expired":
        return {
          status: "processed" as const,
          ...(await handleCheckoutSession(ctx, {
            session: object as StripeCheckoutSessionObject,
            eventType,
            occurredAt,
            now,
          })),
        };
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        return {
          status: "processed" as const,
          ...(await upsertSubscriptionFromStripe(ctx, {
            subscription: object as StripeSubscriptionObject,
            eventType,
            occurredAt,
            now,
          })),
        };
      case "invoice.paid":
      case "invoice.payment_failed":
      case "invoice.payment_action_required":
        return {
          status: "processed" as const,
          ...(await handleInvoice(ctx, {
            invoice: object as StripeInvoiceObject,
            eventType,
            occurredAt,
            now,
          })),
        };
      case "charge.refunded":
        await insertBillingEvent(ctx, {
          eventType,
          payload: { chargeId: object.id },
          occurredAt,
          now,
        });
        return { status: "processed" as const };
      default:
        await insertBillingEvent(ctx, {
          eventType: "stripe_event_ignored",
          payload: { stripeEventId: eventId, stripeEventType: eventType, objectId: object.id },
          occurredAt,
          now,
        });
        return { status: "ignored" as const };
    }
  },
});

export const upgradeToPro = internalMutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.userId);
    if (!existing) return;
    await ctx.db.patch(args.userId, {
      tier: "pro",
      proSince: existing.proSince ?? Date.now(),
      stripeCustomerId: args.stripeCustomerId ?? existing.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId ?? existing.stripeSubscriptionId,
    });
  },
});

export const downgradeToPro = internalMutation({
  args: {
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, { stripeCustomerId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_stripe_customer", (q) => q.eq("stripeCustomerId", stripeCustomerId))
      .first();
    if (!user) return;
    await ctx.db.patch(user._id, {
      tier: "free",
      stripeSubscriptionId: undefined,
    });
  },
});
