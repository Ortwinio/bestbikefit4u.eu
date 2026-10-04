"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Locale } from "@/i18n/config";
import { SubscriptionOverview, type SubscriptionOverviewDetails } from "./SubscriptionOverview";

export function SubscriptionOverviewConnected({ locale }: { locale: Locale }) {
  const subscription = useQuery(api.pricing.queries.getSubscription, {});
  const entitlement = subscription?.entitlements.find((entry) =>
    entry.productId === subscription.access.productId &&
    entry.expiresAt === subscription.access.expiresAt && entry.status === "active");
  const bike = useQuery(api.bikes.queries.get, entitlement?.bikeId
    ? { bikeId: entitlement.bikeId } : "skip");
  let details: SubscriptionOverviewDetails | null | undefined = subscription === null ? null : undefined;
  if (subscription) {
    const product = subscription.access.productId;
    details = {
      plan: product === "annual_personal" ? "personal" : product === "annual_entry" ? "annual" : product,
      expiresAt: subscription.access.expiresAt ?? undefined,
      startsAt: entitlement?.startsAt,
      bikeName: bike?.name,
      introEligible: subscription.access.eligibleForEntry,
      enforced: subscription.access.enforced,
      appointmentAvailable: subscription.access.appointmentAvailable,
      periodPriceCents: entitlement?.periodPriceCents,
      renewed: entitlement?.renewed,
      cancelled: entitlement?.cancelled,
    };
  }
  return <SubscriptionOverview locale={locale} subscription={details} />;
}
