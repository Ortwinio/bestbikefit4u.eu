import type { PricingEntitlement } from "./access";

export type FitterNotificationPlan = {
  status: "ready";
  idempotencyKey: string;
  recipient: string;
  rider: { name: string; email: string };
  locale: "nl" | "en";
} | { status: "not_configured" | "not_eligible" | "missing_contact" };

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function prepareFitterNotification({ entitlement, entitlementId, rider, recipient, now = Date.now() }: {
  entitlement: PricingEntitlement;
  entitlementId: string;
  rider: { name?: string; email?: string; locale?: "nl" | "en" };
  recipient?: string;
  now?: number;
}): FitterNotificationPlan {
  if (entitlement.productId !== "annual_personal" || entitlement.source !== "purchase" ||
    entitlement.status !== "active" || entitlement.startsAt > now || entitlement.expiresAt <= now ||
    !entitlement.appointmentGranted || entitlement.appointmentUsedAt !== undefined) {
    return { status: "not_eligible" };
  }
  const address = recipient?.trim() ?? "";
  if (!isEmail(address)) return { status: "not_configured" };
  const email = rider.email?.trim() ?? "";
  if (!isEmail(email)) return { status: "missing_contact" };
  return {
    status: "ready",
    idempotencyKey: `personal-bikefit:${entitlementId}`,
    recipient: address,
    rider: { name: rider.name?.trim() ?? "", email },
    locale: rider.locale ?? "en",
  };
}
