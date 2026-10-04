"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isPaidAccessEnforced } from "../../shared/pricing/flags";

export function useProfileAccess() {
  const enforced = isPaidAccessEnforced();
  const access = useQuery(api.pricing.queries.getAccess, enforced ? {} : "skip");
  return { enforced, fullProfile: !enforced || access?.fullProfile === true, access,
    isLoading: enforced && access === undefined };
}
