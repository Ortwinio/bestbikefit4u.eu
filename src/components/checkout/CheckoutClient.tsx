"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CheckoutFlow, type CheckoutFlowProps } from "./CheckoutFlow";

export function CheckoutClient(props: Pick<CheckoutFlowProps, "locale" | "initialSelection" | "preview" | "agendaUrl" | "appointmentRequested">) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn } = useAuthActions();
  const user = useQuery(api.users.queries.getCurrentUser, isAuthenticated ? {} : "skip");
  const bikes = useQuery(api.bikes.queries.listByUser, isAuthenticated ? {} : "skip");
  const subscription = useQuery(api.pricing.queries.getSubscription, isAuthenticated ? {} : "skip");

  return <CheckoutFlow {...props} authenticated={isAuthenticated} authLoading={isLoading || (isAuthenticated && subscription === undefined)}
    introEligible={subscription?.access.eligibleForEntry ?? false}
    appointmentAvailable={subscription?.access.appointmentAvailable ?? false}
    accountId={user?._id} accountEmail={user?.email} bikes={bikes?.map(bike => ({ id: bike._id, name: bike.name }))}
    signIn={async (email, code, redirectTo) => {
      await signIn("resend", { email, ...(code ? { code } : {}), locale: props.locale, redirectTo });
    }} />;
}
