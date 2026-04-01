"use client";

import Link from "next/link";
import { ArrowRight, LineChart } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

type SignedInFitFollowUpCardProps = {
  locale: Locale;
  copy: {
    title: string;
    description: string;
    profileCta: string;
    fitCta: string;
  };
  onCtaClick: (targetPath: string, ctaLabel: string) => void;
};

export function SignedInFitFollowUpCard({
  locale,
  copy,
  onCtaClick,
}: SignedInFitFollowUpCardProps) {
  const profilePath = withLocalePrefix("/profile", locale);
  const fitPath = withLocalePrefix("/fit", locale);

  return (
    <Card variant="bordered" className="dashboard-card-surface">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--primary-soft)] text-[color:var(--primary)]">
            <LineChart className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>{copy.title}</CardTitle>
            <CardDescription>{copy.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button
          render={<Link href={profilePath} />}
          onClick={() => onCtaClick(profilePath, copy.profileCta)}
        >
          {copy.profileCta}
        </Button>
        <Button
          variant="outline"
          render={<Link href={fitPath} />}
          onClick={() => onCtaClick(fitPath, copy.fitCta)}
        >
          {copy.fitCta}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
