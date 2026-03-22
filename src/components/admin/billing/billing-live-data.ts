import type { Doc } from "../../../../convex/_generated/dataModel";
import { summarizeJsonText } from "@/components/admin/shared/admin-format";

export type BillingPlan = Doc<"plans">;
export type BillingSubscription = Doc<"subscriptions">;
export type BillingEvent = Doc<"billing_events">;

export type BillingManagementRole = "super_admin" | "billing_admin";

export const BILLING_MANAGEMENT_ROLES: ReadonlySet<BillingManagementRole> = new Set([
  "super_admin",
  "billing_admin",
]);

export function canManageBilling(role?: string | null): role is BillingManagementRole {
  return Boolean(role && BILLING_MANAGEMENT_ROLES.has(role as BillingManagementRole));
}

export function formatBillingMoney(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Custom";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

export function formatBillingInterval(interval: BillingPlan["billingInterval"]) {
  switch (interval) {
    case "month":
      return "/ month";
    case "year":
      return "/ year";
    case "custom":
      return "/ custom";
    default:
      return "";
  }
}

export function formatBillingPlanStatus(isActive: boolean) {
  return isActive ? "Active" : "Inactive";
}

export function formatBillingTier(tier: BillingPlan["tier"]) {
  return tier.replaceAll("_", " ");
}

export function billingPlanTone(tier: BillingPlan["tier"]) {
  switch (tier) {
    case "enterprise":
      return "warning";
    case "bike_shop":
      return "info";
    case "premium":
      return "success";
    case "pro":
    case "free":
    default:
      return "neutral";
  }
}

export function billingSubscriptionTone(status: BillingSubscription["status"]) {
  switch (status) {
    case "active":
      return "success";
    case "trialing":
      return "info";
    case "past_due":
      return "warning";
    case "canceled":
    case "expired":
      return "danger";
    default:
      return "neutral";
  }
}

export function formatBillingSubscriptionSubject(
  subscription: Pick<BillingSubscription, "userId" | "organizationId">
) {
  if (subscription.organizationId) {
    return `Organization ${String(subscription.organizationId)}`;
  }
  if (subscription.userId) {
    return `User ${String(subscription.userId)}`;
  }
  return "Unlinked";
}

export function summarizeBillingEventPayload(payloadJson?: string | null) {
  return summarizeJsonText(payloadJson);
}
