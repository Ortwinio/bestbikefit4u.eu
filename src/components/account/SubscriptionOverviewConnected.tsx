"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Locale } from "@/i18n/config";
import { normalizeProductId } from "../../../shared/pricing/access";
import { SubscriptionOverview, type SubscriptionOverviewDetails } from "./SubscriptionOverview";

export function SubscriptionOverviewConnected({ locale }: { locale: Locale }) {
  const subscription = useQuery(api.pricing.queries.getSubscription, {});
  const entitlement = subscription?.entitlements.find((entry) =>
    normalizeProductId(entry.productId) === subscription.access.productId &&
    entry.expiresAt === subscription.access.expiresAt && entry.status === "active");
  const bike = useQuery(api.bikes.queries.get, entitlement?.bikeId
    ? { bikeId: entitlement.bikeId } : "skip");
  let details: SubscriptionOverviewDetails | null | undefined = subscription === null ? null : undefined;
  if (subscription) {
    const product = subscription.access.productId;
    details = {
      plan: product === "annual_personal" ? "personal" : product === "annual_upgrade" ? "annual" : product === "personal_fit_standalone" ? "free" : product,
      expiresAt: subscription.access.expiresAt ?? undefined,
      startsAt: entitlement?.startsAt,
      bikeName: bike?.name,
      upgradeEligible: subscription.access.eligibleForUpgrade,
      canBuyAppointment: subscription.access.eligibleForPersonalFit,
      enforced: subscription.access.enforced,
      appointmentAvailable: subscription.access.appointmentAvailable,
      periodPriceCents: entitlement?.periodPriceCents,
      renewed: entitlement?.renewed,
      cancelled: entitlement?.cancelled,
    };
  }
  return <SubscriptionOverview locale={locale} subscription={details} />;
}
