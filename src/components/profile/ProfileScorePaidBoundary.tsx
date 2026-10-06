"use client";

import { useProfileAccess } from "@/hooks/useProfileAccess";
import { PaidBoundary } from "@/components/billing/PaidBoundary";
import type { Locale } from "@/i18n/config";

export function ProfileScorePaidBoundary({ locale }: { locale: Locale }) {
  const { access } = useProfileAccess();
  return access?.enforced && access.profileScoreCap === 80
    ? <PaidBoundary locale={locale} boundary="profile-score" /> : null;
}
