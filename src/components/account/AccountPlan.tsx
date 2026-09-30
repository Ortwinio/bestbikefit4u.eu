"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { isStripeBillingEnabled } from "@/config/billing";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { withLocalePrefix } from "@/i18n/navigation";
import { getEffectiveDisplayName } from "@/lib/userIdentity";

export function AccountPlan() {
  const user = useQuery(api.users.queries.getCurrentUser);
  const sessions = useQuery(api.sessions.queries.listByUser);
  const { locale, messages } = useDashboardMessages();
  const dutch = locale === "nl";
  return <section aria-label={dutch ? "Je account" : "Your account"} className="space-y-3 rounded-[20px] bg-white/5 p-5">
    <p className="truncate text-xs text-[var(--bbf-op-donker)]">{getEffectiveDisplayName(user, messages.userMenu.fallbackUserName)}</p>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <strong>{user == null ? "…" : user.tier === "premium" ? "Premium" : user.tier === "pro" ? "Pro" : "Free"}</strong>
      <span className="text-xs text-[var(--bbf-op-donker)]"><span className="font-mono">{sessions?.length ?? "…"}</span> {dutch ? sessions?.length === 1 ? "fit-sessie" : "fit-sessies" : sessions?.length === 1 ? "fit session" : "fit sessions"}</span>
    </div>
    {!isStripeBillingEnabled() && <p className="text-xs leading-relaxed text-[var(--bbf-op-donker)]">{dutch ? "Betalen is tijdelijk gepauzeerd." : "Payments are temporarily paused."}</p>}
    <Link href={withLocalePrefix("/settings", locale)} className="flex min-h-11 items-center justify-center rounded-full bg-[var(--bbf-lime)] px-3 text-sm font-bold text-[var(--bbf-inkt)]">{dutch ? "Bekijk je account" : "View your account"}</Link>
  </section>;
}
