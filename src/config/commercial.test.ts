import { describe, expect, it } from "vitest";
import {
  COMMERCIAL_CURRENCY,
  FIT_PASS_PRODUCT,
  PRODUCT_LIVE_FLAGS,
  PUBLIC_PLANS,
  getCommercialFaqCopy,
  getSubscriptionTermsCopy,
  getSupportResponseItems,
  getVisiblePublicPlans,
} from "./commercial";

describe("commercial config", () => {
  it("uses EUR for every public plan", () => {
    expect(COMMERCIAL_CURRENCY).toBe("EUR");
    expect(PUBLIC_PLANS.every((plan) => plan.priceCentsMonthly >= 0)).toBe(true);
    expect(FIT_PASS_PRODUCT.currency).toBe("EUR");
    expect(FIT_PASS_PRODUCT.priceCents).toBeGreaterThan(0);
  });

  it("shows only supported public plans", () => {
    const visiblePlanIds = getVisiblePublicPlans().map((plan) => plan.id);
    expect(visiblePlanIds).toEqual(["free", "pro"]);
  });

  it("does not advertise unsupported premium capabilities publicly", () => {
    expect(PRODUCT_LIVE_FLAGS.premiumPlanPublic).toBe(false);
    expect(PRODUCT_LIVE_FLAGS.brandedPdf).toBe(false);
    expect(PRODUCT_LIVE_FLAGS.apiAccess).toBe(false);
    expect(PRODUCT_LIVE_FLAGS.clientManagement).toBe(false);
  });

  it("only allows PDF claims because the feature is live", () => {
    expect(PRODUCT_LIVE_FLAGS.pdfReport).toBe(true);
  });

  it("keeps support and commercial copy aligned with public plans", () => {
    expect(getCommercialFaqCopy("en").pricing).toContain("Free and Pro");
    expect(getCommercialFaqCopy("en").pricing).toContain("EUR");
    expect(getCommercialFaqCopy("en").pdfReport).toContain("live");
    expect(getCommercialFaqCopy("en").pdfReport).not.toContain("rolled out");
    expect(getCommercialFaqCopy("nl").pricing).toContain("Free en Pro");
    expect(getSupportResponseItems("en")).toEqual([
      "Free plan: usually within 3 business days",
      "Pro plan: usually within 1 business day",
    ]);
    expect(getSupportResponseItems("en").join(" ")).not.toContain("Premium");
    expect(getSubscriptionTermsCopy("en")).toContain("Free and Pro");
    expect(getSubscriptionTermsCopy("en")).toContain("EUR");
    expect(getSubscriptionTermsCopy("en")).not.toContain("Premium");
  });
});
