import { describe, expect, it } from "vitest";
import {
  billingPlanTone,
  billingSubscriptionTone,
  canManageBilling,
  formatBillingInterval,
  formatBillingMoney,
  formatBillingProviderKind,
  formatBillingSubscriptionSubject,
  getBillingEventStripeSummary,
  getBillingPlanStripePriceId,
  getStripeBillingSnapshot,
  type BillingSubscription,
  summarizeBillingEventPayload,
} from "./billing-live-data";

describe("billing-live-data", () => {
  it("formats plan money and intervals", () => {
    expect(formatBillingMoney(undefined)).toBe("Custom");
    expect(formatBillingMoney(1900)).toBe("€19");
    expect(formatBillingInterval("month")).toBe("/ month");
    expect(formatBillingInterval("custom")).toBe("/ custom");
  });

  it("maps billing status tones", () => {
    expect(billingPlanTone("enterprise")).toBe("warning");
    expect(billingPlanTone("free")).toBe("neutral");
    expect(billingSubscriptionTone("trialing")).toBe("info");
    expect(billingSubscriptionTone("canceled")).toBe("danger");
  });

  it("formats subscription subjects and payloads", () => {
    expect(
      formatBillingSubscriptionSubject({
        userId: "user_123" as BillingSubscription["userId"],
        organizationId: undefined,
      })
    ).toBe("User user_123");
    expect(
      formatBillingSubscriptionSubject({
        userId: undefined,
        organizationId: "org_456" as BillingSubscription["organizationId"],
      })
    ).toBe("Organization org_456");
    expect(summarizeBillingEventPayload("{\"reason\":\"upgrade\",\"planId\":\"plan_1\"}")).toContain(
      "reason: upgrade"
    );
  });

  it("recognizes billing management roles", () => {
    expect(canManageBilling("super_admin")).toBe(true);
    expect(canManageBilling("billing_admin")).toBe(true);
    expect(canManageBilling("analyst")).toBe(false);
  });

  it("extracts Stripe billing support fields with current-schema fallbacks", () => {
    const subscription = {
      provider: "stripe",
      externalId: "sub_123",
      stripeCustomerId: "cus_123",
      stripePriceId: "price_123",
      currentPeriodStart: 1735689600000,
      currentPeriodEnd: 1738368000000,
      cancelAtPeriodEnd: true,
      latestInvoiceId: "in_123",
    } as unknown as BillingSubscription;

    expect(getStripeBillingSnapshot(subscription)).toEqual({
      providerKind: "stripe",
      customerId: "cus_123",
      subscriptionId: "sub_123",
      priceId: "price_123",
      currentPeriodStart: 1735689600000,
      currentPeriodEnd: 1738368000000,
      cancelAtPeriodEnd: true,
      latestInvoiceId: "in_123",
    });
    expect(formatBillingProviderKind("stripe")).toBe("Stripe-backed");
  });

  it("labels current-schema subscriptions without Stripe fields as manual", () => {
    expect(
      getStripeBillingSnapshot({
        provider: undefined,
        externalId: undefined,
      } as unknown as BillingSubscription).providerKind
    ).toBe("manual");
    expect(formatBillingProviderKind("manual")).toBe("Manual");
  });

  it("extracts Stripe price IDs and event summaries when schema fields are present", () => {
    expect(getBillingPlanStripePriceId({ stripePriceId: "price_pro" } as never)).toBe("price_pro");
    expect(
      getBillingEventStripeSummary({
        payloadJson: JSON.stringify({
          stripeEventId: "evt_123",
          type: "invoice.payment_failed",
          invoiceId: "in_456",
        }),
      } as never)
    ).toBe("Stripe event evt_123 · type invoice.payment_failed · invoice in_456");
  });
});
