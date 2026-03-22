import { describe, expect, it } from "vitest";
import {
  billingPlanTone,
  billingSubscriptionTone,
  canManageBilling,
  formatBillingInterval,
  formatBillingMoney,
  formatBillingSubscriptionSubject,
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
});
