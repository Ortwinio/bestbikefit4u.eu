import { describe, expect, it } from "vitest";
import type { PricingEntitlement } from "./access";
import { prepareFitterNotification } from "./appointmentNotification";

const entitlement: PricingEntitlement = {
  productId: "annual_personal", source: "purchase", status: "active",
  startsAt: 100, expiresAt: 300, appointmentGranted: true,
};
const input = {
  entitlement, entitlementId: "verified-entitlement", now: 200,
  rider: { name: "Test rider", email: "rider@example.test", locale: "nl" as const },
  recipient: "fitter@example.test",
};

describe("dormant personal bikefit notification preparation", () => {
  it("fails closed without an explicitly configured recipient", () => {
    expect(prepareFitterNotification({ ...input, recipient: undefined })).toEqual({ status: "not_configured" });
    expect(prepareFitterNotification({ ...input, recipient: "address\nBcc: other@example.test" }))
      .toEqual({ status: "not_configured" });
  });
  it("prepares only name/email with a stable idempotency key, without sending", () => {
    const plan = prepareFitterNotification(input);
    expect(plan).toEqual({
      status: "ready", idempotencyKey: "personal-bikefit:verified-entitlement",
      recipient: "fitter@example.test", rider: {
        name: input.rider.name, email: input.rider.email,
      }, locale: "nl",
    });
    expect(prepareFitterNotification(input)).toEqual(plan);
  });
  it.each([
    { productId: "annual" }, { productId: "single" }, { source: "transition" },
    { status: "expired" }, { status: "revoked" }, { appointmentGranted: false },
    { appointmentUsedAt: 150 }, { startsAt: 201 }, { expiresAt: 200 },
  ] satisfies Partial<PricingEntitlement>[])("rejects ineligible state %j", (change) => {
    expect(prepareFitterNotification({ ...input, entitlement: { ...entitlement, ...change } }))
      .toEqual({ status: "not_eligible" });
  });
  it("prepares a standalone appointment with no invented expiry", () => {
    expect(prepareFitterNotification({ ...input, entitlement: {
      ...entitlement, productId: "personal_fit_standalone", expiresAt: 0,
    } }).status).toBe("ready");
  });
  it("does not invent a rider email", () => {
    expect(prepareFitterNotification({ ...input, rider: {} })).toEqual({ status: "missing_contact" });
  });
});
