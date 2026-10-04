import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { isPaidAnnualGiftSource } from "../../shared/pricing/gifts";

export async function hashGiftToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function findGift(ctx: QueryCtx | MutationCtx, token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  const tokenHash = await hashGiftToken(token);
  return ctx.db.query("pricingGifts").withIndex("by_token_hash", (index) => index.eq("tokenHash", tokenHash)).unique();
}

export async function paidAnnualPeriod(ctx: QueryCtx | MutationCtx, userId: Id<"users">, now: number) {
  const entitlements = await ctx.db.query("pricingEntitlements").withIndex("by_user", (index) => index.eq("userId", userId)).collect();
  return entitlements.filter((entitlement) => isPaidAnnualGiftSource(entitlement, now))
    .sort((left, right) => right.startsAt - left.startsAt || right.expiresAt - left.expiresAt)[0] ?? null;
}

export async function giftSourceValid(ctx: QueryCtx | MutationCtx, entitlementId: Id<"pricingEntitlements">) {
  const entitlement = await ctx.db.get(entitlementId);
  return !!entitlement && entitlement.source === "purchase" && entitlement.status !== "revoked";
}
