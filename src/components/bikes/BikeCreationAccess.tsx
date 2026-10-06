"use client";

import type { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { isPaidAccessEnforced } from "../../../shared/pricing/flags";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { LoadingState } from "@/components/ui";
import { BikeAccessNotice } from "./BikeAccessNotice";

export function BikeCreationAccess({ children }: { children: ReactNode }) {
  return isPaidAccessEnforced() ? <EnforcedBikeCreationAccess>{children}</EnforcedBikeCreationAccess> : children;
}

function EnforcedBikeCreationAccess({ children }: { children: ReactNode }) {
  const access = useQuery(api.pricing.queries.getAccess, {});
  const bikes = useQuery(api.bikes.queries.listSummariesByUser, {});
  const { locale, messages } = useDashboardMessages();
  if (!access || bikes === undefined) return <LoadingState label={messages.bikes.loading} />;
  if (access.enforced && access.maxBikes !== null && bikes.length >= access.maxBikes) {
    return <BikeAccessNotice locale={locale} atLimit pageHeading />;
  }
  return children;
}
