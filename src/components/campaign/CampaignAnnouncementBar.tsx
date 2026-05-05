"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import {
  CONSUMER_CAMPAIGN_CONFIG,
  getConsumerCampaignCopy,
  isConsumerCampaignActive,
} from "@/config/commercial";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { CampaignCtaGroup } from "./CampaignCtaGroup";

type CampaignAnnouncementBarProps = {
  locale: Locale;
};

export function CampaignAnnouncementBar({
  locale,
}: CampaignAnnouncementBarProps) {
  const pathname = usePathname();

  if (!isConsumerCampaignActive()) {
    return null;
  }

  const copy = getConsumerCampaignCopy(locale);
  const pagePath = pathname ?? withLocalePrefix("/", locale);

  return (
    <div className="border-b border-[color:color-mix(in_oklch,var(--primary)_42%,transparent)] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--primary)_18%,var(--background)_82%)_0%,color-mix(in_oklch,var(--primary)_10%,var(--secondary)_18%,var(--background)_72%)_100%)]">
      <TrackMarketingEventOnView
        eventType="campaign_banner_view"
        locale={locale}
        pagePath={pagePath}
        section="campaign_announcement_bar"
      />
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p className="max-w-4xl text-sm leading-6 text-[color:var(--foreground)]">
          {copy.announcement}
        </p>
        <CampaignCtaGroup
          locale={locale}
          pagePath={pagePath}
          startHref={withLocalePrefix("/calculators/bike-fit", locale)}
          startSection="campaign_announcement_start"
          donateHref={CONSUMER_CAMPAIGN_CONFIG.donationUrl}
          donateSection="campaign_announcement_donate"
          startLabel={locale === "nl" ? "Start gratis" : "Start free"}
          donateLabel={locale === "nl" ? "Doneer" : "Donate"}
          buttonSize="sm"
        />
      </div>
    </div>
  );
}
