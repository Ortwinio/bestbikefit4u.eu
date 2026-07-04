export type AppTier = "free" | "pro" | "premium";

export type AppSubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired";

export type PlanTier = AppTier | "bike_shop" | "enterprise";

export type StripeSubscriptionStatus =
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused";

export function mapStripeSubscriptionStatus(status?: string | null): AppSubscriptionStatus {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
    case "incomplete":
    case "paused":
      return "past_due";
    case "incomplete_expired":
    case "unpaid":
      return "expired";
    case "canceled":
      return "canceled";
    default:
      return "past_due";
  }
}

export function subscriptionStatusGrantsAccess(status: AppSubscriptionStatus) {
  return status === "active" || status === "trialing";
}

export function mapStripePriceToPlanKey(
  stripePriceId: string | undefined,
  configuredProPriceId: string | undefined
) {
  if (stripePriceId && configuredProPriceId && stripePriceId === configuredProPriceId) {
    return "pro";
  }
  return undefined;
}

export function tierForPlan(tier?: PlanTier | null): AppTier {
  switch (tier) {
    case "premium":
      return "premium";
    case "pro":
    case "bike_shop":
    case "enterprise":
      return "pro";
    case "free":
    default:
      return "free";
  }
}

export function buildEntitlementPatch(args: {
  subscriptionStatus: AppSubscriptionStatus;
  planTier?: PlanTier | null;
  existingProSince?: number;
  now: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}) {
  const grantsAccess = subscriptionStatusGrantsAccess(args.subscriptionStatus);
  const tier = grantsAccess ? tierForPlan(args.planTier) : "free";

  return {
    tier,
    proSince:
      grantsAccess && tier !== "free"
        ? args.existingProSince ?? args.now
        : args.existingProSince,
    stripeCustomerId: args.stripeCustomerId,
    stripeSubscriptionId: grantsAccess ? args.stripeSubscriptionId : undefined,
  };
}

