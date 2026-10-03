"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { isPaidAccessEnforced } from "../../../shared/pricing/flags";
import type { Locale } from "@/i18n/config";
import { getPricingAccessCopy } from "@/i18n/account/pricingAccess";

export function LegacyReportBadge({ sessionId, locale }: { sessionId: Id<"fitSessions">; locale: Locale }) {
  const access = useQuery(api.recommendations.queries.getReportAccess, isPaidAccessEnforced() ? { sessionId } : "skip");
  if (!access?.enforced || !access.legacyFullAccess) return null;
  return <p className="mt-2 text-sm font-medium text-muted-foreground">{getPricingAccessCopy(locale).legacy}</p>;
}
