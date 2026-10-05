import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { isStripeBillingEnabled } from "../../src/config/billing";
import { applyStripeEvent } from "./events";
import { stripeNotImplemented } from "../../shared/billing/stripeStub";

// Public callers cannot invoke this mutation; the HTTP action verifies the signature first.
export const processWebhookEvent = internalMutation({
  args: { payloadJson: v.string() },
  handler: async (ctx, args) => isStripeBillingEnabled()
    ? applyStripeEvent(ctx, args.payloadJson) : stripeNotImplemented(),
});

export const upgradeToPro = internalMutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
  },
  handler: async () => stripeNotImplemented(),
});

export const downgradeToPro = internalMutation({
  args: { stripeCustomerId: v.string() },
  handler: async () => stripeNotImplemented(),
});
