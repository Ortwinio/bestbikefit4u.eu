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
  it.each(["annual", "annual_upgrade", "annual_personal"] as const)("%s covers all bikes", (productId) => {
    expect(access([entry({ productId })], "other")).toMatchObject({ fullReport: true, maxBikes: null });
  });
  it.each([{ expiresAt: now }, { startsAt: now + 1 }, { status: "expired" }, { status: "revoked" }] as const)("ignores unavailable rights %j", (patch) => {
    expect(access([entry(patch)], "bike-a").fullProfile).toBe(false);
  });
  it("eligibility survives genuine single expiry, but not revocation or future rights", () => {
    expect(access([entry({ status: "expired" })]).eligibleForUpgrade).toBe(true);
    expect(access([entry({ source: "transition" })]).eligibleForUpgrade).toBe(false);
    expect(access([entry({ status: "revoked" })]).eligibleForUpgrade).toBe(false);
    expect(access([entry({ status: "revoked", revokedReason: "bike_deleted" })]).eligibleForUpgrade).toBe(true);
    expect(access([entry({ status: "revoked", revokedReason: "refunded" })]).eligibleForUpgrade).toBe(false);
    expect(access([entry({ status: "revoked", revokedReason: "admin" })]).eligibleForUpgrade).toBe(false);
    expect(access([entry({ startsAt: now + 1 })]).eligibleForUpgrade).toBe(false);
  });
  it("appointment requires an unused active personal credit", () => {
    expect(access([entry({ productId: "annual_personal", appointmentGranted: true })]).appointmentAvailable).toBe(true);
    expect(access([entry({ productId: "annual_personal", appointmentGranted: true, appointmentUsedAt: now })]).appointmentAvailable).toBe(false);
    expect(access([entry({ productId: "annual", appointmentGranted: true })]).appointmentAvailable).toBe(false);
  });
  it("uses approved VAT-inclusive prices and calendar durations", () => {
    expect(Object.values(PRODUCTS).map((product) => product.priceCents)).toEqual([0, 1350, 2150, 950, 23450, 20950]);
    expect(PRODUCTS.annual.renewalPriceCents).toBe(2150);
    expect(addCalendarMonths(Date.UTC(2024, 0, 31, 14), 1)).toBe(Date.UTC(2024, 1, 29, 14));
    expect(addCalendarMonths(Date.UTC(2026, 0, 31), 3)).toBe(Date.UTC(2026, 3, 30));
    expect(addCalendarMonths(Date.UTC(2024, 1, 29), 12)).toBe(Date.UTC(2025, 1, 28));
    expect(() => addCalendarMonths(NaN, 3)).toThrow("INVALID_DURATION");
  });
});


describe("Stripe pricing eligibility and appointment-only access", () => {
  it("counts purchase or redeemed gift for six calendar months only", () => {
    const startsAt = Date.UTC(2026, 0, 31);
    const end = addCalendarMonths(startsAt, 6);
    for (const source of ["purchase", "gift"] as const) {
      const entitlements = [entry({ source, startsAt, status: "expired" })];
      expect(getAccess({ entitlements }, undefined, { now: end - 1 }).eligibleForUpgrade).toBe(true);
      expect(getAccess({ entitlements }, undefined, { now: end }).eligibleForUpgrade).toBe(false);
    }
    expect(access([entry({ source: "legacy_pro" })]).eligibleForUpgrade).toBe(false);
  });
  it("does not offer an upgrade while an annual subscription is already active", () => {
    expect(access([entry(), entry({ productId: "annual" })]).eligibleForUpgrade).toBe(false);
    expect(access([entry(), entry({ productId: "annual", status: "expired" })]).eligibleForUpgrade).toBe(true);
  });
  it("standalone requires purchased single history or active annual, not a gift or transition", () => {
    expect(access([entry({ status: "expired" })]).eligibleForPersonalFit).toBe(true);
    expect(access([entry({ source: "gift" })]).eligibleForPersonalFit).toBe(false);
    expect(access([entry({ source: "transition" })]).eligibleForPersonalFit).toBe(false);
    expect(access([entry({ productId: "annual" })]).eligibleForPersonalFit).toBe(true);
    expect(access([entry({ productId: "annual", expiresAt: now })]).eligibleForPersonalFit).toBe(false);
    expect(access([entry({ status: "revoked", revokedReason: "refunded" })]).eligibleForPersonalFit).toBe(false);
  });
  it("standalone appointment remains bookable but does not unlock timed access", () => {
    const appointment = entry({ productId: "personal_fit_standalone", expiresAt: 0, appointmentGranted: true });
    expect(access([appointment], "bike-a")).toMatchObject({
      fullProfile: false, fullReport: false, maxBikes: 1, profileScoreCap: 80,
      appointmentAvailable: true, productId: "free", expiresAt: null,
    });
    expect(access([{ ...appointment, appointmentUsedAt: now }]).appointmentAvailable).toBe(false);
    expect(access([{ ...appointment, status: "revoked" }]).appointmentAvailable).toBe(false);
  });
  it("normalizes historical entry grants without offering them as products", () => {
    expect(access([entry({ productId: "annual_entry" })])).toMatchObject({
      productId: "annual_upgrade", fullProfile: true, fullReport: true,
    });
    expect(Object.keys(PRODUCTS)).not.toContain("annual_entry");
  });
});
