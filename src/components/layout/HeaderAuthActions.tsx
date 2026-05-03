"use client";

import Link from "next/link";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/prototyper-ui/ui/button";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { UserMenu } from "@/components/auth/UserMenu";

type HeaderAuthActionsProps = {
  locale: Locale;
  loginLabel: string;
  getStartedLabel: string;
  dashboardLabel: string;
  campaignActive?: boolean;
  donateLabel?: string;
  donationUrl?: string;
};

export function HeaderAuthActions({
  locale,
  loginLabel,
  getStartedLabel: _getStartedLabel,
  dashboardLabel,
  campaignActive = false,
  donateLabel,
  donationUrl,
}: HeaderAuthActionsProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const startFreeLabel = locale === "nl" ? "Start gratis" : "Start free";

  if (isLoading) {
    return <div className="h-9 w-28 rounded-lg bg-[color:var(--surface-secondary)]" aria-hidden="true" />;
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button
          render={<Link href={withLocalePrefix("/dashboard", locale)} />}
          variant="outline"
          size="sm"
        >
          {dashboardLabel}
        </Button>
        <UserMenu />
      </div>
    );
  }

  if (campaignActive && donateLabel && donationUrl) {
    return (
      <>
        <Button
          render={<a href={donationUrl} target="_blank" rel="noopener noreferrer" />}
          variant="outline"
          size="sm"
        >
          {donateLabel}
        </Button>
        <Button
          render={<Link href={withLocalePrefix("/login", locale)} />}
          variant="outline"
          size="sm"
        >
          {loginLabel}
        </Button>
      </>
    );
  }

  return (
    <>
      <Button
        render={<Link href={withLocalePrefix("/calculators/bike-fit", locale)} />}
        variant="ghost"
        size="sm"
        className="text-[color:var(--primary)]"
      >
        {startFreeLabel}
      </Button>
      <Button
        render={<Link href={withLocalePrefix("/login", locale)} />}
        variant="outline"
        size="sm"
      >
        {loginLabel}
      </Button>
    </>
  );
}
