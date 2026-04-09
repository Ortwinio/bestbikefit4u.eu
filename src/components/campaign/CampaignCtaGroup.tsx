"use client";

import type { MouseEvent } from "react";
import type { Locale } from "@/i18n/config";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import { getConsumerCampaignCopy } from "@/config/commercial";
import { cn } from "@/utils/cn";

type CampaignCtaGroupProps = {
  locale: Locale;
  pagePath: string;
  startHref: string;
  startSection: string;
  donateHref: string;
  donateSection: string;
  startLabel?: string;
  donateLabel?: string;
  buttonSize?: "default" | "sm" | "lg";
  className?: string;
};

export function CampaignCtaGroup({
  locale,
  pagePath,
  startHref,
  startSection,
  donateHref,
  donateSection,
  startLabel,
  donateLabel,
  buttonSize = "default",
  className,
}: CampaignCtaGroupProps) {
  const logMarketingEvent = useMarketingEventLogger();
  const campaign = getConsumerCampaignCopy(locale);
  const resolvedStartLabel = startLabel ?? campaign.startFreeCta;
  const resolvedDonateLabel = donateLabel ?? campaign.donateCta;

  const handleStartClick = () => {
    logMarketingEvent({
      eventType: "campaign_start_free_click",
      locale,
      pagePath,
      section: startSection,
      ctaLabel: resolvedStartLabel,
      ctaTargetPath: startHref,
    });
  };

  const handleDonateClick = (_event: MouseEvent<HTMLAnchorElement>) => {
    logMarketingEvent({
      eventType: "campaign_donate_click",
      locale,
      pagePath,
      section: donateSection,
      ctaLabel: resolvedDonateLabel,
      ctaTargetPath: donateHref,
    });
    logMarketingEvent({
      eventType: "donation_link_click",
      locale,
      pagePath,
      section: donateSection,
      ctaLabel: resolvedDonateLabel,
      ctaTargetPath: donateHref,
    });
  };

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row", className)}>
      <Button
        size={buttonSize}
        render={
          <TrackedCtaLink
            href={startHref}
            locale={locale}
            pagePath={pagePath}
            section={startSection}
            ctaLabel={resolvedStartLabel}
            onClick={handleStartClick}
          />
        }
      >
        {resolvedStartLabel}
      </Button>
      <Button
        variant="outline"
        size={buttonSize}
        render={
          <TrackedCtaLink
            href={donateHref}
            locale={locale}
            pagePath={pagePath}
            section={donateSection}
            ctaLabel={resolvedDonateLabel}
            onClick={handleDonateClick}
            target="_blank"
            rel="noreferrer noopener"
          />
        }
      >
        {resolvedDonateLabel}
      </Button>
    </div>
  );
}
