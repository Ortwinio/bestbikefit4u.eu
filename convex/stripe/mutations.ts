import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { stripeNotImplemented } from "../../shared/billing/stripeStub";

// Existing internal references stay callable, but cannot mutate billing or access.
export const processWebhookEvent = internalMutation({
  args: { payloadJson: v.string() },
  handler: async () => stripeNotImplemented(),
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
