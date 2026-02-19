"use client";

import Link from "next/link";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { UserMenu } from "@/components/auth/UserMenu";

type HeaderAuthActionsProps = {
  locale: Locale;
  loginLabel: string;
  getStartedLabel: string;
};

export function HeaderAuthActions({
  locale,
  loginLabel,
  getStartedLabel,
}: HeaderAuthActionsProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <div className="h-9 w-28 rounded-lg bg-gray-100" aria-hidden="true" />;
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link href={withLocalePrefix("/dashboard", locale)}>
          <Button variant="outline" size="sm">
            Dashboard
          </Button>
        </Link>
        <UserMenu locale={locale} />
      </div>
    );
  }

  return (
    <>
      <Link href={withLocalePrefix("/login", locale)}>
        <Button variant="ghost" size="sm">
          {loginLabel}
        </Button>
      </Link>
      <Link href={withLocalePrefix("/login", locale)}>
        <Button size="sm">{getStartedLabel}</Button>
      </Link>
    </>
  );
}
