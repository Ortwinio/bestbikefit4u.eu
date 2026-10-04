import { afterEach, describe, expect, it, vi } from "vitest";
import { getAccess, type PricingEntitlement } from "./access";
import { isPaidAccessEnforced } from "./flags";
import { addCalendarMonths, PRODUCTS } from "./products";

const now = Date.UTC(2026, 9, 3);
const entry = (patch: Partial<PricingEntitlement> = {}): PricingEntitlement => ({
  productId: "single", bikeId: "bike-a", status: "active", startsAt: now - 1,
  expiresAt: now + 1, source: "purchase", appointmentGranted: false, ...patch,
});
const access = (entitlements: PricingEntitlement[], bikeId?: string) => getAccess({ entitlements }, bikeId, { now, enforced: true });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("pricing products and access", () => {
  it("preserves full access when enforcement is off", () => {
    expect(getAccess(null, undefined, { enforced: false })).toMatchObject({ fullProfile: true, fullReport: true, maxBikes: null, profileScoreCap: 100 });
  });
  it("defaults enforcement off and accepts literal true only", () => {
    for (const value of [undefined, "false", "1", "TRUE", ""]) {
      vi.stubEnv("PAID_ACCESS_ENFORCED", value);
      expect(isPaidAccessEnforced()).toBe(false);
    }
    vi.stubEnv("PAID_ACCESS_ENFORCED", "true");
    expect(isPaidAccessEnforced()).toBe(true);
  });
  it("free has core-only access, one bike and an 80-point cap", () => {
    expect(access([])).toMatchObject({ fullProfile: false, fullReport: false, maxBikes: 1, profileScoreCap: 80, productId: "free" });
  });
  it("uses only the explicit public flag in a browser", () => {
    vi.stubGlobal("window", {});
    vi.stubEnv("PAID_ACCESS_ENFORCED", "true");
    vi.stubEnv("NEXT_PUBLIC_PAID_ACCESS_ENFORCED", undefined);
    expect(isPaidAccessEnforced()).toBe(false);
    vi.stubEnv("NEXT_PUBLIC_PAID_ACCESS_ENFORCED", "true");
    expect(isPaidAccessEnforced()).toBe(true);
  });
  it("single opens profile and only the matching bike", () => {
    expect(access([entry()], "bike-a")).toMatchObject({ fullProfile: true, fullReport: true, profileScoreCap: 100, maxBikes: 1 });
    expect(access([entry()], "bike-b").fullReport).toBe(false);
    expect(access([entry()]).fullReport).toBe(false);
  });
  it.each(["annual", "annual_entry", "annual_personal"] as const)("%s covers all bikes", (productId) => {
    expect(access([entry({ productId })], "other")).toMatchObject({ fullReport: true, maxBikes: null });
  });
  it.each([{ expiresAt: now }, { startsAt: now + 1 }, { status: "expired" }, { status: "revoked" }] as const)("ignores unavailable rights %j", (patch) => {
    expect(access([entry(patch)], "bike-a").fullProfile).toBe(false);
  });
  it("eligibility survives genuine single expiry, but not revocation or future rights", () => {
    expect(access([entry({ status: "expired" })]).eligibleForEntry).toBe(true);
    expect(access([entry({ source: "transition" })]).eligibleForEntry).toBe(true);
    expect(access([entry({ status: "revoked" })]).eligibleForEntry).toBe(false);
    expect(access([entry({ status: "revoked", revokedReason: "bike_deleted" })]).eligibleForEntry).toBe(true);
    expect(access([entry({ status: "revoked", revokedReason: "refunded" })]).eligibleForEntry).toBe(false);
    expect(access([entry({ status: "revoked", revokedReason: "admin" })]).eligibleForEntry).toBe(false);
    expect(access([entry({ startsAt: now + 1 })]).eligibleForEntry).toBe(false);
  });
  it("appointment requires an unused active personal credit", () => {
    expect(access([entry({ productId: "annual_personal", appointmentGranted: true })]).appointmentAvailable).toBe(true);
    expect(access([entry({ productId: "annual_personal", appointmentGranted: true, appointmentUsedAt: now })]).appointmentAvailable).toBe(false);
    expect(access([entry({ productId: "annual", appointmentGranted: true })]).appointmentAvailable).toBe(false);
  });
  it("uses approved VAT-inclusive prices and calendar durations", () => {
    expect(Object.values(PRODUCTS).map((product) => product.priceCents)).toEqual([0, 1350, 2450, 1350, 23450]);
    expect(PRODUCTS.annual.renewalPriceCents).toBe(1950);
    expect(addCalendarMonths(Date.UTC(2024, 0, 31, 14), 1)).toBe(Date.UTC(2024, 1, 29, 14));
    expect(addCalendarMonths(Date.UTC(2026, 0, 31), 3)).toBe(Date.UTC(2026, 3, 30));
    expect(addCalendarMonths(Date.UTC(2024, 1, 29), 12)).toBe(Date.UTC(2025, 1, 28));
    expect(() => addCalendarMonths(NaN, 3)).toThrow("INVALID_DURATION");
  });
});
