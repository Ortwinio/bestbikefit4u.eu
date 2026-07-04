import { describe, expect, it } from "vitest";
import {
  buildEntitlementPatch,
  mapStripePriceToPlanKey,
  mapStripeSubscriptionStatus,
  subscriptionStatusGrantsAccess,
} from "../mapping";

describe("stripe mapping helpers", () => {
  it("maps Stripe lifecycle statuses to app subscription statuses", () => {
    expect(mapStripeSubscriptionStatus("active")).toBe("active");
    expect(mapStripeSubscriptionStatus("trialing")).toBe("trialing");
    expect(mapStripeSubscriptionStatus("past_due")).toBe("past_due");
    expect(mapStripeSubscriptionStatus("incomplete")).toBe("past_due");
    expect(mapStripeSubscriptionStatus("unpaid")).toBe("expired");
    expect(mapStripeSubscriptionStatus("incomplete_expired")).toBe("expired");
    expect(mapStripeSubscriptionStatus("canceled")).toBe("canceled");
  });

  it("only grants access for active or trialing subscriptions", () => {
    expect(subscriptionStatusGrantsAccess("active")).toBe(true);
    expect(subscriptionStatusGrantsAccess("trialing")).toBe(true);
    expect(subscriptionStatusGrantsAccess("past_due")).toBe(false);
    expect(subscriptionStatusGrantsAccess("canceled")).toBe(false);
    expect(subscriptionStatusGrantsAccess("expired")).toBe(false);
  });

  it("maps configured Stripe price IDs to the app plan key", () => {
    expect(mapStripePriceToPlanKey("price_pro", "price_pro")).toBe("pro");
    expect(mapStripePriceToPlanKey("price_other", "price_pro")).toBeUndefined();
  });

  it("builds entitlement patches for grant and revoke transitions", () => {
    expect(
      buildEntitlementPatch({
        subscriptionStatus: "active",
        planTier: "pro",
        now: 123,
        stripeCustomerId: "cus_1",
        stripeSubscriptionId: "sub_1",
      })
    ).toEqual({
      tier: "pro",
      proSince: 123,
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: "sub_1",
    });

    expect(
      buildEntitlementPatch({
        subscriptionStatus: "canceled",
        planTier: "pro",
        existingProSince: 100,
        now: 123,
        stripeCustomerId: "cus_1",
        stripeSubscriptionId: "sub_1",
      })
    ).toEqual({
      tier: "free",
      proSince: 100,
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: undefined,
    });
  });
});

