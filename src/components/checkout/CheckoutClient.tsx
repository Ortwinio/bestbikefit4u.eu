"use client";

import { useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CheckoutFlow, type CheckoutFlowProps } from "./CheckoutFlow";
import { isStripeBillingVisible } from "@/config/billing";
import { requestCheckout } from "./checkout-request";
import { useMemo } from "react";
import { isPaidCheckoutProductId, parseCheckoutProduct } from "./checkout-state";

export function CheckoutClient({ sessionId, cancelled = false, ...props }: Pick<CheckoutFlowProps, "locale" | "initialSelection" | "preview" | "agendaUrl" | "appointmentRequested"> & { sessionId?: string; cancelled?: boolean }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn } = useAuthActions();
  const token = useAuthToken();
  const user = useQuery(api.users.queries.getCurrentUser, isAuthenticated ? {} : "skip");
  const bikes = useQuery(api.bikes.queries.listByUser, isAuthenticated ? {} : "skip");
  const subscription = useQuery(api.pricing.queries.getSubscription, isAuthenticated ? {} : "skip");
  const billingVisible = isStripeBillingVisible();
  const checkout = useQuery(api.stripe.queries.getCheckoutStatus, billingVisible && isAuthenticated && sessionId ? { sessionId } : "skip");
  const paymentReceipt = billingVisible && sessionId && checkout && isPaidCheckoutProductId(checkout.productId)
    ? { productId: checkout.productId, amountTotalCents: checkout.amountTotalCents }
    : undefined;
  const paymentProduct = paymentReceipt?.productId;
  const paymentBike = checkout?.bikeId;
  const paymentSelection = useMemo(() => paymentProduct ? {
    product: parseCheckoutProduct(paymentProduct),
    bikeId: paymentBike ?? "",
  } : props.initialSelection, [paymentProduct, paymentBike, props.initialSelection]);

  return <CheckoutFlow {...props} initialSelection={paymentSelection}
    paymentStatus={billingVisible && sessionId ? paymentReceipt && checkout?.status === "paid" ? "success" : paymentReceipt && (checkout?.status === "failed" || checkout?.status === "expired") ? "failure" : "pending" : cancelled ? "failure" : null}
    paymentReceipt={paymentReceipt}
    authenticated={isAuthenticated} authLoading={isLoading || (isAuthenticated && subscription === undefined)}
    upgradeEligible={subscription?.access.eligibleForUpgrade ?? false}
    standaloneEligible={subscription?.access.eligibleForPersonalFit ?? false}
    appointmentAvailable={subscription?.access.appointmentAvailable ?? false}
    accountId={user?._id} accountEmail={user?.email} bikes={bikes?.map(bike => ({ id: bike._id, name: bike.name }))}
    startCheckout={billingVisible ? async selection => {
      if (!isAuthenticated || !token) throw new Error("AUTH_REQUIRED");
      const result = await requestCheckout(selection, props.locale, subscription?.access.eligibleForUpgrade ?? false, token);
      if ("code" in result) return result;
      window.location.assign(result.url);
    } : undefined}
    signIn={async (email, code, redirectTo) => {
      const redirect = new URL(redirectTo, window.location.origin);
      if (sessionId) redirect.searchParams.set("session_id", sessionId);
      await signIn("resend", { email, ...(code ? { code } : {}), locale: props.locale, redirectTo: `${redirect.pathname}${redirect.search}` });
    }} />;
}
