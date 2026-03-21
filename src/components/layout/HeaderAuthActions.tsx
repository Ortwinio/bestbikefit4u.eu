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
          Dashboard
        </Button>
        <UserMenu />
      </div>
    );
  }

  return (
    <>
      <Button
        render={<Link href={withLocalePrefix("/login", locale)} />}
        variant="ghost"
        size="sm"
      >
        {loginLabel}
      </Button>
      <Button render={<Link href={withLocalePrefix("/login", locale)} />} size="sm">
        {getStartedLabel}
      </Button>
    </>
  );
}
