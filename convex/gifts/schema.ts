import { defineTable } from "convex/server";
import { v } from "convex/values";

export const giftTables = {
  pricingGifts: defineTable({
    giverId: v.id("users"),
    entitlementId: v.id("pricingEntitlements"),
    periodStartsAt: v.number(),
    periodExpiresAt: v.number(),
    recipientEmail: v.optional(v.string()),
    message: v.optional(v.string()),
    locale: v.union(v.literal("nl"), v.literal("en")),
    tokenHash: v.string(),
    requestKey: v.string(),
    status: v.union(v.literal("pending"), v.literal("redeemed"), v.literal("expired"), v.literal("cancelled")),
    createdAt: v.number(),
    expiresAt: v.number(),
    redeemedAt: v.optional(v.number()),
    emailSentAt: v.optional(v.number()),
    recipientId: v.optional(v.id("users")),
    bikeId: v.optional(v.id("bikes")),
  }).index("by_token_hash", ["tokenHash"])
    .index("by_giver", ["giverId"])
    .index("by_giver_request", ["giverId", "requestKey"])
    .index("by_entitlement_period", ["entitlementId", "periodStartsAt"])
    .index("by_status_expiry", ["status", "expiresAt"]),
};
