import { describe, expect, it } from "vitest";
import { addCalendarMonths, giftConsumesCredit, giftPreview, isPaidAnnualGiftSource, normalizeGiftEmail } from "./gifts";
import type { PricingEntitlement } from "./access";

describe("gift policy", () => {
  it("uses calendar months clamped at month ends", () => {
    expect(addCalendarMonths(Date.UTC(2026, 0, 31, 12), 1)).toBe(Date.UTC(2026, 1, 28, 12));
    expect(addCalendarMonths(Date.UTC(2024, 0, 31), 1)).toBe(Date.UTC(2024, 1, 29));
  });
  it("releases expired reservations but never redeemed credits", () => {
    expect(giftConsumesCredit({ status: "pending", expiresAt: 100 }, 100)).toBe(false);
    expect(giftConsumesCredit({ status: "redeemed", expiresAt: 100 }, 100)).toBe(true);
  });
  it("requires active real paid annual access", () => {
    const entitlement = { source: "purchase", status: "active", productId: "annual", startsAt: 0, expiresAt: 100 } as const;
    expect(isPaidAnnualGiftSource(entitlement, 50)).toBe(true);
    const overrides: Partial<PricingEntitlement>[] = [
      { source: "transition" }, { source: "legacy_pro" }, { status: "revoked" },
      { productId: "single" }, { productId: "personal_fit_standalone" },
    ];
    for (const override of overrides) {
      expect(isPaidAnnualGiftSource({ ...entitlement, ...override }, 50)).toBe(false);
    }
    expect(isPaidAnnualGiftSource(entitlement, 100)).toBe(false);
  });
  it("normalizes historical paid entry rows through the catalog compatibility seam", () => {
    const entitlement = {
      source: "purchase", status: "active", productId: "annual_entry", startsAt: 0, expiresAt: 100,
    } as const;
    expect(isPaidAnnualGiftSource(entitlement, 50)).toBe(true);
    expect(isPaidAnnualGiftSource({ ...entitlement, source: "transition" }, 50)).toBe(false);
    expect(isPaidAnnualGiftSource({ ...entitlement, status: "revoked" }, 50)).toBe(false);
  });
  it("normalizes email and exposes anonymous preview states", () => {
    expect(normalizeGiftEmail(" Rider@Example.com ")).toBe("rider@example.com");
    expect(() => normalizeGiftEmail("bad\n@example.com")).toThrow();
    expect(giftPreview({ status: "pending", expiresAt: 100 }, 0)).toEqual({ status: "expiring", expiresAt: 100 });
    expect(giftPreview({ status: "pending", expiresAt: 100 }, 100)).toEqual({ status: "expired", expiresAt: 100 });
  });
});
