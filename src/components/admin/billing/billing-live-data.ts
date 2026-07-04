import type { Doc } from "../../../../convex/_generated/dataModel";
import { summarizeJsonText } from "@/components/admin/shared/admin-format";

export type BillingPlan = Doc<"plans">;
export type BillingSubscription = Doc<"subscriptions">;
export type BillingEvent = Doc<"billing_events">;

type BillingRecord = Record<string, unknown>;

export type BillingProviderKind = "stripe" | "manual";

export type StripeBillingSnapshot = {
  providerKind: BillingProviderKind;
  customerId?: string;
  subscriptionId?: string;
  priceId?: string;
  currentPeriodStart?: number;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
  latestInvoiceId?: string;
};

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

function getStringField(record: BillingRecord, field: string) {
  const value = record[field];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function getNumberField(record: BillingRecord, field: string) {
  const value = record[field];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function getBooleanField(record: BillingRecord, field: string) {
  const value = record[field];
  return typeof value === "boolean" ? value : undefined;
}

function parseJsonObject(value?: string | null): BillingRecord | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as BillingRecord)
      : null;
  } catch {
    return null;
  }
}

export function getBillingPlanStripePriceId(plan: BillingPlan) {
  return getStringField(plan as BillingRecord, "stripePriceId");
}

export function getStripeBillingSnapshot(
  subscription: BillingSubscription,
  user?: Pick<Doc<"users">, "stripeCustomerId" | "stripeSubscriptionId"> | null
): StripeBillingSnapshot {
  const record = subscription as BillingRecord;
  const provider = getStringField(record, "provider")?.toLowerCase();
  const externalId = getStringField(record, "externalId");
  const explicitSubscriptionId =
    getStringField(record, "stripeSubscriptionId") ??
    (provider === "stripe" || externalId?.startsWith("sub_") ? externalId : undefined) ??
    user?.stripeSubscriptionId;
  const customerId = getStringField(record, "stripeCustomerId") ?? user?.stripeCustomerId;
  const priceId = getStringField(record, "stripePriceId");
  const latestInvoiceId =
    getStringField(record, "latestInvoiceId") ??
    getStringField(record, "latestInvoice");

  const providerKind: BillingProviderKind =
    provider === "stripe" ||
    Boolean(customerId || explicitSubscriptionId || priceId || latestInvoiceId)
      ? "stripe"
      : "manual";

  return {
    providerKind,
    customerId,
    subscriptionId: explicitSubscriptionId,
    priceId,
    currentPeriodStart: getNumberField(record, "currentPeriodStart"),
    currentPeriodEnd: getNumberField(record, "currentPeriodEnd"),
    cancelAtPeriodEnd: getBooleanField(record, "cancelAtPeriodEnd"),
    latestInvoiceId,
  };
}

export function formatBillingProviderKind(kind: BillingProviderKind) {
  return kind === "stripe" ? "Stripe-backed" : "Manual";
}

export function getBillingEventStripeSummary(event: BillingEvent) {
  const payload = parseJsonObject(event.payloadJson);
  const eventRecord = event as BillingRecord;
  const stripeEventId =
    getStringField(eventRecord, "stripeEventId") ??
    getStringField(payload ?? {}, "stripeEventId") ??
    getStringField(payload ?? {}, "eventId") ??
    getStringField(payload ?? {}, "id");
  const stripeType =
    getStringField(eventRecord, "stripeEventType") ??
    getStringField(payload ?? {}, "stripeEventType") ??
    getStringField(payload ?? {}, "type");
  const invoiceId =
    getStringField(payload ?? {}, "latestInvoiceId") ??
    getStringField(payload ?? {}, "invoiceId") ??
    getStringField(payload ?? {}, "invoice");

  const parts = [
    stripeEventId ? `Stripe event ${stripeEventId}` : null,
    stripeType ? `type ${stripeType}` : null,
    invoiceId ? `invoice ${invoiceId}` : null,
  ].filter(Boolean);

  return parts.length ? parts.join(" · ") : null;
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
